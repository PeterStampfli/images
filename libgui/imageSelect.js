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
    ImageButton,
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
    // make that the popup can get keyboard events
    this.popup.theDiv.setAttribute("tabindex", "-1");
    this.popup.close();
    // popup with two divs: one for image buttons, one for close button
    this.popupImageButtonDiv = document.createElement("div");
    this.popup.addElement(this.popupImageButtonDiv);
    this.popupCloseButtonDiv = document.createElement("div");
    this.popupCloseButtonDiv.style.textAlign = "center";
    //   this.popupCloseButtonDiv.style.padding = ImageSelect.popupStyle.padding + "px";
    this.closePopupButton = new Button("close", this.popupCloseButtonDiv);
    this.closePopupButton.setFontSize(ImageSelect.popupCloseButtonFontSize);
    this.closePopupButton.element.style.margin = ImageSelect.popupStyle.padding + "px";
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
        imageSelect.interaction();
    };

    this.iconImage.addEventListener("mousedown", function() {
        console.log("icon mousedown");
        imageSelect.interaction();
    });

    // mousewheel action

    function wheelAction(event) {
        event.preventDefault();
        event.stopPropagation();
        imageSelect.interaction();
        if (event.deltaY > 0) {
            imageSelect.select.changeIndex(1);
        } else {
            imageSelect.select.changeIndex(-1);
        }
        return false;
    }

    // mousewheel on icon
    this.iconImage.onwheel = wheelAction;

    // mousewheel on popup
    this.popup.theDiv.onwheel = wheelAction;

    this.popup.theDiv.onmouseenter = function() {
        imageSelect.popup.theDiv.focus(); // to be able to use mousewheel
    };

    // arrowkeys on popup
    this.popup.theDiv.onkeydown = function(event) {
        let key = event.key;
        let index = imageSelect.getIndex();
        const buttonsPerRow = ImageSelect.imageButtonsPerRow;
        if (key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            if (index + buttonsPerRow < imageSelect.imageButtons.length) {
                imageSelect.select.changeIndex(buttonsPerRow);
            }
        } else if (key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
            if (index >= buttonsPerRow) {
                imageSelect.select.changeIndex(-buttonsPerRow);
            }
        } else if (key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            if ((index % buttonsPerRow < buttonsPerRow - 1) && (index < imageSelect.imageButtons.length - 1)) {
                imageSelect.select.changeIndex(1);
            }
        } else if (key === "ArrowLeft") {
            event.preventDefault();
            event.stopPropagation();
            if (index % buttonsPerRow > 0) {
                imageSelect.select.changeIndex(-1);
            }
        }
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

// loading images: only if visible

// check if an html element is visible
// NOTE: if the image or its parents are display==="none", then this does not work.
function isVisible(image) {
    console.log(image);
    if (image.style.display === "none") {
        console.log("**** warning: isVisible - image/parents display none");
        console.log(image);
    }
    let offset = image.offsetTop;
    let element = image.offsetParent;

    console.log(element);
    while (element !== null) {
        if (element.style.display === "none") {
            console.log("**** warning: isVisible - element display none");
            console.log(element);
        }
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    console.log("offtop " + offset);

}

/**
 * start of interaction: load images instead of placeholders, 
 * open popup, call the onInteraction function
 * @method ImageSelect#interaction
 */
ImageSelect.prototype.interaction = function() {


    // improve this- load only visible images, alos do upon onscroll (popup)
    const length = this.imageButtons.length;
    for (var i = 0; i < length; i++) {
        console.log(this.imageButtons[i].element.src);
        this.imageButtons[i].setImageURL(this.iconURLs[i]);
        console.log(i);
        console.log(isVisible(this.imageButtons[i].element));
    }
    this.popup.open();


    this.onInteraction();
};

// style for the ui panel (not the popup)
// style defaults

// width in px for space between select input and icon in the panel
ImageSelect.panelStyle = {
    spaceWidth: 5
};

// missing icon is a red image (data URL for red pixel)
ImageSelect.missingIconURL = "data:image/gif;base64,R0lGODlhAQABAPAAAP8SAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hFDcmVhdGVkIHdpdGggR0lNUAAh+QQAFAD/ACwAAAAAAQABAAACAkQBADs=";
// delayed loading (data url for green pixel)
ImageSelect.notLoadedURL = "data:image/gif;base64,R0lGODlhAQABAPAAABj/AAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hFDcmVhdGVkIHdpdGggR0lNUAAh+QQAFAD/ACwAAAAAAQABAAACAkQBADs=";

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
    totalWidth: 120,
    totalHeight: 120,
    borderWidth: 3,
    borderWidthSelected: 6
};

// popup style is in ImageSelect.popupStyle
const imagePadding = 0.5 * (ImageSelect.imageButtonDimensions.totalHeight - ImageSelect.imageButtonDimensions.imageHeight);

ImageSelect.popupStyle = {
    padding: imagePadding,
    backgroundColor: "#bbbbbb",
    position: "bottomLeft",
    horizontalShift: 0
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
 * adds choices, no varargs
 */
ImageSelect.prototype.add = function(choices) {
    if (Array.isArray(choices)) { // an array
        choices.forEach(choice => this.addChoices(choice));
    } else {
        const keys = Object.keys(choices);
        // an object with many choices (key as name/ value as image url)
        if ((keys.length > 3) || (typeof choices.name) === "undefined" || (typeof choices.value) === "undefined") {
            // backwards compatibility, simpler setup
            console.log("compa");
            const choice = {};
            const imageSelect = this;
            keys.forEach(function(key) {
                choice.name = key;
                choice.icon = choices[key];
                choice.value = choice.icon;
                imageSelect.add(choice);
            });
        } else {
            // adding a single option
            this.select.addOptions(choices.name);
            this.values.push(choices.value);
            let iconURL = ImageSelect.missingIconURL;
            let imageButtonURL = ImageSelect.missingIconURL;
            if (typeof choices.icon === "string") {
                // delayed loading
                iconURL = choices.icon;
                imageButtonURL = ImageSelect.notLoadedURL;
            }
            this.iconURLs.push(iconURL);
            // make the image button
            const index = this.imageButtons.length;
            const button = new ImageButton(imageButtonURL, this.popupImageButtonDiv);
            this.imageButtons.push(button);
            const imageSelect = this;
            button.onClick = function() {
                console.log("image no " + index);
                if (imageSelect.getIndex() !== index) {
                    imageSelect.setIndex(index);
                    imageSelect.onChange();
                }
            };
        }
    }
};

/**
 * add choices
 * Attention: creates the image buttons for the popup, may take a lot of time
 *  do this separately to save loading time
 * each choice is an object with a name, icon and value field
 * choice={name: "name as string", icon: "URL for icon image", value: whatever}
 * the value can be an image URL, a preset (URL of json file)
 * multiple choices are put together in an array, or repeated arguments
 * for backwards compatibility:
 * object { key: "imageURL string", ...}, where number of keys larger than 3, 
 * or object.name===undefined, or object.value=undefined
 * makes choices with {name: key, icon: imageURL, value: imageURL}
 * @method ImageSelect#addChoices
 * @param {... object|array} choice
 */
ImageSelect.prototype.addChoices = function(choices) {
    const length = arguments.length;
    for (var i = 0; i < length; i++) {
        this.add(arguments[i]);
    }
    this.popup.resize();
};

/**
 *  update the icon image, and more
 * @method ImageSelect#update
 */
ImageSelect.prototype.update = function() {
    const index = this.getIndex(); // in case that parameter is out of range
    console.log(index);

    this.iconImage.src = this.iconURLs[index];
    this.imageButtons.forEach(button => button.setBorderWidth(ImageSelect.imageButtonDimensions.borderWidth));
    if (index >= 0) {
        this.imageButtons[index].setBorderWidth(ImageSelect.imageButtonDimensions.borderWidthSelected);
    }
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
