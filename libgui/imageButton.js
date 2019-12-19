/**
 * a button with an image
 * the image is an inline element, margins add up, the border goes into the margin
 * simple push button
 *
 * @constructor ImageButton
 * @param {String} imageURL
 * @param {DOM element} parent, an html element, best "div"
 * @param {...object} newDesign - modifying the default design
 */

import {
    guiUtils,
    Button
} from "./modules.js";

export function ImageButton(imageURL, parent, newDesign) {
    this.design = {};
    Object.assign(this.design, ImageButton.defaultDesign);
    for (var i = 2; i < arguments.length; i++) {
        guiUtils.updateValues(this.design, arguments[i]);
    }
    // basic element is an image
    this.element = document.createElement("img");
    this.element.style.cursor = "pointer";
    this.element.style.objectFit = "contain";
    this.element.style.objectPosition = "center center";
    this.setDimensions();
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
     * action upon mouse down, doing an interaction
     * @method ImageButton#onInteraction
     */
    this.onInteraction = function() {};

    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
        button.onInteraction();
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
ImageButton.defaultDesign = {
    imageButtonWidth: 100,
    imageButtonHeight: 100,
    imageButtonTotalWidth: 120,
    imageButtonTotalHeight: 120,
    imageButtonBorderWidth: 3
};

// background color for png images with a white motiv?
ImageButton.backgroundColorUp = "#eeeeee";
// transparencies for mouse interaction
ImageButton.opacityDown = 0.6;
ImageButton.opacityHover = 0.8;

/**
 * setup the color styles defaults, use for other buttons too
 * @method ImageButton#colorStyleDefaults
 */
ImageButton.prototype.colorStyleDefaults = function() {
    this.backgroundColorUp = ImageButton.backgroundColorUp;
    this.backgroundColorUpHover = Button.backgroundColorUpHover;
    this.backgroundColorDownHover = Button.backgroundColorDownHover;
    this.backgroundColorDown = Button.backgroundColorDown;
    this.opacityHover = ImageButton.opacityHover;
    this.opacityDown = ImageButton.opacityDown;
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
 * set image (url) of the button (only if changes ??)
 * @method ImageButton#setImageURL
 * @param {string} url
 */
ImageButton.prototype.setImageURL = function(url) {
    if (this.element.src !== url) {
        this.element.src = url;
    }
};

// set style dimensions from known image sizes, border width and total sizes
// adjusting the margins
ImageButton.prototype.setDimensions = function() {
    const design = this.design;
    this.element.style.width = design.imageButtonWidth + "px";
    this.element.style.height = design.imageButtonHeight + "px";
    this.element.style.borderWidth = design.imageButtonBorderWidth + "px";
    this.element.style.marginTop = 0.5 * (design.imageButtonTotalHeight - design.imageButtonHeight) - design.imageButtonBorderWidth + "px";
    this.element.style.marginBottom = 0.5 * (design.imageButtonTotalHeight - design.imageButtonHeight) - design.imageButtonBorderWidth + "px";
    this.element.style.marginLeft = 0.5 * (design.imageButtonTotalWidth - design.imageButtonWidth) - design.imageButtonBorderWidth + "px";
    this.element.style.marginRight = 0.5 * (design.imageButtonTotalWidth - design.imageButtonWidth) - design.imageButtonBorderWidth + "px";
};

/**
 * set width and height of the image of the button, in px
 * NOTE: Length ratio has to fit the image
 * @method ImageButton#setSize
 * @param {integer} width
 * @param {integer} height
 */
ImageButton.prototype.setImageSize = function(width, height) {
    if ((this.design.imageButtonWidth !== width) || (this.design.imageButtonHeight !== height)) {
        this.design.imageButtonWidth = width;
        this.design.imageButtonHeight = height;
        this.setDimensions();
    }
};

/**
 * set width of the border, in px
 * does only something if borderwidth really changes
 * @method ImageButton#setBorderWidth
 * @param {integer} width
 */
ImageButton.prototype.setBorderWidth = function(width) {
    if (this.design.imageButtonBorderWidth !== width) {
        this.design.imageButtonBorderWidth = width;
        this.setDimensions();
    }
};

/**
 * set color of the border
 * does only something if borderwidth really changes
 * @method ImageButton#setBorderWidth
 * @param {string} color
 */
ImageButton.prototype.setBorderColor = function(color) {
    this.element.style.borderColor = color;
};

/**
 * set total width and height of the button, inluding margin, in px
 * @method ImageButton#setTotalSize
 * @param {integer} width
 * @param {integer} height
 */
ImageButton.prototype.setTotalSize = function(width, height) {
    if ((this.design.imageButtonTotalWidth !== width) || (this.design.imageButtonTotalHeight !== height)) {
        this.design.imageButtonTotalWidth = width;
        this.design.imageButtonTotalHeight = height;
        this.setDimensions();
    }
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
