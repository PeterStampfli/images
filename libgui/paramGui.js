/*
 * emulator of  https://github.com/dataarts/dat.gui
 * 
 */

/*
I've modified the numbers editor in dat.gui to make it react on mouse 
scroll wheel and "ArrowUp" and "ArrowDown" keys (keyboard).
The increment of value for each scroll changes the digit where the caret is.
*/

/**
 * this is the actual Gui for parameters
 * @class ParamGui
 */

/**
 * creating an empty div to show the controls
 * hiding and showing the controls
 * @creator ParamGui
 * @param {...Object} params - setup parameters as fields (key,value pairs) of objects, multiple objects possible
 */

/*
 * setup parameters:
 * As in dat.gui 
 * 
 * name - String - name of the gui/gui folder - default: ""
 * load - Object - saved state of the gui (JSON) ??? - default: null
 * parent - ParamGui instance - the gui this one is nested in - default: null (root)
 * autoPlace - boolean - placing the gui automatically?? - default: true
 * hideable - boolean - hide/show with keyboard ParamGui.hideCharacter press ("Tab") - default: true
 *                                              (should not be a printable character)
 * closed - boolean - start gui in closed state - default: false
 * closeOnTop - boolean - make a titlebar with show/close button - default: false
 */

import {
    guiUtils,
    ParamColor,
    ParamAngle,
    ParamController,
    ParamImageSelection,
    Button,
    InstantHelp,
    Logger
} from "./modules.js";

export function ParamGui(params) {
    // a list of all folders, controllers and other elements
    // must have a destroy method, an updateDisplayIfListening method
    this.elements = [];
    // styling
    var i;
    // copy default parameters, change later
    Object.assign(this, ParamGui.defaults);
    // default values for parameters
    this.name = "controls";
    this.load = null;
    this.parent = null;
    this.helpButton = null;
    this.autoPlace = true;
    this.hideable = true;
    this.closed = false;
    this.closeOnTop = true;
    // read/merge params object replacing defaults
    // applies only to the parameters above
    for (i = 0; i < arguments.length; i++) {
        guiUtils.updateValues(this, arguments[i]);
    }
    // now this.parent is set, if different from null
    // we now know if we are
    this.design = {};
    const design = this.design;
    // now load default design parameters into this design
    // for a root gui it is the ParamGui.defaultDesign (there is no parent)
    // for a folder it is the parent design
    if (this.isRoot()) {
        Object.assign(design, ParamGui.defaultDesign);
    } else {
        Object.assign(design, this.parent.design);
    }
    // update design parameters
    for (i = 0; i < arguments.length; i++) {
        guiUtils.updateValues(design, arguments[i]);
    }
    // update the popup parameters depending on the gui position
    if (design.horizontalPosition === "right") {
        design.popupPosition = "bottomRight";
    } else {
        design.popupPosition = "bottomLeft";
    }
    design.popupHorizontalShift = design.width + design.horizontalShift + design.borderWidth;
    // the ui elements go into their own div, the this.bodyDiv
    // append as child to this.domElement
    this.bodyDiv = document.createElement("div");
    this.bodyDiv.style.backgroundColor = design.backgroundColor;
    if (this.isRoot()) {
        // the root element has to generate a div as containing DOMElement
        // everything is in this div
        this.domElement = document.createElement("div");
        this.domElement.style.width = design.width + "px";
        this.domElement.style.fontFamily = design.fontFamily;
        // the border around everything
        this.domElement.style.borderWidth = design.borderWidth + "px";
        this.domElement.style.borderStyle = "solid";
        this.domElement.style.borderColor = design.borderColor;
        // put the gui onto collection and top of stack
        ParamGui.addRootGui(this);
        // add the title
        this.createTitle();
        // autoPlacing the root gui domElement relative to one of the four corners
        // and make the bodyDiv scrolling vertical, if needed
        this.domElement.appendChild(this.bodyDiv);
        if (this.autoPlace) {
            this.domElement.style.position = "fixed";
            this.domElement.style[design.verticalPosition] = design.verticalShift + "px";
            this.domElement.style[design.horizontalPosition] = design.horizontalShift + "px";
            // scroll in vertical direction: attention! overflowY="auto" makes that overflowX becomes "auto" too if it is "initial" or "visible"
            // be careful: the vertical scroll bar might hide things
            // take into account design.scrollBarWidth for auto wrapping lines
            this.bodyDiv.style.overflowY = "auto";
            this.bodyDiv.style.overflowX = "hidden";
            document.body.appendChild(this.domElement);
            this.resize();
        } else {
            document.body.appendChild(this.domElement);
        }
    } else {
        // folders have the parent bodyDiv as container
        this.domElement = this.parent.bodyDiv;
        // add the title
        this.createTitle();
        // the ui elements go into their own div, the this.bodyDiv
        // attach to dom after all changes
        this.bodyDiv = document.createElement("div");
        this.bodyDiv.style.backgroundColor = design.backgroundColor;
        // indent and left border only if there is a title and/or open/close buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            this.bodyDiv.style.borderLeft = "solid";
            this.bodyDiv.style.borderColor = design.titleBackgroundColor;
            this.bodyDiv.style.borderLeftWidth = design.levelIndent + "px";
        }
        this.domElement.appendChild(this.bodyDiv);
    }
    // close it initially? (has to be here, after creation of elements
    if (this.closeOnTop && this.closed) {
        this.close();
    }
}

