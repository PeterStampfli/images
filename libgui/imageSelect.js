/* jshint esversion: 6 */

/**
 * a select input with icons (only the select thing, make more complicated layout outside)
 * each option has a name, an icon and a value
 * the value may be an URL for an image, a preset, ...
 * if enabled, the user can add his own images
 * @constructor ImageSelect
 * @param {DOM element} parent, an html element, best "div"
 * @param {...object} newDesign - optional, modifying the default design
 */

import {
    guiUtils,
    ImageButton,
    Button,
    Select,
    Popup
} from "./modules.js";

export function ImageSelect(parent, newDesign) {
    this.parent = parent;
    this.active = true;
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
    this.names = [];
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
    // (as all of them change the choosen image)

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
 * set if button is active
 * @method ImageSelect#setActive
 * @param {boolean} on
 */
ImageSelect.prototype.setActive = function(on) {
    if (this.active !== on) {
        this.active = on;
        if (!on) {
            this.closePopup();
        }
        this.select.setActive(on);
        if (on) {
            this.guiImage.style.cursor = 'pointer';
        } else {
            this.guiImage.style.cursor = 'default';
        }
        if (this.userInput) {
            this.userInput.setActive(on);
        }
    }
};

/**
 * create an image for the gui that shows the current selection
 * shows the currently selected image (if there is a selection)
 * create in separate call depending on layout (external)
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
    // setting the image if it is created late ???
    if (index >= 0) {
        const popupBackgroundColor = this.popupImageButtons[index].image.style.backgroundColor;
        if (popupBackgroundColor !== "") {
            this.guiImage.style.backgroundColor = popupBackgroundColor;
            this.guiImage.onload = function() {};
        } else {
            const guiImage = this.guiImage;
            this.guiImage.onload = function() {
                guiImage.style.backgroundColor = ImageButton.determineBackgroundColor(guiImage);
            };
        }
        this.guiImage.src = this.iconURLs[index];
    }

    const imageSelect = this;

    this.guiImage.onmousedown = function() {
        if (imageSelect.active) {
            imageSelect.select.element.focus(); // makes that keyboard events (arrows) go to the select ui element, not elsewhere
            imageSelect.interaction();
            return false;
        }
    };

    // no mousewheel action on icon, interferes with ui scrolling

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
    popupZIndex: 18, // smaller (between) than hint popup
    popupPosition: "topRight",
    popupHorizontalShift: 0
};

/**
 * update design defaults, using data of another object with the same key 
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
    const imageHeight = this.popupImageButtons[0].image.offsetHeight;
    for (var i = 0; i < length; i++) {
        const totalOffset = this.popupImageButtons[i].image.offsetTop - contentScroll;
        // partially visible: "upper" border of image above zero (lower border of content)
        //                    AND "lower" border of image below "upper" border of content
        if ((totalOffset + imageHeight > 0) && (totalOffset < contentHeight)) {
            this.popupImageButtons[i].setImage(this.iconURLs[i]);
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
        const imageHeight = imageButton.image.offsetHeight;
        const totalOffset = imageButton.image.offsetTop - contentScroll;
        // check if not entirely visible
        //"lower" border is below lower border of popup  
        if (totalOffset < 0) {
            this.popup.contentDiv.scrollTop = imageButton.image.offsetTop - 2 * this.design.popupPadding;
        }
        // higher border is above upper border of popup
        else if (totalOffset + imageHeight > contentHeight) {
            this.popup.contentDiv.scrollTop = imageButton.image.offsetTop + imageHeight - contentHeight + this.design.popupPadding;
        }
    }
};

/**
 * start of interaction:  
 * open popup, make choosen image visible, load images instead of placeholders, call the onInteraction function
 * @method ImageSelect#interaction
 */
ImageSelect.prototype.interaction = function() {
    if (this.active) {
        this.popup.open();
        const topPosition = guiUtils.topPosition(this.parent);
        this.popup.setCenterPosition(topPosition + this.parent.offsetHeight / 2);
        const index = this.getIndex(); // in case that parameter is out of range
        if (index >= 0) {
            this.makeImageButtonVisible(this.popupImageButtons[index]);
        }
        this.loadImages();
        this.onInteraction();
    }
};

/**
 * close the popup
 * @method ImageSelect#closePopup
 */
ImageSelect.prototype.closePopup = function() {
    this.popup.close();
};

// loading icons/options

/**
 * clear (delete) all options
 * @method ImageSelect#clearOptions
 */
ImageSelect.prototype.clearOptions = function() {
    this.select.clear();
    this.iconURLs.length = 0;
    this.values.length = 0;
    this.names.length = 0;
    if (this.guiImage) {
        this.guiImage.src = "";
    }
    this.popupImageButtons.forEach(button => button.destroy());
    this.popupImageButtons.length = 0;
};

/**
 * add options, each option is an object with a name, icon and value field
 * option={name: "name as string", icon: "URL for icon image", value: whatever}
 * the value can be an image URL, a preset (URL of json file)
 * You can put options together in an array
 * Second possibility compatible with datGui:
 * object { key: "imageURL string", ...}, where there is no key=="name" or key=="value" (means that object.name=="undefined", object.value==undefined)
 * makes options with {name: key, icon: imageURL, value: imageURL}
 * @method ImageSelect#addOptions
 * @param {object|array} options
 */
ImageSelect.prototype.addOptions = function(options) {
    // an array: its components are options, arrays of arrays possible, for whatever reason
    // do each option
    if (Array.isArray(options)) {
        options.forEach(option => this.addOptions(option));
    } else {
        // an object with many options (key as name of option/ value for the key as image url)
        // it does not have both "name" and "value" as keys
        // for backwards compatibility: Look if we have a datGui-style of image selection
        // it is an object with key/value pairs. Key is the name of the option and the value a image file path string
        // it has many different image choices
        if ((typeof options.name === "undefined") || (typeof options.value === "undefined")) {
            const option = {};
            const imageSelect = this;
            // modify the option object for each option in the object and add its data to the selection
            const keys = Object.keys(options);
            keys.forEach(function(key) {
                option.name = key;
                option.icon = options[key];
                option.value = options[key];
                imageSelect.addOptions(option);
            });
        } else {
            // adding a single option, its value does not yet exist as an option
            // we do not know if we have a valid icon
            this.select.addOptions(options.name);
            // trying to make it as threadsafe as possible
            this.names.push(options.name);
            this.values.push(options.value);
            // assume that there is an image, delayed loading -> placeholder gif
            const button = new ImageButton(this.popup.contentDiv, this.design);
            this.popupImageButtons.push(button);
            // make that the image buttons change the selected image if it is different
            const index = this.values.length - 1;
            const imageSelect = this;
            button.onClick = function() {
                if (imageSelect.getIndex() !== index) {
                    imageSelect.setIndex(index);
                    imageSelect.onChange();
                } else {
                    imageSelect.onInteraction();
                }
            };
            // do we have an icon?
            if (guiUtils.isGoodImageFile(options.icon)) {
                // all is well, we have an icon (assuming this is a picture url or dataURL)
                this.iconURLs[index] = options.icon;
                button.setPlaceholder(ImageSelect.notLoadedURL);
                button.setBorderColor(this.design.imageButtonBorderColor);
            } else if (guiUtils.isGoodImageFile(options.value)) {
                // instead of the icon can use the value image ( if the value is an URL of a jpg,svg or png file)
                this.iconURLs[index] = options.value;
                button.setPlaceholder(ImageSelect.notLoadedURL);
                button.setBorderColor(this.design.imageButtonBorderColorNoIcon);
            } else {
                // no icon
                this.iconURLs[index] = ImageSelect.missingIconURL;
                button.setPlaceholder(ImageSelect.missingIconURL);
                button.setBorderColor(this.design.imageButtonBorderColorNoIcon);
            }
        }
    }
    this.popup.resize();
};

/* 
 * doing the image: load file as a dataURL
 * test if it is really an image
 * add as option object {name: file name without extension, icon: dataURL of file, image: dataURL of file}
 * do this with overhead and threadsafe (?), loading multiple images results in concurrent threads
 * param file is the file object
 * param selectThis: if true, then make that this file is selected, and everything updated
 */
ImageSelect.prototype.addUserImage = function(file, selectThis = false) {
    if (guiUtils.isGoodImageFile(file.name)) {
        const fileReader = new FileReader();
        const imageSelect = this;
        fileReader.onload = function() {
            // fileReader.result is the dataURL
            // loading images  is trivial
            // for selection: show file name without extension
            const option = {};
            option.name = file.name.split(".")[0];
            option.icon = fileReader.result;
            option.value = fileReader.result;
            imageSelect.addOptions(option);
            // make the loaded image potentially visible
            // change selection if selectThis
            const index = imageSelect.findIndex(fileReader.result);
            if (index >= 0) {
                imageSelect.makeImageButtonVisible(imageSelect.popupImageButtons[index]);
                imageSelect.loadImages();
                if (selectThis) {
                    imageSelect.setValue(fileReader.result);
                    imageSelect.update();
                    imageSelect.onChange();
                }
            }
        };

        fileReader.onerror = function() {
            console.log("*** readImage dataURL - fileReader fails " + file.name);
        };

        fileReader.readAsDataURL(file);
    }
};

const fileReader = new FileReader();

/**
 * read image files and add to image choices
 * @method ImageSelect#readFiles
 * @param {object} files
 */
ImageSelect.prototype.readFiles = function(files) {
    let currentFileNumber = -1;
    let selectionChoiceUpdated = false; // for selecting the first image in files
    const imageSelect = this;

    // load next file only if it is an image file and not yet in the options
    // if in options and selection not updated, then set selected value
    function loadNextFile() {
        var file;
        currentFileNumber += 1; // advance to next file
        while (currentFileNumber < files.length) {
            file = files[currentFileNumber];
            const fileNameParts = file.name.split('.');
            // use only image files (for window drag and drop)
            if (guiUtils.isGoodImageFile(file.name)) {
                const name = fileNameParts[0]; // filename without extension, use as name of selection 
                // load only once 
                if (imageSelect.findIndex(name) < 0) {
                    fileReader.readAsDataURL(file);
                    return;
                } else if (!selectionChoiceUpdated) {
                    // set selection to the first previously loaded preset
                    imageSelect.setValue(name);
                    imageSelect.onChange();
                    selectionChoiceUpdated = true;
                }
            }
            // nothing loaded, look at next file
            currentFileNumber += 1;
        }
    }

    fileReader.onload = function() {
        // we know that file is a good image file and it is not yet an option
        const file = files[currentFileNumber];
        const fileNameParts = file.name.split('.');
        const name = fileNameParts[0]; // filename without extension, use as name of selection  
        // load image from file reader
        // fileReader.result is the dataURL for the image
        const option = {};
        option.name = name;
        option.icon = fileReader.result;
        option.value = fileReader.result;
        imageSelect.addOptions(option);
        // make the loaded image potentially visible
        const index = imageSelect.findIndex(fileReader.result);
        if (index >= 0) {
            imageSelect.makeImageButtonVisible(imageSelect.popupImageButtons[index]);
            imageSelect.loadImages();
            // set selection to the first loaded image
            if (!selectionChoiceUpdated) {
                imageSelect.setValue(name);
                imageSelect.onChange();
                selectionChoiceUpdated = true;
            }
        }
        loadNextFile();
    };

    fileReader.onerror = function() {
        loadNextFile();
    };

    loadNextFile();
};

// texts for the button and the popup for loading user images
ImageSelect.addImageButtonText = "add images";

/**
 * make an add image button for opening user images
 * its standard methods may have to be changed for structured image select
 * it is related to the ImageSelect, where the user images go to
 * does not add the button to this, it may belong to some higher ui element group (?)
 * make that first loaded image will be selected
 * @method ImageSelect#makeAddImageButton
 * @param {htmlElement} parent
 * @return Button
 */
ImageSelect.prototype.makeAddImageButton = function(parent) {
    const button = new Button(ImageSelect.addImageButtonText, parent);
    // this uses an invisible button.fileInput input element, clicking on this button here makes a click on the input
    button.asFileInput("image/*");
    button.fileInput.setAttribute("multiple", "true");
    button.setFontSize(this.design.buttonFontSize);

    // adding events
    const imageSelect = this;

    button.onInteraction = function() {
        imageSelect.interaction();
    };

    // this is the callback to be called via the file input element after all files have been choosen by the user
    button.onFileInput = function(files) {
        imageSelect.readFiles(files);
    };

    return button;
};

/**
 * add message and drag and drop to the popup
 * good for simple image select
 * eventually rewrite methods (ondrop)
 * make that first image will be selected
 * @method ImageSelect#addDragAndDrop
 */
ImageSelect.prototype.addDragAndDrop = function() {
    const imageSelect = this;

    // we need dragover to prevent default loading of image, even if dragover does nothing else
    this.popup.mainDiv.ondragover = function(event) {
        event.preventDefault();
    };

    this.popup.mainDiv.ondrop = function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        imageSelect.readFiles(files);
    };
};

