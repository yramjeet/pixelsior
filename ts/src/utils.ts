type ShaderType = WebGL2RenderingContext["VERTEX_SHADER"] | WebGL2RenderingContext["FRAGMENT_SHADER"];

function createShader(gl: WebGL2RenderingContext, type: ShaderType, source: string): WebGLShader{
	const shader = gl.createShader(type) as WebGLShader;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
	throw new Error(`Failed to create ${type} shader.`);
}

export function createProgram(gl: WebGL2RenderingContext, vs_source: string, fs_source: string){
	const vertex_shader = createShader(gl, gl.VERTEX_SHADER, vs_source);
	const fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fs_source);

	const program = gl.createProgram() as WebGLProgram;

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
	throw new Error("Failed to create program");
}	

export function setFloatUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, value: number){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform1f(loc, value);
}

export function setVec2Uniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, value: Float32Array){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform2f(loc, value[0], value[1]);
}

export function setVec4Uniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, value: Float32Array){
	const loc = gl.getUniformLocation(program, name);
	gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
}

export function setColorAttrib(gl: WebGL2RenderingContext, loc: number, size: number, normalise: boolean, stride:number, offset: number){
	gl.vertexAttribPointer(
		loc,
		size,
		gl.UNSIGNED_BYTE,
		normalise,
		stride,
		offset
	);
	gl.enableVertexAttribArray(loc);
}

export function setCoordAttrib(gl: WebGL2RenderingContext, loc: number, size: number, normalise: boolean, stride:number, offset: number){
	gl.vertexAttribPointer(
		loc,
		size,
		gl.UNSIGNED_SHORT,
		normalise,
		stride,
		offset
	);
	gl.enableVertexAttribArray(loc);
}

export function setClipSpaceAttrib(gl: WebGL2RenderingContext, loc: number, size: number, normalise: boolean, stride:number, offset: number){
	gl.vertexAttribPointer(
		loc,
		size,
		gl.FLOAT,
		normalise,
		stride,
		offset
	);
	gl.enableVertexAttribArray(loc);
}

export function hexToUint8(hex_str: string): Uint8Array {
	const hex = hex_str.split("#").pop();
	if(!hex){
		throw new Error("Invalid hex string.");
	}

	const arr = new Uint8Array(hex.length/2);

	let i = 0;
	let j = 0;

	while(i < hex.length){
		arr[j] = parseInt(hex.substring(i, i+2), 16);
		j = j + 1;
		i = i + 2;
	}

	return arr;
}

export function hexToVec(hex_str: string) :Float32Array {
	return (new Float32Array(hexToUint8(hex_str)))
		.map(v => v/255);
}

export function uint8ToHex(arr: Uint8Array) :string{
	return arr.reduce((acc, v) => {
		return acc + v.toString(16).padStart(2, "0");
	}, "");
}

export function unit8ToVec4(arr: Uint8Array | Uint8ClampedArray): Float32Array {
	return (new Float32Array(arr)).map(v => v/255);
}

export function resizeImage(image_data: ImageData, new_width: number, new_height: number): ImageData{
	const new_image = new ImageData(new_width, new_height);

	let i = 0, j = 0;
	while(i < image_data.data.length && j < new_image.data.length){
		new_image.data[j] = image_data.data[i];
		i = i + 1;
		j = j + 1;
		if(image_data.width <= new_width && (i % (image_data.width * 4) == 0)){
			j = new_image.width * (i / image_data.width);
		} else if(new_width < image_data.width && (j % (new_width * 4) == 0)){
			i = image_data.width * (j / new_width);
		}
	}

	return new_image;
}

export function throttle<T extends(...args: any[]) => void>(fn: T, ms_delay: number): T {
	let last_trigger = 0;

	return function(this: any, ...args : Parameters<T>) {
		const now = Date.now();
		if( now - last_trigger >= ms_delay){
			last_trigger = now;
			fn.apply(this, args);
		}
	} as T;
}

export function rgb2hsv(r: number, g:number, b:number): [number, number, number]{
	const c_max = Math.max(r, g, b);
	const c_min = Math.min(r, g, b);

	const d = c_max - c_min;

	let s , h = c_max;

	if(d==0){
		h = 0;
	} else if (c_max == r){
		h = ((g - b)/d) % 6;
	} else if (c_max == g){
		h = ((b - r)/d) + 2;
	} else if (c_max == b){
		h = ((r - g)/d) + 4;
	}
	
	h = h/6;
	if (h < 0) {
		h = h+1;
	}
	if (c_max == 0){
		s = 0;
	} else {
		s = d/c_max;
	}
	return [h, s, c_max];
}

export function hsv2rgb(h: number, s:number, v:number): [number, number, number]{
	const c = v * s;
	const x = c * (1 - Math.abs((h*6)%2 - 1));
	const m = v - c;

	let rgb;

	if (h < 1.0/6.0) rgb = [c, x, 0.0];
	else if (h < 2.0/6.0) rgb = [x, c, 0.0];
	else if (h < 3.0/6.0) rgb = [0.0, c, x];
	else if (h < 4.0/6.0) rgb = [0.0, x, c];
	else if (h < 5.0/6.0) rgb = [x, 0.0, c];
	else rgb = [c, 0.0, x];

	return rgb.map(val => (val + m) * 255) as [number, number, number];  
}
