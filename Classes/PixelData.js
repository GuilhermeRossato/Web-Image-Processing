function PixelData(imageData) {

	this.width = imageData.width;
	this.height = imageData.height;

	/* Declaration of main functions */
	this.get = function(x, y) {
		let index = translatePixelToArray(x, y);
		return [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3]]
	}

	this.set = function(x, y, r=255, g=255, b=255, a=255) {
		let index = translatePixelToArray(x, y);
		[r, g, b, a].forEach((element,i)=> imageData.data[index + i] = Math.round(element));
	}

	/* Declaration of special functions */
	this.replaceImageData = function(newImageData) {
		imageData = newImageData;
		this.width = imageData.width;
		this.height = imageData.height;
	}

	this.getLastData = function() {
		return imageData;
	}

	function translatePixelToArray(x, y) {
		if (typeof (x) !== "number" || typeof (y) !== "number")
			console.error(`Unexpected parameters: type "${typeof (x)}" and type "${typeof (y)}"`);
		else {
			let width = imageData.width;
			let height = imageData.height;
			(x < 0) && (x = 0);
			(x >= width) && (x = width-1);
			(y < 0) && (y = 0);
			(y >= height) && (y = height-1);
			return (x + y * width)*4;
		}
	}
}
