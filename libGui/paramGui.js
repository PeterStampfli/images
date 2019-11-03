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
    ParamColor,
    ParamAngle,
    ParamController,
    DOM,
    Button
} from "./modules.js";

export function ParamGui(params) {
    var i;
    // copy default parameters, change later
    Object.assign(this, ParamGui.defaults);
    // default values for parameters
    this.name = "controls";
    this.load = null;
    this.parent = null;
    this.autoPlace = true;
    this.hideable = true;
    this.closed = false;
    this.closeOnTop = true;
    // read/merge params object replacing defaults
    // applies only to the parameters above
    for (i = 0; i < arguments.length; i++) {
        ParamGui.updateValues(this, arguments[i]);
    }
    // now this.parent is set, if different from null
    // we now know if we are
    this.design = {};
    const design = this.design;
    // now load default design parameters
    // for a root gui it is the ParamGui.defaultDesign
    // for a folder it is the parent design

    if (this.isRoot()) {
        Object.assign(design, ParamGui.defaultDesign);
    } else {
        Object.assign(design, this.parent.design);
    }

    // update design parameters
    for (i = 0; i < arguments.length; i++) {
        ParamGui.updateValues(design, arguments[i]);
    }
    // in particular note that width decreases for sub(sub) folders
    // because of indentation
    // be careful: the vertical scroll bar might hide things
    // use clientWidth for width inside
    this.setup();
}

const px = "px";

// add some defaults designs, especially styles
// styles, change the values of these fields if you do not like them
// do changes in your program
// position (at corners)
ParamGui.defaultDesign = {
    // positioning, default top right corner
    // other corners are possible, as references
    verticalPosition: "top",
    horizontalPosition: "right",
    // shifting the position with respect to the corner
    verticalShift: 0,
    horizontalShift: 0,
    // dimensions, in terms of pixels, if they should scale with window
    // then change these fields in a resize function
    // width of the ui panel
    width: 400,
    // be careful: the vertical scroll bar might hide things
    // important for auto wrapping lines
    scrollBarWidth: 10,
    //ui element label spacing from border and to controls
    labelSpacing: 8,
    // vertical spacing
    paddingVertical: 4,
    // width of border around ui panel
    borderWidth: 3, // set to zero to make border disappear
    // height for the title div
    titleHeight: 30,
    // the same font(family) for everything ?!
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    // fontsize for tile of gui/folder 
    titleFontSize: 14,
    titleFontWeight: "bold", // lighter, normal , bold, bolder, depending on font
    // marking different folder levels
    levelIndent: 10,
    // width of the open/close button span, if too small collapses?
    closeOpenButtonWidth: 30,

    // default colors
    // background (of controllers)
    backgroundColor: "#eeeeee",
    // color for text of controllers
    textColor: "#444444",
    // color for the border of the ui panel
    borderColor: "#777777",
    // color for top of folder with close/open button
    titleColor: "#000000",
    titleBackgroundColor: "#bbbbbb",

    // padding for paragraphs: free space at left and right
    paragraphPadding: 10,
    // textcolor for paragraphs
    paragraphColor: "#000000",

    // defaults for controller dimensions

    // fontsize for buttons
    buttonFontSize: 12,
    // vertical spacing: minimum height overall=== distance between baselines
    //  if controller not too large/minHeight too low
    minControllerHeight: 25,
    // (minimum) width for labels (horizontal alignement)
    controllerLabelWidth: 80,
    // fontsize for labels
    controllerLabelFontSize: 14,
    // width (min) of on/off buttons
    onOffButtonWidth: 60,
    // width for text input
    textInputWidth: 200,
    // width for number input
    numberInputWidth: 40,
    // width for colorInput as string
    colorStringInputWidth: 70,
    // width for color input
    colorInputWidth: 50,
    // length for alpha range element for color
    colorRangeWidth: 60,
    // length of slider for range element
    rangeSliderLengthShort: 80,
    rangeSliderLengthLong: 120,
    // diameter for circular controllers
    controllerDiameter: 80
};

// other parameters
// base z-index for ui divs, to keep them above others
// the guis will have z-indizes of zIndex,zIndex+1, ... zIndex+number of guis -1
ParamGui.zIndex = 5;
//time in milliseconds between listening updates
ParamGui.listeningInterval = 400;
// keyboard character to hide/show all guis
ParamGui.hideCharacter = "Tab";
// width for spaces in px
ParamGui.spaceWidth = 20;

/**
 * updating existing fields of first object by fields of second object
 * both have to have the same type, which is not a function
 * use instead of Object.assign(to,from) to avoid copying ALL (unwanted) fields
 * @method ParamGui.updateValues
 * @param {Object} toObject (or Generator function)
 * @param {Object} fromObject (or generator function)
 */
ParamGui.updateValues = function(toObject, fromObject) {
    for (var key in fromObject) {
        if ((typeof toObject[key] === typeof fromObject[key]) && (typeof fromObject[key] !== "function")) {
            toObject[key] = fromObject[key];
        }
    }
};

