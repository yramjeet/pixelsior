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

export function hexToVec4(hex_str: string) :Float32Array {
	return (new Float32Array(hexToUint8(hex_str)))
		.map(v => v/255);
}

export function unit8ToVec4(arr: Uint8Array | Uint8ClampedArray): Float32Array {
	return (new Float32Array(arr)).map(v => v/255);
}
