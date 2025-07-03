import { Layer }  from "./layer.js";
import {
	UV_OUT_VERTEX_SHADER,
	HUE_FRAGMENT_SHADER,
	HSV_FRAGMENT_SHADER
} from "./shaders.js";
import {
	setClipSpaceAttrib,
	hexToVec,
	uint8ToHex,
	rgb2hsv,
	hsv2rgb,
	setFloatUniform,
	setVec2Uniform
} from "./utils.js";

export class ColorPicker {
	color_hex: string;
	//rgba: Uint8Array;
	hsva: Array<number>;
	hue_grad!: Layer;
	sv_grad!: Layer;
	preview!: HTMLSpanElement;
	hex_input!: HTMLInputElement;


	constructor(color: string){
		this.color_hex = color;
		const [r, g, b, a] = hexToVec(color);
		this.hsva = [...rgb2hsv(r,g,b), a];
		this.initSVGradient();
		this.initHueGradient();
	}
	
	initHueGradient(){
		this.hue_grad = new Layer(360, 20);
		this.hue_grad.acquireContext(true);
		this.hue_grad.initProgram(UV_OUT_VERTEX_SHADER, HUE_FRAGMENT_SHADER);
		this.hue_grad.setPixelBuffer(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,]));
		this.hue_grad.initDrawState();
		this.hue_grad.initVertexBuffer();
		this.hue_grad.setAttribs([
			{
				"loc": 0,
				"size": 2,
				"normalise": false, 
				"stride": 0,
				"offset": 0,
				"setter": setClipSpaceAttrib
			}

		]);
		this.hue_grad.clear();
		this.hue_grad.drawTriangles(2);
	}

	initSVGradient(){
		this.sv_grad = new Layer(360, 360);
		this.sv_grad.acquireContext(true);
		this.sv_grad.initProgram(UV_OUT_VERTEX_SHADER, HSV_FRAGMENT_SHADER);
		this.sv_grad.setUniforms([
			{
				"name": "hue",
				"value": this.hsva[0] || 0.0,
				"setter": setFloatUniform
			},
			{
				"name": "sv",
				"value": new Float32Array([this.hsva[1], this.hsva[2]]),
				"setter": setVec2Uniform
			}
		]);
		this.sv_grad.setPixelBuffer(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,]));
		this.sv_grad.initDrawState();
		this.sv_grad.initVertexBuffer();
		this.sv_grad.setAttribs([
			{
				"loc": 0,
				"size": 2,
				"normalise": false, 
				"stride": 0,
				"offset": 0,
				"setter": setClipSpaceAttrib
			}

		]);
		this.sv_grad.clear();
		this.sv_grad.drawTriangles(2);
	}

	updateHue(){
		this.sv_grad.setUniforms([
			{
				"name": "hue",
				"value": this.hsva[0] || 0.0,
				"setter": setFloatUniform
			},
			{
				"name": "sv",
				"value": new Float32Array([this.hsva[1], this.hsva[2]]),
				"setter": setVec2Uniform
			}
		]);
		this.sv_grad.clear();
		this.sv_grad.drawTriangles(2);
	}

	updatePreview(){
		this.preview.style.background = this.color_hex;
		this.hex_input.value = this.color_hex;
	}


	render(root: HTMLButtonElement, callback: () => void){
		const container = document.createElement("div");
		container.popover = "auto";
		root.popoverTargetElement = container;
		root.popoverTargetAction = "toggle";

		container.addEventListener("beforetoggle", (e) => {
			if((e as ToggleEvent).newState == "closed") {
				container.style.display = "none";
				callback();
			} else {
				container.style.display = "grid";
				container.style.gap = "1rem";
			}
		});

		this.sv_grad.canvas.addEventListener("click", (e) => {
			this.hsva[1] = e.offsetX/this.sv_grad.canvas.clientWidth;
			this.hsva[2] = 1 - e.offsetY/this.sv_grad.canvas.clientHeight;
			this.updateHue();
			const [r, g, b] = hsv2rgb(this.hsva[0], this.hsva[1], this.hsva[2]);
			this.color_hex = "#" + uint8ToHex(new Uint8Array([r, g, b, this.hsva[3]*255]));
			this.updatePreview();
		});
		this.hue_grad.canvas.addEventListener("click", (e) => {
			this.hsva[0] = e.offsetX/this.hue_grad.canvas.clientWidth;
			this.updateHue();
			const [r, g, b] = hsv2rgb(this.hsva[0], this.hsva[1], this.hsva[2]);
			this.color_hex = "#" + uint8ToHex(new Uint8Array([r, g, b, this.hsva[3]*255]));
			this.updatePreview();
		});
		const fragment = document.createDocumentFragment();
		fragment.appendChild(this.sv_grad.canvas);
		fragment.appendChild(this.hue_grad.canvas);

		const preview_wrapper = document.createElement("div");
		preview_wrapper.style.display = "flex";
		preview_wrapper.style.gap = "1rem";
		this.preview = document.createElement("div");
		this.preview.style.background = this.color_hex;
		this.preview.style.height = "4rem";
		this.preview.style.width = "5rem";
		this.preview.style.borderRadius = "15%";

		this.hex_input = document.createElement("input");
		this.hex_input.type = "text";
		this.hex_input.style.fontSize = "1.5rem";
		this.hex_input.style.fontFamily = "monospace";
		this.hex_input.style.border = "none";
		this.hex_input.style.width = "9rem";
		this.hex_input.value = this.color_hex;
		this.hex_input.addEventListener("input", (e) => {
			const color = (e.target as HTMLInputElement).value;
			if(color.length == 9){
				this.color_hex = color;
				const [r, g, b, a] = hexToVec(color);
				this.hsva = [...rgb2hsv(r,g,b), a];
				this.updateHue();
			}
		});
		preview_wrapper.appendChild(this.preview);
		preview_wrapper.appendChild(this.hex_input);
		fragment.appendChild(preview_wrapper);

		container.appendChild(fragment);

		document.body.appendChild(container);
	}
}
