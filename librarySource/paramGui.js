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
    // default values for parameters
    this.name = "";
    this.load = null;
    this.parent = null;
    this.autoPlace = true;
    this.hideable = true;
    this.closed = false;
    this.closeOnTop = false;
    // read/merge params object replacing defaults
    for (var i = 0; i < arguments.length; i++) {
        ParamGui.updateValues(this, arguments[i]);
    }
    // other parameters to change
    // width default for root
    this.width = ParamGui.width;
    // a list of all folders, controllers and other elements
    // must have a destroy method, an updateDisplayIfListening method
    this.elements = [];
    this.setup();
};

(function() {
    "use strict";

    const px = "px";
    const px0 = "0px";

    // add some defaults, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program
    // position (at corners)
    ParamGui.zIndex = 5; // z-index for ui divs, to keep them above others
    // positioning, default top right corner
    ParamGui.verticalPosition = "top";
    ParamGui.horizontalPosition = "right";
    // dimensions, in terms of pixels, if they should scale with window
    // then change these fields in a resize function
    // width of the ui panel
    ParamGui.width = 400;
    //ui element spacing from border
    ParamGui.paddingHorizontal = 8;
    // vertical spacing
    ParamGui.paddingVertical = 4;
    // width of border around ui panel
    ParamGui.borderWidth = 3; // set to zero to make border disappear
    // font size for buttons
    ParamGui.buttonFontSize = 13;
    // minimum width for label (property), alignment
    ParamGui.labelWidth = 110;
    // fontsize for label/property 
    ParamGui.labelFontSize = 14;
    // marking different folder levels
    ParamGui.levelIndent = 10;
    // width of the open/close button span
    ParamGui.openCloseButtonWidth = 20;

    // colors
    // background of the root ui panel
    ParamGui.rootBackgroundColor = "#eeeeee";
    // background for folder panels
    ParamGui.folderBackgroundColor = "#eeeeee";
    // color for text
    ParamGui.textColor = "#444444";
    // color for the border of the ui panel
    ParamGui.borderColor = "#777777";
    // color for top of folder with close/open button
    ParamGui.folderTopColor = "#000000";
    ParamGui.folderTopBackgroundColor = "#bbbbbb";

    //time in milliseconds betweenm listening updates
    ParamGui.listeningInterval = 400;
    // keyboard character to hide/show all guis
    ParamGui.hideCharacter = "h";

    /**
     * updating existing fields of first object by fields of second object
     * both have to have the same value
     * use instead of Object.assign(to,from) to avoid copying ALL (unwanted) fields
     * @method ParamGui.updateValues
     * @param {Object} toObject
     * @param {Object} fromObject
     */

    ParamGui.updateValues = function(toObject, fromObject) {
        if ((typeof toObject === "object") && (typeof fromObject === "object")) {
            for (var key in fromObject) {
                if (typeof toObject[key] === typeof fromObject[key]) {
                    toObject[key] = fromObject[key];
                }
            }
        }
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

    // root GUI objects collection (listening, hiding)
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
        console.log("resize");

    };

    // attach this handler to resize events
    window.addEventListener("resize", ParamGui.resize, false);


    //=================================================================
    // dom structure
    // this.domElement contains all of the ParamGui object
    // this.topDiv contains the title bar at the top if there is a name and open/close buttons
    // this.bodyDiv contains the controls, folders and so on
    //=========================================================================================


    ParamGui.prototype.setup = function() {
        const paramGui = this;
        if (this.parent === null) {
            ParamGui.addRootGui(this);
            // the root element has to generate a div as containing DOMElement
            this.domElementId = DOM.createId();
            this.domElement = DOM.create("div", this.domElementId, "body");
            // put it on top
            DOM.style("#" + this.domElementId, "zIndex", "" + ParamGui.zIndex);
            if (this.autoPlace) { // autoplacing into a corner
                DOM.style("#" + this.domElementId,
                    "position", "fixed",
                    ParamGui.verticalPosition, px0,
                    ParamGui.horizontalPosition, px0);
            }
            // width, no padding, define spacing on elements
            DOM.style("#" + this.domElementId,
                "width", this.width + px,
                "maxHeight", (window.innerHeight - 2 * ParamGui.borderWidth) + px,
                "overflowY", "auto",
                "overflowX", "hidden");
            DOM.style("#" + this.domElementId,
                "borderWidth", ParamGui.borderWidth + px,
                "borderStyle", "solid",
                "borderColor", ParamGui.borderColor,
                "backgroundColor", ParamGui.rootBackgroundColor);
        } else {
            // folders have the parent bodyDiv as container
            this.domElementId = this.parent.bodyDivId;
            this.domElement = this.parent.bodyDiv;
        }
        // a title bar on top if there is a name or close/open buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            // create divs with open/close buttons
            this.topDivId = DOM.createId();
            this.topDiv = DOM.create("div", this.topDivId, "#" + this.domElementId);
            DOM.style("#" + this.topDivId,
                "backgroundColor", ParamGui.folderTopBackgroundColor,
                "color", ParamGui.folderTopColor,
                "width", this.width + px,
                "paddingTop", ParamGui.paddingVertical + px,
                "paddingBottom", ParamGui.paddingVertical + px);

            // close and open buttons if wanted
            if (this.closeOnTop) {
                const closeButtonElementId = DOM.createId();
                const closeButtonElement = DOM.create("span", closeButtonElementId, "#" + this.topDivId, "▼");
                const openButtonElementId = DOM.createId();
                const openButtonElement = DOM.create("span", openButtonElementId, "#" + this.topDivId, "►");
                this.closeButton = new Button(closeButtonElementId);
                this.closeButton.onClick = function() {
                    paramGui.close();
                };
                this.closeButton.colorStyleForTransparentSpan();
                this.openButton = new Button(openButtonElementId);
                this.openButton.onClick = function() {
                    paramGui.open();
                };
                this.openButton.colorStyleForTransparentSpan();
                DOM.style("#" + closeButtonElementId + ",#" + openButtonElementId,
                    "font-size", ParamGui.buttonFontSize + px,
                    "borderRadius", "0px",
                    "paddingLeft", ParamGui.borderWidth + px,
                    "font-size", ParamGui.labelFontSize + px,
                    "backgroundColor", "#ffffff00",
                    "display", "inline-block",
                    "width", ParamGui.openCloseButtonWidth + px
                );
                // default:open
                DOM.displayNone(openButtonElementId);
            } else {
                const spanId = DOM.createId();
                const spanElement = DOM.create("span", spanId, "#" + this.topDivId);
                DOM.style("#" + spanId,
                    "display", "inline-block",
                    "paddingLeft", ParamGui.borderWidth + px,
                    "width", ParamGui.openCloseButtonWidth + px
                );
            }
            this.topLabelId = DOM.createId();
            this.topLabel = DOM.create("span", this.topLabelId, "#" + this.topDivId, this.name);
            DOM.style("#" + this.topLabelId,
                "minWidth", ParamGui.labelWidth + px,
                "display", "inline-block",
                "font-size", ParamGui.labelFontSize + px,
                "font-weight", "bold",
                "paddingRight", ParamGui.paddingHorizontal + px);
        }
        // the ui elements go into their own div, the this.bodyDiv
        this.bodyDivId = DOM.createId();
        this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
        DOM.style("#" + this.bodyDivId,
            "paddingTop", ParamGui.paddingVertical + px);
        if (this.parent !== null) {
            DOM.style("#" + this.bodyDivId,
                "backgroundColor", ParamGui.folderBackgroundColor,
                "border-left", "solid",
                "borderColor", ParamGui.folderTopBackgroundColor,
                "border-left-width", ParamGui.levelIndent + px);

            // padding at end as extra divs, always visible
            // to separate folders
            this.bottomPaddingDivId = DOM.createId();
            DOM.create("div", this.bottomPaddingDivId, "#" + this.domElementId);
            DOM.style("#" + this.bottomPaddingDivId,
                "height", ParamGui.paddingVertical + px);
        }

        // close it initially?
        if (this.closeOnTop && this.closed) {
            this.close();
        }

    };

    /**
     * hide the gui/folder. (makes it disappear)
     * note difference between root and folders
     * @method ParamGui#hide
     */
    ParamGui.prototype.hide = function() {
        this.hidden = true;
        if (this.parent === null) {
            // root, hide base container with border
            DOM.style("#" + this.domElementId, "display", "none");
        }
        // folder, hide topDiv if exists
        if ((this.closeOnTop) || (this.name !== "")) {
            DOM.style("#" + this.topDivId, "display", "none");
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
        if (this.parent === null) {
            // root, show base container
            DOM.style("#" + this.domElementId, "display", "block");
        }
        // folder, show topDiv if exists, including the buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            DOM.style("#" + this.topDivId, "display", "block");
        }
        // show the body div if not closed or no close/open buttons
        if ((!this.closed) || (!this.closeOnTop)) {
            DOM.style("#" + this.bodyDivId, "display", "block");
        }
        // always show bottom padding
        DOM.style("#" + this.bottomPaddingDivId, "display", "block");
    };

    /**
     * open the body of a gui 
     * only if there are open/close buttons
     * if hidden do not display body 
     * @method ParamGui#open
     */
    ParamGui.prototype.open = function() {
        if (this.closeOnTop) {
            this.closed = false;
            // the buttons are inside the topDiv, which is shown/hidden
            this.openButton.element.style.display = "none";
            this.closeButton.element.style.display = "inline-block";
            if (!this.hidden) {
                DOM.style("#" + this.bodyDivId, "display", "block");
            }
        }
    };

    /**
     * close the body of a gui 
     * only if there are open/close buttons
     * if hidden do not display closeBody
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
     * get the root (topmost parent) of the gui
     * @method ParamGui#getRoot
     * @return ParamGui object
     */
    ParamGui.prototype.getRoot = function() {
        let root = this;
        while (root.parent !== null) {
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
     * this is in the dat.gui API
     * don't know how to implement whatever
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
            this.topDiv.remove();
            this.topDiv = null;
        }
        // destroy body
        this.bodyDiv.remove();
        this.bodyDiv = null;
        // if root destroy main domElement
        if (this.parent === null) {
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
