function ZoomMethod(config) {
	for (var property in config) {
		if (config.hasOwnProperty(property)) {
			this[property] = config[property];
		}
	}
}