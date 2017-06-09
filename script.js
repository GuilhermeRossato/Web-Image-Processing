/*
 * Guilherme Rossato - June 2017
 */

let gui = new GraphicalUserInterface();

let application = new StateMachine({
	state: "loading",
	transitions: [{
		last: "loading",
		next: "init",
		event: function() {
			gui.onInit();
		}
	}, {
		last: "init",
		next: "hovering",
		event: function() {
			gui.onStartHover();
		}
	}, {
		last: "hovering",
		next: "init",
		event: function() {
			gui.onFinishHover();
		}
	}, {
		last: "*",
		next: "operating",
		event: function() {
			gui.onStartOperating(lastLoadedImage);
		}
	}, {
		last: "*",
		next: "error",
		event: function() {
			gui.onTemporaryError();
		}
	}, {
		last: "*",
		next: "error-permanent",
		event: function() {
			gui.onPermanentError();
		}
	}]
});

function onImageSelect(image) {
	lastLoadedImage = image;
	if (application.state === "init") {
		application.state = "operating";
	}
}