/**
 * we might want to change design parameters for parts of a gui/folder
 * @method ParamGui#changeDesign
 * @param {...Object} design - design parameters as fields (key,value pairs) of objects, multiple objects possible
 * @return this
 */
ParamGui.prototype.changeDesign = function(design) {
    // update design parameters
    for (var i = 0; i < arguments.length; i++) {
        guiUtils.updateValues(this.design, arguments[i]);
    }
};

// add some defaults designs, especially styles
// styles, change the values of these fields if you do not like them
// do changes in your program
// position (at corners)
ParamGui.defaultDesign = {
    // controller for numbers
    //==========================================
    popupForNumberController: true,
    popupMinWidth: 0,
    indicatorColorLeft: "#dddddd",
    indicatorColorRight: "#f8f8f8",

    // image select, loading user images
    //===============================================
    preferNewImageselect: true,
    acceptUserImages: true,
    addImageButtonText: "add images",
    dropToPopupText: "Drop images here!",

    // overall appearance
    //------------------------------------------------------------
    // positioning, default top right corner
    // other corners are possible, as references
    verticalPosition: "top",
    horizontalPosition: "right",
    // shifting the position with respect to the corner
    verticalShift: 0,
    horizontalShift: 0,
    // width of the ui panel
    width: 400,
    //spacing from left border and between controls
    spaceWidth: 5,
    // vertical spacing
    paddingVertical: 4,
    // indentation witdh per folder level
    levelIndent: 10,
    // width of border around ui panel
    borderWidth: 3, // set to zero to make border disappear
    // color for the border of the ui panel
    borderColor: "#777777",
    // basic background color
    backgroundColor: "#eeeeee",
    // the same font(family) for everything ?!
    fontFamily: "FontAwesome, FreeSans, sans-serif",

    // style for paragraph
    //-------------------------------------------------
    // padding for paragraphs: free space at right (left: labelspacing)
    paragraphRightPadding: 10,
    // padding for paragraphs: free space at top (bottom: paddingVertical)
    paragraphTopPadding: 10,
    // textcolor for paragraphs
    paragraphColor: "#000000",
    // fontsize for paragraphs
    paragraphFontSize: 14,

    // style for gui-titles
    //---------------------------------------------------------
    // height for the title div
    titleHeight: 30,
    // fontsize for tile of gui/folder 
    titleFontSize: 14,
    titleFontWeight: "bold", // lighter, normal , bold, bolder, depending on font
    // width of the open/close button span, if too small collapses?
    closeOpenButtonWidth: 30,
    // colors
    titleColor: "#000000",
    titleBackgroundColor: "#bbbbbb",

    // style for controller labels
    //----------------------------------------------------
    // (minimum) width for labels (horizontal alignement)
    labelWidth: 80,
    // fontsize for labels
    labelFontSize: 14,

    // style for simple controllers (defined in paramController.js)
    //--------------------------------------
    // fontsize for buttons
    buttonFontSize: 12,
    // width of boolean buttons
    booleanButtonWidth: 60,
    // width for text input
    textInputWidth: 200,
    // width for number input
    numberInputWidth: 40,
    // length of slider for range element
    rangeSliderLengthShort: 80,
    rangeSliderLengthLong: 120,
    rangeSliderLengthVeryLong: 180,

    // style for the colorInput
    //----------------------------
    // width of text element
    colorTextWidth: 70,
    // width of color element
    colorColorWidth: 70,
    // width of range element
    colorRangeWidth: 70,

    // style for the logger
    loggerHeight: 100,
    loggerBackgroundColor: "#ffffff",
    loggerColor: "#000088",

    // style for the image selection/preset selection
    //-------------------------------------
    // the icon image
    guiImageWidth: 50,
    guiImageHeight: 50,
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
    // popup, those design parameters that have to be overwritten for message popup
    popupImagesPerRow: 1, // for choosing images, maybe larger for choosing presets
    popupFontFamily: "FontAwesome, FreeSans, sans-serif", // fontFamily
    popupFontSize: 14, // design.labelFontSize
    popupBackgroundColor: "#cccccc",
    popupBorderWidth: 3,
    popupBorderColor: "#777777",
    popupZIndex: 18,
    // popupPosition: calculated from other data (depending on gui position)
    //  popupHorizontalShift: calculated from other data
};

