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
    this.leftDiv = document.createElement("div"); // div with label and other things, including spacing at left and right
    this.leftDiv.style.display = "inline-block";

    parent.appendChild(this.leftDiv);
    // controller.label = imageSelect.label in the controller if needed, can also delete
    this.label = document.createElement("div");
    this.label.style.backgroundColor = "#ffff88";
    this.label.textContent = "label";
    this.leftDiv.appendChild(this.label);

    this.selectDiv = document.createElement("div");
    this.selectDiv.style.textAlign = "right";

    this.select = new SelectValues(this.selectDiv);
    this.selectDiv.style.backgroundColor = "green";

    this.leftDiv.appendChild(this.selectDiv);



    this.buttonUpDiv = document.createElement("div");
    this.buttonUpDiv.style.textAlign = "right";

    this.buttonUpDiv.style.backgroundColor = "orange";

    this.buttonUp = new Button("▲", this.buttonUpDiv);

    this.leftDiv.appendChild(this.buttonUpDiv);


    this.buttonDownDiv = document.createElement("div");
    this.buttonDownDiv.style.textAlign = "right";

    this.buttonDownDiv.style.backgroundColor = "orange";
    this.buttonDown = new Button("▼", this.buttonDownDiv);

    this.leftDiv.appendChild(this.buttonDownDiv);

    this.image = document.createElement("img");

    this.image.src = null;
    //this.image.style.display = "inline-block";
    this.image.style.verticalAlign = "top";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "left top";

    this.image.setAttribute("tabindex", "0");

    parent.appendChild(this.image);

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

    // hovering
    this.image.onmouseover = function() {
        imageSelect.image.focus();
        console.log("fo"); // img cannot have focus, only form elms  a-tag too
    };


    this.image.onkeydown = function(event) {
        console.log("key");
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

    this.select.onChange = function() {

        console.log("value " + imageSelect.select.value);
        imageSelect.updateImageValue();
        imageSelect.onChange();
    };

    // the onChange function that does the action
    this.onChange = function() {
        console.log("imageSelect value: ");
        console.log(this.value.toString());
    };
}


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
 * set the minimumn width for the label space, including whitespace
 * @method ImageSelect#setMinimalWidth
 * @param {int} size
 */
ImageSelect.prototype.setMinimalWidth = function(size) {
    this.leftDiv.style.minWidth = size + "px";
};


/**
 * set label and button font sizes
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
        this.value = this.selectValue;
    } else {
        this.image.src = selectValue.image;
        this.value = selectValue.value;
    }
};


/**
 * for choosing images
 * set labels and image urls as two strings, key value pairs of an object choices={ "label1": "URL1", ...},
 * for other uses (presets): image is only a label 
 * and there may be another value that is actually choosen (the preset object), then
 * choices={"label1": {"image": "URL1", value: someData}, ...}
 * then use an object made of labels (again as keys) and objects with image and value fields
 * 
 * @method ImageSelect#setLabelImageURL
 * @param {Object} images
 */
ImageSelect.prototype.setLabelImageURL = function(choices) {
    this.select.setLabelsValues(choices);
    this.select.setIndex(0);
    this.select.onChange();
};
