function create_shader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	if(success) {
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function create_program(gl, vs_source, fs_source) {
	const vertex_shader = create_shader(gl, vs_source, gl.VERTEX_SHADER);
	const fragment_shader = create_shader(gl, fs_source, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();

	gl.attachShader(program, vertex_shader);
	gl.attachShader(program, fragment_shader);

	gl.linkProgram(program);

	const success  = gl.getProgramParameter(program, gl.LINK_STATUS);

	if(success) {
		gl.deleteShader(vertex_shader);
		gl.deleteShader(fragment_shader);

		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function generate_pixel_buffer(vw, vh, ps){
	const sw = parseInt(vw/ps);
	const sh = parseInt(vh/ps);

	const qw = vw/2;
	const qh = vh/2;

	const r = ps/2;

	const data  = new Float32Array(sw * sh * 6);
	let idx = 0;

	for(let h = 0; h < sh; h++){
		for(let w = 0; w < sw; w++){
			data[idx++] = (w*ps + r - qw)/qw;
			data[idx++] = (qh - h*ps - r)/qh;
			data[idx++] = 0.0;
			data[idx++] = 1.0;
			data[idx++] = 0.0;
			data[idx++] = 0.0;
		}
	}

	return data;
}

function get_vertex_data(vw, vh, ps, x, y){
	return new Float32Array([
		(x*ps + (ps/2) - vw/2) / (vw/2),
		(vh/2 - y*ps - (ps/2)) / (vh/2)
	]);
}

function GL(canvas) {
	this.gl = canvas.getContext("webgl2", {alpha: true});  
}

GL.prototype.init = function(vs_source, fs_source) {
	this.program = create_program(this.gl, vs_source, fs_source);
	this.gl.useProgram(this.program);
}

GL.prototype.init_state = function(vertex_data, has_color = false) {
	this.state = this.gl.createVertexArray();
	this.gl.bindVertexArray(this.state);

	// see if this could be a local scope var
	this.data_buffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.data_buffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, vertex_data, this.gl.DYNAMIC_DRAW);
	this.gl.vertexAttribPointer(
		0,
		2,
		this.gl.FLOAT,
		false,
		has_color ? 6*4 : 0,
		0
	);

	this.gl.enableVertexAttribArray(0);

	if(has_color){

		this.gl.vertexAttribPointer(
			1,
			4,
			this.gl.FLOAT,
			false,
			has_color ? 6*4 : 0,
			2*4
		);

		this.gl.enableVertexAttribArray(1);
	}
}


GL.prototype.draw = function(item_count, offset = 0) {
	this.gl.drawArrays(
		this.gl.POINTS,
		offset,
		item_count
	);
}

GL.prototype.clear = function (color = "#00000000") {
	this.gl.clearColor(
		...Uint8Array.fromHex(
			color.split("#").pop()
		).map(v => v/255)
	);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}

GL.prototype.updateBuffer = function(offset, data){
	this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, data)
}

function Pixelsior(width, height) {
	this.width = width;
	this.height = height;
	this.x = width/2;
	this.y = height/2;
}

Pixelsior.prototype.init = function() {
	this.bg_canvas = document.getElementById("grd");
	this.bg_canvas.width = this.width * 20;
	this.bg_canvas.height = this.height * 20;
	this.bg_ctx = new GL(this.bg_canvas);
	this.bg_ctx.init(grid_vertex_shader(64, 64), color_fragment_shader());
	this.bg_ctx.draw(64*64);
	this.sprite_canvas = document.getElementById("sprt");
	this.sprite_canvas.width = this.width * 20;
	this.sprite_canvas.height = this.height * 20;
	this.sprite_ctx = new GL(this.sprite_canvas);
	this.sprite_ctx.init(position_color_vertex_shader(), color_fragment_shader());
	const d = generate_pixel_buffer(this.sprite_canvas.width, this.sprite_canvas.height, 20)
	console.log(d)
	this.sprite_ctx.init_state(generate_pixel_buffer(this.sprite_canvas.width, this.sprite_canvas.height, 20), true);
	this.sprite_ctx.gl.enable(this.sprite_ctx.gl.BLEND);
	this.sprite_ctx.gl.blendFunc(this.sprite_ctx.gl.SRC_ALPHA, this.sprite_ctx.gl.ONE_MINUS_SRC_ALPHA);

	this.sprite_ctx.clear();
	this.sprite_ctx.draw(this.width * this.height);
	this.nav_canvas = document.getElementById("nav");
	this.nav_canvas.width = this.width * 20;
	this.nav_canvas.height = this.height * 20;
	this.nav_ctx = new GL(this.nav_canvas);
	this.nav_ctx.init(position_vertex_shader(), fixed_fragment_shader());
	this.nav_ctx.init_state(get_vertex_data(
		this.nav_canvas.width,
		this.nav_canvas.height,
		20,
		this.x,
		this.y
		)
	);

	this.nav_ctx.gl.enable(this.nav_ctx.gl.BLEND);
	this.nav_ctx.gl.blendFunc(this.nav_ctx.gl.SRC_ALPHA, this.nav_ctx.gl.ONE_MINUS_SRC_ALPHA);
	this.nav_ctx.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	this.nav_ctx.gl.clear(this.nav_ctx.gl.COLOR_BUFFER_BIT);
	this.nav_ctx.draw(1);

}

Pixelsior.prototype.move_up = function(){
	this.y = this.y == 0 ? (this.height - 1) : this.y - 1;
//	this.nav_ctx.clear();
	this.nav_ctx.updateBuffer(
		0,
		get_vertex_data(
			this.nav_canvas.width,
			this.nav_canvas.height,
			20,
			this.x,
			this.y
		)
	);
//	this.nav_ctx.draw(1);
	this.sprite_ctx.updateBuffer(
		((this.width* this.y + this.x) * 6 + 2)*4,
		new Float32Array([1.0, 0.0, 0.0, 1.0])
	);
	this.sprite_ctx.draw(this.width * this.height);
	this.nav_ctx.draw(1);
}
Pixelsior.prototype.addListners = function() {
	this.nav_canvas.addEventListener('keyup', (e) => {
		switch(e.key) {
			case "k" : {
				this.move_up();
				break;
			}
			case "f" : {
				this.fill();
			}
		}
	});
}

function grid_vertex_shader(width, height) {
	return `#version 300 es
	out vec4 v_color;

	void main() {
		int pw = 20;
		int tx = ${width} * 10;
		int ty = ${width} * 10;
		int y = int(gl_VertexID / ${height});
		int x = int(gl_VertexID % ${width}); 
		float rx = float(float(x*pw + 10 - tx)/float(tx));
		float ry = float(float(ty - y*pw - 10)/float(ty));
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = 20.0;
		v_color = ((gl_VertexID + y)%2 == 0) ? vec4(0.6, 0.6, 0.6, 1.0) : vec4(0.4, 0.4, 0.4, 1.0);
	}`;
}

function color_fragment_shader() {
	return `#version 300 es
	precision mediump float;
	in vec4 v_color;
	out vec4 out_color;

	void main() {
		out_color = v_color;
	}`;
}

function position_vertex_shader() {
	return `#version 300 es
	layout(location = 0) in vec4 a_position;

	void main() {
		gl_Position = a_position;
		gl_PointSize = 20.0;
	}`;
}

function fixed_fragment_shader() {
	return `#version 300 es
	precision mediump float;
	out vec4 out_color;

	void main() {
		out_color = vec4(0.0, 0.5, 0.5, 0.5);
	}`;
}

function position_color_vertex_shader() {
	return `#version 300 es
	layout(location = 0) in vec4 a_position;
	layout(location = 1) in vec4 a_color;

	out vec4 v_color;

	void main() {
		gl_Position = a_position;
		v_color = a_color;
		gl_PointSize = 20.0;
	}`;
}

const p = new Pixelsior(64, 64);
p.init();
p.addListners();
