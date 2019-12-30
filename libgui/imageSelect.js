/**
 * a select input with icons (only the select thing, make more complicated layout outside)
 * each choice has a name, an icon and a value
 * the value may be an URL for an image, a preset, ...
 * if enabled, the user can add his own images
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 * @param {...object} newDesign - modifying the default design
 */

import {
    guiUtils,
    ImageButton,
    Button,
    Select,
    Popup
} from "./modules.js";

export function ImageSelect(parent, newDesign) {
    const design = {};
    this.design = design;
    Object.assign(design, ImageSelect.defaultDesign);
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
    // the popup width should be large enough for image buttons
    design.popupInnerWidth = design.imageButtonTotalWidth * design.popupImagesPerRow;
    design.popupPadding = 0.5 * (design.imageButtonTotalWidth - design.imageButtonWidth);
    this.popup = new Popup(design);
    // make that the popup can get keyboard events
    this.popup.mainDiv.setAttribute("tabindex", "-1");
    this.popup.addCloseButton();
    this.popup.close();
    // the select thing
    this.select = new Select(parent);
    this.select.setFontSize(design.buttonFontSize);

    // the actions
    const imageSelect = this;

    // events to make appear the image chooser popup:
    // mousedown on select or icon image
    // onChange on select or mouse wheel on icon image 
    // (as all of them change choice)

    this.select.onInteraction = function() {
        imageSelect.interaction();
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

/**
 * create an image for the gui that shows the current selection
 * shows the currently selected image (if there is a selection)
 * @method ImageSelect#createGuiImage
 * @param {HTML element} parent
 */
ImageSelect.prototype.createGuiImage = function(parent) {
    const design = this.design;
    this.guiImage = document.createElement("img");
    guiUtils.style(this.guiImage)
        .attribute("importance", "high")
        .verticalAlign("middle")
        .cursor("pointer")
        .height(design.guiImageHeight + "px")
        .width(design.guiImageWidth + "px")
        .border("solid")
        .borderStyle("inset")
        .borderColor(design.guiImageBorderColor)
        .borderWidth(design.guiImageBorderWidth + "px")
        .objectFit("contain")
        .objectPosition("center center")
        .parent(parent);
    const index = this.getIndex(); // in case that parameter is out of range
    if (index >= 0) {
        this.guiImage.src = this.iconURLs[index];
    }

    const imageSelect = this;

    this.guiImage.onmousedown = function() {
        imageSelect.select.element.focus(); // makes that keyboard events (arrows) go to the select ui element, not elsewhere
        imageSelect.interaction();
        return false;
    };

    // mousewheel on icon
    this.guiImage.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY > 0) {
            imageSelect.select.changeIndex(1);
        } else {
            imageSelect.select.changeIndex(-1);
        }
        imageSelect.select.element.focus();
        imageSelect.interaction();
        return false;
    };
};



ImageSelect.defaultDesign = {
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
    if (this.guiImage) {
        this.guiImage.src = null;
    }
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
 * make that user images are accepted
 * creates a button to add user images and drag and drop to the popup
 * @method ImageSelect#acceptUserImages
 * @param {htmlElement} parent
 */

// texts for the button and the popup
ImageSelect.addImageButtonText = "add images";
ImageSelect.addImagePopupText = "drop images here!";

/**
 * make an add image button for opening user images
 * its standard methods may have to be changed for structured image select
 * it is related to the ImageSelect, where the user images go to
 * does not add the button to this, it may belong to some higher ui element group (?)
 * @method ImageSelect#makeAddImageButton
 * @param {htmlElement} parent
 * @return Button
 */
ImageSelect.prototype.makeAddImageButton = function(parent) {
    const button = new Button(ImageSelect.addImageButtonText, parent);
    button.asFileInput("image/*");
    button.fileInput.setAttribute("multiple", "true");
    button.setFontSize(this.design.buttonFontSize);

    // adding events
    // maybe needs to be overwritten
    const imageSelect = this;

    button.onInteraction = function() {
        imageSelect.interaction();
    };

    button.onFileInput = function(files) {
        // files is NOT an array
        for (let i = 0; i < files.length; i++) {
            imageSelect.addUserImage(files[i]);
        }
    };

    return button;
};

/**
 * add message and drag and drop to the popup
 * good for simple image select
 * eventually rewrite methods (ondrop)
 * @method ImageSelect#addDragAndDrop
 */
ImageSelect.prototype.addDragAndDrop = function() {
    // write that we can drop images into the popup
    const messageDiv = document.createElement("div");
    messageDiv.innerText = ImageSelect.addImagePopupText;
    guiUtils.fontSize(this.design.buttonFontSize + "px", messageDiv)
        .paddingBottom(this.popup.design.popupPadding + "px");
    this.popup.controlDiv.insertBefore(messageDiv, this.popup.closeButton.element);

    // adding events
    // maybe needs to be overwritten
    const imageSelect = this;

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
};

/**
 * make that the user can open his own images
 * mainly for simple image select
 * ImageSelect#acceptUserImages
 * @param {html element} parent
 */
ImageSelect.prototype.acceptUserImages = function(parent) {
    // the user image input button
    this.userInput = this.makeAddImageButton(parent);
    this.addDragAndDrop();
};

/**
 *  update the icon image, and more
 * @method ImageSelect#update
 */
ImageSelect.prototype.update = function() {
    this.popupImageButtons.forEach(button => button.setBorderWidth(this.design.imageButtonBorderWidth));
    const index = this.getIndex(); // in case that parameter is out of range
    if (index >= 0) {
        const choosenButton = this.popupImageButtons[index];
        choosenButton.setBorderWidth(this.design.imageButtonBorderWidthSelected);
        this.makeImageButtonVisible(choosenButton);
        if (this.guiImage) {
            this.guiImage.src = this.iconURLs[index];
        }
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
 * sets only to already existing values
 * @method ImageSelect#setValue
 * @param {whatever} value
 * @return integer index, -1 if value not found
 */
ImageSelect.prototype.setValue = function(value) {
    const index = this.findIndex(value);
    if (index >= 0) {
        this.setIndex(index);
        this.update();
    }
    return index;
};



/**
 * open the image select
 * @method ImageSelect#open
 */
ImageSelect.prototype.open = function() {
    this.select.open();
    if (this.userInput) {
        this.userInput.open();
    }
    guiUtils.displayInlineBlock(this.guiImage);
};

/**
 * close the image select
 * @method ImageSelect#close
 */
ImageSelect.prototype.close = function() {
    this.select.close();
    if (this.userInput) {
        this.userInput.close();
    }
    guiUtils.displayNone(this.guiImage);
};

/*
 * destroy the image select (including popup and choices)
 * @method ImageSelect#destroy
 */
ImageSelect.prototype.destroy = function() {
    this.clearChoices();
    if (this.userInput) {
        this.userInput.destroy();
        this.popup.mainDiv.ondragover = null;
        this.popup.mainDiv.ondrop = null;
    }
    this.popup.mainDiv.onkeydown = null;
    this.popup.contentDiv.onscroll = null;
    this.popup.destroy();
    this.select.destroy();
    if (this.guiImage) {
        this.guiImage.onmousedown = null;
        this.guiImage.onwheel = null;
        this.guiImage.remove();
    }
    this.removeWindowEventListener();
    this.onChange = null;
    this.onInteraction = null;
};
