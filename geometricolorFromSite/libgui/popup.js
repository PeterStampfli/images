/**
 * a popup for dialogues and messages
 * similar to the color chooser
 * it has a contentdiv (scrolling, with variable content) and an optional controldiv (mainly close button)
 * @constructor Popup
 * @param {...object} newDesign - modifying the default design, multiple designs possible
 */
import {
    Button,
    guiUtils
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
    this.contentDiv.style.textAlign = "center";
    this.mainDiv.appendChild(this.contentDiv);

    // creating the control div, if there is one
    if (this.design.popupHasControl) {
        this.controlDiv = document.createElement("div");
        this.mainDiv.appendChild(this.controlDiv);
        this.controlDiv.style.textAlign = "center";
    }

    this.setStyle();
    document.body.appendChild(this.mainDiv);

    // resizing maxheight to fit window
    // resizing maxWidth to fit window if there is no fixed with (design.popupInnerWidth=0)
    // this maxWidth=0;                       ( in case that we need the resulting maxWidth)
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
    popupHasControl: true, // if it has a control div
    popupInnerWidth: 300, // the minimal usable client width inside, even if there is a scroll bar, 
    // put to zero if no fixed width
    popupMinWidth: 200, // minimum width if no fixed inner width
    popupScrollBarWidth: scrollBarWidth, // estimate for scroll bar width, valid for all?
    popupFontFamily: "FontAwesome, FreeSans, sans-serif",
    popupFontSize: 14,
    popupTextColor: "#444444",
    popupBackgroundColor: "#ffffaa",
    popupPadding: 10,
    popupBorder: "solid",
    popupBorderWidth: 3,
    popupBorderColor: "#444444",
    popupBorderRadius: 20,
    popupShadowWidth: 5,
    popupShadowBlur: 10,
    popupShadowRed: 0,
    popupShadowGreen: 0,
    popupShadowBlue: 0,
    popupShadowAlpha: 0.7,
    popupZIndex: 20,
    popupPosition: "center", // topLeft, topRight, bottomLeft, bottomRight
    popupHorizontalShift: 0 // shift from left/right side
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
 * update Popup design defaults, using data of another object with the same key 
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
    let totalShadowWidth = this.design.popupShadowBlur + this.design.popupShadowWidth;
    this.mainDiv.style[horizontal] = totalShadowWidth + this.design.popupHorizontalShift + "px";
    this.mainDiv.style[vertical] = totalShadowWidth + "px";
    this.mainDiv.style.transform = "";
};

/**
 * set max height to fit popup+shadow into window
 * @method Popup#resize
 */
Popup.prototype.resize = function() {
    const noShow = !this.isOpen();
    if (noShow) {
        this.open();
    }
    const totalShadowWidth = this.design.popupShadowBlur + this.design.popupShadowWidth;
    let maxHeight = document.documentElement.clientHeight - 2 * totalShadowWidth;
    // content div as seen in the main div extends from 0 to controlDiv.offsetTop
    // it includes the height, paddings and border
    maxHeight -= 2 * (this.design.popupBorderWidth + this.design.popupPadding);
    if (this.design.popupHasControl) {
        maxHeight -= this.controlDiv.offsetHeight;
    }
    this.contentDiv.style.maxHeight = maxHeight + "px";
    if (this.design.popupInnerWidth <= 0) {
        this.maxWidth = document.documentElement.clientWidth - this.design.popupHorizontalShift;
        this.maxWidth -= 2 * this.design.popupBorderWidth + 2 * totalShadowWidth;
        this.mainDiv.style.maxWidth = this.maxWidth + "px";
        this.mainDiv.style.minWidth = this.design.popupMinWidth + "px";
    }
    if (noShow) {
        this.close();
    }
};

/**
 * determine the height
 * @method Popup#getHeight
 * @return number, integer height
 */
Popup.prototype.getHeight = function() {
    const noShow = !this.isOpen();
    if (noShow) {
        this.open();
    }
    const height = this.mainDiv.offsetHeight;
    if (noShow) {
        this.close();
    }
    return height;
};

/**
 * set top of popup, limited that it is not cut off
 * overrides earlier vertical positioning
 * @method Popup#setTopPosition
 * @param {number} positionY - relative to top of window
 */
Popup.prototype.setTopPosition = function(positionY) {
    // top not above window, must be positive
    let top = Math.max(0, positionY);
    // top plus height not below window, top plus height must be smaller than client height
    top = Math.min(document.documentElement.clientHeight - this.getHeight(), top);
    this.mainDiv.style.top = top + "px";
    this.mainDiv.style.bottom = "";
};

/**
 * set center of popup, limited that it is not cut off
 * overrides earlier vertical positioning
 * @method Popup#setCenterPosition
 * @param {number} positionY - relative to top of window
 */
Popup.prototype.setCenterPosition = function(positionY) {
    this.setTopPosition(positionY-this.getHeight()/2);
}

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
    switch (design.popupPosition) {
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
    this.mainDiv.style.zIndex = design.popupZIndex;
    this.mainDiv.style.backgroundColor = design.popupBackgroundColor;
    this.mainDiv.style.color = design.popupTextColor;
    this.mainDiv.style.fontSize = design.popupFontSize + "px";
    this.mainDiv.style.fontFamily = design.popupFontFamily;
    this.mainDiv.style.border = design.popupBorder;
    this.mainDiv.style.borderWidth = design.popupBorderWidth + "px";
    this.mainDiv.style.borderColor = design.popupBorderColor;
    if (this.design.popupInnerWidth > 0) {
        this.mainDiv.style.width = this.design.popupInnerWidth + this.design.popupScrollBarWidth + 2 * this.design.popupBorderWidth + "px";
    } else if (this.design.popupInnerWidth <= 0) {
        this.contentDiv.style.overflowX = "auto";
    }
    this.mainDiv.style.outline = "none";
    // the content div
    this.contentDiv.style.padding = design.popupPadding + "px";
    // the control div
    if (design.popupHasControl) {
        this.controlDiv.style.padding = design.popupPadding + "px";
        this.controlDiv.style.borderTop = design.popupBorder;
        this.controlDiv.style.borderTopWidth = design.popupBorderWidth + "px";
        this.controlDiv.style.borderTopColor = design.popupBorderColor;
    }
    let shadow = "0px 0px " + design.popupShadowBlur + "px ";
    shadow += design.popupShadowWidth + "px ";
    shadow += "rgba(" + design.popupShadowRed + "," + design.popupShadowGreen + "," + design.popupShadowBlue + "," + design.popupShadowAlpha + ")";
    this.mainDiv.style.boxShadow = shadow;
    this.mainDiv.style.borderRadius = design.popupBorderRadius + "px";
    this.resize();
};

/**
 * open the popup
 * @method Popup#open
 */
Popup.prototype.open = function() {
    if (this.mainDiv.style.display !== "block") {
        this.mainDiv.style.display = "block";
    }
};

/**
 * close the popup
 * @method Popup#close
 */
Popup.prototype.close = function() {
    if (this.mainDiv.style.display !== "none") {
        this.mainDiv.style.display = "none";
    }
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
 * @method Popup#clear
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
    this.closeButton.setFontSize(this.design.popupFontSize);
    this.resize();
    const popup = this;
    this.closeButton.onClick = function() {
        popup.close();
    };
    this.closeButton.onInteraction = function() {};
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
