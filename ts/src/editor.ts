import { Layer } from "./layer.js";
import { Status } from "./status.js";
import {
	GRID_VERTEX_SHADER,
	COLOR_VERTEX_SHADER,
	COORD_VERTEX_SHADER,
	COLOR_FRAGMENT_SHADER,
	UNIFORM_FRAGMENT_SHADER
} from "./shaders.js";
import {
	setFloatUniform,
	setVec2Uniform,
	setVec4Uniform,
	setColorAttrib,
	setCoordAttrib,
	hexToVec4,
	hexToUint8,
	resizeImage,
	throttle
} from "./utils.js";

interface Res {
	width: number;
	height: number;
}

interface Coord2d {
	x: number;
	y: number;
}

export class Editor { 
	res: Res = {
		width: 30,
		height: 30
	}

	coord: Coord2d = {
		x: Math.floor(this.res.width/2),
		y: Math.floor(this.res.height/2)
	}

	pixel_size: number = 20;
	color: string = "#c99494ff";

	splash_layer!: Layer;
	grid_layer!: Layer;
	image_layer!: Layer;
	cursor_layer!: Layer;
	// layers!: Array<Layer>;
	// active_layer!: Layer;

	layer_root: HTMLDivElement;
	cmd_bar: HTMLInputElement;
	status_bar: HTMLDivElement;
	status: Status;

	constructor(layer_root: HTMLDivElement, cmd_bar: HTMLInputElement, status_bar: HTMLDivElement){
		this.layer_root = layer_root;
		this.cmd_bar = cmd_bar;
		this.status_bar = status_bar;
		this.status = new Status(status_bar, this.res.width, this.res.height, this.coord.x, this.coord.y, this.color);
		this.throttledDrawCursor = throttle(this.drawCursorAtPointer.bind(this), 100);
		this.fillPixelAtPointer = this.fillPixelAtPointer.bind(this);
	}

	addLayer(anchor: HTMLElement | null){
		const layer = new Layer(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
		this.layer_root.insertBefore(layer.canvas, anchor);
		// this.layers.push(layer);
		return layer;
	}
	
	initGridLayer(){
		this.grid_layer = this.addLayer(null);
		this.grid_layer.acquireContext(true);
		this.grid_layer.initProgram(GRID_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
		this.grid_layer.setUniforms([
			{
				"name": "u_ps",
				"value": this.pixel_size,
				"setter": setFloatUniform
			},
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			}
		]);
		this.grid_layer.clear();
		this.grid_layer.enableBlend();
		this.grid_layer.drawPixels(this.res.width * this.res.height);

	}

	initImageLayer(){
		this.image_layer = this.addLayer(null);
		this.image_layer.acquireContext(true);
		this.image_layer.initProgram(COLOR_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
		this.image_layer.setUniforms([
			{
				"name": "u_ps",
				"value": this.pixel_size,
				"setter": setFloatUniform
			},
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			}
		]);
		this.image_layer.initImageData(new ImageData(this.res.width, this.res.height));
		this.image_layer.initDrawState();
		this.image_layer.initVertexBuffer();
		this.image_layer.setAttribs([
			{
				"loc": 0,
				"size": 4,
				"normalise": true,
				"stride": 0,
				"offset": 0,
				"setter": setColorAttrib
			}

		]);
		this.image_layer.drawPixels(this.res.width * this.res.height);
	}
	
	initCursorLayer(){
		this.cursor_layer = this.addLayer(null);
		this.cursor_layer.acquireContext(true);
		this.cursor_layer.initProgram(COORD_VERTEX_SHADER, UNIFORM_FRAGMENT_SHADER);
		this.cursor_layer.setUniforms([
			{
				"name": "u_ps",
				"value": this.pixel_size,
				"setter": setFloatUniform
			},
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			},
			{
				"name": "u_color",
				"value": hexToVec4("#77aabb80"),
				"setter": setVec4Uniform
			}
		]);
		this.cursor_layer.setPixelBuffer(new Uint16Array([this.coord.x, this.coord.y]));
		this.cursor_layer.initDrawState();
		this.cursor_layer.initVertexBuffer();
		this.cursor_layer.setAttribs([
			{
				"loc": 0,
				"size": 2,
				"normalise": false, 
				"stride": 0,
				"offset": 0,
				"setter": setCoordAttrib
			}

		]);
		this.cursor_layer.enableBlend();
		this.cursor_layer.clear();
		this.cursor_layer.drawPixels(1);
	}

	initStatusBar(){
	}

	setPixelColor(hex_color: string){
		const offset = (this.coord.y * this.res.width + this.coord.x) * 4;
		const arr = hexToUint8(hex_color);
		this.image_layer.updateImageData(arr, offset);
		this.image_layer.updateBuffer(arr, offset);
		this.image_layer.drawPixels(this.res.width * this.res.height);
	}
	
	drawCursor(){
		this.cursor_layer.updateBuffer(new Uint16Array([this.coord.x, this.coord.y]));
		this.cursor_layer.drawPixels(1);
	}

	clear(){
		this.image_layer.initImageData(new ImageData(this.res.width, this.res.height));
		this.image_layer.resetBuffer();
		this.image_layer.clear();
		this.image_layer.drawPixels(this.res.width * this.res.height);
	}

	createNew(keep_data: boolean = false){
		this.grid_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
		this.grid_layer.setUniforms([
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			}
		]);
		this.grid_layer.clear();
		this.grid_layer.drawPixels(this.res.width * this.res.height);
		
