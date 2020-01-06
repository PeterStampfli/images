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
    this.image = document.createElement("img");
    this.image.style.cursor = "pointer";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "center center";
    this.setDimensions();
    parent.appendChild(this.image);
    this.setImage(imageURL);
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
        this.image.style.borderStyle = "inset";
        this.image.style.opacity = this.opacityDown;
        if (this.hover) {
            this.image.style.backgroundColor = this.backgroundColorDownHover;
        } else {
            this.image.style.backgroundColor = this.backgroundColorDown;
        }
    } else {
        this.image.style.borderStyle = "outset";
        if (this.hover) {
            this.image.style.backgroundColor = this.backgroundColorUpHover;
            this.image.style.opacity = this.opacityHover;
        } else {
            this.image.style.backgroundColor = this.backgroundColorUp;
            this.image.style.opacity = 1;
        }
    }
};


// move to image button

// a single pixel off-screen canvas
const onePixelCanvas = document.createElement("canvas");
//onePixelCanvas.style.display = "none";
onePixelCanvas.width = 200;
onePixelCanvas.height = 200;
guiUtils.style(onePixelCanvas)
    .width("200px")
    .height("200px")
    .zIndex(30)
    .position("absolute")
    .bottom("0px")
    .left("0px")
    .backgroundColor("yellow");
document.body.appendChild(onePixelCanvas);

const onePixelContext = onePixelCanvas.getContext('2d');

/*


onePixelContext.fillStyle = "blue";
onePixelContext.fillRect(0, 0, 2, 2);
const onePixelImageData = onePixelContext.getImageData(0, 0, 1, 1);
console.log(onePixelCanvas)
console.log(onePixelImageData)

//     ImageData { width: 1, height: 1, data: Uint8ClampedArray(4) }

const onePixelColor = onePixelImageData.data; // Uint8ClampedArray[r,g,b,a]
*/

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

/**
 * set image (url) of the button (only if changes ??)
 * and background depending on average image color (images with transparency: png and svg and ?)
 * @method ImageButton#setImage
 * @param {string} url
 */
ImageButton.prototype.setImage = function(url) {


    if (filename(this.image.src) !== filename(url)) {
        console.log("loading " + url);
        const imageButton = this;
        this.image.onload = function() {
            if (!isJpeg(url)) {
                console.log("transparency");

                onePixelContext.clearRect(0, 0, 200, 200);
                onePixelContext.drawImage(imageButton.image, 0, 0, 200, 200);

            }
        };


        this.image.src = url;
        // determine if it is a png (needs different background)

        // asynchronous image.onload !!!  
        // use thrpoughaway canvas

        // determine average color
        /*   console.log(url);
           onePixelContext.clearRect(0, 0, 200, 200);
           onePixelContext.drawImage(this.image, 0, 0, 200, 200);
           const onePixelImageData = onePixelContext.getImageData(0, 0, 2, 2);
           console.log(onePixelImageData)
           console.log(onePixelImageData.data)
           */
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
 * set color of the border
 * does only something if borderwidth really changes
 * @method ImageButton#setBorderWidth
 * @param {string} color
 */
ImageButton.prototype.setBorderColor = function(color) {
    this.image.style.borderColor = color;
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