// other parameters
// base z-index for ui divs, to keep them above others
// the guis will have z-indizes of zIndex,zIndex+1, ... zIndex+number of guis -1
ParamGui.zIndex = 5;
//time in milliseconds between listening updates
ParamGui.listeningInterval = 400;
// keyboard character to hide/show all guis
// Attention: should not interfere with usual text input (file names...)
// should not be "tab" (switches between input elements)
ParamGui.hideCharacter = "$";
// width for spaces in px
ParamGui.spaceWidth = 7;

/**
 * update ParamGui design defaults, using data of another object with the same key 
 * @method ParamGui.updateDefaultDesign
 * @param {Object} newValues
 */
ParamGui.updateDefaultDesign = function(newValues) {
    guiUtils.updateValues(ParamGui.defaultDesign, newValues);
};

ParamGui.outputDiv = false;

/**
 * create an output div fitting this gui
 * it will be in ParamGui.outputDiv
 * ASSUMING that this.autoPlace=true, 
 *  this.design.horizontalPosition= "right",
 *  this.design.horizontalShift= 0,
 * @method ParamGui#createOutputDiv
 */
ParamGui.prototype.createOutputDiv = function() {
    // check assumptions
    if (ParamGui.outputDiv) {
        console.log("*** ParamGui.outputDiv already exists");
    } else if (this.autoPlace && (this.design.horizontalPosition === "right") && (this.design.horizontalShift === 0)) {
        ParamGui.outputDiv = document.createElement("div");
        guiUtils.style(ParamGui.outputDiv)
            .position("absolute")
            .top("0px")
            .left("0px")
            .overflow("auto");
        // resize the output div such that it fills the screen at the left of the gui
        const guiTotalWidth = this.design.width + 2 * this.design.borderWidth;
        const resizeOutputDiv = function() {
            ParamGui.outputDiv.style.height = document.documentElement.clientHeight + "px";
            ParamGui.outputDiv.style.width = (document.documentElement.clientWidth - guiTotalWidth) + "px";
        };
        resizeOutputDiv();
        window.addEventListener("resize", resizeOutputDiv, false);
        document.body.appendChild(ParamGui.outputDiv);
    } else {
        console.log("*** problem in ParamGui#createOutputDiv:");
        console.log("autoPlace " + this.autoPlace);
        console.log("design.horizontalPosition " + this.design.horizontalPosition);
        console.log("design.horizontalShift " + this.design.horizontalShift);
    }
};

/**
 * add a span with a space to the parent element
 * use ParamGui.spaceWidth as parameter !!!
 * @method ParamGui.addSpace
 * @param {HTMLElement} parent
 */
ParamGui.addSpace = function(parent) {
    const theSpan = document.createElement("span");
    theSpan.style.width = ParamGui.spaceWidth + "px";
    theSpan.style.display = "inline-block";
    parent.appendChild(theSpan);
};

/**
 * center an element vertically in its parent element
 * set position to relative if parent position is not set to absolute
 * @method ParamGui.centerVertical
 * @param {hlmlElement} toCenter - an inline element, display set to inline-block
 */
ParamGui.centerVertical = function(toCenter) {
    if (toCenter.parentElement.style.position !== "absolute") {
        toCenter.parentElement.style.position = "relative";
    }
    toCenter.style.position = "absolute";
    toCenter.style.top = "50%";
    toCenter.style.transform = "translateY(-50%)";
    toCenter.style.display = "inline-block";
};

/**
 * remove an element from an array (of listeners)
 * removes dublicates
 * @method ParamGui.removeArrayElement
 * @param {Array} array
 * @param {whatever} element
 */
ParamGui.removeArrayElement = function(array, element) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (element === array[i]) {
            array.splice(i, 1);
        }
    }
};

// collection of root GUI (listening, hiding, resize)
ParamGui.rootGuis = [];

/**
 * test if a GUI is last element of list of root guis
 * and thus in front
 * @method ParamGui.isInFront
 * @param {ParamGui} rootGui 
 * @return boolean, true if rootGui is last of array
 */
