/**
 * create instantaneously appearing help popups
 * @creator InstantHelp
 * @param {String} content - for the popup, using html markup
 * @param {domElement} parent
 */

import {
    Popup
} from "./modules.js";

export function InstantHelp(content, parent) {
    this.element = document.createElement("button");
    this.element.innerHTML = "&nbsp;?&nbsp;";
    this.element.style.borderRadius = "1000px"; // semicircle
    this.element.style.float = "right";
    this.element.style.cursor = "pointer";
    this.element.style.backgroundColor = "white";
    parent.appendChild(this.element);

    // the actions
    const help = this;

    function start(event) {
        event.preventDefault();
        help.element.style.backgroundColor = InstantHelp.handleActiveColor;
        InstantHelp.popup.setContent(content);
        InstantHelp.popup.open();
    }

    function end(event) {
        event.preventDefault();
        help.element.style.backgroundColor = "white";
        InstantHelp.popup.close();
    }

    this.element.onmouseenter = start;
    this.element.onmouseleave = end;
    this.element.addEventListener("touchstart", start);
    this.element.addEventListener("touchend", end);

    /**
     * destroy the handle
     * we put it here because the start and end functions are only in this scope
     * @method InstantHelp.destroy
     */
    this.destroy = function() {
        this.element.removeEventListener("touchstart", start);
        this.element.removeEventListener("touchend", end);
        this.element.onmouseenter = null;
        this.element.onmouseleave = null;
        this.element.remove();
    };
}

// creating the popup, one for all

InstantHelp.popup = new Popup({
    popupHasControl: false,
    popupInnerWidth: 400,
    popupFontSize: 18,
    popupBorder: "none"
});

InstantHelp.popup.close();
InstantHelp.handleActiveColor = "#ffff88";

/**
 * set fontsize of the handle, in px
 * @method InstantHelp#setFontSize
 * @param {integer} size
 */
InstantHelp.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set the styles, use if you change the style parameters
 * @method InstantHelp.setStyle
 * @param {...Object} newStyle - with those parameter values that change
 */
InstantHelp.setStyle = function(newStyle) {
    InstantHelp.popup.setStyle(newStyle);
};
