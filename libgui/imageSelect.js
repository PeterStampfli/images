/**
 * a select input with icons
 * each choice has a name, an icon and a value
 * the value may be an URL for an image, a preset, ...
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 */

// note: close popup when using another ui input element
//  simplify color picker

import {
    Button,
    Select,
    Popup
} from "./modules.js";

export function ImageSelect(parent) {
    this.parent = parent;
    // the html elements in the main UI (not the popup)
    // first a select 
    this.select = new Select(parent);
    // then a space (as a span ?)
    // accessible from outside top be able to change style
    this.space = document.createElement("span");
    this.space.style.width = ImageSelect.panelStyle.spaceWidth + "px";
    this.space.style.display = "inline-block";
    this.parent.appendChild(this.space);
    // at the right of input elements there is the small icon image
    this.iconImage = document.createElement("img");
    this.iconImage.setAttribute("importance", "high");
    this.iconImage.src = null;
    this.iconImage.style.verticalAlign = "middle";
    this.iconImage.style.cursor = "pointer";
    this.iconImage.style.objectFit = "contain";
    this.iconImage.style.objectPosition = "center center";
    parent.appendChild(this.iconImage);
    // here comes the popup
    // change ImageSelect.popupStyle if necessary
    // the popup width that should be available for image buttons
    ImageSelect.popupStyle.innerWidth = ImageSelect.imageButtonDimensions.totalWidth * ImageSelect.imageButtonsPerRow;
    this.popup = new Popup(ImageSelect.popupStyle);
    this.popup.close();
    // popup with two divs: one for image buttons, one for close button
    this.popupImageButtonDiv = document.createElement("div");
    this.popupImageButtonDiv.style.textAlign = "center";
    this.popupImageButtonDiv.style.paddingTop = ImageSelect.popupStyle.verticalPadding + "px";
    this.popup.addElement(this.popupImageButtonDiv);
    this.popupCloseButtonDiv = document.createElement("div");
    this.popupCloseButtonDiv.style.textAlign = "center";
    this.popupCloseButtonDiv.style.paddingTop = ImageSelect.popupStyle.verticalPadding + "px";
    this.popupCloseButtonDiv.style.paddingBottom = ImageSelect.popupStyle.verticalPadding + "px";
    this.closePopupButton = new Button("close", this.popupCloseButtonDiv);
    this.closePopupButton.setFontSize(ImageSelect.popupCloseButtonFontSize);
    this.popup.addElement(this.popupCloseButtonDiv);
    // the data
    this.iconURLs = [];
    this.values = [];
    this.imageButtons = [];

    // the actions
    const imageSelect = this;

    // events to make appear the image chooser popup:
    // mousedown on select or icon image
    // onChange on select or mouse wheel on icon image 
    // (as all of them change choice)

    this.select.onInteraction = function() {
        console.log("select inter");
        imageSelect.onInteraction();
    };

    this.iconImage.addEventListener("mousedown", function() {
        console.log("icon mousedown");
        imageSelect.onInteraction();
    });

    // mousewheel
    this.iconImage.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        imageSelect.onInteraction();
        if (event.deltaY > 0) {
            imageSelect.select.changeIndex(1);
        } else {
            imageSelect.select.changeIndex(-1);
        }
        return false;
    };

    // close the popup (other than automatically)
    this.closePopupButton.onClick = function() {
        imageSelect.popup.close();
    };

    // all events change the select element, if its value changes then update the image, the value of this and do some action
    this.select.onChange = function() {
        imageSelect.update();
        imageSelect.onChange();
    };

    // the start of interaction function that changes the ui, in particular popups
    this.onInteraction = function() {
        console.log("interaction");
        imageSelect.popup.open();

    };

    // the onChange function that does the action
    this.onChange = function() {
        //???????????????????????????????????????
        console.log("onChange imageSelect value: " + this.getValue());
    };
}

// style for the ui panel (not the popup)
// style defaults

// width in px for space between select input and icon in the panel
ImageSelect.panelStyle = {
    spaceWidth: 5
};