ParamGui.isInFront = function(rootGui) {
    return rootGui === ParamGui.rootGuis[ParamGui.rootGuis.length - 1];
};

/**
 * update the zIndices of the guis
 * last comes in front, zIndex(i)=zIndex+i
 * @method ParamGui.updateZIndices
 */
ParamGui.updateZIndices = function() {
    for (var i = 0; i < ParamGui.rootGuis.length; i++) {
        ParamGui.rootGuis[i].setZIndex(ParamGui.zIndex + i);
    }
};

/**
 * close all popups of all guis
 * @method ParamGui.closePopups
 */
ParamGui.closePopups = function() {
    for (var i = 0; i < ParamGui.rootGuis.length; i++) {
        ParamGui.rootGuis[i].closePopups();
    }
};

/**
 * adding a root gui to the collection, update the zIndices
 * it will be last and visible in front
 * @method ParamGui.addRootGui
 * @param {Gui} rootGui 
 */
ParamGui.addRootGui = function(rootGui) {
    ParamGui.rootGuis.push(rootGui);
    ParamGui.updateZIndices();
};

/**
 * remove a root gui from the list, 
 * no need to update the z indices
 * @method ParamGui.removeRootGui
 * @param {Gui} rootGui 
 */
ParamGui.removeRootGui = function(rootGui) {
    ParamGui.removeArrayElement(ParamGui.rootGuis, rootGui);
};

/**
 * put a rootgui in front, becomes last in list, covers all
 * @method ParamGui.moveToFront
 * @param {Gui} rootGui
 */
ParamGui.moveToFront = function(rootGui) {
    ParamGui.removeRootGui(rootGui);
    ParamGui.addRootGui(rootGui);
};

/**
 * initiate periodical display update for listening controllers 
 * @method ParamGui.startListening
 */
let intervalID = 0;
ParamGui.startListening = function() {
    if (intervalID === 0) {
        // gives a non-zero ID
        const gui = this;
        intervalID = setInterval(function() {
            ParamGui.rootGuis.forEach(function(gui) {
                gui.updateDisplayIfListening();
            });
        }, ParamGui.listeningInterval);
    }
};

// keyboard ParamGui.hideCharacter hide/shows all hideable guis
let hidden = false;

document.addEventListener("keydown", hideShow, false);

function hideShow(event) {
    if (event.key === ParamGui.hideCharacter) {
        ParamGui.rootGuis.forEach(function(gui) {
            if (gui.hideable) {
                if (hidden) {
                    gui.show();
                } else {
                    gui.hide();
                }
            }
        });
        hidden = !hidden;
    }
}

/**
 * handler for window.resize events:
 * dispatches resize() calls to all GUIs
 * @method ParamGui.resize
 */
ParamGui.resize = function() {
    ParamGui.rootGuis.forEach(function(gui) {
        gui.resize();
    });
};

// attach this handler to resize events
window.addEventListener("resize", ParamGui.resize, false);

//=================================================================
// dom structure
// this.domElement contains all of the ParamGui object
// this.outerTitleDiv contains the title bar at the top if there is a name and open/close buttons
// this.bodyDiv contains the controls, folders and so on
//=========================================================================================

// create a title bar if gui has a name and/or open/close buttons
// created directly in the main DOM element
ParamGui.prototype.createTitle = function() {
    if ((this.closeOnTop) || (this.name !== "")) {
        const design = this.design;
        // a div for the title, with vertical padding
        // no padding at right. is included on close/open button width
        this.titleDiv = document.createElement("div");
        this.titleDiv.style.backgroundColor = design.titleBackgroundColor;
        this.titleDiv.style.color = design.titleColor;
        this.titleDiv.style.paddingTop = design.paddingVertical + "px";
        this.titleDiv.style.paddingBottom = design.paddingVertical + "px";
        this.titleDiv.style.paddingRight = design.spaceWidth + "px";
        // for root gui make a border
        if (this.isRoot()) {
            this.titleDiv.style.borderBottomWidth = design.borderWidth + "px";
            this.titleDiv.style.borderBottomStyle = "solid";
            this.titleDiv.style.borderBottomColor = design.borderColor;
        }
        // create close and open buttons if wanted
        // small arrows (as for file system), before name
        if (this.closeOnTop) {
            this.closeOpenButton = new Button("▼", this.titleDiv);
            this.closeOpenButton.colorStyleForTransparentSpan(design.titleColor);
            this.closeOpenButton.element.style.borderRadius = "0px";
            this.closeOpenButton.element.style.borderStyle = "none";
            this.closeOpenButton.element.style.outline = "none";
            this.closeOpenButton.setFontSize(design.titleFontSize);
            this.closeOpenButton.setWidth(design.closeOpenButtonWidth);
            const paramGui = this;
            this.closeOpenButton.onClick = function() {
                paramGui.close();
            };
        } else {
            // no close/open buttons - occupy space with empty span for alignement
            const spanElement = document.createElement("span");
            this.titleDiv.appendChild(spanElement);
            spanElement.style.display = "inline-block";
            spanElement.style.width = design.closeOpenButtonWidth + "px";
        }
        // write name of folder/gui in the title div
        this.titleLabel = document.createElement("span");
        this.titleLabel.innerHTML = this.name;
        this.titleDiv.appendChild(this.titleLabel);
        this.titleLabel.style.fontSize = design.titleFontSize + "px";
        this.titleLabel.style.fontWeight = design.titleFontWeight;
        // attach to the dom only after all changes have been done
        // might accelerate things (page reflow only once)
        this.domElement.appendChild(this.titleDiv);
    }
};

