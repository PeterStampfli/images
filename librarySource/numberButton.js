/**
 * a button to input numbers, needs button.js
 * <input type="text" class="numbers" id="outputWidthChooser" maxlength="4" />
 * 
 * @constructor NumberButton
 * @param {String} idName name (id) of an html element
 */

function NumberButton(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();


    /**
     * action upon change, strategy pattern
     * @method Button#onclick
     */
    this.onchange = function() {};


    var button = this;

    this.element.onchange = function() {
        button.onchange();
    }


    // onfocus /onblur corresponds to pressed


    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    }

    this.element.onmouseleave = function() {
        button.hover = false;
        button.updateStyle();
    }


}


(function() {
    "use strict";


    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method NumberButton#updateStyle
     */
    NumberButton.prototype.updateStyle = function() {
        if (this.hover) {
            this.element.style.color = this.colorUpHover;
            this.element.style.backgroundColor = this.backgroundColorUpHover;
        } else {
            this.element.style.color = this.colorUp;
            this.element.style.backgroundColor = this.backgroundColorUp;
        }
    };

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    NumberButton.prototype.colorStyleDefaults = function() {
        // can customize colors, preset defaults
        this.colorUp = Button.colorUp;
        this.colorUpHover = Button.colorUpHover;

        this.backgroundColorUp = Button.backgroundColorUp;
        this.backgroundColorUpHover = Button.backgroundColorUpHover;
    };


}());
