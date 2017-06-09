/*
 * Guilherme Rossato - June 2017
 */

function DigitalImage(canvas, image, width, height) {
	canvas.setSize(width, height);
	canvas.render(ctx=>ctx.drawImage(image, 0, 0));
	let data;
	this.update = function() {
		canvas.render(ctx=>{
			data = ctx.getImageData(0, 0, width, height);
		});
	}
	this.size = image.size;
	this.fileName = image.fileName;
	this.update();

	this.getArea = function(x, y, sx, sy) {
		let newData;
		canvas.render(ctx=>{
			newData = ctx.getImageData(x, y, sx, sy);
		});
		return newData;
	}

	Object.defineProperty(this, "width", {
		get: function() {
			return width;
		},
		set: function(s) {
			console.warn("Value can't be set");
		}
	});
	Object.defineProperty(this, "height", {
		get: function() {
			return height;
		},
		set: function(s) {
			console.warn("Value can't be set");
		}
	});
	Object.defineProperty(this, "data", {
		get: function() {
			return data.data;
		},
		set: function(s) {
			console.warn("Value can't be set");
		}
	});
}
