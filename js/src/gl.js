// UTILS
const COLOR_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	in vec4 v_color;
	out vec4 out_color;

	void main(){
		out_color = v_color;
	}`;

const GRID_VERTEX_SHADER = `#version 300 es
	uniform vec2 u_res;
	uniform float u_ps;
	out vec4 v_color;

	void main(){
		int x = gl_VertexID % int(u_res.x);
		int y = gl_VertexID / int(u_res.y);
		float cw = u_res.x * u_ps;
		float ch = u_res.y * u_ps;
		float rx = (float(x) * u_ps * 2.0 - cw)/cw + (u_ps/cw);
		float ry = (ch - float(y) * u_ps * 2.0)/ch - (u_ps/ch);
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = u_ps;
		v_color = ((gl_VertexID + y)%2 == 0) ? vec4(0.6, 0.6, 0.6, 1.0) : vec4(0.4, 0.4, 0.4, 1.0);
	}`;

const COLOR_VERTEX_SHADER = `#version 300 es
	uniform vec2 u_res;
	uniform float u_ps;
	
	layout(location = 0) in vec4 a_color;

	out vec4 v_color;

	void main(){
		int x = gl_VertexID % int(u_res.x);
		int y = gl_VertexID / int(u_res.y);
		float cw = u_res.x * u_ps;
		float ch = u_res.y * u_ps;
		float rx = (float(x) * u_ps * 2.0 - cw)/cw + (u_ps/cw);
		float ry = (ch - float(y) * u_ps * 2.0)/ch - (u_ps/ch);
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = u_ps;
		v_color = a_color;
	}`;

const COORD_VERTEX_SHADER = `#version 300 es
	uniform vec2 u_res;
	uniform float u_ps;
	
	layout(location = 0) in vec2 a_pos;

	void main(){
		float cw = u_res.x * u_ps;
		float ch = u_res.y * u_ps;
		float rx = (a_pos.x * u_ps * 2.0 - cw)/cw + (u_ps/cw);
		float ry = (ch - a_pos.y * u_ps * 2.0)/ch - (u_ps/ch);
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = u_ps;
	}`;

const COORD_COLOR_VERTEX_SHADER = `#version 300 es
	uniform vec2 u_res;
	unifrom float u_ps;

	layout(location = 0) in vec2 a_pos;
	layout(location = 1) in vec3 a_color;

	out vec4 v_color;

	void main(){
		float cw = u_res.x * u_ps;
		float ch = u_res.y * u_ps;
		float rx = (a_pos.x * u_ps * 2.0 - cw)/cw + (u_ps/cw);
		float ry = (ch - a_pos.y * u_ps * 2.0)/ch - (u_ps/ch);
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = u_ps;
		v_color = a_color;
	}`;

const UNIFORM_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	uniform vec4 u_color;

	out vec4 out_color;

	void main(){
		out_color = u_color;
	}`;

function set_float_uniform(gl, program, name, value){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform1f(loc, value);
}

function set_vec2_uniform(gl, program, name, value){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform2f(loc, ...value);
}

function set_vec4_uniform(gl, program, name, value){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform4f(loc, ...value);
}

function hex_to_vec4(hex_str){
	return (new Float32Array(Uint8Array.fromHex(
		hex_str.split("#").pop()
	))).map(v => v/255);
}

function uint8_to_vec4(arr){
	return (new Float32Array(arr)).map(v => v/255);
}

function create_pixel_buffer(image_data){
	const buffer = new Float32Array(image_data.width * image_data.height * 6);
	let idx = 0;
	let c_idx = 0
	for(let h = 0; w < image_data.height; ++h){
		for(let w = 0; w < image_data.width; ++w){
			buffer[idx] = w; 
			buffer[idx + 1] = h; 

			idx += 2;

			buffer[idx] = image_data.data[c_idx];
			buffer[idx + 1] = image_data.data[c_idx + 1];
			buffer[idx + 2] = image_data.data[c_idx + 2];
			buffer[idx + 3] = image_data.data[c_idx + 3];
			idx += 4;
			c_idx += 4;
		}
	}
	return buffer;
}

function create_shader(gl, type, source){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function create_program(gl, vs_source, fs_source){
	const vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vs_source);
	const fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fs_source);

	const program = gl.createProgram();
	
	gl.attachShader(program, vertex_shader);
	gl.attachShader(program, fragment_shader);

	gl.linkProgram(program);

	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		gl.deleteShader(vertex_shader);
		gl.deleteShader(fragment_shader);

		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function Layer2D(width, height, pixel_size = 20){
	this.width = width;
	this.height = height;
	this.pixel_size = pixel_size;
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width * this.pixel_size;
	this.canvas.height = this.height * this.pixel_size;
}

Layer2D.prototype.acquire_context = function(use_alpha){
	this.ctx = this.canvas.getContext("webgl2", { alpha: use_alpha });
	if (!this.ctx){
		throw new Error("Failed to get Webgl2 context.");
	}
	return this.ctx;
}

Layer2D.prototype.init_program = function(vs_source, fs_source){
	this.program = create_program(this.ctx, vs_source, fs_source);
	this.ctx.useProgram(this.program);
}

Layer2D.prototype.set_uniform = function (name, value, setter) {
	setter(this.ctx, this.program, name, value)
}

Layer2D.prototype.clear = function(color = "00000000"){
	this.ctx.clearColor(...(hex_to_vec4(color)));
	this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
}

Layer2D.prototype.draw_pixels = function(item_count){
	this.ctx.drawArrays(
		this.ctx.POINTS,
		0,
		item_count
	);
}