/**
 * add drag and drop to the window
 * remove it from the popup, in case it is there
 * @method ImageSelect#addDragAndDropWindow
 */
ImageSelect.prototype.addDragAndDropWindow = function() {
    const imageSelect = this;
    this.popup.mainDiv.ondragover = function(event) {};
    this.popup.mainDiv.ondrop = function(event) {};
    window.ondragover = function(event) {
        event.preventDefault();
    };
    window.addEventListener('drop', function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        imageSelect.readFiles(files);
    }, false);
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
            const popupBackgroundColor = this.popupImageButtons[index].image.style.backgroundColor;
            if (popupBackgroundColor !== "") {
                this.guiImage.style.backgroundColor = popupBackgroundColor;
                this.guiImage.onload = function() {};
            } else {
                const guiImage = this.guiImage;
                this.guiImage.onload = function() {
                    guiImage.style.backgroundColor = ImageButton.determineBackgroundColor(guiImage);
                };
            }
            this.guiImage.src = this.iconURLs[index];
        }
    }
};

// reading and setting options

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
 * set the choice
 * searches the values and then the labels, if not found makes error message
 * does not call the onChange callback
 * @method ImageSelect#setValue
 * @param {whatever} value
 */
ImageSelect.prototype.setValue = function(value) {
    const index = this.findIndex(value);
    if (index >= 0) {
        this.setIndex(index);
    } else {
        console.error("Image controller, setValue: argument not found in options");
        console.log('argument value is ' + value + ' of type "' + (typeof value) + '"');
    }
};

