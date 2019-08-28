/**
 * representing an hTML selection
 *
 * @constructor Select
 * @param {String} idName name (id) of an html select element
 */


/* jshint esversion:6 */

function Select(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";

    // a list of actions, one for each option
    this.actions = [];

    var select = this;

    /**
     * action upon change
     */
    this.element.onchange = function() {
        select.actions[select.element.selectedIndex]();
    };

    // hovering
    this.element.onmouseenter = function() {
        select.hover = true;
        select.updateStyle();
    };

    this.element.onmouseleave = function() {
        select.hover = false;
        select.updateStyle();
    };
}

(function() {
    "use strict";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Button#updateStyle
     */
    Select.prototype.updateStyle = function() {
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
     * @method Button#colorStyleDefaults
     */
    Select.prototype.colorStyleDefaults = function() {
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

    /**
     * return a value clamped between max and min  
     * @function clamp 
     * @para {int/float} min 
     * @para {int/float} x 
     * @para {int/float} max  
     */
    function clamp(min, x, max) {
        return Math.max(min, Math.min(x, max));
    }

    /**
     * adding an option with a name and an action function
     * @method Select#addOption
     * @param {String} name - of the option
     * @param {function} fun - what to do, a function()
     */
    Select.prototype.addOption = function(name, fun) {
        this.element.innerHTML += "<option>" + name + "</option>";
        this.actions.push(fun);
    };

    /**
     * set the index of the selected option, clamped to existing options
     * @method Select#setIndex
     * @param {integer} i
     */
    Select.prototype.setIndex = function(i) {
        this.element.selectedIndex = clamp(0, i, this.actions.length - 1);
    };

    /**
     * get the index of the selected option
     * @method Select#getIndex
     * @return {integer} i
     */
    Select.prototype.getIndex = function(i) {
        return this.element.selectedIndex;
    };


    /**
     * destroy the select thing, taking care of all references, deletes the associated html element
     * may be too careful
     * set reference to the select to null
     * @method NumberButton#destroy
     */
    Select.prototype.destroy = function() {
        this.element.onchange = null;
        this.element.onmouseenter = null;
        this.element.onmouseleave = null;
        this.element.remove();
        for (var i = 0; i < this.actions.length; i++) {
            this.actions[i] = null;
        }
        this.actions.length = 0;
    };

}());
