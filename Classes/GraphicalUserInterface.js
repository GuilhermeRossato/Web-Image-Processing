function GraphicalUserInterface() {
	this.getElements();
	this.offset = {
		x: 0,
		y: 0
	}
	this.scale = {
		x: 1,
		y: 1
	};
	this.magnify = 4;
	this.magnifierFollowMouse = false;
	this.lastMouseX = 0;
	this.lastMouseY = 0;
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
			last: "panning",
			next: "idle",
			event: function() {
				this.stopDraggingScreen();
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
		this.updateMagnifier(canvas, event.clientX-this.offset.x, event.clientY-this.offset.y);
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
	onMainMouseMove: function(event) {
		this.lastGlobalX = event.clientX;
		this.lastGlobalY = event.clientY;
	},
	/* Basic Methods */
	updateOffset: function() {
		this.operation.elements.viewport.setPosition(this.offset.x, this.offset.y);
	},
	updateToolSide: function() {
		let width = this.image.width - 15;
		let height = this.image.height - 15;
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
		this.operation.elements.footer.setPosition(0, image.height);
		this.operation.elements.footer.setSize(image.width - 20, 15);
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
		if (this.draggingScreen)
			return
		this.draggingScreen = true;
		this.operation.elements.catchPanning.show();
		this.operation.elements.catchPanning.setStyleAttribute("cursor", "move");
	},
	stopDraggingScreen: function() {
		if (!this.draggingScreen)
			return
		this.draggingScreen = false;
		this.operation.elements.catchPanning.hide();
	},
	startFollowingMouse: function() {
		if (this.magnifierFollowMouse)
			return
		this.magnifierFollowMouse = true;
		this.operation.elements.magnifierWrapper.setStyleAttribute("position", "absolute");
		this.updateMagnifier(this.operation.elements.canvas, this.lastMouseX, this.lastMouseY);
	},
	stopFollowingMouse: function() {
		if (!this.magnifierFollowMouse)
			return
		this.magnifierFollowMouse = false;
		this.operation.elements.magnifierWrapper.setStyleAttribute("position", "inherit");
		this.operation.elements.magnifierWrapper.setPosition(0, 0);
	},
	/* Structure and State events */
	onChangeImage: function(image) {
		this.image = new DigitalImage(this.operation.elements.canvas, image, image.width, image.height);
		this.operation.elements.title.getChildren(0).setContent(`${image.fileName} (${bytesToString(image.size)}) (${separateDigits((image.width*image.height).toString())} pixels)`);
		this.operation.elements.title.setSize(image.width-20, 15);
		this.updateFooterContent();
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
				topScroll: getElement("top-scroll"),
				rightScroll: getElement("right-scroll"),
				bottomScroll: getElement("bottom-scroll"),
				leftScroll: getElement("left-scroll"),
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
		this.offset.x = window.innerWidth/2 - image.width/2;
		this.offset.y = window.innerHeight/2 - Math.max(image.height,542)/2;
		this.updateOffset();
		this.operation.elements.magnifierCanvas.setSize(180, 180, 180/this.magnify, 180/this.magnify);
		this.operation.buttons.switch.setEvent("click", this.onSwitchClick.bind(this));
		this.operation.buttons.methods.forEach(btn => btn.setEvent("click", this.onMethodButtonClick.bind(this, btn)));
		this.operation.buttons.sizes.forEach(btn => btn.setEvent("click", this.onSizeButtonPress.bind(this, btn)));
		this.operation.elements.canvas.setEvent("mousemove", this.onMainCanvasMouseMove.bind(this, this.operation.elements.canvas), false);
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
		window.addEventListener("mousemove", this.onMainMouseMove.bind(this));
		this.toolsSide = "left";
		this.onChangeImage(image);
		this.updateToolSide();
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