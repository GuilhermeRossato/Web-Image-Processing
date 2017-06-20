/*
 * Guilherme Rossato - June 2017
 */

function DigitalImage(canvas, image, width, height) {
	canvas.setSize(width, height);
	canvas.render(ctx=>ctx.drawImage(image, 0, 0));
	let pixelData = new PixelData({width: width, height: height});

	this.updateData = function() {
		let data;
		canvas.render(ctx=>{
			data = ctx.getImageData(0, 0, width, height);
		});
		pixelData.replaceImageData(data);
	}
	this.size = image.size;
	this.fileName = image.fileName;
	this.updateData();

	this.getArea = function(x, y, sx, sy) {
		let newData;
		canvas.render(ctx=>{
			newData = ctx.getImageData(x, y, sx, sy);
		});
		return newData;
	}

	this.putImageData = function(newImageData) {
		canvas.render(ctx=>{
			ctx.putImageData(newImageData, 0, 0);
		});
	}

	this.setScale = function(x, y, doStretch) {
		this.setCanvasSize(width * x, height * y, doStretch);
	}

	this.setCanvasSize = function(newWidth, newHeight, doStretch = true) {
		newWidth = newWidth|0;
		newHeight = newHeight|0;
		if (doStretch) {
			let newImageData = new ImageData(newWidth, newHeight);
			let data = pixelData.getLastData();
			function set(x, y, ox, oy) {
				x = x|0;
				y = y|0;
				((x < 0) && (x = 0)) || ((x >= newWidth) && (x = newWidth-1));
				((y < 0) && (y = 0)) || ((y >= newHeight) && (y = newHeight-1));
				let ni = (x+y*newWidth)*4;
				let no = (ox+oy*width)*4;
				newImageData.data[ni] = data.data[no];
				newImageData.data[ni+1] = data.data[no+1];
				newImageData.data[ni+2] = data.data[no+2];
				newImageData.data[ni+3] = data.data[no+3];
			}
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					let rx = x*newWidth/width;
					let ry = y*newHeight/height;
					set(rx, ry, x, y)
				}
			}
			canvas.setSize(newWidth, newHeight);
			this.putImageData(newImageData);
		} else {
			canvas.setSize(newWidth, newHeight);
		}
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
	Object.defineProperty(this, "pixelData", {
		get: function() {
			return pixelData;
		},
		set: function(s) {
			console.warn("Value can't be set");
		}
	});
}
