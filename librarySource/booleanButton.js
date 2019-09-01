/**
 * representing an switch button with on/off True/false states and adding actions, can use any html element
 *
 * @constructor BooleanButton
 * @param {String} idName name (id) of an html element, best "button"
 */

/* jshint esversion:6 */

function BooleanButton(idName) {
    "use strict";
    this.idName = idName;
    this.element = document.getElementById(idName);
    this.element.style.cursor = "pointer";
    this.element.style.minWidth = "100px";
    this.value = false;
    this.mouseDown = false;
    this.hover = false;
    this.active = true;
    this.colorStyleDefaults();
    this.updateStyle();




    /**
     * action upon value change, strategy pattern
     * @method Button#onChange
     */
    this.onChange = function() {};




    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.value = !button.value;
        button.mouseDown = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.mouseDown) {
            button.mouseDown = false;
            button.onChange();
        }
        button.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        button.element.onmouseup();
    };
}


(function() {
    "use strict";

    // default colors
    // for active button, depending on hoovering and if it is pressed
    BooleanButton.colorOn = "#444444";
    BooleanButton.colorOnHover = "black";
    BooleanButton.colorOffHover = "black";
    BooleanButton.colorOff = "#444444";
    BooleanButton.backgroundColorOn = "#88ff88";
    BooleanButton.backgroundColorOnHover = "#00ff00";
    BooleanButton.backgroundColorOffHover = "#ff0000";
    BooleanButton.backgroundColorOff = "#ff8888";
    // for switched off
    BooleanButton.colorInactive = "black";
    BooleanButton.backgroundColorInactive = "#aaaaaa";


    /**
     * setup the color styles defaults
     * @method BooleanButton#colorStyleDefaults
     */
    BooleanButton.prototype.colorStyleDefaults = function() {
        // can customize colors, preset defaults
        this.colorOn = BooleanButton.colorOn;
        this.colorOnHover = BooleanButton.colorOnHover;
        this.colorOffHover = BooleanButton.colorOffHover;
        this.colorOff = BooleanButton.colorOff;
        this.colorInactive = BooleanButton.colorInactive;

        this.backgroundColorOn = BooleanButton.backgroundColorOn;
        this.backgroundColorOnHover = BooleanButton.backgroundColorOnHover;
        this.backgroundColorOffHover = BooleanButton.backgroundColorOffHover;
        this.backgroundColorOff = BooleanButton.backgroundColorOff;
        this.backgroundColorInactive = BooleanButton.backgroundColorInactive;
    };

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method BooleanButton#updateStyle
     */
    BooleanButton.prototype.updateStyle = function() {
        console.log("sy");
        if (this.active) {
            if (this.value) {
                if (this.hover) {
                    this.element.style.color = this.colorOnHover;
                    this.element.style.backgroundColor = this.backgroundColorOnHover;
                } else {
                    this.element.style.color = this.colorOn;
                    this.element.style.backgroundColor = this.backgroundColorOn;
                }
            } else {
                if (this.hover) {
                    this.element.style.color = this.colorOffHover;
                    this.element.style.backgroundColor = this.backgroundColorOffHover;
                } else {
                    this.element.style.color = this.colorOff;
                    this.element.style.backgroundColor = this.backgroundColorOff;
                }
            }
        } else {

            this.element.style.color = this.colorInactive;
            this.element.style.backgroundColor = this.backgroundColorInactive;
        }
    };


}());
