/**
 * a popup for dialogues and messages
 * similar to the color chooser
 * @constructor Popup
 * @param {...object} newDesign - modifying the default design
 */
import {
    Button
} from "./modules.js";

export function Popup(newDesign) {
    this.design = {};
    Object.assign(this.design, Popup.defaultDesign);
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            updateValues(this.design, arguments[i]);
        }
    }
    // creating the main div that contains all, placing done in setStyle
    this.mainDiv = document.createElement("div");
    this.mainDiv.style.position = "absolute";
    // creating the content div
    this.contentDiv = document.createElement("div");
    this.contentDiv.style.overflowY = "auto";
    this.contentDiv.style.overflowX = "hidden";
    this.mainDiv.appendChild(this.contentDiv);

    // creating the control div, if there is one
    if (this.design.hasControl) {
        this.controlDiv = document.createElement("div");
        this.mainDiv.appendChild(this.controlDiv);
        this.controlDiv.style.textAlign = "center";

    }

    this.setStyle();
    document.body.appendChild(this.mainDiv);

    // resizing maxheight to fit window
    const popup = this;

    function autoResize() {
        popup.resize();
    }

    window.addEventListener("resize", autoResize, false);
    // destroying the event listener
    this.destroyResizeEvent = function() {
        window.removeEventListener("resize", autoResize, false);
    };
}

// determine the scroll bar width
const testDiv = document.createElement("div");
testDiv.style.width = "100px";
document.body.appendChild(testDiv);
let scrollBarWidth = testDiv.clientWidth;
testDiv.style.overflowY = "scroll";
scrollBarWidth -= testDiv.clientWidth;
testDiv.remove();

Popup.defaultDesign = {
    hasControl: true, // if it has a control div
    innerWidth: 300, // the minimal usable client width inside, even if there is a scroll bar
    scrollBarWidth: scrollBarWidth, // estimate for scroll bar width
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    fontSize: 18,
    textColor: "#444444",
    backgroundColor: "#ffffaa",
    padding: 10,
    border: "solid",
    borderWidth: 3,
    borderColor: "#444444",
    borderRadius: 10,
    shadowWidth: 5,
    shadowBlur: 10,
    shadowRed: 0,
    shadowGreen: 0,
    shadowBlue: 0,
    shadowAlpha: 0.7,
    zIndex: 20,
    position: "center",
    horizontalShift: 0
};

// changing design parameters

function updateValues(toObject, fromObject) {
    for (var key in fromObject) {
        if ((typeof toObject[key] === typeof fromObject[key]) && (typeof fromObject[key] !== "function")) {
            toObject[key] = fromObject[key];
        }
    }
}

/**
 * update Poipup design defaults, using data of another object with the same key 
 * @method Popup.updateDefaultDesign
 * @param {Object} newValues
 */
Popup.updateDefaultDesign = function(newValues) {
    updateValues(Popup.defaultDesign, newValues);
};

// positioning

/**
 * center the popup
 * @method Popup#center
 */
Popup.prototype.center = function() {
    this.mainDiv.style.top = "50%";
    this.mainDiv.style.bottom = "";
    this.mainDiv.style.left = "50%";
    this.mainDiv.style.right = "";
    this.mainDiv.style.transform = "translate(-50%,-50%)";
};

/**
 * popup at corner
 * @method Popup#corner
 * @param {"left"|"right"} horizontal
 * @param {"top"|"bottom"} vertical
 */
Popup.prototype.corner = function(horizontal, vertical) {
    this.mainDiv.style.top = "";
    this.mainDiv.style.bottom = "";
    this.mainDiv.style.right = "";
    this.mainDiv.style.left = "";
    let totalShadowWidth = this.design.shadowBlur + this.design.shadowWidth;
    this.mainDiv.style[horizontal] = totalShadowWidth + this.design.horizontalShift + "px";
    this.mainDiv.style[vertical] = totalShadowWidth + "px";
    this.mainDiv.style.transform = "";
};

/**
 * set max height to fit popup+shadow into window
 * extend total width if there is a scroll bar
 * attention: can read dimensions only if display!=="block" (can be "")
 * @method Popup#resize
 */
Popup.prototype.resize = function() {
    const noShow = !this.isOpen();
    if (noShow) {
        this.open();
    }
    let maxHeight = document.documentElement.clientHeight - 2 * (this.design.shadowBlur + this.design.shadowWidth);
    // content div as seen in the main div extends from 0 to controlDiv.offsetTop
    // it includes the height, paddings and border
    maxHeight -= 2 * (this.design.borderWidth + this.design.padding);
    if (this.design.hasControl) {
        maxHeight -= this.controlDiv.offsetHeight;
    }
    this.contentDiv.style.maxHeight = maxHeight + "px";
    if (noShow) {
        this.close();
    }
};