/**
 * add a help alert
 * @method ParamGui#addHelp
 * @param {String} message - can have html
 */
ParamGui.prototype.addHelp = function(message) {
    this.helpButton = new InstantHelp(message, this.titleDiv);
    this.helpButton.setFontSize(this.design.titleFontSize);
};

// resizing the body of root guis if autoplaced
// set max height of bodydiv
// attention: available inner space is document.documentElement.clientHeight 
// (including effect of scroll bar)
// window.innerHeight does not take into account the scroll bar
ParamGui.prototype.resize = function() {
    if (this.isRoot() && this.autoPlace) {
        const design = this.design;
        // get the height of the title div
        const titleHeight = this.titleDiv.offsetHeight;
        const maxHeight = document.documentElement.clientHeight - titleHeight - 2 * design.borderWidth - design.verticalShift;
        this.bodyDiv.style.maxHeight = maxHeight + "px";
    }
};

/**
 * set the z-index of the domElement, that contains all
 * @method ParamGui#setZIndex
 * @param {integer} zIndex
 */
ParamGui.prototype.setZIndex = function(zIndex) {
    this.domElement.zIndex = zIndex + "";
};

// hide and show might be used in a program to hide irrelevant parameters
// including title

/**
 * hide the gui/folder. (makes it disappear)
 * note difference between root and folders
 * @method ParamGui#hide
 */
ParamGui.prototype.hide = function() {
    this.hidden = true;
    if (this.isRoot()) {
        // root, hide base container with border
        this.domElement.style.visibility = "hidden";
    } else {
        // folder, hide topDiv if exists
        if ((this.closeOnTop) || (this.name !== "")) {
            this.titleDiv.style.display = "none";
        }
        // hide body div and the bottom padding div
        this.bodyDiv.style.display = "none";
    }
};

/**
 * show the gui/folder. (makes it reappear)
 * note difference between root and folders
 * show in correct open/closed state (body)
 * @method ParamGui#show
 */
ParamGui.prototype.show = function() {
    this.hidden = false;
    if (this.isRoot()) {
        // root, show base container
        this.domElement.style.visibility = "visible";
    } else {
        // folder, show topDiv if exists, including the buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            this.titleDiv.style.display = "block";
        }
        this.bodyDiv.style.display = "block";
    }
};

// open/close should not be used in a program (makes no sense)
// use only in the gui

/**
 * open the body of a gui 
 * only if there are open/close buttons
 * @method ParamGui#open
 */
ParamGui.prototype.open = function() {
    if (this.closeOnTop) {
        this.closed = false;
        this.closeOpenButton.setText("▼");
        const paramGui = this;
        this.closeOpenButton.onClick = function() {
            paramGui.close();
        };
        this.bodyDiv.style.display = "block";
    }
};

/**
 * close the body of a gui 
 * only if there are open/close buttons
 * @method ParamGui#open
 */
ParamGui.prototype.close = function() {
    if (this.closeOnTop) {
        this.closed = true;
        this.closeOpenButton.setText("►");
        const paramGui = this;
        this.closeOpenButton.onClick = function() {
            paramGui.open();
        };
        this.bodyDiv.style.display = "none";
    }
};

/**
 * check if this gui is the root gui (for better readability)
 * @method ParamGui#isRoot
 * @return boolean, true if this is rootGui
 */
ParamGui.prototype.isRoot = function() {
    return this.parent === null;
};

/**
 * get the root (topmost parent) of the gui
 * @method ParamGui#getRoot
 * @return ParamGui object
 */
