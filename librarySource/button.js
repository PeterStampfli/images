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
    this.idName = idName;
    this.element = document.getElementById(idName);
    // states
    this.pressed = false;
    this.hover = false;
    this.active = true; // allows switching off
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";
    this.element.disabled = false;

    /**
     * action upon click, strategy pattern
     * @method Button#onClick
     */
    this.onClick = function() {};

    /**
     * action upon mouse down, strategy pattern
     * @method Button#onMouseDown
     */
    this.onMouseDown = function() {};

    /**
     * action after loading a new input file for file input buttons
     * @method Button#onFileInput
     * @param {File} file - input file object
     */
    this.onFileInput = function(file) {};


    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        if (button.active) {
            button.pressed = true;
            button.updateStyle();
            button.onMouseDown();
        }
    };

    this.element.onmouseup = function() {
        if (button.active) {
            if (button.pressed) {
                button.pressed = false;
                button.onClick();
            }
            button.updateStyle();
        }
    };

    // hovering
    this.element.onmouseenter = function() {
        if (button.active) {
            button.hover = true;
            button.updateStyle();
        }
    };

    this.element.onmouseleave = function() {
        if (button.active) {
            button.hover = false;
            button.element.onmouseup();
        }
    };
}


(function() {
    "use strict";

    // default colors
    // for active button, depending on hoovering and if it is pressed
    Button.colorUp = "#444444";
    Button.colorUpHover = "black";
    Button.colorDownHover = "black";
    Button.colorDown = "#444444";
    Button.backgroundColorUp = "white";
    Button.backgroundColorUpHover = "#ffffbb";
    Button.backgroundColorDownHover = "#ffff44";
    Button.backgroundColorDown = "#ffff88";
    // for switched off
    Button.colorInactive = "black";
    Button.backgroundColorInactive = "#aaaaaa";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Button#updateStyle
     */
    Button.prototype.updateStyle = function() {
        if (this.active) {
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
        } else {

            this.element.style.color = this.colorInactive;
            this.element.style.backgroundColor = this.backgroundColorInactive;
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
        this.colorInactive = Button.colorInactive;

        this.backgroundColorUp = Button.backgroundColorUp;
        this.backgroundColorUpHover = Button.backgroundColorUpHover;
        this.backgroundColorDownHover = Button.backgroundColorDownHover;
        this.backgroundColorDown = Button.backgroundColorDown;
        this.backgroundColorInactive = Button.backgroundColorInactive;
    };

    /**
     * set if button is active
     * @method Button#setActive
     * @param {boolean} isActive
     */
    Button.prototype.setActive = function(isActive) {
        this.active = isActive;
        this.element.disabled = !isActive;
        if (isActive) {
            this.element.style.cursor = "pointer";
        } else {
            this.element.style.cursor = "default";
            this.pressed = false;
            this.hover = false;
        }
        this.updateStyle();
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

    /**
     * destroy the button, taking care of all references, deletes the associated html element
     * may be too careful
     * set reference to the button to null
     * @method Button#destroy
     */
    Button.prototype.destroy = function() {
        this.onClick = null;
        this.onMouseDown = null;
        this.onFileInput = null;
        this.element.onmousedown = null;
        this.element.onmouseup = null;
        this.element.onmouseenter = null;
        this.element.onmouseleave = null;
        this.element.remove();
    };

    /**
     * create a button that goes to another html page
     * @method Button.createGoToLocation
     * @param {String} id - of the html element that serves as button
     * @param {String} target - url of the new html page
     * @return Button element, just in case
     */
    Button.createGoToLocation = function(id, target) {
        const button = new Button(id);
        button.onClick = function() {
            window.location = target;
        };
        return button;
    };

    /**
     * create a button that executes a function
     * @method Button.createFunction
     * @param {String} id - of the html element that serves as button
     * @param {function} action 
     * @return Button element, just in case
     */
    Button.createAction = function(id, action) {
        const button = new Button(id);
        button.onClick = action;
        return button;
    };

    /**
     * enable (set active true) a list of buttons
     * @method Button.enable
     * @param {Button ...} buttons - a list of buttons
     */
    Button.enable = function(buttons) {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i].setActive(true);
        }
    };

    /**
     * disable (set active false) a list of buttons
     * @method Button.enable
     * @param {Button ...} buttons - a list of buttons
     */
    Button.disable = function(buttons) {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i].setActive(false);
        }
    };

}());