/**
 * update ParamGui design defaults, using data of another object with the same key 
 * @method ParamGui.updateDefaults
 * @param {Object} newValues
 */
ParamGui.updateDefaults = function(newValues) {
    ParamGui.updateValues(ParamGui.defaultDesign, newValues);
};

/**
 * add a span with a space to the parent element
 * use NumberButton.spaceWidth as parameter !!!
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
        this.titleLabel.style.fontSize = design.titleFontSize + px;
        this.titleLabel.style.fontWeight = design.titleFontWeight;
        // attach to the dom only after all changes have been done
        // might accelerate things (page reflow only once)
        this.domElement.appendChild(this.titleDiv);
    }
};

// resizing root guis if autoplaced
// set max height of bodydiv
// attention: available inner space is document.documentElement.clientHeight 
// (including effect of scroll bar)
// window.innerHeight does not take into account the scroll bar
ParamGui.prototype.resize = function() {
    if (this.isRoot() && this.autoPlace) {
        const design = this.design;
        // get the height of the title div
        const titleHeight = this.titleDiv.offsetHeight;
        const maxHeight = document.documentElement.clientHeight - titleHeight - 3 * design.borderWidth - design.verticalShift;
        this.bodyDiv.style.maxHeight = maxHeight + px;
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

ParamGui.prototype.setup = function() {
    const paramGui = this;
    const design = this.design;
    // a list of all folders, controllers and other elements
    // must have a destroy method, an updateDisplayIfListening method
    this.elements = [];
    if (this.isRoot()) {
        // the root element has to generate a div as containing DOMElement
        // everything is in this div
        this.domElementId = DOM.createId();
        this.domElement = document.createElement("div");

        this.domElement = DOM.create("div", this.domElementId, "body");

        /*
            this.domElement = document.createElement("div");
            document.body.appendChild(this.domElement);

        */
        // the border around everything
        DOM.style("#" + this.domElementId,
            "width", design.width + px,
            "borderWidth", design.borderWidth + px,
            "borderStyle", "solid",
            "borderColor", design.borderColor);
        // all the same font !?
        DOM.style("#" + this.domElementId,
            "fontFamily", design.fontFamily);

        // put the gui onto collection and top of stack
        ParamGui.addRootGui(this);

        // add the title
        this.createTitle();
        // div between title and body of root gui
        // makes a line similar as border
        const separation = document.createElement("div");
        this.domElement.appendChild(separation);
        separation.style.height = design.borderWidth + px;
        separation.style.backgroundColor = design.borderColor;
        // the ui elements go into their own div, the this.bodyDiv
        this.bodyDivId = DOM.createId();
        this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
        // autoPlacing the root gui domElement relative to one of the four corners
        // and make the bodyDiv scrolling vertical, if needed
        if (this.autoPlace) {
            this.domElement.style.position = "fixed";
            this.domElement.style[design.verticalPosition] = design.verticalShift + px;

            DOM.style("#" + this.domElementId,

                design.horizontalPosition, design.horizontalShift + px

            );
            // scroll in vertical direction: attention! overflowY="auto" makes that overflowX becomes "auto" too if it is "initial" or "visible"
            // be careful: the vertical scroll bar might hide things
            // take into account design.scrollBarWidth for auto wrapping lines
            this.bodyDiv.style.overflowY = "auto";
            this.bodyDiv.style.overflowX = "hidden";
            this.resize();
        }
    } else {
        // folders have the parent bodyDiv as container
        this.domElementId = this.parent.bodyDivId;
        this.domElement = this.parent.bodyDiv;
        // add the title
        this.createTitle();
        // the ui elements go into their own div, the this.bodyDiv
        // atach to dom after all changes
        this.bodyDivId = DOM.createId();
        // this.bodydiv = document.createElement("div");
        //  this.domElement.appendChild(this.bodyDiv);

        this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
        // padding to have minimal height, space for controller padding
        // separating folders
        DOM.style("#" + this.bodyDivId,
            "paddingTop", design.paddingVertical + px
        );
        // indent and left border only if there is a title and/or open/close buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            this.bodyDiv.style.borderLeft = "solid";
            this.bodyDiv.style.borderColor = design.titleBackgroundColor;
            this.bodyDiv.style.borderLeftWidth = design.levelIndent + px;
        }
    }
    // close it initially? (has to be here, after creation of elements
    if (this.closeOnTop && this.closed) {
        this.close();
    }
    // set colors of body
    this.bodyDiv.style.color = design.textColor;
    this.bodyDiv.style.backgroundColor = design.backgroundColor;
    // attach bodyDiv to dom
};

// hide and show might be used in a program to hide irrelevant parameters

/**
 * hide the gui/folder. (makes it disappear)
 * note difference between root and folders
 * @method ParamGui#hide
 */