ParamGui.prototype.getRoot = function() {
    let root = this;
    while (!root.isRoot()) {
        root = root.parent;
    }
    return root;
};

/**
 * add a folder, it is a gui instance
 * @method ParamGui#addFolder
 * @param {String} folderName
 * @param {...Object} designParameters - modifying the design and other parameters
 * @return ParamGui instance (that's the folder)
 */
ParamGui.prototype.addFolder = function(folderName, designParameters) {
    const allParameters = {
        name: folderName,
        closeOnTop: true,
        closed: true,
        parent: this,
        autoPlace: false,
        hideable: false
    };
    for (var i = 1; i < arguments.length; i++) {
        Object.assign(allParameters, arguments[i]);
    }
    const folder = new ParamGui(allParameters);
    this.elements.push(folder);
    return folder;
};

/**
 * remove an element: destroy and remove from array of elements
 * @method ParamGui#remove
 * @param {Object} element - to remove, with a destroy method
 */
ParamGui.prototype.remove = function(element) {
    const index = this.elements.indexOf(element);
    if (index >= 0) {
        this.elements.splice(index, 1);
    }
    element.destroy();
};

/**
 * remove a folder is same as remove element
 * added because it is in the dat.gui api
 * @method ParamGui.removeFolder
 * @param {ParamGui} folder
 */
ParamGui.prototype.removeFolder = ParamGui.prototype.remove;

/**
 * create a div for a controller
 * @method ParamGui#createControllerDomElement
 * @return a formatted div
 */
ParamGui.prototype.createControllerDomElement = function() {
    const controllerDomElement = document.createElement("div");
    // make a regular spacing between elements
    controllerDomElement.style.paddingTop = this.design.paddingVertical + "px";
    controllerDomElement.style.paddingBottom = this.design.paddingVertical + "px";
    return controllerDomElement;
};

/**
 * make a controller with an image selection
 * choices as an object with (label: value pairs)
 * for choosing images:
 * set labels and image urls as two strings, key value pairs of an object choices={ "label1": "URL1", ...},
 * for other uses (presets): image is only a label 
 * then use an object made of labels (again as keys) and value objects with image and value fields
 * this value field is actually choosen (the preset object), thus
 * choices={"label1": {"image": "URL1", value: someData}, ...}
 * @method ParamGui#addImageSelection
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - key for the field of params to change, params[property]
 * @param {object} choices - see above
 * @return {ParamController} object
 */
ParamGui.prototype.addImageSelection = function(params, property, choices) {
    const controllerDomElement = document.createElement("div");
    // make a regular spacing between elements
    controllerDomElement.style.paddingTop = this.design.paddingVertical + "px";
    controllerDomElement.style.paddingBottom = this.design.paddingVertical + "px";
    const controller = new ParamImageSelection(this, controllerDomElement, params, property, choices);
    this.bodyDiv.appendChild(controllerDomElement);
    this.elements.push(controller);
    return controller;
};

/**
 * add a controller for a parameter, one controller on a line, in its div
 * depending on its value and limits
 * @method ParamGui#add
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - key for the field of params to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 * @return {ParamController} object, the controller
 */
/*
 * if low is an object or array then make a selection or a new image select
 * if params[property] is undefined make a button (action defined by onClick method of the controller object
 * if params[property] is boolean make a booleanButton
 * if params[property] is a string make a text textInput  
 * if params[property] is a function make a button with this function as onClick method 
 * if params[property] is a number make a number button with lower and upper limits if defined, 
 *                                 if step is not defined, then a step size is deduced from the parameter value
 *                                 function buttons and range can be added to the domElement or the popup (if exists)
 */

/**
 * adding a controller for a simple parameter
 * uses new image select with popup instead of simple select if:
 *     if design.preferNewImageselect is true and low is an object (that defines choices)
 *     and first low.value is a good image file
 * @method ParamGui#add
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */
ParamGui.prototype.add = function(params, property, low, high, step) {
    // see if we use the new image select:
    // if design option is true and low is an object (that defines choices)
    // and first low.value is a good image file
    let useNewSelect = (this.design.preferNewImageselect) && (guiUtils.isObject(low));
    useNewSelect = useNewSelect && (guiUtils.isGoodImageFile(low[Object.keys(low)[0]])); //first property of low is an image file
    if (useNewSelect) {
        // use the new image select
        return this.addImageSelection(params, property, low);
    } else {
        const controllerDomElement = this.createControllerDomElement();
        const controller = ParamController.create(this, controllerDomElement, params, property, low, high, step);
        // change dom after all work has been done
        this.bodyDiv.appendChild(controllerDomElement);
        return controller;
    }
};

