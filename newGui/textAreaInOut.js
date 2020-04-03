/* jshint esversion: 6 */

/**
 * a text area for input and output 
 *
 * @constructor TextAreaInOut
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    guiUtils
} from "../libgui/modules.js";

 export function TextAreaInOut(parent){
    this.element = document.createElement("textarea");
parent.appendChild(this.element);
    this.element.style.cursor = "text";

    this.hover = false;
    this.pressed = false;
    this.active = true;


    this.colorStyleDefaults();
    this.updateStyle();

    // note: There is no onchange 


    /**
     * action upon mouse down, doing an interaction
     * @method TestInput#onInteraction
     */
    this.onInteraction = function() {
        console.log("textinput select Interaction");
    };

    var textInput = this;
    this.element.onchange = function() {
        textInput.onChange();
    };

    // onfocus /onblur corresponds to pressed
    this.element.onfocus = function() {
        textInput.pressed = true;
        textInput.updateStyle();
    };

    this.element.onblur = function() {
        textInput.pressed = false;
        textInput.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        textInput.hover = true;
        textInput.updateStyle();
    };

    this.element.onmouseleave = function() {
        textInput.hover = false;
        textInput.updateStyle();
    };

    this.element.onmousedown = function() {
        textInput.onInteraction();
    };
 }


/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method TextAreaInOut#updateStyle
 */
TextAreaInOut.prototype.updateStyle = Button.prototype.updateStyle;

/**
 * setup the color styles defaults, use for other buttons too
 * @method TextAreaInOut#colorStyleDefaults
 */
TextAreaInOut.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

