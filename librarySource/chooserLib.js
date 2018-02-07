/**
 * representing a radio button chooser and adding actions
 * @example see chooserTest.html
 *
 * @constructor Chooser
 * @param {String} className name (class) of the chooser in the HTML page
 */

function Chooser(className) {
    "use strict";
    this.index = 0;
    this.buttons = document.getElementsByClassName(className);
}

(function() {
    "use strict";
    /**
     * add a click event listener to a radio button, starting with the first one,
     * always going to the next one
     * @method Chooser#add
     * @param {function} action function without parameters, will be called upon a click event   
     */
    Chooser.prototype.add = function(action) {
        this.buttons[this.index++].addEventListener('click', action, false);
    };

    /**
     * set the n-th button to checked
     * @method Chooser#setChecked
     * @param {integer} n index of button (starting with 0)
     */
    Chooser.prototype.setChecked = function(n) {
        this.buttons[n].checked = true;
    };

    /**
     * set the first button to checked
     * @method Chooser#setCheckedFirst
     */
    Chooser.prototype.setCheckedFirst = function() {
        this.setChecked(0);
    };
}());
