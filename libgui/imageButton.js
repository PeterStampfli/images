/**
 * a button with an image, set image later
 * the image is an inline element, margins add up, the border goes into the margin
 * simple push button
 *
 * @constructor ImageButton
 * @param {DOM element} parent, an html element, best "div"
 * @param {...object} newDesign - modifying the default design
 */

import {
    guiUtils,
    Button
} from "./modules.js";

export function ImageButton(parent, newDesign) {
    this.design = {};
    Object.assign(this.design, ImageButton.defaultDesign);
    for (var i = 2; i < arguments.length; i++) {
        guiUtils.updateValues(this.design, arguments[i]);
    }
    // basic element is an image
    this.image = document.createElement("img");
    this.image.style.cursor = "pointer";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "center center";
    this.setDimensions();
    parent.appendChild(this.image);
    this.image.style.outline = "none";
    this.image.style.verticalAlign = "middle";
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

    this.image.onmousedown = function() {
        button.pressed = true;
        button.updateStyle();
        button.onInteraction();
    };

    this.image.onmouseup = function() {
        if (button.pressed) {
            button.pressed = false;
            button.onClick();
        }
        button.image.blur();
        button.updateStyle();
    };

    this.image.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.image.onmouseleave = function() {
        button.hover = false;
        button.image.onmouseup();
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
ImageButton.borderColorUp = "#444444";
ImageButton.borderColorHover = "#bbbb44";
ImageButton.borderColorDown = "#eeee44";

/**
 * setup the color styles defaults, use for other buttons too
 * @method ImageButton#colorStyleDefaults
 */
ImageButton.prototype.colorStyleDefaults = function() {
    this.borderColorDown = ImageButton.borderColorDown;
    this.borderColorHover = ImageButton.borderColorHover;
    this.borderColorUp = ImageButton.borderColorUp;
};

/**
 * update the style :border depending on state
 * @method ImageButton#updateStyle
 */
ImageButton.prototype.updateStyle = function() {
    if (this.pressed) {
        this.image.style.borderStyle = "inset";
        this.image.style.borderColor = this.borderColorDown;
    } else {
        this.image.style.borderStyle = "outset";
        if (this.hover) {
            this.image.style.borderColor = this.borderColorHover;
        } else {
            this.image.style.borderColor = this.borderColorUp;
        }
    }
};

/*
 * find filename, if data url return the entire data url
 */
function filename(url) {
    if (url.substring(0, 5) === "data:") {
        return url;
    } else {
        const urlParts = url.split("/");
        return urlParts[urlParts.length - 1];
    }
}

/*
 * return if filename is jpg (no transparency)
 * for data url too
 */
const dataJpeg = "data:image/jpeg";

function isJpeg(url) {
    if (url.substring(0, 15) === dataJpeg) {
        return true;
    } else {
        const urlPieces = url.split(".");
        const type = urlPieces[urlPieces.length - 1].toLowerCase();
        return (type === "jpg") || (type === "jpeg");
    }
}

ImageButton.backgroundColorHigh = "#f8f8f8";
ImageButton.backgroundColorLow = "#666666";
/**
 * determine the background color suitable for a transparent image
 * calculates the average rgb components and luminosity
 * background depends on lumo
 * @method ImageButton.determineBackgroundColor
 * @param {html image element} image
 * @return String, the suitable background color
 */
ImageButton.determineBackgroundColor = function(image) {
    // a single pixel off-screen canvas
    let backgroundColor = "#888888";
    if (!isJpeg(image.src)) {
        const theCanvas = document.createElement("canvas");
        const size = 50;
        theCanvas.width = size; // the size, not the style
        theCanvas.height = size;
        theCanvas.style.display = "none";
        document.body.appendChild(theCanvas);
        const theCanvasContext = theCanvas.getContext('2d');
        theCanvasContext.drawImage(image, 0, 0, size, size);
        const theImageData = theCanvasContext.getImageData(0, 0, size, size).data;
        theCanvas.remove();
        // sum and average
        let sumRed = 0;
        let sumGreen = 0;
        let sumBlue = 0;
        let sumAlpha = 0;
        const length = theImageData.length;
        for (var i = 0; i < length; i += 4) {
            const alpha = theImageData[i + 3];
            sumRed += theImageData[i] * alpha;
            sumGreen += theImageData[i + 1] * alpha;
            sumBlue += theImageData[i + 2] * alpha;
            sumAlpha += alpha;
        }
        if (sumAlpha > 0) {
            sumAlpha = 1 / sumAlpha;
            sumRed *= sumAlpha;
            sumGreen *= sumAlpha;
            sumBlue *= sumAlpha;
            const luma = 0.299 * sumRed + 0.587 * sumGreen + 0.114 * sumBlue;
            if (luma > 127) {
                backgroundColor = ImageButton.backgroundColorLow;
            } else {
                backgroundColor = ImageButton.backgroundColorHigh;
            }
        }
    }
    return backgroundColor;
};

/**
 * set image url for a placeholder, no image background
 * @method ImageButton#setPlaceholder
 * @param {string} url
 */
ImageButton.prototype.setPlaceholder = function(url) {
    this.image.onload = function() {};
    this.image.src = url;
    this.image.style.backgroundColor = "";
};

/**
 * set image (url) of the button (only if changes ??)
 * and background depending on average image color (images with transparency: png and svg and ?)
 * @method ImageButton#setImage
 * @param {string} url
 */
ImageButton.prototype.setImage = function(url) {
    if (filename(this.image.src) !== filename(url)) {
        // define callback for image loading (asynchronous)
        const imageButton = this;
        this.image.onload = function() {
            imageButton.image.style.backgroundColor = ImageButton.determineBackgroundColor(imageButton.image);
        };
        // now load the image
        this.image.src = url;
    }
};

// set style dimensions from known image sizes, border width and total sizes
// adjusting the margins
ImageButton.prototype.setDimensions = function() {
    const design = this.design;
    this.image.style.width = design.imageButtonWidth + "px";
    this.image.style.height = design.imageButtonHeight + "px";
    this.image.style.borderWidth = design.imageButtonBorderWidth + "px";
    this.image.style.marginTop = 0.5 * (design.imageButtonTotalHeight - design.imageButtonHeight) - design.imageButtonBorderWidth + "px";
    this.image.style.marginBottom = 0.5 * (design.imageButtonTotalHeight - design.imageButtonHeight) - design.imageButtonBorderWidth + "px";
    this.image.style.marginLeft = 0.5 * (design.imageButtonTotalWidth - design.imageButtonWidth) - design.imageButtonBorderWidth + "px";
    this.image.style.marginRight = 0.5 * (design.imageButtonTotalWidth - design.imageButtonWidth) - design.imageButtonBorderWidth + "px";
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
 * set color of the border (for up)
 * @method ImageButton#setBorderWidth
 * @param {string} color
 */
ImageButton.prototype.setBorderColor = function(color) {
    this.borderColorUp = color;
    this.updateStyle();
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
    this.image.onmousedown = null;
    this.image.onmouseup = null;
    this.image.onmouseenter = null;
    this.image.onmouseleave = null;
    this.image.remove();
    this.image = null;
};
