import { Editor } from "./editor.js";

const layers_div = document.getElementById("layers") as HTMLDivElement;
const cmd_input = document.getElementById("cmd") as HTMLInputElement;

const editor = new Editor(layers_div, cmd_input);
editor.initGridLayer();
editor.initImageLayer();
editor.initCursorLayer();
editor.addListeners();
