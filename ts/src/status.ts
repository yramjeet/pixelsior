export class Status {
	res!: HTMLSpanElement;
	coord!: HTMLSpanElement;
	color!: HTMLSpanElement;

	constructor(root: HTMLDivElement, width: number, height: number, x: number, y: number, color_hex: string){
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

	updateRes(width: number, height: number){
		this.res.textContent = `${width} X ${height}`;
	}
	updateCoord(x: number, y: number){
		this.coord.textContent = `${x},${y}`;
	}
	updateColor(color_hex: string){
		this.color.textContent = color_hex;
	}
}
