/**
 * representing an switch button with down(pressed)/up states and adding actions, can use any html element
 *
 * @constructor Button
 * @param {String} idName name (id) of an html element
 */

/* jshint esversion:6 */

function SwitchButton(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.state = 0;
    this.pressed = false;
    this.mouseDown = false;
    this.hover = false;
    this.active = true;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";


    /**
     * action upon pressing down, strategy pattern
     * @method Button#onPress
     */
    this.onPress = function() {};

    /**
     * action upon releasing, strategy pattern
     * @method Button#onRelease
     */
    this.onRelease = function() {};


    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = !button.pressed;
        button.mouseDown = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.mouseDown) {
            button.mouseDown = false;
            if (button.pressed) {
                button.onPress();
            } else {
                button.onRelease();
            }
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

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method SwitchButton#updateStyle
     */
    SwitchButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method SwitchButton#colorStyleDefaults
     */
    SwitchButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * put the button back to not pressed=released, without action, only update style
     * @method SwitchButton#release 
     */
    SwitchButton.prototype.release = function() {
        this.pressed = false;
        this.updateStyle();
    };

    /**
     * put the button back to pressed, without action, only update style
     * @method SwitchButton#push 
     */
    SwitchButton.prototype.push = function() {
        this.pressed = true;
        this.updateStyle();
    };

}());
