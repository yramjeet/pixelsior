function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error(`Failed to create ${type} shader.`);
}
export function createProgram(gl, vs_source, fs_source) {
    const vertex_shader = createShader(gl, gl.VERTEX_SHADER, vs_source);
    const fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fs_source);
    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteShader(vertex_shader);
        gl.deleteShader(fragment_shader);
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Failed to create program");
}
export function setFloatUniform(gl, program, name, value) {
    const loc = gl.getUniformLocation(program, name);
    gl.uniform1f(loc, value);
}
export function setVec2Uniform(gl, program, name, value) {
    const loc = gl.getUniformLocation(program, name);
    gl.uniform2f(loc, value[0], value[1]);
}
export function setVec4Uniform(gl, program, name, value) {
    const loc = gl.getUniformLocation(program, name);
    gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
}
export function setColorAttrib(gl, loc, size, normalise, stride, offset) {
    gl.vertexAttribPointer(loc, size, gl.UNSIGNED_BYTE, normalise, stride, offset);
    gl.enableVertexAttribArray(loc);
}
export function setCoordAttrib(gl, loc, size, normalise, stride, offset) {
    gl.vertexAttribPointer(loc, size, gl.UNSIGNED_SHORT, normalise, stride, offset);
    gl.enableVertexAttribArray(loc);
}
export function hexToUint8(hex_str) {
    const hex = hex_str.split("#").pop();
    if (!hex) {
        throw new Error("Invalid hex string.");
    }
    const arr = new Uint8Array(hex.length / 2);
    let i = 0;
    let j = 0;
    while (i < hex.length) {
        arr[j] = parseInt(hex.substring(i, i + 2), 16);
        j = j + 1;
        i = i + 2;
    }
    return arr;
}
export function hexToVec4(hex_str) {
    return (new Float32Array(hexToUint8(hex_str)))
        .map(v => v / 255);
}
export function unit8ToVec4(arr) {
    return (new Float32Array(arr)).map(v => v / 255);
}
export function resizeImage(image_data, new_width, new_height) {
    const new_image = new ImageData(new_width, new_height);
    let i = 0, j = 0;
    while (i < image_data.data.length && j < new_image.data.length) {
        new_image.data[j] = image_data.data[i];
        i = i + 1;
        j = j + 1;
        if (image_data.width <= new_width && (i % (image_data.width * 4) == 0)) {
            j = new_image.width * (i / image_data.width);
        }
        else if (new_width < image_data.width && (j % (new_width * 4) == 0)) {
            i = image_data.width * (j / new_width);
        }
    }
    return new_image;
}
