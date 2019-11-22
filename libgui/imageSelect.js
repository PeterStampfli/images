/**
 * a select input with icons
 * each choice has a name, an icon and a value
 
 
 
 
 * In both cases we have in addition to th image a smaller icon
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    SelectValues
} from "./modules.js";

export function ImageSelect(parent) {
    this.parent = parent;
    // first a select
    this.select = new SelectValues(parent);
    this.firstSpace = document.createElement("div");
    this.firstSpace.style.width = ImageSelect.spaceWidth + "px";
    this.firstSpace.style.display = "inline-block";
    this.parent.appendChild(this.firstSpace);

    // at the right of input elements there is the small icon
    this.image = document.createElement("img");
    this.image.setAttribute("importance", "high");
    this.image.src = null;
    this.image.style.verticalAlign = "middle";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "center center";
    parent.appendChild(this.image);

    // the actions
    const imageSelect = this;

    this.select.select.element.addEventListener("mousedown", function() {
        console.log("mousedown");
    });

    this.image.addEventListener("mousedown", function() {
        console.log("mousedown");
    });


    this.image.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY > 0) {
            imageSelect.select.select.changeIndex(1);
        } else {
            imageSelect.select.select.changeIndex(-1);
        }
        return false;
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

// width for spaces in px
ImageSelect.spaceWidth = 5;


/**
 * set label and select/button font sizes, button font sizes are increased
 * @method ImageSelect#setFontSize
 * @param {int} buttonSize - in pix
 */
ImageSelect.prototype.setFontSize = function(buttonSize) {
    this.select.setFontSize(buttonSize);
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
    const selectValue = this.select.getValue();
    if (typeof selectValue === "string") {
        this.image.src = selectValue;
        this.value = selectValue;
    } else {
        this.image.src = selectValue.image;
        this.value = selectValue.data;
    }
};

/**
 * set the choices as key/value pairs of an object, 
 * the key is shown as text in the select input element.
 * - choosing images: The value is the URL string of the image. 
 *   We have a choices object with pairs of strings. choices={ label1: "URL1", ...};
 *   The selected value is the image URL string
 * - choosing other values (presets), the image is only a label.
 *   The choices object now has as values objects with an image and a data field.
 *   choices={label1: {image: "URL1", data: someData}, ...};
 *   The selected value is the data field.
 * the labels go to the this.select.labels array
 * the values (image URL strings or image/data objects) got to the this.select.values array
 * @method ImageSelect#setChoices
 * @param {Object} images
 */
ImageSelect.prototype.setChoices = function(choices) {
    this.select.addOptions(choices);
    this.select.setIndex(0);
    this.updateImageValue();
};

/**
 * set the selection to a new value, without calling the callback
 * updating the shown image too, not only the label
 * if this.select.values items are (URL) strings 
 * then the newValue parameter has to be a string and we can use this.select.setValue(newValue) (searches for this.select.value===newValue)
 * if this.select.values items are objects then we have search for the values object with the same data
 * that means to find the selection index i with this.select.values[i].data===newValue
 * @method ImageSelect#setValue
 * @param {Object||string||simpleValue} newValue
 */
ImageSelect.prototype.setValue = function(newValue) {
    console.log(newValue);
    if (typeof this.select.values[0] === "object") {
        //search for the index with the correct object.value field
        var index = this.select.values.length - 1;
        while ((index >= 0) && (this.select.values[index].data !== newValue)) {
            index--;
        }
        newValue = this.select.values[index]; // replace value by its {image: URL, data: some data} object
    }
    this.select.setValue(newValue);
    this.updateImageValue();
};

/**
 * get the value
 * if this.select.value is a (URL) string  then it is the return value
 * if this.select.value is an objects then we have to return its data field
 * done in updateImageValue method
 * @method ImageSelect#getValue
 * @param {Object||string||simpleValue} value
 */
ImageSelect.prototype.getValue = function() {
    return this.value;
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
