import { createProgram, hexToVec, unit8ToVec4 } from "./utils.js";

type TypedArray = Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Float32Array;

interface UniformMetadata {
	name: string;
	value: number | TypedArray; 
	setter: Function;
}

interface AttributeMetadata {
	loc: number;
	size: 1 | 2 | 3 | 4;
	stride: number;
	offset: number,
	normalise: boolean;
	setter: Function;
}

export class Layer {
	canvas: HTMLCanvasElement;
	ctx!: WebGL2RenderingContext;
	program!: WebGLProgram;
	image_data!: ImageData;
	pixel_buffer!: TypedArray;
	vertex_buffer!: WebGLBuffer;
	draw_state!: WebGLVertexArrayObject;

	constructor(width: number, height: number){
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
	}

	getColorVecAtOffset(offset: number) : Uint8Array {
		return new Uint8Array([
			this.image_data.data[offset],
			this.image_data.data[offset + 1],
			this.image_data.data[offset + 2],
			this.image_data.data[offset + 3]
		]);
	}

	resizeCanvas(width: number, height: number){
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx.viewport(0, 0, width, height);
	}

	acquireContext(alpha: boolean = false) : WebGL2RenderingContext {
		const ctx = this.canvas.getContext("webgl2", { alpha: alpha });

		if(ctx != null ){
			this.ctx = ctx;
			return ctx;
		}
		
		throw new Error("Failed to get Webgl2 context.");
	}

	initProgram(vs_source: string, fs_source: string){
		this.program = createProgram(this.ctx, vs_source, fs_source);
		this.ctx.useProgram(this.program);
	}

	initImageData(image_data: ImageData){
		this.image_data = image_data;
		this.pixel_buffer = image_data.data;
	}

	setPixelBuffer(vertex_data: TypedArray){
		this.pixel_buffer = vertex_data;
	}

	setUniforms(uniforms: Array<UniformMetadata>){
		uniforms.forEach(u => u.setter(this.ctx, this.program, u.name, u.value));
	}

	initDrawState(){
		this.draw_state = this.ctx.createVertexArray();
		this.ctx.bindVertexArray(this.draw_state);
	}

	initVertexBuffer(){
		this.vertex_buffer = this.ctx.createBuffer();
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.pixel_buffer, this.ctx.DYNAMIC_DRAW);
	}
	
	resetBuffer(){
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.pixel_buffer, this.ctx.DYNAMIC_DRAW);
	}

	updateImageData(arr: Uint8Array, offset: number){
		arr.forEach((v,i) => {
			this.image_data.data[offset+i] = v
		});
	}

	updateBuffer(vertex_data: TypedArray, offset = 0){
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
		this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, offset * vertex_data.BYTES_PER_ELEMENT, vertex_data);
	}

	setAttribs(attribs: Array<AttributeMetadata>){
		attribs.forEach(a => a.setter(this.ctx, a.loc, a.size, a.normalise, a.stride, a.offset));
	}

	setAttrib(a_loc: number, a_size: number, stride: number, offset: number){
		this.ctx.vertexAttribPointer(
			a_loc,
			a_size,
			this.ctx.FLOAT,
			false,
			stride,
			offset
		);
		this.ctx.enableVertexAttribArray(a_loc);
	}

	clear(color: string = "#00000000"){
		const [r, g, b, a] = hexToVec(color);
		this.ctx.clearColor(r, g, b, a);
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
	}

	enableBlend(){
		this.ctx.enable(this.ctx.BLEND);
		this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
	}

	drawPixels(count: number){
		this.ctx.drawArrays(
			this.ctx.POINTS,
			0,
			count
		);
	}

	drawTriangles(count: number){
		this.ctx.drawArrays(
			this.ctx.TRIANGLES,
			0,
			count * 3
		);
	}
}

