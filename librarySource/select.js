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
        console.log(select.element.selectedIndex);
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
     * adding an action function for an option
     * @method Select#addAction
     * @param {function} fun - what to do, a function()
     */
    Select.prototype.addAction = function(fun) {
        this.actions.push(fun);
    };
}());