Layer2D.prototype.enable_blend = function(){
	this.ctx.enable(this.ctx.BLEND);
	this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
}

Layer2D.prototype.init_state = function(){
	this.state = this.ctx.createVertexArray();
	this.ctx.bindVertexArray(this.state);
}

Layer2D.prototype.init_buffer = function(vertex_data){
	this.vertex_buffer = this.ctx.createBuffer();
	this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
	this.ctx.bufferData(this.ctx.ARRAY_BUFFER, vertex_data, this.ctx.DYNAMIC_DRAW);
}

Layer2D.prototype.set_attrib = function (a_loc, a_size, stride, offset){
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

Layer2D.prototype.init_image_data = function(image_data){
	if(image_data){
		this.image_data = image_data;
	} else {
		this.image_data = new ImageData(this.width, this.height)
	}
	this.pixel_buffer = uint8_to_vec4(this.image_data.data);
}

Layer2D.prototype.update_buffer = function(vertex_data, offset = 0){
	this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
	this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, offset * 4, vertex_data);
}

function Editor(layer_root, cmd_bar){
	this.rows = 30;
	this.cols = 30;
	this.x = parseInt(this.cols/2);
	this.y = parseInt(this.rows/2);
	this.pixel_size = 20;
	this.layers = [];
	this.layer_root = layer_root;
	this.cmd_bar = cmd_bar;
	this.color = '#ff3333ff';
}

Editor.prototype.handle_fill = function(){
	const offset = (this.y * this.cols + this.x) * 4;
	this.image_layer.update_buffer(hex_to_vec4(this.color), offset);
	this.image_layer.draw_pixels(this.rows * this.cols);

}

Editor.prototype.handle_erase = function(){
	const offset = (this.y * this.cols + this.x) * 4;
	this.image_layer.update_buffer(hex_to_vec4("#00000000"), offset);
	this.image_layer.draw_pixels(this.rows * this.cols);

}

Editor.prototype.add_layer = function(anchor){
	if (anchor) {

	} else {
		const layer = new Layer2D(this.cols, this.rows);
		this.layer_root.appendChild(layer.canvas);
		return layer;
	}
}

Editor.prototype.init_listeners = function(){
	this.layer_root.addEventListener('keydown', (e) => {
	
		switch(e.key){
			case 'k': {
				this.y = this.y == 0 ? (this.rows - 1) : this.y - 1;
				this.cursor_layer.update_buffer(new Float32Array([this.x, this.y]));
				this.cursor_layer.draw_pixels(1);
				break;
			}
			case 'j': {
				this.y = this.y == (this.rows - 1) ? 0 : this.y + 1;
				this.cursor_layer.update_buffer(new Float32Array([this.x, this.y]));
				this.cursor_layer.draw_pixels(1);
				break;
			}
			case 'h': {
				this.x = this.x == 0 ? (this.cols - 1) : this.x - 1;
				this.cursor_layer.update_buffer(new Float32Array([this.x, this.y]));
				this.cursor_layer.draw_pixels(1);
				break;
			}
			case 'l': {
				this.x = this.x == (this.cols - 1) ? 0 : this.x + 1;
				this.cursor_layer.update_buffer(new Float32Array([this.x, this.y]));
				this.cursor_layer.draw_pixels(1);
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
		}
	});
	
	this.cmd_bar.addEventListener('keyup', (e) => {
		switch(e.key){
			case 'Escape' : {
				this.cmd_bar.value = '';
				this.layer_root.focus();
				break;
			}
		}
	});

}

const layer_container = document.getElementById("layers");
const cmd_bar = document.getElementById("cmd");

const editor = new Editor(layer_container, cmd_bar);
// bg grid
const grid_layer = editor.add_layer();
grid_layer.acquire_context();
grid_layer.init_program(GRID_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
grid_layer.set_uniform("u_ps", editor.pixel_size, set_float_uniform);
grid_layer.set_uniform("u_res", new Float32Array([editor.cols, editor.rows]), set_vec2_uniform);
grid_layer.clear();
grid_layer.draw_pixels(grid_layer.width*grid_layer.height);
editor.grid_layer = grid_layer;

const image_layer = editor.add_layer();
image_layer.acquire_context(true);
image_layer.init_program(COLOR_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
image_layer.set_uniform("u_ps", editor.pixel_size, set_float_uniform);
image_layer.set_uniform("u_res", new Float32Array([editor.cols, editor.rows]), set_vec2_uniform);
image_layer.init_image_data();
image_layer.init_state();
image_layer.init_buffer(image_layer.pixel_buffer);
image_layer.set_attrib(0, 4, 0, 0);
image_layer.draw_pixels(image_layer.width*image_layer.height);
editor.image_layer = image_layer;

const cursor_layer = editor.add_layer();
cursor_layer.acquire_context(true);
cursor_layer.init_program(COORD_VERTEX_SHADER, UNIFORM_FRAGMENT_SHADER);
cursor_layer.set_uniform("u_ps", editor.pixel_size, set_float_uniform);
cursor_layer.set_uniform("u_res", new Float32Array([editor.cols, editor.rows]), set_vec2_uniform);
cursor_layer.set_uniform("u_color", hex_to_vec4("00777777"), set_vec4_uniform);
cursor_layer.init_state();
cursor_layer.init_buffer(new Float32Array([15, 15]));
cursor_layer.set_attrib(0, 2, 0, 0);
cursor_layer.draw_pixels(1);
editor.cursor_layer = cursor_layer;

editor.init_listeners();
