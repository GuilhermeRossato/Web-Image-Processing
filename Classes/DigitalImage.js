/*
 * Guilherme Rossato - June 2017
 */

function DigitalImage(canvas, image, width, height) {
	canvas.setSize(width, height);
	canvas.render(ctx=>ctx.drawImage(image, 0, 0));
	let data;
	this.setData = function() {
		canvas.render(ctx=>{
			data = ctx.getImageData(0, 0, width, height);
		});
	}
	this.size = image.size;
	this.fileName = image.fileName;
	this.setData();

	this.getArea = function(x, y, sx, sy) {
		let newData;
		canvas.render(ctx=>{
			newData = ctx.getImageData(x, y, sx, sy);
		});
		return newData;
	}

	this.setScale = function(x, y) {
		this.setCanvasSize(width * x, height * y);
	}

	this.setCanvasSize = function(newWidth, newHeight) {
		newWidth = newWidth|0;
		newHeight = newHeight|0;
		let imageData = new ImageData(newWidth, newHeight);
		function set(x, y, ox, oy) {
			x = x|0;
			y = y|0;
			((x < 0) && (x = 0)) || ((x >= newWidth) && (x = newWidth-1));
			((y < 0) && (y = 0)) || ((y >= newHeight) && (y = newHeight-1));
			let ni = (x+y*newWidth)*4;
			let no = (ox+oy*width)*4;
			imageData.data[ni] = data.data[no];
			imageData.data[ni+1] = data.data[no+1];
			imageData.data[ni+2] = data.data[no+2];
			imageData.data[ni+3] = data.data[no+3];
		}
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				let rx = FastInterpolation.linear(0, 0, width, newWidth, x);
				let ry = FastInterpolation.linear(0, 0, height, newHeight, y);
				set(rx, ry, x, y)
			}
		}
		canvas.setSize(newWidth, newHeight);
		canvas.render(ctx => {
			ctx.clearRect(0,0,20,20);
			ctx.putImageData(imageData, 0, 0);
		});
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
