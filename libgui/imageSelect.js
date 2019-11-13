/**
 * select images with a view of the image and alternative methods for changing
 * to have same interface as other ui elements
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    SelectValues
} from "./modules.js";

export function ImageSelect(parent) {
    this.parent = parent;
    // top level: at left a div with label, select and up/down buttons, including some spacing at left and right
    this.leftDiv = document.createElement("div");
    this.leftDiv.style.display = "inline-block";
    // for each item in the left div we make a new div, to be able to adjust spacing
    // the label is slightly different than for other controllers because we have many items at the left
    // controller.label = imageSelect.label in the controller to be able to change name, can also be deleted
    this.label = document.createElement("div");
    this.label.textContent = "label";
    this.leftDiv.appendChild(this.label);
    //next below the label there is a select
    this.selectDiv = document.createElement("div");
    this.selectDiv.style.textAlign = "right";
    this.select = new SelectValues(this.selectDiv);
    this.leftDiv.appendChild(this.selectDiv);
    // enough vertical space for up/down buttons
    // in their divs, for alignment at the right side
    this.buttonUpDiv = document.createElement("div");
    this.buttonUpDiv.style.textAlign = "right";
    this.buttonUp = new Button("▲", this.buttonUpDiv);
    this.leftDiv.appendChild(this.buttonUpDiv);
    this.buttonDownDiv = document.createElement("div");
    this.buttonDownDiv.style.textAlign = "right";
    this.buttonDown = new Button("▼", this.buttonDownDiv);
    this.leftDiv.appendChild(this.buttonDownDiv);
    parent.appendChild(this.leftDiv);
    // at the right of input elements there is the small image (as selection result or alternative label)
    this.image = document.createElement("img");
    this.image.setAttribute("importance", "high");
    this.image.src = null;
    this.image.style.verticalAlign = "top";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "left top";
    // makes that it can have focus
    this.image.setAttribute("tabindex", "0");
    parent.appendChild(this.image);

    // the actions
    const imageSelect = this;

    // preloading images for fast first response
    if (ImageSelect.preload && !ImageSelect.windowLoaded) {
        window.addEventListener("load", function() {
            ImageSelect.windowLoaded = false;
            imageSelect.preload();
        });
    }

    this.buttonUp.onClick = function() {
        imageSelect.select.changeSelectedIndex(1);
    };

    this.buttonDown.onClick = function() {
        imageSelect.select.changeSelectedIndex(-1);
    };

    this.image.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY > 0) {
            imageSelect.select.changeSelectedIndex(1);
        } else {
            imageSelect.select.changeSelectedIndex(-1);
        }
        return false;
    };

    // hovering, give the image focus, to be able to use keyboard events
    this.image.onmouseover = function() {
        imageSelect.image.focus();
    };

    this.image.onkeydown = function(event) {
        let key = event.key;
        if (key === "ArrowDown") {
            imageSelect.select.changeSelectedIndex(1);
            event.preventDefault();
            event.stopPropagation();
        } else if (key === "ArrowUp") {
            imageSelect.select.changeSelectedIndex(-1);
            event.preventDefault();
            event.stopPropagation();
        }
    };

    // all events change the select element, if its value changes then update the image, the value of this and do some action
    this.select.onChange = function() {
        imageSelect.updateImageValue();
        imageSelect.onChange();
    };

    // the onChange function that does the action
    this.onChange = function() {
        console.log("onChange imageSelect value: " + this.value);
    };
}

/**
 * image preloading at window.onload: set to false if it blocks
 * @variable {boolean} image.preload 
 */
ImageSelect.preload = true;

// check if window loaded
ImageSelect.windowLoaded = false;

/**
 * preloading all images at window.onload
 * @method ImageSelect#preload
 */
ImageSelect.prototype.preload = function() {
    if (ImageSelect.preload) {
        const image = document.createElement("img");
        image.setAttribute("importance", "low"); // as we are only preloading
        for (var i = this.select.values.length - 1; i >= 0; i--) {
            let value = this.select.values[i];
            if (typeof value === "object") {
                value = value.image;
            }
            image.src = value;
        }
    }
};

/**
 * set the spacing between ui elements in verical direction
 * @method ImageSelection#setVerticalSpacing
 * @param {int} space - in px
 */
