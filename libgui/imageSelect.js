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
    guiUtils,
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
            guiUtils.updateValues(this.design, arguments[i]);
        }
    }
    // the data
    this.iconURLs = [];
    this.values = [];
    this.popupImageButtons = [];
    // here comes the popup
    // the popup width that should be available for image buttons
    this.design.popupInnerWidth = this.design.imageButtonTotalWidth * this.design.popupImagesPerRow;
    this.design.popupPadding = 0.5 * (this.design.imageButtonTotalWidth - this.design.imageButtonWidth);
    this.popup = new Popup(this.design);
    // make that the popup can get keyboard events
    this.popup.mainDiv.setAttribute("tabindex", "-1");
    this.popup.addCloseButton();
    this.popup.close();
    // the input elements in the main UI (not the popup)
    // stacking vertically
    this.selectDiv = document.createElement("div");
    this.selectDiv.style.display = "inline-block";
    this.selectDiv.style.verticalAlign = "middle";
    this.selectDiv.style.textAlign = "center";
    this.select = new Select(this.selectDiv);
    this.select.setFontSize(this.design.buttonFontSize);
    // if user images can be loaded, then add a vertical space and a button
    if (this.design.acceptUserImages) {
        // the user image input button
        const vSpace = document.createElement("div");
        vSpace.style.height = this.design.spaceWidth + "px";
        this.selectDiv.appendChild(vSpace);
        this.userInput = new Button(this.design.addImageButtonText, this.selectDiv);
        this.userInput.asFileInput("image/*");
        this.userInput.fileInput.setAttribute("multiple", "true");
        this.userInput.setFontSize(this.design.buttonFontSize);
        // write that we can drop images into the popup
        const messageDiv = document.createElement("div");
        messageDiv.innerText = this.design.dropToPopupText;
        messageDiv.style.fontSize = this.design.buttonFontSize;
        messageDiv.style.paddingBottom = this.popup.design.popupPadding + "px";
        this.popup.controlDiv.insertBefore(messageDiv, this.popup.closeButton.element);

        // adding events
        const imageSelect = this;

        this.userInput.onInteraction = function() {
            imageSelect.interaction();
        };

        this.userInput.onFileInput = function(files) {
            // files is NOT an array
            for (let i = 0; i < files.length; i++) {
                imageSelect.addUserImage(files[i]);
            }
        };

        // we need dragover to prevent default loading of image, even if dragover does nothing else
        this.popup.mainDiv.ondragover = function(event) {
            event.preventDefault();
        };

        this.popup.mainDiv.ondrop = function(event) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            // event.dataTransfer.files is NOT an array
            for (let i = 0; i < files.length; i++) {
                imageSelect.addUserImage(files[i]);
            }
        };
    }
    parent.appendChild(this.selectDiv);
    // then a space between input elements and icon image
    // accessible from outside to be able to change style
    this.space = document.createElement("span");
    this.space.style.width = this.design.spaceWidth + "px";
    this.space.style.display = "inline-block";
    this.parent.appendChild(this.space);
    // at the right of input elements there is the small (icon) image of the selection
    this.guiImage = document.createElement("img");
    this.guiImage.setAttribute("importance", "high");
    this.guiImage.style.verticalAlign = "middle";
    this.guiImage.style.cursor = "pointer";
    this.guiImage.style.height = this.design.guiImageHeight + "px";
    this.guiImage.style.width = this.design.guiImageWidth + "px";
    this.guiImage.style.border = "solid";
    this.guiImage.style.borderStyle = "inset";
    this.guiImage.style.borderColor = this.design.guiImageBorderColor;
    this.guiImage.style.borderWidth = this.design.guiImageBorderWidth + "px";
    this.guiImage.style.objectFit = "contain";
    this.guiImage.style.objectPosition = "center center";
    parent.appendChild(this.guiImage);

    // the actions
    const imageSelect = this;

    // events to make appear the image chooser popup:
    // mousedown on select or icon image
    // onChange on select or mouse wheel on icon image 
    // (as all of them change choice)

    this.select.onInteraction = function() {
        imageSelect.interaction();
    };

    this.guiImage.onmousedown = function() {
        imageSelect.interaction();
        return false;
    };

    // mousewheel on icon
    this.guiImage.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        imageSelect.interaction();
        if (event.deltaY > 0) {
            imageSelect.select.changeIndex(1);
        } else {
            imageSelect.select.changeIndex(-1);
        }
        return false;
    };

    function loadImagesForOpenPopup() {
        if (imageSelect.popup.isOpen()) {
            imageSelect.loadImages();
        }
    }
    // scroll on popup may have to load images
    this.popup.contentDiv.onscroll = loadImagesForOpenPopup;

    window.addEventListener("resize", loadImagesForOpenPopup, false);

    this.removeWindowEventListener = function() {
        window.removeEventListener("resize", loadImagesForOpenPopup, false);
    };

    this.popup.mainDiv.onmouseenter = function() {
        imageSelect.popup.mainDiv.focus(); // to be able to use mousewheel
    };

    // arrowkeys on popup
    this.popup.mainDiv.onkeydown = function(event) {
        let key = event.key;
        let index = imageSelect.getIndex();
        const buttonsPerRow = imageSelect.design.popupImagesPerRow;
        if (key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            if (index + buttonsPerRow < imageSelect.popupImageButtons.length) {
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
            if ((index % buttonsPerRow < buttonsPerRow - 1) && (index < imageSelect.popupImageButtons.length - 1)) {
                imageSelect.select.changeIndex(1);
            }
        } else if (key === "ArrowLeft") {
            event.preventDefault();
            event.stopPropagation();
            if (index % buttonsPerRow > 0) {
                imageSelect.select.changeIndex(-1);
            }
        }
        return false;
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

ImageSelect.defaultDesign = {
    // loading user images
    acceptUserImages: true,
    addImageButtonText: "add images",
    dropToPopupText: "Drop images here!",
    // dimensions for the gui and popup
    spaceWidth: 5,
    buttonFontSize: 14,
    // dimensions for the image icon in the gui
    guiImageWidth: 60,
    guiImageHeight: 60,
    guiImageBorderWidth: 2,
    guiImageBorderColor: "#bbbbbb",
    // for the image buttons
    imageButtonWidth: 100,
    imageButtonHeight: 100,
    imageButtonTotalWidth: 120,
    imageButtonTotalHeight: 120,
    imageButtonBorderWidth: 3,
    imageButtonBorderWidthSelected: 6,
    imageButtonBorderColor: "#888888",
    imageButtonBorderColorNoIcon: "#ff6666",
    // for the popup, specific
    popupImagesPerRow: 2,
    // popupInnerwidth: calculated from other data
    // popupPadding: calculated from other data
    popupFontFamily: "FontAwesome, FreeSans, sans-serif",
    popupFontSize: 14,
    popupBackgroundColor: "#aaaaaa",
    popupBorderWidth: 3,
    popupBorderColor: "#444444",
    popupBorderRadius: 0,
    popupShadowWidth: 0,
    popupShadowBlur: 0,
    popupZIndex: 20,
    popupPosition: "bottomRight",
    popupHorizontalShift: 0
};

/**
 * update Poipup design defaults, using data of another object with the same key 
 * @method ImageSelect.updateDefaultDesign
 * @param {Object} newValues
 */
ImageSelect.updateDefaultDesign = function(newValues) {
    guiUtils.updateValues(ImageSelect.defaultDesign, newValues);
};

// default icons:
// missing icon is a red image (data URL for red pixel)
ImageSelect.missingIconURL = "data:image/gif;base64,R0lGODlhAQABAPABAP8SAAAAACH5BAAAAAAAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAABAAEAAAICRAEAOw==";
// delayed loading (data url for grey pixel)
ImageSelect.notLoadedURL = "data:image/gif;base64,R0lGODlhAQABAPABAJSUlAAAACH5BAAAAAAAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAABAAEAAAICRAEAOw==";

/**
 * load true (icon) images, only if visible in the popup
 * @method ImageSelect#loadImages
 */
ImageSelect.prototype.loadImages = function() {
    const length = this.popupImageButtons.length;
    const contentHeight = this.popup.contentDiv.offsetHeight;
    const contentScroll = this.popup.contentDiv.scrollTop;
    const imageHeight = this.popupImageButtons[0].element.offsetHeight;
    for (var i = 0; i < length; i++) {
        const totalOffset = this.popupImageButtons[i].element.offsetTop - contentScroll;
        // partially visible: "upper" border of image above zero (lower border of content)
        //                    AND "lower" border of image below "upper" border of content
        if ((totalOffset + imageHeight > 0) && (totalOffset < contentHeight)) {
            this.popupImageButtons[i].setImageURL(this.iconURLs[i]);
        }
    }
};

/**
 * make that a given image in the popup becomes visible, adjusts the scrollTop of the popup.contentDiv
 * only if the popup is open
 * #method ImageSelect#makeImageButtonVisible
 * @param {ImageButton} imageButton
 */
ImageSelect.prototype.makeImageButtonVisible = function(imageButton) {
    if (this.popup.isOpen()) {
        const contentHeight = this.popup.contentDiv.offsetHeight;
        const contentScroll = this.popup.contentDiv.scrollTop;
        const imageHeight = imageButton.element.offsetHeight;
        const totalOffset = imageButton.element.offsetTop - contentScroll;
        // check if not entirely visible
        //"lower" border is below lower border of popup  
        if (totalOffset < 0) {
            this.popup.contentDiv.scrollTop = imageButton.element.offsetTop - 2 * this.design.popupPadding;
        }
        // higher border is above upper border of popup
        else if (totalOffset + imageHeight > contentHeight) {
            this.popup.contentDiv.scrollTop = imageButton.element.offsetTop + imageHeight - contentHeight + this.design.popupPadding;
        }
    }
};

/**
 * start of interaction:  
 * open popup, make choosen image visible, load images instead of placeholders, call the onInteraction function
 * @method ImageSelect#interaction
 */
ImageSelect.prototype.interaction = function() {
    this.popup.open();
    const index = this.getIndex(); // in case that parameter is out of range
    if (index >= 0) {
        this.makeImageButtonVisible(this.popupImageButtons[index]);
    }
    this.loadImages();
    this.onInteraction();
};

/**
 * close the popup
 * @method ImageSelect#closePopup
 */
ImageSelect.prototype.closePopup = function() {
    this.popup.close();
};

// loading icons/choices

/**
 * clear (delete) all choices
 * @method ImageSelect#clearChoices
 */
ImageSelect.prototype.clearChoices = function() {
    this.select.clear();
    this.iconURLs.length = 0;
    this.values.length = 0;
    this.popupImageButtons.forEach(button => button.destroy());
    this.popupImageButtons.length = 0;
};

/**
 * adds choices, no varargs
 */
ImageSelect.prototype.add = function(choices) {
    // an array: add its components, arrays of arrays possible, for whatever reason
    if (Array.isArray(choices)) {
        choices.forEach(choice => this.add(choice));
    } else {
        // an object with many choices (key as name of option/ value for the key as image url)
        // it does not have both "name" and "value" as keys
        const keys = Object.keys(choices);
        if ((typeof choices.name === "undefined") || (typeof choices.value === "undefined")) {
            // backwards compatibility, simpler setup
            const choice = {};
            const imageSelect = this;
            keys.forEach(function(key) {
                choice.name = key;
                choice.icon = choices[key];
                choice.value = choices[key];
                imageSelect.add(choice);
            });
        } else if (this.findIndex(choices.value) < 0) {
            // adding a single option, its value does not yet exist as an option
            // we do not know if we have a valid icon
            this.select.addOptions(choices.name);
            // trying to make it as threadsafe as possible
            const index = this.values.length;
            this.values[index] = choices.value;
            // assume worst case: no icon, no image
            const button = new ImageButton(ImageSelect.missingIconURL, this.popup.contentDiv, this.design);
            this.popupImageButtons[index] = button;
            const imageSelect = this;
            button.onClick = function() {
                if (imageSelect.getIndex() !== index) {
                    imageSelect.setIndex(index);
                    imageSelect.onChange();
                }
            };
            // do we have an icon?
            if (guiUtils.isGoodImageFile(choices.icon)) {
                // all is well, we have an icon (assuming this is a picture url or dataURL)
                this.iconURLs[index] = choices.icon;
                button.setImageURL(ImageSelect.notLoadedURL); // delayed loading
                button.setBorderColor(this.design.imageButtonBorderColor);
            } else if (guiUtils.isGoodImageFile(choices.value)) {
                // instead of the icon can use the value image ( if the value is an URL of a jpg,svg or png file)
                this.iconURLs[index] = choices.value;
                button.setImageURL(ImageSelect.notLoadedURL);
                button.setBorderColor(this.design.imageButtonBorderColorNoIcon);
            } else {
                // no icon
                this.iconURLs[index] = ImageSelect.missingIconURL;
                button.setImageURL(ImageSelect.missingIconURL);
                button.setBorderColor(this.design.imageButtonBorderColorNoIcon);
            }
        }
    }
};

/**
 * add choices, this one does multiple arguments
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

/* 
 * doing the image: load file as a dataURL
 * test if it is really an image
 * add as choice object {name: file name without extension, icon: dataURL of file, image: dataURL of file}
 * do this with overhead and threadsafe (?), loading multiple images results in concurrent threads
 */
ImageSelect.prototype.addUserImage = function(file) {
    if (guiUtils.isGoodImageFile(file.name)) {
        const fileReader = new FileReader();
        const imageSelect = this;
        fileReader.onload = function() {
            // fileReader.result is the dataURL
            // loading images  is trivial
            // loading presets???
            // for selection: file name without extension
            const choice = {};
            choice.name = file.name.split(".")[0];
            choice.icon = fileReader.result;
            choice.value = fileReader.result;
            imageSelect.add(choice);
            // make the loaded image visible, do not change selection
            // we do not make an onChange event, as multiple images may have been loaded
            const index = imageSelect.findIndex(fileReader.result);
            if (index >= 0) {
                imageSelect.makeImageButtonVisible(imageSelect.popupImageButtons[index]);
                imageSelect.loadImages();
            }
        };

        fileReader.onerror = function() {
            console.log("*** readImage dataURL - fileReader fails " + file.name);
        };

        fileReader.readAsDataURL(file);
    }
};

/**
 *  update the icon image, and more
 * @method ImageSelect#update
 */
ImageSelect.prototype.update = function() {
    const index = this.getIndex(); // in case that parameter is out of range
    this.guiImage.src = this.iconURLs[index];
    this.popupImageButtons.forEach(button => button.setBorderWidth(this.design.imageButtonBorderWidth));
    if (index >= 0) {
        const choosenButton = this.popupImageButtons[index];
        choosenButton.setBorderWidth(this.design.imageButtonBorderWidthSelected);
        this.makeImageButtonVisible(choosenButton);
    }
};

// reading and setting choices

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
 * find the index to a given value
 * @method ImageSelect#findIndex
 * @param {whatever} value
 * @return index to first occurence of the value, -1 if not found
 */
ImageSelect.prototype.findIndex = function(value) {
    return this.values.indexOf(value);
};

/**
 * set the value and update display
 * does not call the onChange callback
 * if value not found: adds value to select if it is a good image
 * @method ImageSelect#setValue
 * @param {whatever} value
 */
ImageSelect.prototype.setValue = function(value) {
    const index = this.findIndex(value);
    if (index >= 0) {
        this.setIndex(index);
        this.makeImageButtonVisible();
    } else if (guiUtils.isGoodImageFile(value)) {
        const choice = {};
        choice.name = "user image";
        choice.icon = value;
        choice.value = value;
        this.add(choice);
        this.setValue(value);
    }
};

/*
 * destroy the image select (including popup and choices)
 * @method ImageSelect#destroy
 */
ImageSelect.prototype.destroy = function() {
    this.clearChoices();
    if (this.design.acceptUserImages) {
        this.userInput.destroy();
        this.popup.mainDiv.ondragover = null;
        this.popup.mainDiv.ondrop = null;
    }
    this.popup.mainDiv.onkeydown = null;
    this.popup.contentDiv.onscroll = null;
    this.popup.destroy();
    this.select.destroy();
    this.space.remove();
    this.guiImage.onmousedown = null;
    this.guiImage.onwheel = null;
    this.guiImage.remove();
    this.removeWindowEventListener();
    this.onChange = null;
    this.onInteraction = null;
};
