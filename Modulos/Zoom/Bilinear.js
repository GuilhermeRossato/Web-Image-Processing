const Bilinear = new ZoomMethod({
	process: function(imageData, ctx, width, height) {
		let origin = {
			data: imageData.data,
			width: imageData.width,
			height: imageData.height
		}
		let target = {
			imageData: new ImageData(width, height),
			width: width,
			height: height
		}
		function originToTarget(x, y) {
			return [FastInterpolation.linear(0, 0, origin.width, target.width, x), FastInterpolation.linear(0, 0, origin.height, target.height, y)];
		}
		target.data = target.imageData.data;
	}
});