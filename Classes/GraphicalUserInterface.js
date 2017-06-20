function GraphicalUserInterface() {
	this.getElements();
	this.offsetX = 0;
	this.offsetY = 0;
	this.scale = {
		x: 1,
		y: 1
	};
	this.magnify = 4;
	this.magnifierFollowMouse = false;
	this.lastMouseX = 0;
	this.lastMouseY = 0;
	this.lastGlobalX = 0;
	this.lastGlobalY = 0;
	StateMachine.call(this, {
		state: "init",
		transitions: [{
			last: "init",
			next: "idle"
		}, {
			last: "idle",
			next: "panning",
			event: function() {
				this.startDraggingScreen();
			}
		}, {
			last: "idle",
			next: "panning-click",
			event: function() {
				this.startDraggingScreen();
				//this.operation.elements.catchPanning.setStyleAttribute("cursor", "default");
			}
		}, {
			last: "panning",
			next: "idle",
			event: function() {
				this.stopDraggingScreen();
			}
		}, {
			last: "panning-click",
			next: "idle",
			event: function() {
				this.stopDraggingScreen();
			}
		}, {
			last: "idle",
			next: "resizing",
			event: function() {
				this.startResizing();
			}
		}, {
			last: "resizing",
			next: "idle",
			event: function() {
				this.stopResizing();
			}
		}]
	});
}

