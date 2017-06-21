/*
 * Guilherme Rossato - June 2017
 */

let fileHoverTimer, lastDragFileOver;

function onFileHoverTimer() {
	let thisTime = performance.now();
	if (thisTime - lastDragFileOver > 500) {
		goBackToInit();
		if (fileHoverTimer) {
			clearInterval(fileHoverTimer);
			fileHoverTimer = undefined;
		} else {
			console.warn("Hover timer couldn't be stopped");
		}
	}
}

function goBackToInit() {
	if (appLoader.state === "hovering")
		appLoader.state = "init";
}

function onDragOver(ev) {
	ev.preventDefault();
	if (appLoader.state === "init") {
		appLoader.state = "hovering";
		if (fileHoverTimer)
			clearInterval(fileHoverTimer);
		fileHoverTimer = setInterval(onFileHoverTimer, 500);
	}
	ev.dataTransfer.dropEffect
	lastDragFileOver = performance.now();
}

function onDropImage(ev) {
	ev.preventDefault();
	if (fileHoverTimer) {
		clearInterval(fileHoverTimer);
		fileHoverTimer = undefined;
	}
	goBackToInit();
	getImageFromFile(ev.dataTransfer.files[0]).then(onImageSelect);
}

function selectFileManually() {
	getElement("file-selector").click();
}

function getImageFromFile(file, callback) {
	if (file) {
		let reader = new FileReader();
		let img = new Image();
		img.onload = function() {
			img.fileName = file.name;
			img.size = file.size;
			callback(img);
		}
		reader.onloadend = function() {
			img.src = reader.result;
		}
		reader.readAsDataURL(file);
	}
	return {
		then: function(func) {
			callback = func;
		}
	};
}

function onManualFileSelect(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	if (appLoader.state === "init") {
		getImageFromFile(ev.dataTransfer.files[0]).then(onImageSelect);
	}
}

function setupFileSelect() {
	document.body.ondragover = onDragOver;
	getElement("init-div").setEvent("click", selectFileManually);
	getElement("file-selector").setEvent("change", onManualFileSelect);
	getElement("drop-zone").setEvent("drop", onDropImage);
}

window.addEventListener("load", setupFileSelect);
