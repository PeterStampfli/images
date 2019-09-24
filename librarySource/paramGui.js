/**
 * emulator of  https://github.com/dataarts/dat.gui
 * simply use: "dat.GUI=ParamGui;" to switch from old gui to new one
 * 
 */

/*
 * dependencies
<script src="../librarySource/keyboardEvents.js"></script>
<script src="../librarySource/button.js"></script>
<script src="../librarySource/booleanButton.js"></script>
<script src="../librarySource/textInput.js"></script>
<script src="../librarySource/numberButton.js"></script>
<script src="../librarySource/selectValues.js"></script>
<script src="../librarySource/range.js"></script>
<script src="../librarySource/dom.js"></script>
<script src="../librarySource/paramController.js"></script>
<script src="../librarySource/paramGui.js"></script>
*/

/* jshint esversion:6 */

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
 * hideable - boolean - hide/show with keyboard ParamGui.hideCharacter press ("h") - default: true
 * closed - boolean - start gui in closed state - default: false
 * closeOnTop - boolean - make a titlebar with show/close button - default: false
 */

ParamGui = function(params) {
    "use strict";
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
    // now load default design parameters
    // for a root gui it is the ParamGui.defaultDesign
    // for a folder it is the parent design
    if (this.isRoot()) {
        Object.assign(this.design, ParamGui.defaultDesign);
    } else {
        Object.assign(this.design, this.parent.design);
    }
    // update design parameters
    for (i = 0; i < arguments.length; i++) {
        ParamGui.updateValues(this.design, arguments[i]);
    }
    this.setup();
};