		this.image_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
		this.image_layer.setUniforms([
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			}
		]);

		if (keep_data){
			this.image_layer.initImageData(resizeImage(this.image_layer.image_data, this.res.width, this.res.height));
		} else {
			this.image_layer.initImageData(new ImageData(this.res.width, this.res.height));
		}

		this.image_layer.resetBuffer();
		this.image_layer.clear();
		this.image_layer.drawPixels(this.res.width * this.res.height);

		this.cursor_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
		this.cursor_layer.setUniforms([
			{
				"name": "u_res",
				"value": new Uint16Array([this.res.width, this.res.height]), 
				"setter": setVec2Uniform
			}
		]);
		this.cursor_layer.clear();
		this.drawCursor();
		this.status.updateRes(this.res.width, this.res.height);
		this.status.updateCoord(this.coord.x, this.coord.y);

	}

	fillPixelAtPointer(e: MouseEvent) {
		this.coord ={
			x: Math.floor(e.offsetX * this.res.width / this.cursor_layer.canvas.clientWidth),
			y: Math.floor(e.offsetY * this.res.height / this.cursor_layer.canvas.clientHeight)
		}
		this.drawCursor();
		this.status.updateCoord(this.coord.x, this.coord.y);
		this.setPixelColor(this.color);
	}

	drawCursorAtPointer(e: MouseEvent) {
		this.coord ={
			x: Math.floor(e.offsetX * this.res.width / this.cursor_layer.canvas.clientWidth),
			y: Math.floor(e.offsetY * this.res.height / this.cursor_layer.canvas.clientHeight)
		}
		this.drawCursor();
		this.status.updateCoord(this.coord.x, this.coord.y);
	}

	throttledDrawCursor(e: MouseEvent){}
	
	enableMouse(){
		this.cursor_layer.canvas.addEventListener('click', this.fillPixelAtPointer);
		this.cursor_layer.canvas.addEventListener('mousemove', this.throttledDrawCursor);
	}

	disableMouse(){
		this.cursor_layer.canvas.removeEventListener('click', this.fillPixelAtPointer);
		this.cursor_layer.canvas.removeEventListener('mousemove', this.drawCursorAtPointer);
	}

	handleCmd(cmd_str: string){
		const cmd_args = cmd_str.split(" ");
		switch(cmd_args[0]){
			case 'clear': {
				this.clear();
				break;
			}
			case 'disable-mouse' : {
				this.disableMouse();
				break;
			}
			case 'enable-mouse' : {
				this.enableMouse();
				break;
			}
			case 'new' : {
				if(!cmd_args[1]){
					this.clear();
				} else{
					this.res = {
						width: parseInt(cmd_args[1], 10),
						height: parseInt((cmd_args[2] || cmd_args[1]), 10)
					}
					this.coord = {
						x: Math.floor(this.res.width/2),
						y: Math.floor(this.res.height/2)
					}
					this.createNew();
				}
				break;
			}
			case 'save' : {
				const a = document.createElement("a");
				this.image_layer.drawPixels(this.res.width * this.res.height);
				const data = this.image_layer.canvas.toDataURL("image/png", 1.0);
				a.href = data;
				a.download = cmd_args[1] + ".png";
				a.click();
				break;
			}
			case 'set-color' : {
				this.color = cmd_args[1];
				this.status.updateColor(this.color);
				break;
			}
			case 'set-res' : {
				this.res = {
					width: parseInt(cmd_args[1], 10),
					height: parseInt((cmd_args[2] || cmd_args[1]), 10)
				}
				this.coord = {
					x: Math.floor(this.res.width/2),
					y: Math.floor(this.res.height/2)
				}
				this.createNew(true);
				break;
			}	
			case 'upload' :{
				let input = document.createElement("input");
				input.type = "file";
				input.addEventListener("cancel", () => {
					console.log("cancelled");
				});
				input.addEventListener("change", () => {
					console.log(input.files)
				});
				input.click();
				break;
			}
		}
	}


	addListeners(){
		this.layer_root.addEventListener('keydown', (e) => {
	
			switch(e.key){
				case 'k': {
					let {x, y} = this.coord;
					y = y == 0 ? (this.res.height - 1) : y - 1;
					this.coord = {x, y};
					this.drawCursor();
					this.status.updateCoord(this.coord.x, this.coord.y);
					break;
				}
				case 'j': {
					let {x, y} = this.coord;
					y = y == (this.res.height - 1) ? 0 : y + 1;
					this.coord = {x, y};
					this.drawCursor();
					this.status.updateCoord(this.coord.x, this.coord.y);
					break;
				}
				case 'h': {
					let {x, y} = this.coord;
					x = x == 0 ? (this.res.width - 1) : x - 1;
					this.coord = {x, y};
					this.drawCursor();
					this.status.updateCoord(this.coord.x, this.coord.y);
					break;
				}
				case 'l': {
					let {x, y} = this.coord;
					x = x == (this.res.width - 1) ? 0 : x + 1;
					this.coord = {x, y};
					this.drawCursor();
					this.status.updateCoord(this.coord.x, this.coord.y);
					break;
				}
			}
		});

		this.layer_root.addEventListener('keyup', (e) => {
			switch(e.key){
				case ':' : {
					e.stopPropagation();
					this.cmd_bar.value = ":";
					this.cmd_bar.focus();
					break;
				}
				case 'f' : {
					this.setPixelColor(this.color);
					break;
				}
				case 'x' : {
					this.setPixelColor("#00000000");
					break;
				}
			}
		});

		this.cmd_bar.addEventListener('keyup', (e) => {
			switch(e.key){
				case 'Escape' : {
					this.cmd_bar.value = '';
					this.layer_root.focus();
					break;
				}
				case 'Enter' : {
					this.handleCmd(this.cmd_bar.value.substring(1));
					this.cmd_bar.value = '';
					this.layer_root.focus();
					break;
				}
			}
		});
	}
}

