const vs_source = `#version 300 es
layout(location = 0) in vec2 v_position;
void main(){
	gl_Position = vec4(v_position, 0., 1.0);
	gl_PointSize = 20.0;
}
`
const fs_source = `#version 300 es
precision mediump float;

out vec4 frag_color;

void main(){
	frag_color = vec4(0.7, 0.2, 0.9, 1.0);
}
`

function create_shader(gl, source, type){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}
	
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function create_program(gl, v_shader, f_shader){
	const program = gl.createProgram();
	gl.attachShader(program, v_shader);
	gl.attachShader(program, f_shader);

	gl.linkProgram(program);

	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		return program;
	}
	
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function GL(canvas){
	this.ctx = canvas.getContext("webgl2");

	if(!this.ctx){
		throw("Webgl2 not supported");
	}

	this.clear();
}
GL.prototype.clear = function(){
	this.ctx.clearColor(0.1, 0.1, 0.1, 1);
	this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
}

GL.prototype.init = function(vs, fs){
	const vshader = create_shader(this.ctx, vs, this.ctx.VERTEX_SHADER);
	const fshader = create_shader(this.ctx, fs, this.ctx.FRAGMENT_SHADER);
	const program = create_program(this.ctx, vshader, fshader);
	this.ctx.useProgram(program);
}

function Pixelsior (){
	this.width = 800;
	this.height = 800;
}

Pixelsior.prototype.init = function(canvas_ref){
	this.canvas = document.getElementById(canvas_ref);
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	console.log(this.canvas);
	this.gl = new GL(this.canvas);
	this.gl.init(vs_source, fs_source);
}

const pixel_size = 20;



const data_array = new Float32Array([
-0.05, 0.0,
0.1, 0.3,
0.5, 0.1
]);

const: p = new Pixelsior();
p.init('tile-map');
console.log(p.gl);
const gl = p.gl.ctx;
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, data_array, gl.STATIC_DRAW);

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(
	0,
	2,
	gl.FLOAT,
	false,
	0,
	0);
gl.drawArrays(gl.POINTS, 0, 3);
