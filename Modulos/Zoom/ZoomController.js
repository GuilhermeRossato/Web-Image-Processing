const ZoomController = (function() {
	let zoomObject;
	return {
		applyZoom: function(image, width, height) {
			if (zoomObject instanceof ZoomMethod && (width > image.width || height > image.height)) {
				let imageData = new ImageData(width, height);
				zoomObject.process(image.pixelData, new PixelData(imageData));
				image.putImageData(imageData);
			}
		},
		setZoomMode: function(name) {
			name = name.toLowerCase();
			if (name === "nenhum método") {
				zoomObject = undefined;
			} else if (name === "vizinho mais próximo") {
				zoomObject = NearestNeighboor;
			} else if (name === "bilinear") {
				zoomObject = Bilinear;
			} else {
				console.error(`Unhandled zoom mode: "${name}"`);
			}
		},
		getZoomMode: function() {
			return zoomObject;
		}
	}
})();

function ZoomMethod(config) {
	for (var property in config) {
		if (config.hasOwnProperty(property)) {
			this[property] = config[property];
		}
	}
}