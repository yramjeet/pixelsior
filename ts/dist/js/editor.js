import { Layer } from "./layer.js";
import { GRID_VERTEX_SHADER, COLOR_VERTEX_SHADER, COORD_VERTEX_SHADER, COLOR_FRAGMENT_SHADER, UNIFORM_FRAGMENT_SHADER } from "./shaders.js";
import { setFloatUniform, setVec2Uniform, setVec4Uniform, setColorAttrib, setCoordAttrib, hexToVec4, hexToUint8, resizeImage } from "./utils.js";
export class Editor {
    res = {
        width: 30,
        height: 30
    };
    coord = {
        x: Math.floor(this.res.width / 2),
        y: Math.floor(this.res.height / 2)
    };
    pixel_size = 20;
    color = "#c99494ff";
    splash_layer;
    grid_layer;
    image_layer;
    cursor_layer;
    // layers!: Array<Layer>;
    // active_layer!: Layer;
    layer_root;
    cmd_bar;
    constructor(layer_root, cmd_bar) {
        this.layer_root = layer_root;
        this.cmd_bar = cmd_bar;
    }
    addLayer(anchor) {
        const layer = new Layer(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
        this.layer_root.insertBefore(layer.canvas, anchor);
        // this.layers.push(layer);
        return layer;
    }
    initGridLayer() {
        this.grid_layer = this.addLayer(null);
        this.grid_layer.acquireContext(true);
        this.grid_layer.initProgram(GRID_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
        this.grid_layer.setUniforms([
            {
                "name": "u_ps",
                "value": this.pixel_size,
                "setter": setFloatUniform
            },
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            }
        ]);
        this.grid_layer.clear();
        this.grid_layer.enableBlend();
        this.grid_layer.drawPixels(this.res.width * this.res.height);
    }
    initImageLayer() {
        this.image_layer = this.addLayer(null);
        this.image_layer.acquireContext(true);
        this.image_layer.initProgram(COLOR_VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
        this.image_layer.setUniforms([
            {
                "name": "u_ps",
                "value": this.pixel_size,
                "setter": setFloatUniform
            },
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            }
        ]);
        this.image_layer.initImageData(new ImageData(this.res.width, this.res.height));
        this.image_layer.initDrawState();
        this.image_layer.initVertexBuffer();
        this.image_layer.setAttribs([
            {
                "loc": 0,
                "size": 4,
                "normalise": true,
                "stride": 0,
                "offset": 0,
                "setter": setColorAttrib
            }
        ]);
        this.image_layer.drawPixels(this.res.width * this.res.height);
    }
    initCursorLayer() {
        this.cursor_layer = this.addLayer(null);
        this.cursor_layer.acquireContext(true);
        this.cursor_layer.initProgram(COORD_VERTEX_SHADER, UNIFORM_FRAGMENT_SHADER);
        this.cursor_layer.setUniforms([
            {
                "name": "u_ps",
                "value": this.pixel_size,
                "setter": setFloatUniform
            },
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            },
            {
                "name": "u_color",
                "value": hexToVec4("#00777777"),
                "setter": setVec4Uniform
            }
        ]);
        this.cursor_layer.setPixelBuffer(new Uint16Array([this.coord.x, this.coord.y]));
        this.cursor_layer.initDrawState();
        this.cursor_layer.initVertexBuffer();
        this.cursor_layer.setAttribs([
            {
                "loc": 0,
                "size": 2,
                "normalise": false,
                "stride": 0,
                "offset": 0,
                "setter": setCoordAttrib
            }
        ]);
        this.cursor_layer.drawPixels(1);
    }
    setPixelColor(hex_color) {
        const offset = (this.coord.y * this.res.width + this.coord.x) * 4;
        const arr = hexToUint8(hex_color);
        this.image_layer.updateImageData(arr, offset);
        this.image_layer.updateBuffer(arr, offset);
        this.image_layer.drawPixels(this.res.width * this.res.height);
    }
    drawCursor() {
        this.cursor_layer.updateBuffer(new Uint16Array([this.coord.x, this.coord.y]));
        this.cursor_layer.drawPixels(1);
    }
    handleResize() {
        this.grid_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
        this.grid_layer.setUniforms([
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            }
        ]);
        this.grid_layer.clear();
        this.grid_layer.drawPixels(this.res.width * this.res.height);
        this.image_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
        this.image_layer.setUniforms([
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            }
        ]);
        this.image_layer.initImageData(resizeImage(this.image_layer.image_data, this.res.width, this.res.height));
        this.image_layer.resetBuffer();
        this.image_layer.clear();
        this.image_layer.drawPixels(this.res.width * this.res.height);
        this.cursor_layer.resizeCanvas(this.res.width * this.pixel_size, this.res.height * this.pixel_size);
        this.cursor_layer.setUniforms([
            {
                "name": "u_res",
                "value": new Uint16Array([this.res.width, this.res.height]),
                "setter": setVec2Uniform
            }
        ]);
        this.cursor_layer.clear();
        this.drawCursor();
    }
    handleCmd(cmd_str) {
        const cmd_args = cmd_str.split(" ");
        switch (cmd_args[0]) {
            case 'save': {
                const a = document.createElement("a");
                this.image_layer.drawPixels(this.res.width * this.res.height);
                const data = this.image_layer.canvas.toDataURL("image/png", 1.0);
                a.href = data;
                a.download = cmd_args[1] + ".png";
                a.click();
                break;
            }
            case 'set-color': {
                this.color = cmd_args[1];
                break;
            }
            case 'set-res': {
                const width = parseInt(cmd_args[1], 10);
                const height = parseInt(cmd_args[2], 10);
                this.res = { width, height };
                this.coord = {
                    x: Math.floor(this.res.width / 2),
                    y: Math.floor(this.res.height / 2)
                };
                this.handleResize();
            }
        }
    }
    addListeners() {
        this.layer_root.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'k': {
                    let { x, y } = this.coord;
                    y = y == 0 ? (this.res.height - 1) : y - 1;
                    this.coord = { x, y };
                    this.drawCursor();
                    break;
                }
                case 'j': {
                    let { x, y } = this.coord;
                    y = y == (this.res.height - 1) ? 0 : y + 1;
                    this.coord = { x, y };
                    this.drawCursor();
                    break;
                }
                case 'h': {
                    let { x, y } = this.coord;
                    x = x == 0 ? (this.res.width - 1) : x - 1;
                    this.coord = { x, y };
                    this.drawCursor();
                    break;
                }
                case 'l': {
                    let { x, y } = this.coord;
                    x = x == (this.res.width - 1) ? 0 : x + 1;
                    this.coord = { x, y };
                    this.drawCursor();
                    break;
                }
            }
        });
        this.layer_root.addEventListener('keyup', (e) => {
            switch (e.key) {
                case ':': {
                    e.stopPropagation();
                    this.cmd_bar.value = ":";
                    this.cmd_bar.focus();
                    break;
                }
                case 'f': {
                    this.setPixelColor(this.color);
                    break;
                }
                case 'x': {
                    this.setPixelColor("#00000000");
                    break;
                }
            }
        });
        this.cmd_bar.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'Escape': {
                    this.cmd_bar.value = '';
                    this.layer_root.focus();
                    break;
                }
                case 'Enter': {
                    this.handleCmd(this.cmd_bar.value.substring(1));
                    this.cmd_bar.value = '';
                    this.layer_root.focus();
                    break;
                }
            }
        });
    }
}
