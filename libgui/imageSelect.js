/**
 * a select input with icons
 * each choice has a name, an icon and a value
 * the value may be an URL for an image, a preset, ...
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 * @param {...object} newDesign - modifying the default design
 */

// note: close popup when using another ui input element
//  simplify color picker

import {
    ImageButton,
    Button,
    Select,
    Popup
} from "./modules.js";

// add style parameter !!! -> design

export function ImageSelect(parent, newDesign) {
    this.parent = parent;
    this.design = {};
    Object.assign(this.design, ImageSelect.defaultDesign);
    for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === "object") {
            updateValues(this.design, arguments[i]);
        }
    }
    // the html elements in the main UI (not the popup)
    // first a select 
    this.select = new Select(parent);
    this.select.setFontSize(this.design.panelFontSize);
    // then a space (as a span ?)
    // accessible from outside top be able to change style
    this.space = document.createElement("span");
    this.space.style.width = this.design.panelSpaceWidth + "px";
    this.space.style.display = "inline-block";
    this.parent.appendChild(this.space);
    // at the right of input elements there is the small (icon) image of the selection
    this.panelImage = document.createElement("img");
    this.panelImage.setAttribute("importance", "high");
    this.panelImage.src = ImageSelect.missingIconURL;
    this.panelImage.style.verticalAlign = "middle";
    this.panelImage.style.cursor = "pointer";
    this.panelImage.style.height = this.design.panelImageHeight + "px";
    this.panelImage.style.width = this.design.panelImageWidth + "px";
    this.panelImage.style.border = "solid";
    this.panelImage.style.borderStyle = "inset";
    this.panelImage.style.borderColor = this.design.panelImageBorderColor;
    this.panelImage.style.borderWidth = this.design.panelImageBorderWidth + "px";
    this.panelImage.style.objectFit = "contain";
    this.panelImage.style.objectPosition = "center center";
    parent.appendChild(this.panelImage);
    // here comes the popup
    // the popup width that should be available for image buttons
    this.design.innerWidth = this.design.imageButtonTotalWidth * this.design.imageButtonsPerRow;
    this.design.padding = 0.5 * (this.design.imageButtonTotalWidth - this.design.imageButtonWidth);
    this.popup = new Popup(this.design);
    // make that the popup can get keyboard events
    this.popup.theDiv.setAttribute("tabindex", "-1");
    this.popup.close();
    // popup with two divs: one for image buttons, one for close button
    this.popupImageButtonDiv = document.createElement("div");
    this.popup.addElement(this.popupImageButtonDiv);
    this.popupCloseButtonDiv = document.createElement("div");
    this.popupCloseButtonDiv.style.textAlign = "center";
    this.closePopupButton = new Button("close", this.popupCloseButtonDiv);
    this.closePopupButton.setFontSize(this.design.fontSize);
    this.closePopupButton.element.style.margin = this.design.padding + "px";
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

    this.panelImage.addEventListener("mousedown", function() {
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
    this.panelImage.onwheel = wheelAction;


    function loadImagesForOpenPopup() {
        if (imageSelect.popup.isOpen()) {
            imageSelect.loadImages();
        }
    }
    // scroll on popup
    this.popup.theDiv.onscroll = loadImagesForOpenPopup;

    window.addEventListener("resize", loadImagesForOpenPopup, false);

    this.popup.theDiv.onmouseenter = function() {
        imageSelect.popup.theDiv.focus(); // to be able to use mousewheel
    };

    // arrowkeys on popup
    this.popup.theDiv.onkeydown = function(event) {
        let key = event.key;
        let index = imageSelect.getIndex();
        const buttonsPerRow = imageSelect.design.imageButtonsPerRow;
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
    };

    // the onChange function that does the action
    this.onChange = function() {
        console.log("onChange imageSelect value: " + this.getValue());
    };
}

// default design

ImageSelect.defaultDesign = {
    // choosing images: the value is an image that can serve as icon, if there is no icon value
    // ok, this is not really a design parameter, make an exception
    choosingImages: true,
    // for the ui panel
    // dimensions without "panel" are for the popup
    panelSpaceWidth: 5,
    panelFontSize: 14,
    panelImageWidth: 40,
    panelImageHeight: 40,
    panelImageBorderWidth: 2,
    panelImageBorderColor: "#bbbbbb",
    // for the popup, specific
    imageButtonsPerRow: 2,
    imageButtonWidth: 100,
    imageButtonHeight: 100,
    imageButtonTotalWidth: 120,
    imageButtonTotalHeight: 120,
    imageButtonBorderWidth: 3,
    imageButtonBorderWidthSelected: 6,
    imageButtonBorderColor: "#888888",
    imageButtonBorderColorNoIcon: "#ff6666",
    // for the popup, general
    innerWidth: 300, // the usable client width inside, equal to the div-width except if there is a scroll bar
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    fontSize: 18,
    textColor: "#444444",
    backgroundColor: "#aaaaaa",
    padding: 10,
    border: "solid",
    borderWidth: 3,
    borderColor: "#444444",
    borderRadius: 0,
    shadowWidth: 0,
    shadowBlur: 0,
    shadowRed: 0,
    shadowGreen: 0,
    shadowBlue: 0,
    shadowAlpha: 0.7,
    zIndex: 20,
    position: "center",
    horizontalShift: 0
};

// changing design parameters

function updateValues(toObject, fromObject) {
    for (var key in fromObject) {
        if ((typeof toObject[key] === typeof fromObject[key]) && (typeof fromObject[key] !== "function")) {
            toObject[key] = fromObject[key];
        }
    }
}

/**
 * update Poipup design defaults, using data of another object with the same key 
 * @method ImageSelect.updateDefaultDesign
 * @param {Object} newValues
 */
ImageSelect.updateDefaultDesign = function(newValues) {
    updateValues(ImageSelect.defaultDesign, newValues);
};

// default icons:
// missing icon is a red image (data URL for red pixel)
ImageSelect.missingIconURL = "data:image/gif;base64,R0lGODlhAQABAPAAAP8SAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hFDcmVhdGVkIHdpdGggR0lNUAAh+QQAFAD/ACwAAAAAAQABAAACAkQBADs=";
// delayed loading (data url for green pixel)
ImageSelect.notLoadedURL = "data:image/gif;base64,R0lGODlhAQABAPAAABj/AAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hFDcmVhdGVkIHdpdGggR0lNUAAh+QQAFAD/ACwAAAAAAQABAAACAkQBADs=";

/**
 * load true (icon) images , only if visible
 * @method ImageSelect#loadImages
 */
ImageSelect.prototype.loadImages = function() {
    const length = this.imageButtons.length;
    const popupHeight = this.popup.theDiv.offsetHeight;
    const popupScroll = this.popup.theDiv.scrollTop;
    const imageDivOffset = this.popupImageButtonDiv.offsetTop;
    const imageHeight = this.imageButtons[0].element.offsetHeight;
    for (var i = 0; i < length; i++) {
        const totalOffset = this.imageButtons[i].element.offsetTop + imageDivOffset - popupScroll;
        // partially visible: "upper" border of image above zero (lower border of popup)
        //                    AND "lower" border of image below "upper" border of popup
        if ((totalOffset + imageHeight > 0) && (totalOffset < popupHeight)) {
            this.imageButtons[i].setImageURL(this.iconURLs[i]);
        }
    }
};

/**
 * make the choosen image in the popup visible, adjusts the scrollTop
 * #method ImageSelect#makeImageButtonVisible
 * @param {ImageButton} imageButton
 */
ImageSelect.prototype.makeImageButtonVisible = function(imageButton) {
    const popupHeight = this.popup.theDiv.offsetHeight;
    const popupScroll = this.popup.theDiv.scrollTop;
    const imageDivOffset = this.popupImageButtonDiv.offsetTop;
    const imageHeight = imageButton.element.offsetHeight;
    const totalOffset = imageButton.element.offsetTop + imageDivOffset - popupScroll;
    console.log(totalOffset);
    console.log(imageHeight);
    console.log(popupHeight);
    // check if not entirely visible
    //"lower" border is below lower border of popup  
    if (totalOffset < 0) {
        console.log("too low");
        this.popup.theDiv.scrollTop = imageButton.element.offsetTop + imageDivOffset - 2 * this.design.padding;
    }
    // higher border is above upper border of popup
    else if (totalOffset + imageHeight > popupHeight) {
        console.log("too high");
        this.popup.theDiv.scrollTop = imageButton.element.offsetTop + imageDivOffset + imageHeight - popupHeight + this.design.padding;
    }
};

/**
 * start of interaction: load images instead of placeholders, 
 * open popup, make choosen visible, call the onInteraction function
 * @method ImageSelect#interaction
 */
ImageSelect.prototype.interaction = function() {
    this.popup.open();
    this.loadImages();
    const index = this.getIndex(); // in case that parameter is out of range
    if (index >= 0) {
        this.makeImageButtonVisible(this.imageButtons[index]);
    }
    this.onInteraction();
};

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
            const choice = {};
            const imageSelect = this;
            keys.forEach(function(key) {
                choice.name = key;
                choice.icon = choices[key];
                choice.value = choice.icon;
                imageSelect.add(choice);
            });
        } else {
            // adding a single option, we do not know if we have a valid icon
            this.select.addOptions(choices.name);
            const index = this.imageButtons.length;
            this.values.push(choices.value);
            // assume worst case: no icon, no image
            const button = new ImageButton(ImageSelect.missingIconURL, this.popupImageButtonDiv);
            button.setBorderColor(this.design.imageButtonBorderColorNoIcon);
            this.imageButtons.push(button);
            const imageSelect = this;
            button.onClick = function() {
                console.log("image no " + index);
                if (imageSelect.getIndex() !== index) {
                    imageSelect.setIndex(index);
                    imageSelect.onChange();
                }
            };
            // do we have an icon?
            if (typeof choices.icon === "string") {
                // all is well, we have an icon (assuming this is a picture url)
                this.iconURLs.push(choices.icon);
                console.log(choices.icon);
                // delayed loading
                button.setImageURL(ImageSelect.notLoadedURL);
                button.setBorderColor(this.design.imageButtonBorderColor);
            } else if ((this.design.choosingImages) && (typeof choices.value === "string")) {
                // instead of the icon can use the image ( if the value is a jpg or png)
                const valuePieces = choices.value.split(".");
                console.log(valuePieces);
                const valueEnd = valuePieces[valuePieces.length - 1].toLowerCase();
                console.log(valueEnd);
                if ((valueEnd === "jpg") || (valueEnd === "png")) {
                    this.iconURLs.push(choices.value);
                    button.setImageURL(ImageSelect.notLoadedURL);
                } else {
                    // no icon
                    this.iconURLs.push(ImageSelect.missingIconURL);
                }
            } else {
                // no icon
                this.iconURLs.push(ImageSelect.missingIconURL);
            }
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
    this.panelImage.src = this.iconURLs[index];
    this.imageButtons.forEach(button => button.setBorderWidth(this.design.imageButtonBorderWidth));
    if (index >= 0) {
        const choosenButton = this.imageButtons[index];
        choosenButton.setBorderWidth(this.design.imageButtonBorderWidthSelected);
        this.makeImageButtonVisible(choosenButton);
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
 * set the index and update all displays
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