GraphicalUserInterface.prototype = {
	constructor: GraphicalUserInterface,
	getElements: function () {
		this.loadingScreen = getElement("loading-screen");
		this.initMessage = getElement("init-message");
		this.canvasBase = getElement("canvas-base");
		this.dropZone = getElement("drop-zone");
		this.errorMessage = getElement("error-message");
	},
	/* Document Events */
	onSwitchClick: function(event) {
		if (this.toolsSide === "left") {
			this.toolsSide = "right";
		} else {
			this.toolsSide = "left";
		}
		this.updateToolSide();
	},
	onMethodButtonClick: function(pressedBtn, event) {
		this.operation.buttons.methods.forEach(btn => btn.setActiveIf(pressedBtn !== btn));
	},
	onSizeButtonPress: function(pressedBtn, event) {
		this.operation.buttons.sizes.forEach(btn => btn.setActiveIf(pressedBtn !== btn));
	},
	onMainCanvasMouseMove: function(canvas, event) {
		this.updateMagnifier(canvas, event.clientX-this.offsetX, event.clientY-this.offsetY);
	},
	onPanningMouseMove: function(event) {
		this.offsetX = this.startCatch.offsetX + (event.clientX - this.startCatch.mouseX);
		this.offsetY = this.startCatch.offsetY + (event.clientY - this.startCatch.mouseY);
		this.updateOffset();
	},
	onResizeMouseMove: function(event) {
		let newWidth, newHeight;
		let distX = (event.clientX - this.startCatch.mouseX), distY = (event.clientY - this.startCatch.mouseY);
		if (this.resizeIndex === 0) {
			this.offsetY = this.startCatch.offsetY + distY;
			this.updateOffset();
			newHeight = this.startCatch.cHeight - distY;
		} else if (this.resizeIndex === 4) {
			newHeight = this.startCatch.cHeight + distY;
		} else if (this.resizeIndex === 2 && this.toolsSide === "left") {
			newWidth = this.startCatch.cWidth + distX;
		} else if (this.resizeIndex === 2 && this.toolsSide === "right") {
			this.offsetX = this.startCatch.offsetX + distX;
			this.updateOffset();
			newWidth = this.startCatch.cWidth - distX;
		} else if (this.resizeIndex === 3 && this.toolsSide === "left") {
			newWidth = this.startCatch.cWidth + distX;
			newHeight = this.startCatch.cHeight + distY;
		}
		if (newWidth != undefined && newHeight != undefined)
			this.image.setCanvasSize(newWidth, newHeight);
		else if (newWidth != undefined)
			this.image.setCanvasSize(newWidth, this.startCatch.cHeight);
		else if (newHeight != undefined)
			this.image.setCanvasSize(this.startCatch.cWidth, newHeight);
	},
	onMainMouseDown: function(event) {
		if (event.type === "touchstart") {
			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
			this.lastGlobalX = event.clientX;
			this.lastGlobalY = event.clientY;
			event.preventDefault();
		} else if (event.button !== 0)
			return;
	//console.log(event.type, event.clientX, event.clientY);
		if (this.state === "idle") {
			let rx = event.clientX - this.offsetX;
			let ry = event.clientY - this.offsetY;
			let width = this.realCanvasWidth;
			let height = this.realCanvasHeight;
			let positionArgs;
			if (this.toolsSide === "right") {
				positionArgs = [[(width - 15) / 2, -15], [-15, -15], [-15, (height - 15)/2], [-15, (height - 15)], [(width - 15)/2, (height - 15)]];
			} else {
				positionArgs = [[(width - 15) / 2, -15], [(width - 15), -15], [(width - 15), (height - 15) / 2], [(width - 15), (height - 15)], [(width - 15) / 2, (height - 15)]];
			}
			let index;
			if (positionArgs.some((pos, i) => (rx > pos[0] && ry > pos[1] && rx < pos[0]+30 && ry < pos[1]+30) && ((index = i) || true))) {
				this.resizeIndex = index;
				this.state = "resizing";
				(window.getSelection && window.getSelection().empty());
			} else if (rx > 1 && ry > 1 && rx < width-1 && ry < height-1) {
				this.state = "panning-click";
				(window.getSelection && window.getSelection().empty());
			}
		}
	},
	onMainMouseMove: function(event) {
		if (event.type === "touchmove") {
			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
			event.preventDefault();
		}
	//console.log(event.type, event.clientX, event.clientY);
		if (this.state === "panning" || this.state === "panning-click") {
			this.onPanningMouseMove(event);
		} else if (this.state === "resizing") {
			this.onResizeMouseMove(event);
		} else {
			this.lastGlobalX = event.clientX;
			this.lastGlobalY = event.clientY;
		}
	},
	onMainMouseUp: function(event) {
		if (event.type === "touchend") {
			event.preventDefault();
		}
		if (this.state === "panning-click" || this.state === "resizing") {
			this.state = "idle";
		}
	},
	onKeyDown: function(event) {
		if (event.code === "ControlLeft") {
			this.startFollowingMouse();
		} else if (event.code === "ShiftLeft") {
			if (this.state === "idle") {
				this.state = "panning";
			}
		}
	},
	onKeyUp: function(event) {
		if (event.code === "ControlLeft") {
			this.stopFollowingMouse();
		} else if (event.code === "ShiftLeft") {
			if (this.state === "panning") {
				this.state = "idle";
			}
		}
	},
	/* Basic Methods */
	updateOffset: function() {
		this.operation.elements.viewport.setPosition(this.offsetX, this.offsetY);
	},
	updateToolSide: function() {
		let width = this.realCanvasWidth - 15;
		let height = this.realCanvasHeight - 15;
		let scalers = this.operation.buttons.scalers;
		let transformList;
		let positionArgs;
		if (this.toolsSide === "right") {
			transformList = [-90, -135, -180, 135, 90];
			positionArgs = [[width / 2, -15], [-15, -15], [-15, height/2], [-15, height], [width/2, height]];
		} else {
			transformList = [-90, -45, 0, 45, 90];
			positionArgs = [[width / 2, -15], [width, -15], [width, height / 2], [width, height], [width / 2, height]];
		}
		transformList.forEach((transf,i) => scalers[i].getChildren(0).setTransform(`rotate(${transf}deg)`));
		positionArgs.forEach((args,i) => scalers[i].setPosition(...args));
		this.operation.elements.tools.setStyleAttribute("marginLeft", (this.toolsSide === "right")?"":"-200px");
		this.operation.elements.tools.setPosition((this.toolsSide === "right")?this.image.width:0, 0);
		this.operation.buttons.switch.setClass((this.toolsSide === "right")?"switch-left":"switch-right");
		this.operation.buttons.switch.setContent((this.toolsSide === "right")?"arrow_backwards":"arrow_forward");
	},
	updateFooterContent: function() {
		let image = this.image;
		let content;
		if (this.scale.x === this.scale.y) {
			if (this.scale.x === 1) {
				content = (`Tamanho da Imagem: ${image.width}x${image.height}`);
			} else {
				content = (`Tamanho da Imagem: ${image.width}x${image.height} - Escala: ${application.scale.x} - Tamanho Final: ${(image.width * application.scale.x)}x${(image.height * application.scale.y)}`);
			}
		} else {
			content = (`Tamanho da Imagem: ${image.width}x${image.height} - Escala: (${application.scale.x}, ${application.scale.y}) - Tamanho Final: ${(image.width * application.scale.x)}x${(image.height * application.scale.y)}`);
		}
		this.operation.elements.footer.getChildren(0).setContent(content);
	},
	updateMagnifier: function(canvas, mouseX, mouseY) {
		let imageSize = 180/this.magnify
		let area = {
			x: (mouseX-imageSize/2)|0,
			y: (mouseY-imageSize/2)|0,
			width: imageSize,
			height: imageSize
		};
		let data = this.image.getArea(area.x, area.y, area.width, area.height);
		if (this.magnifierFollowMouse) {
			this.operation.elements.magnifierWrapper.setPosition(mouseX+180+60, mouseY+30);
		} else {
			this.lastMouseX = mouseX;
			this.lastMouseY = mouseY;
		}
		this.operation.elements.magnifierCanvas.render(ctx => ctx.putImageData(data, 0, 0, ));
	},
	startDraggingScreen: function() {
		if (this.draggingScreen) {
			console.warn("Unexpected function call");
			return
		}
		this.draggingScreen = true;
		this.startCatch = {
			mouseX : this.lastGlobalX,
			mouseY : this.lastGlobalY,
			offsetX : this.offsetX,
			offsetY : this.offsetY
		}
		this.operation.elements.catchPanning.show();
		this.operation.elements.catchPanning.setStyleAttribute("cursor", "move");
	},
	stopDraggingScreen: function() {
		if (!this.draggingScreen) {
			console.warn("Unexpected function call");
			return
		}
		this.draggingScreen = false;
		this.operation.elements.catchPanning.hide();
	},
	startResizing: function() {
		this.startCatch = {
			mouseX : this.lastGlobalX,
			mouseY : this.lastGlobalY,
			offsetX : this.offsetX,
			offsetY : this.offsetY,
			cWidth : this.realCanvasWidth,
			cHeight : this.realCanvasHeight
		}
		this.operation.elements.catchPanning.show();
		this.operation.elements.catchPanning.setStyleAttribute("cursor", "move");
	},
	stopResizing: function() {
		this.operation.elements.catchPanning.hide();
	},
	startFollowingMouse: function() {
		if (this.magnifierFollowMouse) {
			console.warn("Unexpected function call");
			return
		}
		this.magnifierFollowMouse = true;
		this.operation.elements.magnifierWrapper.setStyleAttribute("position", "absolute");
		this.updateMagnifier(this.operation.elements.canvas, this.lastMouseX, this.lastMouseY);
	},
	stopFollowingMouse: function() {
		if (!this.magnifierFollowMouse) {
			console.warn("Unexpected function call");
			return
		}
		this.magnifierFollowMouse = false;
		this.operation.elements.magnifierWrapper.setStyleAttribute("position", "inherit");
		this.operation.elements.magnifierWrapper.setPosition(0, 0);
	},
	/* Structure and State events */
	onChangeImage: function(image) {
		this.image = new DigitalImage(this.operation.elements.canvas, image, image.width, image.height);
		this.operation.elements.title.getChildren(0).setContent(`${image.fileName} (${bytesToString(image.size)}) (${separateDigits((image.width*image.height).toString())} pixels)`);
		this.updateImageSize();
	},
	setScale: function(x, y) {
		this.scale.x = x;
		this.scale.y = y;
		this.image.setScale(x, y);
		this.updateImageSize();
	},
	updateImageSize: function() {
		this.realCanvasWidth = this.operation.elements.canvas.getWidth();
		this.realCanvasHeight = this.operation.elements.canvas.getHeight();
		this.operation.elements.title.setSize(this.realCanvasWidth-20, 15);
		this.operation.elements.footer.setPosition(0, this.realCanvasHeight);
		this.operation.elements.footer.setSize(this.realCanvasWidth - 20, 15);
		this.updateFooterContent();
		this.updateToolSide();
	},
	onInit:function() {
		this.operation = {
			elements: {
				viewport: getElement("viewport"),
				canvas: getElement("canvas"),
				title: getElement("image-title"),
				footer: getElement("image-footer"),
				methods: getElement("method-list"),
				sizes: getElement("size-list"),
				tools: getElement("tools"),
				catchPanning: getElement("catch-panning"),
				magnifierWrapper: getElement("magnifier-wrapper"),
				magnifierCanvas: getElement("magnifier-canvas")
			},
			buttons: {
				switch: getElement("button-switch"),
				methods: getElement("method-list").getChildrenByTagName("input").filter(btn => btn.getType() === "button"),
				sizes: getElement("size-list").getChildrenByTagName("input").filter(btn => btn.getType() === "button"),
				scalers: [1,2,3,4,5].map(n => getElement(`scaler-${n}`))
			}
		}
		this.loadingScreen.hide();
		this.initMessage.show("flex");
	},
	onStartHover: function() {
		this.initMessage.hide();
		this.dropZone.show("flex");
	},
	onFinishHover: function() {
		this.dropZone.hide();
		this.initMessage.show("flex");
	},
	onStartOperating: function(image) {
		this.loadingScreen.hide();
		this.dropZone.hide();
		this.initMessage.hide();
		this.canvasBase.show("flex");
		this.offsetX = window.innerWidth/2 - image.width/2;
		this.offsetY = window.innerHeight/2 - Math.max(image.height,542)/2;
		this.updateOffset();
		this.operation.elements.magnifierCanvas.setSize(180, 180, 180/this.magnify, 180/this.magnify);
		this.operation.buttons.switch.setEvent("click", this.onSwitchClick.bind(this));
		this.operation.buttons.methods.forEach(btn => btn.setEvent("click", this.onMethodButtonClick.bind(this, btn)));
		this.operation.buttons.sizes.forEach(btn => btn.setEvent("click", this.onSizeButtonPress.bind(this, btn)));
		this.operation.elements.canvas.setEvent("mousemove", this.onMainCanvasMouseMove.bind(this, this.operation.elements.canvas), false);
		this.operation.elements.canvas.setStyleAttribute("cursor", "pointer");
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
		window.addEventListener("mousedown", this.onMainMouseDown.bind(this));
		window.addEventListener("mousemove", this.onMainMouseMove.bind(this));
		window.addEventListener("mouseup", this.onMainMouseUp.bind(this));
		window.addEventListener("touchstart", this.onMainMouseDown.bind(this), {passive:false});
		window.addEventListener("touchmove", this.onMainMouseMove.bind(this), {passive:false});
		window.addEventListener("touchend", this.onMainMouseUp.bind(this), {passive:false});
		this.toolsSide = "left";
		this.onChangeImage(image);
		this.state = "idle";
		this.onStartOperating = undefined;
	},
	onTemporaryError: function() {
		this.loadingScreen.hide();
		this.errorMessage.show();
	},
	onPermanentError: function() {
		this.loadingScreen.hide();
		this.errorMessage.show();
	}
}