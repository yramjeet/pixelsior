import { Editor } from "./editor.js";

const layers_div = document.getElementById("layers") as HTMLDivElement;
const cmd_input = document.getElementById("cmd") as HTMLInputElement;
const status_div = document.getElementById("status") as HTMLDivElement;

const editor = new Editor(layers_div, cmd_input, status_div);
editor.initGridLayer();
editor.initImageLayer();
editor.initCursorLayer();
editor.addListeners();