/**
 * add a button controller with simple interface
 * @method ParamGui#addButton
 * @param {string} text - for the button
 * @param {function} action - what the button does
 * @return {controller} with the button
 */
ParamGui.prototype.addButton = function(text, action) {
    const controllerDomElement = this.createControllerDomElement();
    const controller = ParamController.createButton(this, controllerDomElement, text, action);
    this.bodyDiv.appendChild(controllerDomElement);
    return controller;
};

/**
 * create a select ui, the options are an array or object
 * @method ParamGui.addSelect
 * @param {string} labelText
 * @param {array||object} options - array with values for both name/value or an object={name1: value1, name2: value2, ...}
 * @param {value} value
 * @param {function} action - optional, does it upon onChange
 */
ParamGui.prototype.addSelect = function(labelText, options, value, action = false) {
    const controllerDomElement = this.createControllerDomElement();
    const controller = ParamController.createSelect(this, controllerDomElement, labelText, options, value, action);
    this.bodyDiv.appendChild(controllerDomElement);
    return controller;
};

/**
 * add a boolean button
 * @method ParamGui.addBooleanButton
 * @param {string} labelText - for the label
 * @param {boolean} value
 * @param {function} action - optional, does it upon onChange
 */
ParamGui.prototype.addBooleanButton = function(labelText, value, action = false) {
    const controllerDomElement = this.createControllerDomElement();
    const controller = ParamController.createBooleanButton(this, controllerDomElement, labelText, value, action);
    this.bodyDiv.appendChild(controllerDomElement);
    return controller;
};

/**
 * add an ui element to input text
 * @method ParamGui.addTextInput
 * @param {string} labelText - for the label
 * @param {string} text
 * @param {function} action - optional, does it upon onChange
 */
ParamGui.prototype.addTextInput = function(labelText, text, action = false) {
    const controllerDomElement = this.createControllerDomElement();
    const controller = ParamController.createTextInput(this, controllerDomElement, labelText, text, action);
    this.bodyDiv.appendChild(controllerDomElement);
    return controller;
};


/**
 *  add ui element to input numbers, with action
 * .addNumberButton("label",3.1,function action(){...}) is possible
 * @method ParamGui.addNumberButton
 * @param {string} labelText - for the label
 * @param {number} value
 * @param {number} low - optional
 * @param {number} high - optional, requires low
 * @param {number} step - optional, requires low and high
 * @param {function} action - optional, does it upon onChange, independent of low, high and step
 */
ParamGui.prototype.addNumberButton = function(labelText, value, low, high, step, action = false) {
    const controllerDomElement = this.createControllerDomElement();
    const controller = ParamController.createNumberButton(this, controllerDomElement, labelText, value, low, high, step, action);
    this.bodyDiv.appendChild(controllerDomElement);
    return controller;
};

/**
 * make a controller for color
 * @method ParamGui#addColor
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - key for the field of params to change, params[property]
 * @return {ParamController} object
 */
ParamGui.prototype.addColor = function(params, property) {
    const controllerDomElement = document.createElement("div");
    // make a regular spacing between elements
    controllerDomElement.style.paddingTop = this.design.paddingVertical + "px";
    controllerDomElement.style.paddingBottom = this.design.paddingVertical + "px";
    const controller = new ParamColor(this, controllerDomElement, params, property);
    this.bodyDiv.appendChild(controllerDomElement);
    this.elements.push(controller);
    return controller;
};

/**
 * add a logger with an optional clear button
 * (the clear button is in the controller object: logger.clearButton)
 * @param {boolean} addClearButton, default: true
 * @method ParamGui#addLogger
 * @return {Logger} object
 */
ParamGui.prototype.addLogger = function(addClearButton = true) {
    const domElement = document.createElement("div");
    // make a regular spacing between elements
    domElement.style.paddingTop = this.design.paddingVertical + "px";
    domElement.style.paddingBottom = this.design.paddingVertical + "px";
    domElement.style.paddingLeft = this.design.spaceWidth + "px";
    domElement.style.paddingRight = this.design.paddingVertical + "px";
    domElement.style.fontSize = this.design.labelFontSize + "px";
    domElement.style.height = this.design.loggerHeight + "px";
    domElement.style.backgroundColor = this.design.loggerBackgroundColor;
    domElement.style.color = this.design.loggerColor;
    domElement.style.overflowY = "auto";
    domElement.style.borderWidth = this.design.borderWidth + "px";
    domElement.style.borderBottomStyle = "solid";
    domElement.style.borderColor = this.design.borderColor;
    domElement.style.borderTopStyle = "solid";
    const logger = new Logger(domElement);
    this.bodyDiv.appendChild(domElement);
    this.elements.push(logger);
    if (addClearButton) {
        logger.buttonController = this.addButton("clear the log", function() {
            logger.clear();
        });
        logger.buttonController.domElement.style.textAlign = "center";
        logger.buttonController.deleteLabel();
    }
    return logger;
};

