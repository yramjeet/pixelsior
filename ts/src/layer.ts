import { createProgram, hexToVec4, unit8ToVec4 } from "./utils.js";

interface UniformMetadata {
	name: string;
	value: number | Float32Array;
	setter: Function;
}

export class Layer {
	canvas: HTMLCanvasElement;
	ctx!: WebGL2RenderingContext;
	program!: WebGLProgram;
	image_data!: ImageData;
	pixel_buffer!: Float32Array;
	vertex_buffer!: WebGLBuffer;
	draw_state!: WebGLVertexArrayObject;

	constructor(width: number, height: number){
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
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
		this.pixel_buffer = unit8ToVec4(image_data.data);
	}

	setPixelBuffer(vertex_data: Float32Array){
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

	updateBuffer(vertex_data: Float32Array, offset = 0){
		this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
		this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, vertex_data);
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
		const [r, g, b, a] = hexToVec4(color);
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
}