ParamGui.prototype.hide = function() {
    this.hidden = true;
    if (this.isRoot()) {
        // root, hide base container with border
        DOM.style("#" + this.domElementId, "display", "none");
    }
    // folder, hide topDiv if exists
    if ((this.closeOnTop) || (this.name !== "")) {
        DOM.style("#" + this.outerTitleDivId, "display", "none");
    }
    // hide body div and the bottom padding div
    DOM.style("#" + this.bodyDivId, "display", "none");
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
        this.domElement.style.display = "block";
    }
    // folder, show topDiv if exists, including the buttons
    if ((this.closeOnTop) || (this.name !== "")) {
        DOM.style("#" + this.outerTitleDivId, "display", "block");
    }
    // show the body div if not closed or no close/open buttons
    if ((!this.closed) || (!this.closeOnTop)) {
        DOM.style("#" + this.bodyDivId, "display", "block");
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
        DOM.style("#" + this.bodyDivId, "display", "block");
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
        DOM.style("#" + this.bodyDivId, "display", "none");
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
 * @param {...Object} designParameters - modifying the design
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
 * add a controller for a parameter, depending on its value and limits
 * @method ParamGui#add
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - key for the field of params to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 * @return {ParamController} object, the controller
 */
/*
 * if low is an object or array then make a selection
 * if params[property] is undefined make a button (action defined by onClick method of the controller object
 * if params[property] is boolean make a booleanButton
 * if params[property] is a string make a text textInput  
 * if params[property] is a function make a button with this function as onClick method 
 * if params[property] and low are integer and high is undefined (thus step undefined too) make a numberbutton
 * if params[property],low and high are integer and step is undefined make a numberbutton
 * if params[property],low, and high are integer and step equals 1, make a range with plus and minus buttons 
 * (else) if params[property],low and high are numbers make a range element
 */

ParamGui.prototype.add = function(params, property, low, high, step) {
    const controller = new ParamController(this, params, property, low, high, step);
    this.elements.push(controller);
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
    const controller = new ParamColor(this, params, property);
    this.elements.push(controller);
    return controller;
};

/**
 * make a controller for an angle (and scale)
 * @method ParamGui#addAngle
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - key for the field of params to change, params[property]
 * @return {ParamController} object
 */
ParamGui.prototype.addAngle = function(params, property) {
    const controller = new ParamAngle(this, params, property);
    this.elements.push(controller);
    return controller;
};


// adding hide and show methods to an object with a DOMElement
function hideAndShow(element) {
    element.hide = function() {
        element.DOMElement.style.display = "none";
    };
    element.show = function() {
        element.DOMElement.style.display = "block";
    };
}

/**
 * add a div to make a vertical space
 * choose height (default: paddingVertical)
 * backgroundColor: (default: none )
 * @method ParamGui#verticalSpace
 * @param {...float|String} height/backgroundColor - optional
 * @return object with DOMElement, hide and show methods
 */
ParamGui.prototype.verticalSpace = function(height, backgroundColor) {
    const result = {};
    result.DOMElement = document.createElement("div");
    hideAndShow(result);
    result.DOMElement.style.height = this.design.paddingVertical + px;
    for (var i = 0; i < arguments.length; i++) {
        const arg = arguments[i];
        if (typeof(arg) === "number") {
            result.DOMElement.style.height = arg + px;
        }
        if (typeof(arg) === "string") {
            result.DOMElement.style.backgroundColor = arg;
        }
    }
    this.domElement.appendChild(result.domElement);
    return result;
};

/**
 * add a "paragraph" (its actually a div with optional inner html)
 * text wraps automatically (rewraps if scroll bar appears)
 * @method ParamGui#paragraph
 * @param {String} text - with HTML markup (=>innerHTML), optional
 * @return object with DOMElement,DOMElementId,hide and show methods
 */
ParamGui.prototype.paragraph = function(innerHTML) {
    const id = DOM.createId();
    const result = {};
    result.DOMElement = DOM.create("div", id, "#" + this.bodyDivId);
    result.domElementId = id;
    hideAndShow(result);
    DOM.style("#" + id,
        "paddingLeft", this.design.paragraphPadding + px,
        "paddingRight", this.design.paragraphPadding + px,
        "color", this.design.paragraphColor
    );
    if (typeof innerHTML === "string") {
        result.DOMElement.innerHTML = innerHTML;
    }
    return result;
};

/**
 * propagate updateDisplayIfListening events 
 * @method ParamGui#updateDisplayIfListening
 */
ParamGui.prototype.updateDisplayIfListening = function() {
    this.elements.forEach(function(element) {
        element.updateDisplayIfListening();
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
    console.log("********ParamGui#remeber method not implemented");
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
    console.log("destroy");
    // destroy the ui elements and folders
    for (var i = this.elements.length - 1; i >= 0; i--) {
        // attention: destroying folders remove themselves from this array
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    // if exist destroy open/close buttons
    if (this.closeOnTop) {
        this.closeOpenButton.destroy();
        this.closeOpenButton = null;
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
    }
    // folder: remove from parent GUI 
    else {
        ParamGui.removeArrayElement(this.parent.elements, this);
    }
};

self.ParamGui = ParamGui;