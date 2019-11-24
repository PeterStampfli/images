/**
 * a text button 
 * simple push button
 *
 * @constructor Button
 * @param {String} text
 * @param {DOM element} parent, an html element, best "div"
 */

export function Button(text, parent) {
    this.element = document.createElement("button");
    parent.appendChild(this.element);
    this.setText(text);
    this.element.style.borderRadius = "1000px"; // semicircle
    this.element.style.outline = "none";
    this.element.style.verticalAlign = "middle";
    // states
    this.pressed = false;
    this.hover = false;
    this.active = true; // allows switching off
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";
    this.element.disabled = false;
    this.isFileInput = false;

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
            button.element.blur();
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
 * set fontsize of the button, in px
 * @method Button#setFontSize
 * @param {integer} size
 */
Button.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set width of the button, in px
 * @method Button#setWidth
 * @param {integer} width
 */
Button.prototype.setWidth = function(width) {
    this.element.style.width = width + "px";
};

/**
 * set the text of the button
 * @method Button#setText
 * @param {String} text
 */
Button.prototype.setText = function(text) {
    this.element.textContent = text;
};

/**
 * color style for using transparent span with text as button
 * @method Button#colorStyleForTransparentSpan
 * @param {String} color - for basic text (button state up, no hover)
 */
Button.prototype.colorStyleForTransparentSpan = function(color) {
    const transparentWhite = "#ffffff00";
    this.backgroundColorDown = transparentWhite;
    this.backgroundColorDownHover = transparentWhite;
    this.backgroundColorUp = transparentWhite;
    this.backgroundColorUpHover = transparentWhite;
    this.colorUp = color;
    this.colorUpHover = Button.backgroundColorUpHover;
    this.colorDown = Button.backgroundColorDown;
    this.colorDownHover = Button.backgroundColorDownHover;
    this.updateStyle();
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
 * make that a button is a file input button. 
 * creates an invisible file input button
 * button.onFileInput(file) defines the action
 * @method Button#asFileInput
 * @param {String} accept - optional attribute, type of files to accept, default is image.jpg
 */
Button.prototype.asFileInput = function(accept = ".jpg") {
    this.isFileInput = true;
    const fileInput = document.createElement("input");
    this.fileInput = fileInput;
    fileInput.setAttribute("type", "file");
    fileInput.style.display = "none";
    document.querySelector("body").appendChild(fileInput);
    fileInput.setAttribute("accept", accept);
    let button = this;
    fileInput.onchange = function() {
        button.onFileInput(fileInput.files[0]);
    };
    this.onClick = function() {
        button.fileInput.click();
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
    if (this.isFileInput) {
        this.fileInput.onchange = null;
        this.fileInput.remove();
        this.fileInput = null;
    }
    this.element.onmousedown = null;
    this.element.onmouseup = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
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
