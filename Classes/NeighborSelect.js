/*
 * Guilherme Rossato - May 2017
 */

function NeighborSelect(width, height) {
	let sides = [{
		name: "top",
		offset: [0, -1]
	}, {
		name: "left",
		offset: [-1, 0]
	}, {
		name: "right",
		offset: [1, 0]
	}, {
		name: "bottom",
		offset: [0, 1]
	}];
	this.select = function(ox, oy, radius = 1, startArray = []) {
		function rec(x, y) {
			if (x < 0 || y < 0 || x >= width || y >= height)
				return
			let dist = Math.abs(x-ox)+Math.abs(y-oy);
			let inArray = startArray.some(vec => (vec.x === x && vec.y === y));
			if ((dist <= radius) && (!inArray)) {
				startArray.push({x:x, y:y});
				sides.forEach(side => {
					rec(x + side.offset[0], y + side.offset[1]);
				});
			}
		}
		rec(ox, oy);
		return startArray;
	}
}

NeighborSelect.prototype = {
	constructor: NeighborSelect
}