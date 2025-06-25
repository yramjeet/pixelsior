export class Status {
    res;
    coord;
    color;
    constructor(root, width, height, x, y, color_hex) {
        const fragment = document.createDocumentFragment();
        const res = document.createElement("span");
        res.textContent = `${width} X ${height}`;
        this.res = res;
        fragment.appendChild(res);
        const coord = document.createElement("span");
        coord.textContent = `${x},${y}`;
        this.coord = coord;
        fragment.appendChild(coord);
        const color = document.createElement("span");
        color.textContent = color_hex;
        this.color = color;
        fragment.appendChild(color);
        root.appendChild(fragment);
    }
    updateRes(width, height) {
        this.res.textContent = `${width} X ${height}`;
    }
    updateCoord(x, y) {
        this.coord.textContent = `${x},${y}`;
    }
    updateColor(color_hex) {
        this.color.textContent = color_hex;
    }
}
