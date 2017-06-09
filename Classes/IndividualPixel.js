function IndividualPixel(imageData, x, y) {
	let id = 4*(x+imageData.width*y);
	this.red = imageData.data[id];
	this.green = imageData.data[id+1];
	this.blue = imageData.data[id+2];
	this.alpha = imageData.data[id+3];
}