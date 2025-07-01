export class Status {
    res;
    coord;
    color;
    constructor(root, width, height, x, y, pixel_color, fill_color) {
        const fragment = document.createDocumentFragment();
        const res = document.createElement("span");
        res.textContent = `${width} X ${height}`;
        this.res = res;
        fragment.appendChild(res);
        const coord = document.createElement("span");
        coord.textContent = `${x},${y} : ${pixel_color}`;
        this.coord = coord;
        fragment.appendChild(coord);
        const color = document.createElement("span");
        color.textContent = fill_color;
        this.color = color;
        fragment.appendChild(color);
        root.appendChild(fragment);
    }
    updateRes(width, height) {
        this.res.textContent = `${width} X ${height}`;
    }
    updateCoord(x, y, color) {
        this.coord.textContent = `${x},${y} : ${color}`;
    }
    updateColor(fill_color) {
        this.color.textContent = fill_color;
    }
}
