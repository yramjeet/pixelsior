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

export const UV_OUT_VERTEX_SHADER = `#version 300 es
	layout(location = 0) in vec2 a_pos;

	out vec2 v_uv;

	void main(){
		v_uv = a_pos * 0.5 + 0.5;
		gl_Position = vec4(a_pos, 0.0, 1.0);
	}`;

export const HUE_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	
	in vec2 v_uv;
	out vec4 out_color;

	vec3 hsv2rgb(float h){
		float c = 1.0;
		float x = 1.0 - abs(mod(h * 6.0, 2.0) - 1.0);

		vec3 rgb;

		if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
		else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
		else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
		else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
		else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
		else rgb = vec3(c, 0.0, x);

		return rgb;
	}

	void main(){
		float hue = v_uv.x;
		vec3 rgb = hsv2rgb(hue);
		out_color = vec4(rgb, 1.0);
	}`;

export const HSV_FRAGMENT_SHADER = `#version 300 es
	precision mediump float;
	
	uniform float hue;
	in vec2 v_uv;
	out vec4 out_color;

	vec3 hsv2rgb(float h, float s, float v){
		float c = s * v; 
		float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
		float m = v - c;

		vec3 rgb;

		if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
		else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
		else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
		else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
		else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
		else rgb = vec3(c, 0.0, x);

		return rgb + vec3(m);
	}

	void main(){
		float s = v_uv.x;
		float v = v_uv.y;
		vec3 rgb = hsv2rgb(hue, s, v);
		out_color = vec4(rgb, 1.0);
	}`;