/*
 * find the image name from an URL-string or a src string
 */
function imageName(imageSrc) {
    const imageSrcPieces = imageSrc.split('/');
    return imageSrcPieces[imageSrcPieces.length - 1];
}

/**
 * do something with the selected image
 * loads the selected image and uses it as argument for a callback function
 * the image is also at this.image, but beware of image loading time delay
 * @method ImageSelect.useImage
 * @param {function} callback - function(image), image is a html image object
 */
ImageSelect.prototype.useImage = function(callback) {
    const selectedImageSrc = this.getValue();
    if (guiUtils.isGoodImageFile(selectedImageSrc)) {
        if (!guiUtils.isDefined(this.image)) {
            this.image = document.createElement("img");
            this.image.style.display = 'none';
            document.body.appendChild(this.image);
        }
        if (imageName(this.image.src) !== imageName(selectedImageSrc)) {
            const thisImage = this.image;
            this.image.onload = function() {
                callback(thisImage);
            };
            this.image.src = selectedImageSrc;
        } else {
            callback(this.image);
        }
    } else {
        console.error('ImageSelect.useImage: value "' + selectedImageSrc + '" is not a good image file name');
    }
};

/**
 * find the index to a given value
 * searches first the selection values, then the labels
 * @method ImageSelect#findIndex
 * @param {whatever} value
 * @return number, index to first occurence of the value, -1 if not found
 */
ImageSelect.prototype.findIndex = function(value) {
    let index = this.values.indexOf(value);
    if (index < 0) {
        index = this.names.indexOf(value);
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
 * destroy the image select (including popup and options)
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