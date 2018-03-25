/**
 * representing an switching on-off button and adding actions, can use any html element
 *
 * @constructor OnOffButton
 * @param {String} idName name (id) of an html element
 */

function OnOffButton(idName) {
    "use strict";
    this.element = document.getElementById(idName);
    this.pressed = false;
    this.doSomething = false;
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";


    /**
     * action upon going down, strategy pattern
     * @method Button#ondown
     */
    this.ondown = function() {};


    /**
     * action upon going up, strategy pattern
     * @method Button#onup
     */
    this.onup = function() {};


    var button = this;

    this.element.onmousedown = function() {

        button.pressed = !button.pressed;
        this.doSomething = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (this.doSomething) {
            if (button.pressed) {
                button.ondown();
            } else {
                button.onup();
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
     * @method OnOffButtonButton#updateStyle
     */
    OnOffButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method OnOffButtonButton#colorStyleDefaults
     */
    OnOffButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;


}());