(function() {
    "use strict";

    const px = "px";
    const px0 = "0px";

    // add some defaults designs, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program
    // position (at corners)
    ParamGui.defaultDesign = {
        // positioning, default top right corner
        verticalPosition: "top",
        horizontalPosition: "right",
        // dimensions, in terms of pixels, if they should scale with window
        // then change these fields in a resize function
        // width of the ui panel
        width: 400,
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
        // width of the open/close button span
        openCloseButtonWidth: 20,

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

        // defaults for controller dimensions

        // fontsize for buttons
        buttonFontSize: 12,
        // vertical spacing: minimum height overall=== distance between baselines
        //  if controller not too large/minHeight too low
        minControllerHeight: 23,
        // (minimum) width for labels (horizontal alignement)
        controllerLabelWidth: 80,
        // fontsize for labels
        controllerLabelFontSize: 14,
        // width (min) of on/off buttons
        onOffButtonWidth: 60,
        // width for text input
        textInputWidth: 200,
        // width for number input
        numberInputWidth: 60,
        // length of slider for range element
        rangeSliderLengthShort: 80,
        rangeSliderLengthLong: 120,
        // vertical offset for range slider (alignment)
        rangeVOffset: 4
    };

    // other parameters
    ParamGui.zIndex = 5; // z-index for ui divs, to keep them above others
    //time in milliseconds between listening updates
    ParamGui.listeningInterval = 400;
    // keyboard character to hide/show all guis
    ParamGui.hideCharacter = "h";

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
     * update ParamGui defauts using data of another object with the same key 
     * @method ParamGui.updateDefaults
     * @param {Object} newValues
     */
    ParamGui.updateDefaults = function(newValues) {
        ParamGui.updateValues(ParamGui.defaultDesign, newValues);
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
     * adding a root gui to the collection
     * @method ParamGui.addRootGui
     * @param {Gui} rootGui 
     */
    ParamGui.addRootGui = function(rootGui) {
        ParamGui.rootGuis.push(rootGui);
    };

    /**
     * remove a root gui from the list
     * @method ParamGui.removeRootGui
     * @param {Gui} rootGui 
     */
    ParamGui.removeRootGui = function(rootGui) {
        ParamGui.removeArrayElement(ParamGui.rootGuis, rootGui);
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
    KeyboardEvents.addFunction(function() {
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
    }, ParamGui.hideCharacter);

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
            // create title div for name and open/close buttons
            this.outerTitleDivId = DOM.createId();
            this.outerTitleDiv = DOM.create("div", this.outerTitleDivId, "#" + this.domElementId);
            // full width (background color!), excess will be hidden
            DOM.style("#" + this.outerTitleDivId,
                "backgroundColor", this.design.titleBackgroundColor,
                "color", this.design.titleColor,
                "width", this.design.width + px,
                "height", this.design.titleHeight + px,
                "position", "relative");
            // put elements at center of div with fixed heigth
            const innerTitleDivId = DOM.createId();
            DOM.create("div", innerTitleDivId, "#" + this.outerTitleDivId);
            DOM.style("#" + innerTitleDivId,
                "position", "absolute",
                "top", "50%",
                "transform", "translateY(-50%)");
            // id of the div for writing the title and the open/close buttons
            const titleDivId = innerTitleDivId;
            // create close and open buttons if wanted
            // small arrows (as for file system), before name
            if (this.closeOnTop) {
                // button visuals
                const closeButtonElementId = DOM.createId();
                const closeButtonElement = DOM.create("span", closeButtonElementId, "#" + titleDivId, "▼");
                const openButtonElementId = DOM.createId();
                const openButtonElement = DOM.create("span", openButtonElementId, "#" + titleDivId, "►");
                // span length determines spacing between handles and gui/folder name
                // make width large enough that the title label does not move
                // padding left shifts buttons
                DOM.style("#" + closeButtonElementId + ",#" + openButtonElementId,
                    "borderRadius", "0px",
                    "paddingLeft", this.design.borderWidth + px,
                    "font-size", this.design.titleFontSize + px,
                    "display", "inline-block",
                    "width", this.design.openCloseButtonWidth + px);
                // default:open
                DOM.displayNone(openButtonElementId);
                // button function
                const paramGui = this;
                this.closeButton = new Button(closeButtonElementId);
                this.closeButton.colorStyleForTransparentSpan(this.titleColor);
                this.closeButton.onClick = function() {
                    paramGui.close();
                };
                this.openButton = new Button(openButtonElementId);
                this.openButton.colorStyleForTransparentSpan(this.titleColor);
                this.openButton.onClick = function() {
                    paramGui.open();
                };
            } else {
                // no close/open buttons - occupy space with empty span for alignement
                const spanId = DOM.createId();
                const spanElement = DOM.create("span", spanId, "#" + titleDivId);
                DOM.style("#" + spanId,
                    "display", "inline-block",
                    "paddingLeft", this.design.borderWidth + px,
                    "width", this.design.openCloseButtonWidth + px);
            }
            // write name of folder/gui in the title div
            this.topLabelId = DOM.createId();
            this.topLabel = DOM.create("span", this.topLabelId, "#" + titleDivId, this.name);
            DOM.style("#" + this.topLabelId,
                "display", "inline-block",
                "font-size", this.design.titleFontSize + px,
                "font-weight", this.design.titleFontWeight);
        }
    };

    // resizing root guis if autoplaced
    // set max height of bodydiv
    ParamGui.prototype.resize = function() {
        if (this.isRoot() && this.autoPlace) {
            DOM.style("#" + this.bodyDivId,
                "maxHeight", (window.innerHeight - 3 * this.design.borderWidth - this.design.titleHeight) + px);
        }
    };

    ParamGui.prototype.setup = function() {
        const paramGui = this;
        // a list of all folders, controllers and other elements
        // must have a destroy method, an updateDisplayIfListening method
        this.elements = [];
        if (this.isRoot()) {
            ParamGui.addRootGui(this);
            // the root element has to generate a div as containing DOMElement
            // everything is in this div
            this.domElementId = DOM.createId();
            this.domElement = DOM.create("div", this.domElementId, "body");
            // put it on top
            DOM.style("#" + this.domElementId, "zIndex", ParamGui.zIndex + "");
            // the border around everything
            DOM.style("#" + this.domElementId,
                "borderWidth", this.design.borderWidth + px,
                "borderStyle", "solid",
                "borderColor", this.design.borderColor,
                "color", this.design.textColor,
                "backgroundColor", this.design.backgroundColor);
            // all the same font !?
            DOM.style("#" + this.domElementId,
                "fontFamily", this.design.fontFamily);
            // add the title
            this.createTitle();
            // padding at top as always visible separating line between root gui title and rest
            // root has no "indentation"
            const topPaddingDivId = DOM.createId();
            DOM.create("div", topPaddingDivId, "#" + this.domElementId);
            DOM.style("#" + topPaddingDivId,
                "height", this.design.borderWidth + px,
                "backgroundColor", this.design.borderColor
            );
            // the ui elements go into their own div, the this.bodyDiv
            this.bodyDivId = DOM.createId();
            this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
            // autoPlacing into a corner, if not style outside
            if (this.autoPlace) {
                DOM.style("#" + this.domElementId,
                    "position", "fixed",
                    this.design.verticalPosition, px0,
                    this.design.horizontalPosition, px0,
                    "width", this.design.width + px,
                    "overflowX", "hidden");
                DOM.style("#" + this.bodyDivId,
                    "overflowY", "auto",
                    "overflowX", "hidden");
                this.resize();
            }
        } else {
            // folders have the parent bodyDiv as container
            this.domElementId = this.parent.bodyDivId;
            this.domElement = this.parent.bodyDiv;
            // add the title
            this.createTitle();
            // the ui elements go into their own div, the this.bodyDiv
            this.bodyDivId = DOM.createId();
            this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
            // padding at top makes separating line between folders
            DOM.style("#" + this.bodyDivId,
                "paddingTop", this.design.paddingVertical + px);
            // indent and left border only if there is a title and/or open/close buttons
            if ((this.closeOnTop) || (this.name !== "")) {
                DOM.style("#" + this.bodyDivId,
                    "border-left", "solid",
                    "borderColor", this.design.titleBackgroundColor,
                    "border-left-width", this.design.levelIndent + px);
            }
            // padding at end as extra divs, always visible
            // to separate folders
            this.bottomPaddingDivId = DOM.createId();
            DOM.create("div", this.bottomPaddingDivId, "#" + this.domElementId);
            DOM.style("#" + this.bottomPaddingDivId,
                "marginBottom", this.design.paddingVertical + px);
        }
        // close it initially? (has to be here, after creation of elements
        if (this.closeOnTop && this.closed) {
            this.close();
        }

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
        DOM.style("#" + this.bottomPaddingDivId, "display", "none");
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
            DOM.style("#" + this.domElementId, "display", "block");
        }
        // folder, show topDiv if exists, including the buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            DOM.style("#" + this.outerTitleDivId, "display", "block");
        }
        // show the body div if not closed or no close/open buttons
        if ((!this.closed) || (!this.closeOnTop)) {
            DOM.style("#" + this.bodyDivId, "display", "block");
        }
        // always show bottom padding
        DOM.style("#" + this.bottomPaddingDivId, "display", "block");
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
            // the buttons are inside the topDiv, which is shown/hidden
            this.openButton.element.style.display = "none";
            this.closeButton.element.style.display = "inline-block";
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
            this.openButton.element.style.display = "inline-block";
            this.closeButton.element.style.display = "none";
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
     * @return ParamGui instance (that's the folder)
     */
    ParamGui.prototype.addFolder = function(folderName) {
        const folder = new ParamGui({
            name: folderName,
            closeOnTop: true,
            parent: this,
            autoPlace: false,
            hideable: false
        });
        this.elements.push(folder);
        return folder;
    };

    /**
     * remove an element: destroy and remove from array of elements
     * @method ParamGui.remove
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
     * part of dat.gui, not implemented, generates a dummy button controller
     * a controller for color
     * @method ParamGui#addColor
     * @param {Object} params - object that has the parameter as a field
     * @param {String} property - key for the field of params to change, params[property]
     * @return {ParamController} object
     */
    ParamGui.prototype.addColor = function(params, property) {
        return this.add({}, "addColor not implemented");
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
            this.closeButton.destroy();
            this.closeButton = null;
            this.openButton.destroy();
            this.openButton = null;
        }
        // destroy top title element if exists
        if ((this.closeOnTop) || (this.name !== "")) {
            this.topLabel.remove();
            this.topLabel = null;
            this.outerTitleDiv.remove();
            this.outerTitleDiv = null;
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

}());
