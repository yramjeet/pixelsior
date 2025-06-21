import { createProgram, hexToVec4 } from "./utils.js";
export class Layer {
    canvas;
    ctx;
    program;
    image_data;
    pixel_buffer;
    vertex_buffer;
    draw_state;
    constructor(width, height) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
    }
    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.viewport(0, 0, width, height);
    }
    acquireContext(alpha = false) {
        const ctx = this.canvas.getContext("webgl2", { alpha: alpha });
        if (ctx != null) {
            this.ctx = ctx;
            return ctx;
        }
        throw new Error("Failed to get Webgl2 context.");
    }
    initProgram(vs_source, fs_source) {
        this.program = createProgram(this.ctx, vs_source, fs_source);
        this.ctx.useProgram(this.program);
    }
    initImageData(image_data) {
        this.image_data = image_data;
        this.pixel_buffer = image_data.data;
    }
    setPixelBuffer(vertex_data) {
        this.pixel_buffer = vertex_data;
    }
    setUniforms(uniforms) {
        uniforms.forEach(u => u.setter(this.ctx, this.program, u.name, u.value));
    }
    initDrawState() {
        this.draw_state = this.ctx.createVertexArray();
        this.ctx.bindVertexArray(this.draw_state);
    }
    initVertexBuffer() {
        this.vertex_buffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.pixel_buffer, this.ctx.DYNAMIC_DRAW);
    }
    resetBuffer() {
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.pixel_buffer, this.ctx.DYNAMIC_DRAW);
    }
    updateImageData(arr, offset) {
        arr.forEach((v, i) => {
            this.image_data.data[offset + i] = v;
        });
    }
    updateBuffer(vertex_data, offset = 0) {
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertex_buffer);
        this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, offset * vertex_data.BYTES_PER_ELEMENT, vertex_data);
    }
    setAttribs(attribs) {
        attribs.forEach(a => a.setter(this.ctx, a.loc, a.size, a.normalise, a.stride, a.offset));
    }
    setAttrib(a_loc, a_size, stride, offset) {
        this.ctx.vertexAttribPointer(a_loc, a_size, this.ctx.FLOAT, false, stride, offset);
        this.ctx.enableVertexAttribArray(a_loc);
    }
    clear(color = "#00000000") {
        const [r, g, b, a] = hexToVec4(color);
        this.ctx.clearColor(r, g, b, a);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
    }
    enableBlend() {
        this.ctx.enable(this.ctx.BLEND);
        this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
    }
    drawPixels(count) {
        this.ctx.drawArrays(this.ctx.POINTS, 0, count);
    }
}
