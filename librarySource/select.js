/**
 * representing an hTML selection
 *
 * @constructor Select
 * @param {String} idName name (id) of an html select element
 */

/*
<select id="test">

    <option> one</option>
    <option> two</option>
    <option> three</option>

</select>
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


    /**
     * action after loading a new input file for file input buttons
     * @method Button#onFileInput
     * @param {File} file - input file object
     */
    this.onFileInput = function(file) {};


    // a list of actions....

    var select = this;

    /**
     * action upon change, strategy pattern
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
        this.element.selectedIndex = Fast.clamp(0, i, this.actions.length - 1);
    };

    /**
     * get the index of the selected option
     * @method Select#getIndex
     * @return {integer} i
     */
    Select.prototype.getIndex = function(i) {
        return this.element.selectedIndex;
    };



}());
