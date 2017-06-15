/*
 * Guilherme Rossato - June 2017
 *
 * This script simplifies javascrip to be more verbose (and easier to understand)
 */

function createWrapperForObject(element) {
	return {
		_real_element: element,
		getChildren: function(i) {
			if (this._children) {
				if (typeof(i) === "number") {
					return this._children[i];
				} else if (typeof(i) === "undefined") {
					return this._children;
				} else {
					return console.error(`Unhandled parameter type: ${typeof(i)}`);
				}
			} else {
				if (typeof(i) === "number") {
					return (this._children = (new Array(...this._real_element.children)).filter(elem => !(elem instanceof Text)).map(element => addLookupForObject(element, createWrapperForObject(element))))[i];
				} else if (typeof(i) === "undefined") {
					return this._children = (new Array(...this._real_element.children)).filter(elem => !(elem instanceof Text)).map(element => addLookupForObject(element, createWrapperForObject(element)));
				} else {
					return console.error(`Unhandled parameter type: ${typeof(i)}`);
				}
			}
		},
		getChildrenByTagName(tagName) {
			tagName = tagName.toUpperCase();
			return this.getChildren().filter(elem => (elem.getTagName().toUpperCase() === tagName));
		},
		setStyleAttribute: function(attribute, style) {
			this._real_element.style[attribute] = style;
		},
		show: function(type = "block") {
			this.setStyleAttribute("display", type);
		},
		hide: function() {
			this.setStyleAttribute("display", "none");
		},
		setContent: function(text) {
			this._real_element.innerText = text;
		},
		setBackground: function(bg) {
			this.setStyleAttribute("background", bg);
		},
		setTransform: function(tr) {
			this.setStyleAttribute("transform", tr);
		},
		setActiveIf: function(condition) {
			if (this._real_element instanceof HTMLInputElement) {
				this._real_element.disabled = !condition;
			} else {
				console.error(`Cannot set active on element of type ${this._real_element.tagName}`);
			}
		},
		getTagName: function() {
			return this._real_element.tagName;
		},
		getType: function() {
			return this._real_element.type;
		},
		setClass: function(newClass) {
			this._real_element.setAttribute("class", newClass);
		},
		setSize: function(width, height, fakeWidth, fakeHeight) {
			if (this._real_element instanceof HTMLCanvasElement) {
				this._real_element.width = ((fakeWidth && fakeHeight)?fakeWidth:width);
				this._real_element.height = ((fakeWidth && fakeHeight)?fakeHeight:height);
			}
			this._real_element.style.width = `${width}px`;
			this._real_element.style.height = `${height}px`;
		},
		getWidth: function() {
			return this._real_element.width;
		},
		getHeight: function() {
			return this._real_element.height;
		},
		setPosition: function(x, y) {
			this._real_element.style.left = `${x}px`;
			this._real_element.style.top = `${y}px`;
		},
		setEvent: function(event, func, debounce = true) {
			this._real_element["on"+event] = (debounce)?this._debounce_func(func):func;
		},
		click: function() {
			return this._real_element.click();
		},
		render: function(func) {
			if (!this._real_element instanceof HTMLCanvasElement) {
				console.error(`Cannot render on element of type ${this._real_element.tagName}`);
				return;
			}
			if (!this.ctx)
				this.ctx = this._real_element.getContext("2d");
			return func(this.ctx);
		},
		_debounce_func: function(func, delay_ms = 100) {
			let lastPress = performance.now();
			return function(...a) {
				let thisPress = performance.now();
				if (thisPress - lastPress > delay_ms) {
					lastPress = thisPress;
					func(...a);
				}
			}
		}
	};
}

let elementLookup = {};
function addLookupForObject(element, wrapper) {
	if (wrapper._real_element !== element) {
		return console.error("Wrapper's element doesn't match element");
	} else {
		elementLookup[element.lookup = Symbol("Element Lookup Id")] = wrapper;
	}
	return wrapper;
}

function getElement(identity) {
	if (identity instanceof HTMLElement) {
		if (identity.lookup) {
			return elementLookup[identity.lookup];
		} else {
			return addLookupForObject(identity, createWrapperForObject(identity));
		}
	} else if (typeof(identity) === "string") {
		let element = document.getElementById(identity);
		if (element) {
			if (element.lookup) {
				return elementLookup[element.lookup];
			} else {
				return addLookupForObject(element, createWrapperForObject(element));
			}
		} else {
			console.warn(`Element of id "${identity}" was not found`);
		}
	} else {
		return console.error(`Unhandled parameter type: ${typeof(name)}`);
	}
}

function bytesToString(bytes) {
	if (bytes < 1000) {
		return `${bytes} bytes`;
	} else if (bytes < 1000000) {
		return `${(bytes/1000)|0} kB`;
	} else if (bytes < 1000000000) {
		return `${(bytes/1000000)|0} mB`;
	} else {
		return bytes.toString();
	}
}

function separateDigits(string, each = 3, separator = "'") {
	let res = [];
	string.split('').reverse().forEach((char,i) => (res.push(char) && (i%each === each-1) && res.push(separator)));
	if (res[res.length-1] === separator)
		res.pop();
	return res.reverse().join('');
}