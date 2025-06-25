export const COLOR_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	in vec4 v_color;
	out vec4 out_color;

	void main(){
		out_color = v_color;
	}`;

export const GRID_VERTEX_SHADER = `#version 300 es
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
		v_color = ((gl_VertexID + y)%2 == 0) ? vec4(0.6, 0.6, 0.6, 0.3) : vec4(0.4, 0.4, 0.4, 0.3);
	}`;

export const COLOR_VERTEX_SHADER = `#version 300 es
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

export const COORD_VERTEX_SHADER = `#version 300 es
	uniform vec2 u_res;
	uniform float u_ps;
	
	layout(location = 0) in vec2 a_pos;

	void main(){
		float cw = u_res.x * u_ps;
		float ch = u_res.y * u_ps;
		float rx = (a_pos.x * u_ps * 2.0 - cw)/cw + (u_ps/cw);
		float ry = (ch - a_pos.y * u_ps * 2.0)/ch - (u_ps/ch);
		gl_Position = vec4(rx, ry, 0.0, 1.0);
		gl_PointSize = u_ps * 0.75;
	}`;

export const COORD_COLOR_VERTEX_SHADER = `#version 300 es
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

export const UNIFORM_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	uniform vec4 u_color;

	out vec4 out_color;

	void main(){
		out_color = u_color;
	}`;

