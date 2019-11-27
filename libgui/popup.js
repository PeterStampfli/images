/**
 * a popup for dialogues and messages
 * similar to the color chooser
 * @constructor Popup
 * @param {...object} newDesign - modifying the default design
 */

export function Popup(newDesign) {
    this.theDiv = document.createElement("div");
    this.theDiv.style.position = "absolute";
    this.theDiv.style.overflowY = "auto";
    this.theDiv.style.overflowX = "hidden";
    this.design = {};
    Object.assign(this.design, Popup.defaultDesign);
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            Object.assign(this.design, arguments[i]);
        }
    }
    this.setStyle();
    document.body.appendChild(this.theDiv);

    // resizing maxheight to fit window
    const popup = this;

    function resize() {
        popup.resize();
    }

    window.addEventListener("resize", resize, false);
    // destroying the event listener
    this.destroyResizeEvent = function() {
        window.removeEventListener("resize", resize, false);
    };
}

Popup.defaultDesign = {
    width: 300,
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    fontSize: 18,
    textColor: "#444444",
    backgroundColor: "#ffffaa",
    borderRadius: 10,
    shadowWidth: 5,
    shadowBlur: 10,
    shadowAlpha: 0.7,
    padding: 10,
    zIndex: 20,
    position: "center"
};

// positioning

/**
 * center the popup
 * @method Popup#center
 */
Popup.prototype.center = function() {
    this.theDiv.style.top = "50%";
    this.theDiv.style.left = "50%";
    this.theDiv.style.transform = "translate(-50%,-50%)";
};

/**
 * popup at corner
 * @method Popup#corner
 * @param {"left"|"right"} horizontal
 * @param {"top"|"bottom"} vertical
 */
Popup.prototype.corner = function(horizontal, vertical) {
    this.theDiv.style.top = "";
    this.theDiv.style.bottom = "";
    this.theDiv.style.right = "";
    this.theDiv.style.left = "";
    const offset = this.design.shadowBlur + this.design.shadowWidth;
    this.theDiv.style[horizontal] = offset + "px";
    this.theDiv.style[vertical] = offset + "px";
    this.theDiv.style.transform = "";
};

/**
 * set max height to fit popup+shadow into window
 * @method Popup#resize
 */
Popup.prototype.resize = function() {
    const spaces = this.design.shadowBlur + this.design.shadowWidth + this.design.padding;
    this.theDiv.style.maxHeight = (document.documentElement.clientHeight - 2 * spaces) + "px";
};

/**
 * set the styles, use if you change the style parameters
 * @method Popup#setStyle
 * @param {...Object} newStyle - with parameter values that have to change, optional
 */
Popup.prototype.setStyle = function(newStyle) {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            Object.assign(this.design, arguments[i]);
        }
    }
    switch (this.design.position) {
        case "center":
            this.center();
            break;
        case "topLeft":
            this.corner("left", "top");
            break;
        case "topRight":
            this.corner("right", "top");
            break;
        case "bottomLeft":
            this.corner("left", "bottom");
            break;
        case "bottomRight":
            this.corner("right", "bottom");
            break;
    }
    this.resize();
    this.theDiv.style.zIndex = this.design.zIndex;
    this.theDiv.style.backgroundColor = this.design.backgroundColor;
    this.theDiv.style.color = this.design.textColor;
    this.theDiv.style.fontSize = this.design.fontSize + "px";
    this.theDiv.style.fontFamily = this.design.fontFamily;
    this.theDiv.style.width = this.design.width + "px";
    this.theDiv.style.padding = this.design.padding + "px";
    let shadow = "0px 0px " + this.design.shadowBlur + "px ";
    shadow += this.design.shadowWidth + "px ";
    shadow += "rgba(0,0,0," + this.design.shadowAlpha + ")";
    this.theDiv.style.boxShadow = shadow;
    this.theDiv.style.borderRadius = this.design.borderRadius + "px";
};

/**
 * open the popup
 * @method Popup#open
 */
Popup.prototype.open = function(content) {
    this.theDiv.style.display = "block";
};

/**
 * close the popup
 * @method Popup#close
 */
Popup.prototype.close = function() {
    this.theDiv.style.display = "none";
};

/**
 * clear the popup
 * (remove all children of the div)
 * @method Popup#close
 */
Popup.prototype.clear = function() {
    while (this.theDiv.firstChild) {
        this.theDiv.removeChild(this.theDiv.firstChild);
    }
};

/**
 * set the content (HTML markup)
 * @method Popup#setContent
 * @param {String} content - html
 */
Popup.prototype.setContent = function(content) {
    this.theDiv.innerHTML = content;
};

/**
 * add an HTML element
 * @method Popup#addElement
 * @param {String} element - html element
 */
Popup.prototype.addElement = function(element) {
    this.theDiv.appendChild(element);
};

/**
 * destroy the popup
 * @method Popup#destroy
 */
Popup.prototype.destroy = function() {
    this.destroyResizeEvent();
    this.theDiv.remove();
};
