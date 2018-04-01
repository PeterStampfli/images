/**
 * representing an input button and adding actions, can use any html element
 * simple push button
 *
 * @constructor Button
 * @param {String} idName name (id) of an html element
 */

/* jshint esversion:6 */

function Button(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.state = 0;
    this.pressed = false;
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";


    /**
     * action upon click, strategy pattern
     * @method Button#onClick
     */
    this.onClick = function() {};


    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.pressed) {
            button.pressed = false;
            button.onClick();
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
        button.pressed = false;
        button.updateStyle();
    };

}


(function() {
    "use strict";

    // default colors
    Button.colorUp = "black";
    Button.colorUpHover = "red";
    Button.colorDownHover = "grey";
    Button.colorDown = "black";
    Button.backgroundColorUp = "white";
    Button.backgroundColorUpHover = "yellow";
    Button.backgroundColorDownHover = "red";
    Button.backgroundColorDown = "blue";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Button#updateStyle
     */
    Button.prototype.updateStyle = function() {
        if (this.pressed) {
            if (this.hover) {
                this.element.style.color = this.colorDownHover;
                this.element.style.backgroundColor = this.backgroundColorDownHover;
            } else {
                this.element.style.color = this.colorDown;
                this.element.style.backgroundColor = this.backgroundColorDown;
            }
        } else {
            if (this.hover) {
                this.element.style.color = this.colorUpHover;
                this.element.style.backgroundColor = this.backgroundColorUpHover;
            } else {
                this.element.style.color = this.colorUp;
                this.element.style.backgroundColor = this.backgroundColorUp;
            }
        }
    };

    /**
     * setup the color styles defaults, use for other buttons too
     * @method Button#colorStyleDefaults
     */
    Button.prototype.colorStyleDefaults = function() {
        // can customize colors, preset defaults
        this.colorUp = Button.colorUp;
        this.colorUpHover = Button.colorUpHover;
        this.colorDownHover = Button.colorDownHover;
        this.colorDown = Button.colorDown;

        this.backgroundColorUp = Button.backgroundColorUp;
        this.backgroundColorUpHover = Button.backgroundColorUpHover;
        this.backgroundColorDownHover = Button.backgroundColorDownHover;
        this.backgroundColorDown = Button.backgroundColorDown;
    };

}());
