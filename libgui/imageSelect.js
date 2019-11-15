/**
 * a select input with images. It has two use cases:
 * - Select an (input) image: we can directly see the current image 
 *   and we can rapidly change it (scrolling with the mouse wheel)
 *   The selected value is the image URL
 * - Select something (such as a preset) that is better represented by an image 
 *   than a name. The name and the image are both shown. 
 *   The selected data is not the image URL, something else instead.
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
    this.leftDiv.style.verticalAlign = "bottom";

    // for each item in the left div we make a new div, to be able to adjust spacing
    this.buttonUpDiv = document.createElement("div");
    this.buttonUpDiv.style.textAlign = "center";
    this.buttonUp = new Button("▲", this.buttonUpDiv);
    this.leftDiv.appendChild(this.buttonUpDiv);
    this.buttonDownDiv = document.createElement("div");
    this.buttonDownDiv.style.textAlign = "center";
    this.buttonDown = new Button("▼", this.buttonDownDiv);
    this.leftDiv.appendChild(this.buttonDownDiv);
    //next below the label there is a select
    this.selectDiv = document.createElement("div");
    this.select = new SelectValues(this.selectDiv);
    this.leftDiv.appendChild(this.selectDiv);
    parent.appendChild(this.leftDiv);
    this.firstSpace = document.createElement("div");
    this.firstSpace.style.width = ImageSelect.spaceWidth + "px";
    this.firstSpace.style.display = "inline-block";
    this.parent.appendChild(this.firstSpace);

    // at the right of input elements there is the small image (as selection result or alternative label)
    this.image = document.createElement("img");
    this.image.setAttribute("importance", "high");
    this.image.src = null;
    this.image.style.verticalAlign = "top";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "left top";
    parent.appendChild(this.image);

    // the actions
    const imageSelect = this;

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
 * using link prefetch to preload images and accelerate response
 * works on google chrome and chromium
 * but not on firefox (see network tab of the debugger)
 * do not abuse (needs more reflection)
 * @function prefetchImage
 * @param {string} url
 */
function prefetchImage(url) {
    console.log("prefetch");
    const prefetch = document.createElement("link");
    prefetch.href = url;
    prefetch.rel = "prefetch";
    prefetch.as = "image";
    prefetch.onload = function() {
        console.log("loaded " + url);
    };
    document.head.appendChild(prefetch);
}

/**
 * set the spacing between ui elements in verical direction
 * @method ImageSelection#setVerticalSpacing
 * @param {int} space - in px
 */
ImageSelect.prototype.setVerticalSpacing = function(space) {
    this.buttonDownDiv.style.paddingTop = space + "px"; // spacing to next
    this.buttonDownDiv.style.paddingBottom = 2 * space + "px"; // spacing to next
    this.selectDiv.style.paddingBottom = 2 * space + "px"; // spacing to next
};

/**
 * set label and select/button font sizes, button font sizes are increased
 * @method ImageSelect#setFontSize
 * @param {int} buttonSize - in pix
 */
ImageSelect.prototype.setFontSize = function(buttonSize) {
    this.select.setFontSize(buttonSize);
    this.buttonUp.setFontSize(buttonSize);
    this.buttonDown.setFontSize(buttonSize);
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
    this.select.setLabelsValues(choices);
    this.select.setIndex(0, false);
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