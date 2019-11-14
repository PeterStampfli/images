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
    this.leftDiv.style.verticalAlign="bottom";

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

    this.firstSpace.style.backgroundColor="red";
    this.parent.appendChild(this.firstSpace);


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
    this.buttonDownDiv.style.paddingBottom = 5*space + "px"; // spacing to next
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
    console.log(value);
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