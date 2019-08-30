/**
 * a checkbox (container)
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor Checkbox
 * @param {String} idName - of an html input element
 */

/* jshint esversion:6 */

function Checkbox(idName) {
    this.idName = idName;
    this.element = document.getElementById(idName);
    DOM.attribute("#" + idName, "type", "checkbox");
    DOM.style("#" + idName, "cursor", "pointer");

    /**
     * action upon change, strategy pattern
     * @method Button#onClick
     */
    this.onChange = function() {
        console.log("nada");
    };

    var checkbox = this;
    this.element.onchange = function() {
        checkbox.onChange();
    };
}

(function() {
    "use strict";

    /**
     * get value of checkbox
     * @method Checkbox#getValue
     * @return boolean, if checked
     */
    Checkbox.prototype.getValue = function() {
        return this.element.checked;
    };

    /**
     * set value of checkbox
     * @method Checkbox#setValue
     * @param {boolean} checked
     */
    Checkbox.prototype.setValue = function(checked) {
        this.element.checked = checked;
    };

    /**
     * destroy the checkbox
     * @method Checkbox#destroy
     */
    Checkbox.prototype.destroy = function() {
        this.onChange = null;
        this.element.onchange = null;
        this.element.remove();
    };

}());
