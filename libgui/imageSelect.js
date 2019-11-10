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

    this.image.src = "abendfalter.jpg";
    //this.image.style.display = "inline-block";
    this.image.style.verticalAlign = "top";
    this.image.style.objectFit = "contain";
    this.image.style.objectPosition = "left top";

    parent.appendChild(this.image);


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
 * set labels and image url arrays from object ( label: URL, ...), access to other data through selectedIndex
 * @method ImageSelect#setLabelImageURL
 * @param {Array||Object} images
 */
ImageSelect.prototype.setLabelImageURL = function(images) {
    this.select.setLabelsValues(images);
};