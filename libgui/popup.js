/**
 * a popup for dialogues and messages
 * similar to the color chooser
 * @constructor Popup
 * @param {...object} newDesign - modifying the default design
 */

export function Popup(newDesign) {
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.overflowY = "auto";
    this.div.style.overflowX = "hidden";
    this.design = {};
    Object.assign(this.design, Popup.defaultDesign);
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            Object.assign(this.design, arguments[i]);
        }
    }
    this.setStyle();
    document.body.appendChild(this.div);

    // resizing maxheight

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
    // either use width or maxWidth, set other to zero
    width: 300,
    maxWidth: 0,
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
    this.div.style.top = "50%";
    this.div.style.left = "50%";
    this.div.style.transform = "translate(-50%,-50%)";
};

/**
 * popup at corner
 * @method Popup#corner
 * @param {"left"|"right"} horizontal
 * @param {"top"|"bottom"} vertical
 */
Popup.prototype.corner = function(horizontal, vertical) {
    this.div.style.top = "";
    this.div.style.bottom = "";
    this.div.style.right = "";
    this.div.style.left = "";
    const offset = this.design.shadowBlur + this.design.shadowWidth;
    this.div.style[horizontal] = offset + "px";
    this.div.style[vertical] = offset + "px";
    this.div.style.transform = "";
};

/**
 * set max height to fit popup+shadow into window
 * @method Popup#resize
 */
Popup.prototype.resize = function() {
    const spaces = this.design.shadowBlur + this.design.shadowWidth + this.design.padding;
    this.div.style.maxHeight = (document.documentElement.clientHeight - 2 * spaces) + "px";
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
    this.div.style.zIndex = this.design.zIndex;
    this.div.style.backgroundColor = this.design.backgroundColor;
    this.div.style.color = this.design.textColor;
    this.div.style.fontSize = this.design.fontSize + "px";
    this.div.style.fontFamily = this.design.fontFamily;
    this.div.style.width = (this.design.width > 0) ? this.design.width + "px" : "";
    this.div.style.maxWidth = (this.design.maxWidth > 0) ? this.design.maxWidth + "px" : "";
    this.div.style.padding = this.design.padding + "px";
    let shadow = "0px 0px " + this.design.shadowBlur + "px ";
    shadow += this.design.shadowWidth + "px ";
    shadow += "rgba(0,0,0," + this.design.shadowAlpha + ")";
    this.div.style.boxShadow = shadow;
    this.div.style.borderRadius = this.design.borderRadius + "px";
};


/**
 * open the popup
 * @method Popup#open
 */
Popup.prototype.open = function(content) {
    this.div.style.display = "block";
};

/**
 * close the popup
 * @method Popup#close
 */
Popup.prototype.close = function() {
    this.div.style.display = "none";
};

/**
 * clear the popup
 * (remove all children of the div)
 * @method Popup#close
 */
Popup.prototype.clear = function() {
    while (this.div.firstChild) {
        this.div.removeChild(this.div.firstChild);
    }
};

/**
 * set the content (HTML markup)
 * @method Popup#setContent
 * @param {String} content - html
 */
Popup.prototype.setContent = function(content) {
    this.div.innerHTML = content;
};

/**
 * add an HTML element
 * @method Popup#addElement
 * @param {String} element - html element
 */
Popup.prototype.addElement = function(element) {
    this.div.appendChild(element);
};
