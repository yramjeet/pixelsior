function Pixelsior(){
	this.color = 'green';
	this.width = 800;
	this.height = 800;
	this.row_count = 10;
	this.col_count = 10;
	this.cell_width = this.width / this.col_count;
	this.cell_height = this.height / this.row_count;
	this.canvas = null;
	this.ctx = null;
	this.grd = null;
	this.grd_ctx = null;
	this.cli = null;
}

Pixelsior.prototype.init_canvas = function(canvas_ref, grd_ref, cmd_ref){
	this.canvas = document.getElementById(canvas_ref);
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.ctx = this.canvas.getContext("2d");

	this.grd = document.getElementById(grd_ref);
	this.grd.width = this.width;
	this.grd.height = this.height;
	this.grd_ctx = this.grd.getContext("2d");

	if (!this.ctx || !this.grd_ctx) throw("No canvas context found");

	this.cli = document.getElementById(cmd_ref);
}


Pixelsior.prototype.draw_grid = function(){
	let start_point;
	for (let i = 0; i< this.row_count; ++i){
		start_point = i * this.cell_height;
	 	this.grd_ctx.beginPath();
		this.grd_ctx.moveTo(0, start_point);
		this.grd_ctx.lineTo(this.width, start_point);
		this.grd_ctx.stroke();
	}

	for (let i = 0; i< this.col_count; ++i){
		start_point = i * this.cell_width;
		this.grd_ctx.beginPath();
		this.grd_ctx.moveTo(start_point, 0);
		this.grd_ctx.lineTo(start_point,this.height);
		this.grd_ctx.stroke();
	}
}



function get_pos_by_idx(idx, row_count, col_count){
	const col = parseInt(idx/col_count);
	const row = (idx%col_count);
	return {row, col};
}

Pixelsior.prototype.draw_tile_map = function(tile_map){
	tile_map.forEach((pxl, idx) => {
		if(pxl != 0){
			const {row, col} = get_pos_by_idx(idx, this.row_count, this.col_count);
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect((row*this.cell_height), (col*this.cell_width), this.cell_height, this.cell_width);
		}
	});
}
    
Pixelsior.prototype.highlight_cell = function(col, row){
	this.grd_ctx.strokeStyle = 'red';
	this.grd_ctx.strokeRect((row*this.cell_height) - 2, (col*this.cell_width) - 2, this.cell_height + 4, this.cell_width + 4);
}

Pixelsior.prototype.draw_new_state = function(state_arr, active_row, active_col){
	this.ctx.reset();
	this.draw_tile_map(state_arr);
	this.grd_ctx.reset();
	this.grd_ctx.setLineDash([1,5]);
	this.draw_grid();
	this.grd_ctx.setLineDash([]);
	this.highlight_cell(active_row, active_col);
}


const pxls = new Array(100);
pxls.fill(0);

let active_row = 0;
let active_col = 0;

const p = new Pixelsior();
p.init_canvas('tile-map', 'grd', 'cmd');
p.draw_new_state(pxls, active_row, active_col);

p.canvas.addEventListener("keypress", (event) => {
	console.log(event.key);
	switch (event.key) {
		case 'j' : {
			active_row = (active_row + 1)%p.row_count;
			p.draw_new_state(pxls, active_row, active_col);
			break;
		}
		case 'k' : {
			active_row = (active_row + 9)%p.row_count;
			p.draw_new_state(pxls, active_row, active_col);
			break;
		}
		case 'h' : {
			active_col = (active_col + 9)%p.col_count;
			p.draw_new_state(pxls, active_row, active_col);
			break;
		}
		case 'l' : {
			active_col = (active_col + 1)%p.col_count;
			p.draw_new_state(pxls, active_row, active_col);
			break;
		}
		case 'f' : {
			pxls[active_row*p.row_count + active_col] = pxls[active_row*p.row_count + active_col] ? 0 : 1;
			p.draw_new_state(pxls, active_row, active_col);
			break;
		}
	}
});

p.canvas.addEventListener("keyup", (event) => {
	switch(event.key) {
		case ":" : {
			event.stopPropagation();
			p.cli.value = ':';
			p.cli.focus();
			break;
		}
	}
});

p.cli.addEventListener("keyup", (event) => {
	console.log(event.key)
	switch(event.key){
		case 'Enter' : {
		} 
		case 'Escape' : {
			p.cli.value = '';
			p.canvas.focus();
			break;
		}
	
	}
});
