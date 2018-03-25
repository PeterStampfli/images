/**
 * a button to load a file
 * @constructor FileButton
 * @param {String} idName name (id) of an html element
 */

/* jshint esversion:6 */

function FileButton(idName) {
    "use strict";
    // what to accept, default is image
    this.accept = "image/*";

    this.element = document.getElementById(idName);
    this.hover = false;
    this.pressed = false;
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * what to do if the choosen input file changes
     * @method FileButton#onchange
     * @param {fileblob} file - the input file blob
     */
    this.onchange = function(file) {};

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.pressed) {
            button.onclick();
        }
        button.pressed = false;
        button.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        if (button.pressed) {
            button.onclick();
        }
        button.pressed = false;
        button.updateStyle();
    };
}


(function() {
    "use strict";


    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method FileButton#updateStyle
     */
    FileButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method FileButton#colorStyleDefaults
     */
    FileButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;


    // make an invisible input file button
    let inputFileButton = document.createElement("input");
    inputFileButton.setAttribute("type", "file");
    inputFileButton.style.display = "none";
    document.querySelector("body").appendChild(inputFileButton); //?????


    /**
     * action upon click, load a file, using the hidden inputFileButton
     * call the this.onchange(file) method
     * @method FileButton#onclick
     */
    FileButton.prototype.onclick = function() {
        inputFileButton.setAttribute("accept", this.accept);
        var button = this;
        inputFileButton.onchange = function() {
            button.onchange(inputFileButton.files[0]);
        };
        inputFileButton.click();
    };




}());
