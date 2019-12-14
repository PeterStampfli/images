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
    this.select.setFontSize(this.design.guiFontSize);
    // then a space (as a span ?)
    // accessible from outside top be able to change style
    this.space = document.createElement("span");
    this.space.style.width = this.design.guiSpaceWidth + "px";
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
    // here comes the popup
    // the popup width that should be available for image buttons
    this.design.popupInnerWidth = this.design.popupImageTotalWidth * this.design.popupImagesPerRow;
    this.design.popupPadding = 0.5 * (this.design.popupImageTotalWidth - this.design.popupImageWidth);
    this.popup = new Popup(this.design);
    // make that the popup can get keyboard events
    this.popup.mainDiv.setAttribute("tabindex", "-1");
    this.popup.addCloseButton();
    this.popup.close();
    // the data
    this.iconURLs = [];
    this.values = [];
    this.popupImages = [];

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
            if (index + buttonsPerRow < imageSelect.popupImages.length) {
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
            if ((index % buttonsPerRow < buttonsPerRow - 1) && (index < imageSelect.popupImages.length - 1)) {
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

// default design

ImageSelect.defaultDesign = {
    // choosing images: the value is an image that can serve as icon, if there is no icon value
    // ok, this is not really a design parameter, make an exception
    choosingImages: true,
    // for the static gui, not the popup
    guiSpaceWidth: 5,
    guiFontSize: 14,
    guiImageWidth: 40,
    guiImageHeight: 40,
    guiImageBorderWidth: 2,
    guiImageBorderColor: "#bbbbbb",
    // for the popup, specific
    popupImagesPerRow: 2,
    popupImageWidth: 100,
    popupImageHeight: 100,
    popupImageTotalWidth: 120,
    popupImageTotalHeight: 120,
    popupImageBorderWidth: 3,
    popupImageBorderWidthSelected: 6,
    popupImageBorderColor: "#888888",
    popupImageBorderColorNoIcon: "#ff6666",
    // for the popup, general
    // innerwidth and padding result from other data
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
ImageSelect.missingIconURL = "data:image/gif;base64,R0lGODlhAQABAPABAP8SAAAAACH5BAAAAAAAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAABAAEAAAICRAEAOw==";
// delayed loading (data url for grey pixel)
ImageSelect.notLoadedURL = "data:image/gif;base64,R0lGODlhAQABAPABAJSUlAAAACH5BAAAAAAAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAABAAEAAAICRAEAOw==";

/**
 * load true (icon) images, only if visible in the popup
 * @method ImageSelect#loadImages
 */
ImageSelect.prototype.loadImages = function() {
    const length = this.popupImages.length;
    const contentHeight = this.popup.contentDiv.offsetHeight;
    const contentScroll = this.popup.contentDiv.scrollTop;
    const imageHeight = this.popupImages[0].element.offsetHeight;
    for (var i = 0; i < length; i++) {
        const totalOffset = this.popupImages[i].element.offsetTop - contentScroll;
        // partially visible: "upper" border of image above zero (lower border of content)
        //                    AND "lower" border of image below "upper" border of content
        if ((totalOffset + imageHeight > 0) && (totalOffset < contentHeight)) {
            this.popupImages[i].setImageURL(this.iconURLs[i]);
        }
    }
};

/**
 * make that the choosen image lies in the popup, adjusts the scrollTop of the popup.contentDiv
 * #method ImageSelect#makeImageButtonVisible
 * @param {ImageButton} imageButton
 */
ImageSelect.prototype.makeImageButtonVisible = function(imageButton) {
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
        this.makeImageButtonVisible(this.popupImages[index]);
    }
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
    this.popupImages.forEach(button => button.destroy());
    this.popupImages.length = 0;
};

/*
 * function checks if a file name has a good image file extension
 */
const goodExtensions = ["jpg", "jpeg", "png", "svg", "bmp", "gif"];

function isGoodImageFile(fileName) {
    const namePieces = fileName.split(".");
    if (namePieces.length > 1) {
        const extension = namePieces[namePieces.length - 1].toLowerCase();
        const index = goodExtensions.indexOf(extension);
        return (index >= 0);
    } else {
        return false;
    }
}

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
            // adding a single option, no multiple values
            // we do not know if we have a valid icon
            this.select.addOptions(choices.name);
            // trying to make it as threadsafe as possible
            const index = this.values.length;
            this.values[index] = choices.value;
            // assume worst case: no icon, no image
            const button = new ImageButton(ImageSelect.missingIconURL, this.popup.contentDiv);
            button.setBorderColor(this.design.popupImageBorderColorNoIcon);
            this.popupImages[index] = button;
            const imageSelect = this;
            button.onClick = function() {
                if (imageSelect.getIndex() !== index) {
                    imageSelect.setIndex(index);
                    imageSelect.onChange();
                }
            };
            // do we have an icon?
            if (typeof choices.icon === "string") {
                // all is well, we have an icon (assuming this is a picture url or dataURL)
                this.iconURLs[index] = choices.icon;
                // delayed loading
                button.setImageURL(ImageSelect.notLoadedURL);
                button.setBorderColor(this.design.popupImageBorderColor);
            } else if ((this.design.choosingImages) && (typeof choices.value === "string")) {
                // instead of the icon can use the value image ( if the value is an URL of a jpg,svg or png file)
                if (isGoodImageFile(choices.value)) {
                    this.iconURLs[index] = choices.value;
                    button.setImageURL(ImageSelect.notLoadedURL);
                } else {
                    // no icon
                    this.iconURLs[index] = ImageSelect.missingIconURL;
                }
            } else {
                // no icon
                this.iconURLs[index] = ImageSelect.missingIconURL;
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
    // update the image button dimension according to the imageSelect design
    const design = this.design;
    const dimensions = {
        imageWidth: design.popupImageWidth,
        imageHeight: design.popupImageWidth,
        borderWidth: design.popupImageBorderWidth,
        totalWidth: design.popupImageTotalWidth,
        totalHeight: design.popupImageTotalHeight,
    };
    ImageButton.newDimensions(dimensions);
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
    if (isGoodImageFile(file.name)) {
        const choice = {};
        // for selection: file name without extension
        console.log("add choice-name " + file.name);
        choice.name = file.name.split(".")[0];
        console.log("add choice-name " + choice.name);


        const fileReader = new FileReader();
        fileReader.onload = function() {



            choice.icon = fileReader.result;
            choice.value = fileReader.result;
            console.log("success with " + file.name);
            console.log(choice.icon.substring(0, 20));
        };
        fileReader.onerror = function() {
            console.log("*** readImageFromFileBlob - fileReader fails " + file.name);
        };
        fileReader.readAsDataURL(file);


    }

};



/**
 * set up the possibility to add user side image files
 * as choice object {name: file name, icon: dataURL of file, image: dataURL of file}
 * @method ImageSelect#acceptUserImages
 */
ImageSelect.prototype.acceptUserImages = function() {

    // a space between button and icon
    // accessible from outside top be able to change style
    this.secondSpace = document.createElement("span");
    this.secondSpace.style.width = this.design.guiSpaceWidth + "px";
    this.secondSpace.style.display = "inline-block";
    this.parent.insertBefore(this.secondSpace, this.guiImage);
    // the user input button
    this.userInput = new Button("add images", document.body);
    this.userInput.asFileInput("image/*");
    this.userInput.fileInput.setAttribute("multiple", "true");
    this.userInput.setFontSize(this.design.guiFontSize);
    this.parent.insertBefore(this.userInput.element, this.secondSpace);

    const imageSelect = this;

    this.userInput.onInteraction = function() {
        imageSelect.interaction();
    };

    this.userInput.onFileInput = function(files) {
        console.log(files.length);
        for (let i = 0; i < files.length; i++) {
            imageSelect.addUserImage(files[i]);
        }
        imageSelect.interaction();
    };

    this.popup.mainDiv.ondragover = function(event) {

        event.preventDefault();
        console.log("dragover");
    };

    this.popup.mainDiv.ondrop = function(event) {

        event.preventDefault();
        console.log("dropp");
        // Use DataTransfer interface to access the file(s)
        /*          const length = event.dataTransfer.files.length;
                while (!imageFileFound && (i < length)) {
                    file = event.dataTransfer.files[i];
                    imageFileFound = isImageFile(file);
                    i++;
                }
*/
    };


};

/**
 *  update the icon image, and more
 * @method ImageSelect#update
 */
ImageSelect.prototype.update = function() {
    const index = this.getIndex(); // in case that parameter is out of range
    this.guiImage.src = this.iconURLs[index];
    this.popupImages.forEach(button => button.setBorderWidth(this.design.popupImageBorderWidth));
    if (index >= 0) {
        const choosenButton = this.popupImages[index];
        choosenButton.setBorderWidth(this.design.popupImageBorderWidthSelected);
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
 * @method ImageSelect#setValue
 * @param {whatever} value
 */
ImageSelect.prototype.setValue = function(value) {
    const index = this.findIndex(value);
    if (index >= 0) {
        this.setIndex(index);
    }
};

/*
 * destroy the image select (including popup and choices)
 * @method ImageSelect#destroy
 */
ImageSelect.prototype.destroy = function() {
    this.clearChoices();
    if (typeof this.userInput !== "undefined") {
        console.log("destroy user inputz");
        this.userInput.destroy();
        this.secondSpace.remove();
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