/**
 * set the styles, use if you change the style parameters
 * @method Popup#setStyle
 * @param {...Object} newStyle - with parameter values that have to change, optional
 */
Popup.prototype.setStyle = function(newStyle) {
    const design = this.design;
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            Object.assign(design, arguments[i]);
        }
    }
    switch (design.position) {
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
    this.mainDiv.style.zIndex = design.zIndex;
    this.mainDiv.style.backgroundColor = design.backgroundColor;
    this.mainDiv.style.color = design.textColor;
    this.mainDiv.style.fontSize = design.fontSize + "px";
    this.mainDiv.style.fontFamily = design.fontFamily;
    this.mainDiv.style.border = design.border;
    this.mainDiv.style.borderWidth = design.borderWidth + "px";
    this.mainDiv.style.borderColor = design.borderColor;
    // the content div
    // no padding at the right, leaving flexibility/space for scroll bar
    this.contentDiv.style.paddingTop = design.padding + "px";
    this.contentDiv.style.paddingLeft = design.padding + "px";
    this.contentDiv.style.paddingBottom = design.padding + "px";
    this.contentDiv.style.width = this.design.innerWidth + this.design.scrollBarWidth + "px";
    // the control div
    if (this.design.hasControl) {
        this.controlDiv.style.padding = design.padding + "px";
        this.controlDiv.style.borderTop = "solid";
        this.controlDiv.style.borderTopWidth = design.borderWidth + "px";
        this.controlDiv.style.borderTopColor = design.borderColor;
    }
    let shadow = "0px 0px " + design.shadowBlur + "px ";
    shadow += design.shadowWidth + "px ";
    shadow += "rgba(" + design.shadowRed + "," + design.shadowGreen + "," + design.shadowBlue + "," + design.shadowAlpha + ")";
    this.mainDiv.style.boxShadow = shadow;
    this.mainDiv.style.borderRadius = design.borderRadius + "px";
    this.resize();
};

/**
 * open the popup
 * @method Popup#open
 */
Popup.prototype.open = function(content) {
    this.mainDiv.style.display = "block";
};

/**
 * close the popup
 * @method Popup#close
 */
Popup.prototype.close = function() {
    this.mainDiv.style.display = "none";
};

/**
 * test if the popup is open (display="block" or "")
 * #method Popup#isOpen
 * @return boolean - true if popup is open
 */
Popup.prototype.isOpen = function() {
    return this.mainDiv.style.display !== "none";
};

/**
 * clear the popup (content)
 * (remove all children of the div)
 * @method Popup#close
 */
Popup.prototype.clear = function() {
    while (this.contentDiv.firstChild) {
        this.contentDiv.removeChild(this.mainDiv.firstChild);
    }
    this.resize();
};

/**
 * set the content (HTML markup)
 * @method Popup#setContent
 * @param {String} content - html
 */
Popup.prototype.setContent = function(content) {
    this.contentDiv.innerHTML = content;
    this.resize();
};

/**
 * add an HTML element to the content div, and resize
 * @method Popup#addContent
 * @param {String} element - html element
 */
Popup.prototype.addContent = function(element) {
    this.contentDiv.appendChild(element);
    this.resize();
};

/**
 * center the content div
 * @method Popup#centerContent
 */
Popup.prototype.centerContent = function() {
    this.contentDiv.style.textAlign = "center";
};

/**
 * add an HTML element to the control div, and resize
 * @method Popup#addControl
 * @param {String} element - html element
 */
Popup.prototype.addControl = function(element) {
    this.controlDiv.appendChild(element);
    this.resize();
};

/**
 * add a close button to the control div
 * @method ImageSelect#addCloseButton
 */
Popup.prototype.addCloseButton = function() {
    this.closeButton = new Button("close", this.controlDiv);
    this.closeButton.setFontSize(this.design.fontSize);
    this.resize();
    const popup = this;
    this.closeButton.onClick = function() {
        popup.close();
    };
};

/**
 * destroy the popup
 * @method Popup#destroy
 */
Popup.prototype.destroy = function() {
    if (typeof this.closeButton !== "undefined") {
        this.closeButton.destroy();
    }
    this.destroyResizeEvent();
    this.mainDiv.remove();
};
