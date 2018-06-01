/**
 * representing an input button and adding actions, can use any html element
 * simple push button
 *
 * @constructor Button
 * @param {String} idName name (id) of an html element
 */

/* jshint esversion:6 */

function Button(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.pressed = false;
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";


    /**
     * action upon click, strategy pattern
     * @method Button#onClick
     */
    this.onClick = function() {};

    /**
     * action after loading a new input file for file input buttons
     * @method Button#onFileInput
     * @param {File} file - input file object
     */
    this.onFileInput = function(file) {};


    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.pressed) {
            button.pressed = false;
            button.onClick();
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

    // default colors
    Button.colorUp = "#444444";
    Button.colorUpHover = "black";
    Button.colorDownHover = "black";
    Button.colorDown = "#444444";
    Button.backgroundColorUp = "white";
    Button.backgroundColorUpHover = "#ffffbb";
    Button.backgroundColorDownHover = "#ffff44";
    Button.backgroundColorDown = "#ffff88";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Button#updateStyle
     */
    Button.prototype.updateStyle = function() {
        if (this.pressed) {
            if (this.hover) {
                this.element.style.color = this.colorDownHover;
                this.element.style.backgroundColor = this.backgroundColorDownHover;
            } else {
                this.element.style.color = this.colorDown;
                this.element.style.backgroundColor = this.backgroundColorDown;
            }
        } else {
            if (this.hover) {
                this.element.style.color = this.colorUpHover;
                this.element.style.backgroundColor = this.backgroundColorUpHover;
            } else {
                this.element.style.color = this.colorUp;
                this.element.style.backgroundColor = this.backgroundColorUp;
            }
        }
    };

    /**
     * setup the color styles defaults, use for other buttons too
     * @method Button#colorStyleDefaults
     */
    Button.prototype.colorStyleDefaults = function() {
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
     * create an invisible file input button
     * @method Button.createFileInput
     * @param {function} action - callback function(file), what to do with the new file
     * @param {String} accept - optional attribute, type of files to accept, default is image.jpg
     */
    Button.createFileInput = function(action, accept) {
        let fileInput = document.createElement("input");
        fileInput.setAttribute("type", "file");
        fileInput.style.display = "none";
        document.querySelector("body").appendChild(fileInput);
        if (arguments.length > 1) {
            fileInput.setAttribute("accept", accept);
        } else {
            fileInput.setAttribute("accept", ".jpg");
        }
        fileInput.onchange = function() {
            action(fileInput.files[0]);
        };
        return fileInput;
    };

    /**
     * make that a button is a file input button. 
     * button.onFileInput(file) defines the action
     * @method Button#asFileInput
     */
    Button.prototype.asFileInput = function() {
        let button = this;
        this.fileInput = Button.createFileInput(function(file) {
            button.onFileInput(file);
        }, this.accept);
        this.onClick = function() {
            this.fileInput.click();
        };
    };


}());
