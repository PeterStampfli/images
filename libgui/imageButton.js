/**
 * a button with an image
 * simple push button
 *
 * @constructor ImageButton
 * @param {String} imageURL
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button
} from "./modules.js";

export function ImageButton(imageURL, parent) {
    this.element = document.createElement("img");
    this.element.style.cursor = "pointer";
    this.setSize(ImageButton.dimensions.width, ImageButton.dimensions.height);
    this.setMarginWidth(ImageButton.dimensions.marginWidth);
    parent.appendChild(this.element);
    this.setImageURL(imageURL);
    this.element.style.outline = "none";
    this.element.style.verticalAlign = "middle";
    // states
    this.pressed = false;
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon click, strategy pattern
     * @method Button#onClick
     */
    this.onClick = function() {
        console.log("click");
    };

    /**
     * action upon mouse down, strategy pattern
     * @method Button#onMouseDown
     */
    this.onMouseDown = function() {};

    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
        button.onMouseDown();
    };

    this.element.onmouseup = function() {
        if (button.pressed) {
            button.pressed = false;
            button.onClick();
        }
        button.element.blur();
        button.updateStyle();
    };

    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        button.element.onmouseup();
    };
}

// initial (default) dimensions, overwrite values
ImageButton.dimensions = {
    width: 100,
    height: 100,
    marginWidth: 10
};

/**
 * setup the color styles defaults, use for other buttons too
 * @method ImageButton#colorStyleDefaults
 */
ImageButton.prototype.colorStyleDefaults = function() {
    this.backgroundColorUp = Button.backgroundColorUp;
    this.backgroundColorUpHover = Button.backgroundColorUpHover;
    this.backgroundColorDownHover = Button.backgroundColorDownHover;
    this.backgroundColorDown = Button.backgroundColorDown;
    this.opacityHover = 0.8;
    this.opacityDown = 0.6;
};

/**
 * update the style :border depending on state
 * @method ImageButton#updateStyle
 */
ImageButton.prototype.updateStyle = function() {
    if (this.pressed) {
        this.element.style.borderStyle = "inset";
        this.element.style.opacity = this.opacityDown;
        if (this.hover) {
            this.element.style.backgroundColor = this.backgroundColorDownHover;
        } else {
            this.element.style.backgroundColor = this.backgroundColorDown;
        }
    } else {
        this.element.style.borderStyle = "outset";
        if (this.hover) {
            this.element.style.backgroundColor = this.backgroundColorUpHover;
            this.element.style.opacity = this.opacityHover;
        } else {
            this.element.style.backgroundColor = this.backgroundColorUp;
            this.element.style.opacity = 1;
        }
    }
};

/**
 * set image (url) of the button
 * @method ImageButton#setImageURL
 * @param {string} url
 */
ImageButton.prototype.setImageURL = function(url) {
    this.element.src = url;
};

/**
 * set width and height of the button, in px
 * NOTE: Length ratio has to fit the image
 * @method ImageButton#setSize
 * @param {integer} width
 * @param {integer} height
 */
ImageButton.prototype.setSize = function(width, height) {
    this.element.style.width = width + "px";
    this.element.style.height = height + "px";
};

/**
 * set width of the border, in px
 * @method ImageButton#setBorderWidth
 * @param {integer} width
 */
ImageButton.prototype.setBorderWidth = function(width) {
    this.element.style.borderWidth = width + "px";
};

/**
 * set width of the margin, in px
 * @method ImageButton#setMarginWidth
 * @param {integer} width
 */
ImageButton.prototype.setMarginWidth = function(width) {
    this.element.style.margin = width + "px";
};

/**
 * destroy the button, taking care of all references, deletes the associated html element
 * may be too careful
 * set reference to the button to null
 * @method ImageButton#destroy
 */
ImageButton.prototype.destroy = function() {
    this.onClick = null;
    this.onMouseDown = null;
    this.element.onmousedown = null;
    this.element.onmouseup = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
};