/**
 * add a div to make a vertical space
 * choose height (default: paddingVertical)
 * backgroundColor: (default: none )
 * @method ParamGui#addVerticalSpace
 * @param {...float|String} height/backgroundColor - optional
 */
ParamGui.prototype.addVerticalSpace = function(height, backgroundColor) {
    const vSpace = document.createElement("div");
    vSpace.style.height = this.design.paddingVertical + "px";
    for (var i = 0; i < arguments.length; i++) {
        const arg = arguments[i];
        if (typeof(arg) === "number") {
            vSpace.style.height = arg + "px";
        }
        if (typeof(arg) === "string") {
            vSpace.style.backgroundColor = arg;
        }
    }
    this.bodyDiv.appendChild(vSpace);
};

/**
 * add a "paragraph" (its actually a div with optional inner html)
 * text wraps automatically (rewraps if scroll bar appears)
 * @method ParamGui#paragraph
 * @param {String} text - with HTML markup (=>innerHTML)
 * @return the html <p> element, for futher formatting, in case
 */
ParamGui.prototype.addParagraph = function(innerHTML) {
    const para = document.createElement("div");
    para.style.margin = "none";
    para.style.paddingLeft = this.design.spaceWidth + "px";
    para.style.paddingRight = this.design.paragraphRightPadding + "px";
    para.style.paddingTop = this.design.paragraphTopPadding + "px";
    para.style.paddingBottom = this.design.paddingVertical + "px";
    para.style.color = this.design.paragraphColor;
    para.style.fontSize = this.design.paragraphFontSize + "px";
    para.innerHTML = innerHTML;
    this.bodyDiv.appendChild(para);
    return para;
};

/**
 * propagate updateDisplayIfListening events 
 * @method ParamGui#updateDisplayIfListening
 */
ParamGui.prototype.updateDisplayIfListening = function() {
    this.elements.forEach(function(element) {
        if (element.updateDisplayIfListening) {
            element.updateDisplayIfListening();
        }
    });
};

/**
 * this is here because it is in the dat.gui api
 * not implemented
 * @method ParamGui#getSaveObject
 * @return empty object, instead of a JSON object representing the current state of this GUI as well as its remembered properties
 */
ParamGui.prototype.getSaveObject = function() {
    console.log("********ParamGui#getSaveObject method not implemented");
    return {};
};

/**
 * remember values of an object with data
 * use same object as for adding controllers
 * @method ParamGui#remember
 * @param {Object} params - an object containing parameter values
 */
ParamGui.prototype.remember = function(params) {
    console.log("********ParamGui#remember method not implemented");
};

/**
 * this is in the dat.gui API
 * don't know how to implement whatever
 * @method ParamGui#revert
 */
ParamGui.prototype.revert = function(params) {
    console.log("********ParamGui#revert method not implemented");
};

/**
 * destroy everything
 * @method ParamGui#destroy
 */
ParamGui.prototype.destroy = function() {
    // destroy the ui elements and folders
    for (var i = this.elements.length - 1; i >= 0; i--) {
        // attention: destroying folders remove themselves from this array, makes array smaller
        // this is safe (no danger of not destroying an element, or out of array boundary error)
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    // if exist destroy open/close buttons
    if (this.closeOnTop) {
        this.closeOpenButton.destroy();
        this.closeOpenButton = null;
    }
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
    // destroy top title element if exists
    if ((this.closeOnTop) || (this.name !== "")) {
        this.titleLabel.remove();
        this.titleLabel = null;
        this.titleDiv.remove();
        this.titleDiv = null;
    }
    // destroy body
    this.bodyDiv.remove();
    this.bodyDiv = null;
    // if root destroy main domElement
    if (this.isRoot()) {
        this.domElement.remove();
        this.domElement = null;
        ParamGui.removeRootGui(this);
        window.removeEventListener("resize", ParamGui.resize, false);
    }
    // folder: remove from parent GUI 
    else {
        ParamGui.removeArrayElement(this.parent.elements, this);
    }
};

/**
 * close popups
 * @method ParamGui#closePopups
 */
ParamGui.prototype.closePopups = function() {
    this.elements.forEach(element => {
        if (typeof element.closePopup === "function") {
            element.closePopup();
        }
    });
};