ImageSelect.prototype.setVerticalSpacing = function(space) {
    this.label.style.paddingBottom = space + "px"; // spacing to next
    this.selectDiv.style.paddingBottom = space + "px"; // spacing to next
    this.buttonUpDiv.style.paddingBottom = space + "px"; // spacing to next
};

/**
 * set the spacing left and right of ui elements
 * @method ImageSelection#setHorizontalSpacing
 * @param {int} space - in px
 */
ImageSelect.prototype.setHorizontalSpacing = function(space) {
    this.leftDiv.style.paddingLeft = space + "px";
    this.selectDiv.style.paddingLeft = space + "px";
    this.leftDiv.style.paddingRight = space + "px";
};

/**
 * set the minimumn width for the label/controls space, including whitespace
 * @method ImageSelect#setMinimalWidth
 * @param {int} size
 */
ImageSelect.prototype.setMinimalWidth = function(size) {
    this.leftDiv.style.minWidth = size + "px";
};

/**
 * set label and select/button font sizes, button font sizes are increased
 * @method ImageSelect#setFontSizes
 * @param {int} labelSize - in pix
 * @param {int} buttonSize - in pix
 */
ImageSelect.prototype.setFontSizes = function(labelSize, buttonSize) {
    this.label.style.fontSize = labelSize + "px";
    this.select.setFontSize(buttonSize);
    const buttonFactor = 1.3;
    this.buttonUp.setFontSize(buttonFactor * buttonSize);
    this.buttonDown.setFontSize(buttonFactor * buttonSize);
};

/**
 * set the image size (limits)
 * @method ImageSelect.setImageSize
 * @param {int} width - in px
 * @param {int} height - in px
 */
ImageSelect.prototype.setImageSize = function(width, height) {
    this.image.style.width = width + "px";
    this.image.style.height = height + "px";
};

/**
 * set image and value depending on selected index
 * @method ImageSelect#updateImageValue
 */
ImageSelect.prototype.updateImageValue = function() {
    const selectValue = this.select.value;
    if (typeof selectValue === "string") {
        this.image.src = selectValue;
        this.value = selectValue;
    } else {
        this.image.src = selectValue.image;
        this.value = selectValue.value;
    }
};

/**
 * set the choices, without calling the callback
 * for choosing images
 * set labels and image urls as two strings, key value pairs of an object choices={ "label1": "URL1", ...},
 * for other uses (presets): image is only a label 
 * and there may be another value that is actually choosen (the preset object), then
 * choices={"label1": {"image": "URL1", value: someData}, ...}
 * then use an object made of labels (again as keys) and objects with image and value fields
 * the labels go to the this.select.labels array
 * the values (URL strings or objects) got to the this.select.values array
 * 
 * @method ImageSelect#setChoices
 * @param {Object} images
 */
ImageSelect.prototype.setChoices = function(choices) {
    this.select.setLabelsValues(choices);
    this.select.setIndex(0, false);
    this.updateImageValue();
};

/**
 * set the value, without calling the callback
 * updating the image too, not only the label
 * if this.select.values items are (URL) strings 
 * then the value parameter has to be a string and we can use this.select.setValue
 * if this.select.values items are objects then we have two possibilities
 * - the value parameter is an object with an image key that is a string
 *   then we can use this.select.setValue
 *   ATTENTION: has to be the SAME object, not another object with same values
 * - the value parameter is not an object or an object without an image key
 *   then we have to find the index with this.select.values[i]===value
 *   and use it in this.select.setIndex
 * @method ImageSelect#setValue
 * @param {Object||string||simpleValue} value
 */
ImageSelect.prototype.setValue = function(value) {
    if (typeof this.select.values[0] === "object") {
        if ((typeof value === "object") && (typeof value.image === "string")) {
            this.select.setValue(value);
        } else {
            //search for the index with the correct object.value field
            var index = this.select.values.length - 1;
            while ((index >= 0) && (this.select.values[index].value !== value)) {
                index--;
            }
            this.select.setIndex(index, false);
        }
    } else { // all values are supposed to be strings
        this.select.setValue(value);
    }
    this.updateImageValue();
};

/**
 * destroy this input element
 * @method ImageSelect#destroy
 */
ImageSelect.prototype.destroy = function() {
    this.onChange = null;
    this.image.onwheel = null;
    this.image.onmouseover = null;
    this.image.onkeydown = null;
    this.image.remove();
    this.select.destroy();
    this.buttonUp.destroy();
    this.buttonDown.destroy();
    this.leftDiv.remove();
};