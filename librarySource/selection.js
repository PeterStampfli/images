/**
 * collect switchButtons to make a synchronized single choice
 * @constructor Selection
 * @param {SwitchButton} button... - vararg, list of buttons, first button will be set to pressed
 */

/* jshint esversion:6 */


function Selection() {
    "use strict";

    this.buttons = [];
    for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
    }
    this.setFirstPressed();
}


(function() {
    "use strict";


    /**
     * add a button to the selection, change its element.onmousedown function
     * @method  Selection#add
     * @param {SwitchButton} button
     */
    Selection.prototype.add = function(button) {
        this.buttons.push(button);
        let selection = this;
        button.element.onmousedown = function() {
            selection.reset();
            button.pressed = true;
            button.mouseDown = true;
            button.updateStyle();
        };
    };

    /**
     * create a switchbutton with given id, add to selection, set first button to pressed, return the button
     * @method Selection#createButton
     * @param {String} idName
     * @return {SwitchButton}
     */
    Selection.prototype.createButton = function(idName) {
        let button = new SwitchButton(idName);
        this.add(button);
        this.setFirstPressed();
        return button;
    };

    /**
     * reset buttons, set them all up to released
     * @method Selection#reset
     */
    Selection.prototype.reset = function() {
        this.buttons.forEach(function(button) {
            button.release();
        });
    };

    /**
     * for initialization, set selected button to pressed
     * @method Selection#setPressed
     * @param {SwitchButton} button
     */
    Selection.prototype.setPressed = function(button) {
        this.reset();
        button.push();
    };

    /**
     * for initialization, set first button to pressed
     * @method Selection#setFirstPressed
     */
    Selection.prototype.setFirstPressed = function() {
        if (this.buttons.length > 0) {
            this.setPressed(this.buttons[0]);
        }
    };


}());