// default icon
// ATTENTION: set new URL for different file structure
ImageSelect.defaultIconURL = "/images/libgui/defaultIcon.jpg";

/**
 * set label and select/button font sizes, button font sizes are increased
 * @method ImageSelect#setFontSize
 * @param {int} buttonSize - in pix
 */
ImageSelect.prototype.setFontSize = function(buttonSize) {
    this.select.setFontSize(buttonSize);
};

/**
 * set the size of the icon image in the UI panel
 * @method ImageSelect.setPanelIconSize
 * @param {int} width - in px
 * @param {int} height - in px
 */
ImageSelect.prototype.setPanelIconSize = function(width, height) {
    this.iconImage.style.width = width + "px";
    this.iconImage.style.height = height + "px";
};

// style of the pupop
// defaults for the popup

// image buttons in the popup 
// numbers of buttons per row
ImageSelect.imageButtonsPerRow = 3;
// initial (default) dimensions for image buttons, overwrite values
ImageSelect.imageButtonDimensions = {
    imageWidth: 100,
    imageHeight: 100,
    borderWidth: 3,
    totalWidth: 120,
    totalHeight: 120,
    borderWidthSelected: 6
};

// popup style is in ImageSelect.popupStyle

ImageSelect.popupStyle = {
    padding: 0,
    verticalPadding: 10, // padding at top and bottom of the parts of popup
    backgroundColor: "#bbbbbb",
    position: "bottomLeft"
};

// for the close button
ImageSelect.popupCloseButtonFontSize = 18;

// actions on both the ui-panel and the popup

/**
 * clear (delete) all choices
 * @method ImageSelect#clear
 */
ImageSelect.prototype.clear = function() {
    this.select.clear();
    this.iconURLs.length = 0;
    this.values.length = 0;
    this.imageButtons.forEach(button => button.destroy());
    this.imageButtons.length = 0;
};

/**
 * add the image buttons to the popup
 * can be delayed to improve speed of initial page loading
 * @method ImageSelect#addImageButtons
 */
ImageSelect.prototype.addImageButtons = function() {

};





/**
 * add choices
 * each choice is an object with a name, icon and value field
 * choice={name: "name as string", icon: "URL for icon image", value: whatever}
 * the value can be an image URL, a preset (URL of json file)
 * multiple choices are put together in an array, or repeated arguments
 * @method ImageSelect#addChoices
 * @param {... object|array} choice
 */
ImageSelect.prototype.addChoices = function(choices) {
    const length = arguments.length;
    if (length === 1) {
        if (Array.isArray(choices)) {
            choices.forEach(choice => this.addChoices(choice));
        } else {
            this.select.addOptions(choices.name);
            this.values.push(choices.value);
            if (typeof choices.icon === "string") {
                this.iconURLs.push(choices.icon);
            } else {
                this.iconURLs.push(ImageSelect.defaultIconURL);
            }
        }
    } else {
        for (var i = 0; i < length; i++) {
            this.addChoices(arguments[i]);
        }
    }
};

/**
 *  update the icon image, and more
 * @method ImageSelect#update
 */
ImageSelect.prototype.update = function() {
    const index = this.getIndex(); // in case that parameter is out of range
    this.iconImage.src = this.iconURLs[index];
};

/**
 * get the index
 * @method ImageSelect#getIndex
 * @return integer, the selected index
 */
ImageSelect.prototype.getIndex = function() {
    const result = this.select.getIndex();
    return result;
};

/**
 * set the index
 * does not call the onChange callback
 * @method ImageSelect#setIndex
 * @param {integer} index
 */
ImageSelect.prototype.setIndex = function(index) {
    this.select.setIndex(index);
    this.update();
};

/**
 * get the value
 * @method ImageSelect#getValue
 * @return integer, the selected index
 */
ImageSelect.prototype.getValue = function() {
    const result = this.values[this.select.getIndex()];
    return result;
};

/**
 * set the value and update display
 * does not call the onChange callback
 * @method ImageSelect#setValue
 * @param {whatever} value
 */
ImageSelect.prototype.setValue = function(value) {
    const index = this.values.indexOf(value);
    this.setIndex(index);
};