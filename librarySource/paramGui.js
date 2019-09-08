/**
 * emulator of  https://github.com/dataarts/dat.gui
 * simply use: "dat.GUI=ParamGui;" to switch from old gui to new one
 * 
 */

/*
 * dependencies
<script src="../librarySource/button.js"></script>
<script src="../librarySource/numberButton.js"></script>
<script src="../librarySource/select.js"></script>
<script src="../librarySource/range.js"></script>
<script src="../librarySource/dom.js"></script>
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
 * @param {Object} params - setup parameters
 */

/*
 * setup parameters:
 * name - String - name of the gui/gui folder - default: ""
 * load - Object - saved state of the gui (JSON) ??? - default: null
 * parent - ParamGui instance - the gui this one is nested in - default: null (root)
 * autoPlace - boolean - placing the gui automatically?? - default: true
 * hideable - boolean - hide/show with keyboard "h" press - default: true
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
    // read params object replacing defaults
    if (typeof params !== "undefined") {
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = params[keys[i]];
        }
    }
    // other parameters to change
    // width default for root
    this.width = ParamGui.width;
    // a list of all folders, controllers and other elements
    // must have a destroy method
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
    ParamGui.buttonFontSize = 14;
    // minimum width for label (property), alignment
    ParamGui.labelWidth = 100;
    // fontsize for label/property 
    ParamGui.labelFontSize = 16;

    // colors
    // background of the ui panel
    ParamGui.backgroundColor = "#ffffff";
    // color for text
    ParamGui.textColor = "#444444";
    // color for the border of the ui panel
    ParamGui.borderColor = "#777777";
    // color for top of folder with close/open button
    ParamGui.folderTopColor = "#000000";
    ParamGui.folderTopBackgroundColor = "#bbbbbb";

    //=================================================================
    // dom structure
    // this.domElement contains all of the ParamGui object
    // this.topDiv contains the title bar at the top if there is a name and open/close buttons
    // this.bodyDiv contains the controls, folders and so on
    //=========================================================================================


    ParamGui.prototype.setup = function() {
        const paramGui = this;
        if (this.parent === null) {
            // the root element has to generate a div as containing DOMElement
            console.log("generate div");
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
                "backgroundColor", ParamGui.backgroundColor);
        } else {
            // folders have the parent bodyDiv as container
            this.domElementId = this.parent.bodyDivId;
            this.domElement = this.parent.bodyDiv;
        }
        // a title bar on top if there is a name or close/open buttons
        if ((this.closeOnTop) || (this.name !== "")) {
            // create divs with open/close buttons
            console.log("closeOnTop");
            this.topDivId = DOM.createId();
            this.topDiv = DOM.create("div", this.topDivId, "#" + this.domElementId);
            DOM.style("#" + this.topDivId,
                "backgroundColor", ParamGui.folderTopBackgroundColor,
                "color", ParamGui.folderTopColor,
                "width", this.width + px,
                "paddingTop", ParamGui.paddingVertical + px,
                "paddingBottom", ParamGui.paddingVertical + px);
            this.topLabelId = DOM.createId();
            this.topLabel = DOM.create("span", this.topLabelId, "#" + this.topDivId, this.name);
            DOM.style("#" + this.topLabelId,
                "minWidth", ParamGui.labelWidth + px,
                "display", "inline-block",
                "font-size", ParamGui.labelFontSize + px,
                "font-weight", "bold",
                "paddingLeft", ParamGui.paddingHorizontal + px,
                "paddingRight", ParamGui.paddingHorizontal + px);
            // close and open buttons if wanted
            if (this.closeOnTop) {
                // closing the body replace it with a div of padding height
                this.closedBodyDivId = DOM.createId();
                this.closedBodyDiv = DOM.create("div", this.closedBodyDivId, "#" + this.domElementId);
                DOM.style("#" + this.closedBodyDivId,
                    "width", this.width + px,
                    "height", ParamGui.paddingVertical + px,
                    "display", "none");

                const closeButtonElementId = DOM.createId();

                const closeButtonElement = DOM.create("button", closeButtonElementId, "#" + this.topDivId, "close");
                const openButtonElementId = DOM.createId();

                const openButtonElement = DOM.create("button", openButtonElementId, "#" + this.topDivId, "open");

                DOM.style("#" + closeButtonElementId + ",#" + openButtonElementId,
                    "font-size", ParamGui.buttonFontSize + px);
                this.closeButton = new Button(closeButtonElementId);
                this.closeButton.onClick = function() {
                    paramGui.close();
                };
                this.openButton = new Button(openButtonElementId);
                this.openButton.onClick = function() {
                    paramGui.open();
                };
                // default:open
                DOM.displayNone(openButtonElementId);
            }
        }
        // the ui elements go into their own div, the this.bodyDiv
        this.bodyDivId = DOM.createId();
        this.bodyDiv = DOM.create("div", this.bodyDivId, "#" + this.domElementId);
        DOM.style("#" + this.bodyDivId,
            "width", this.width + px,
            "paddingTop", ParamGui.paddingVertical + px,
            "paddingBottom", ParamGui.paddingVertical + px);
        // close it initially?
        if (this.closeOnTop && this.closed) {
            this.closeButton.onClick();
        }
        // keyboard "h" open/closes (only root gui)
        this.hidden = false;
        if (this.hideable && (this.parent === null)) {
            KeyboardEvents.addFunction(function() {
                if (paramGui.hidden) {
                    paramGui.show();
                } else {
                    paramGui.hide();
                }
            }, "h");
        }
    };

    /**
     * hide the gui/folder. (makes it disappear)
     * note difference between root and folders
     * @method ParamGui#hide
     */
    ParamGui.prototype.hide = function() {
        if (this.parent === null) {
            // root, hide all
            DOM.style("#" + this.domElementId, "display", "none");
        } else {
            // folder, hide topDiv if exists, hide bodyDiv
            if ((this.closeOnTop) || (this.name !== "")) {
                DOM.style("#" + this.topDivId, "display", "none");
            }
            // see if we have to hide the body div in closed state
            if (this.closeOnTop) {
                DOM.style("#" + this.closedBodyDiv, "display", "none");
            }
            DOM.style("#" + this.bodyDivId, "display", "none");
        }
        this.hidden = true;
    };

    /**
     * show the gui/folder. (makes it reappear)
     * note difference between root and folders
     * show in correct open/closed state (body)
     * @method ParamGui#show
     */
    ParamGui.prototype.show = function() {
        if (this.parent === null) {
            // root, show all
            DOM.style("#" + this.domElementId, "display", "block");
        } else {
            // folder, show topDiv if exists, including the buttons
            if ((this.closeOnTop) || (this.name !== "")) {
                DOM.style("#" + this.topDivId, "display", "block");
            }
            if ((this.closeOnTop) && (this.closed)) {
                DOM.style("#" + this.closedBodyDivId, "display", "block");
            } else {
                DOM.style("#" + this.bodyDivId, "display", "block");
            }
        }
        this.hidden = false;
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
            this.openButton.element.style.display = "none";
            this.closeButton.element.style.display = "initial";
            DOM.style("#" + this.closedBodyDivId, "display", "none");
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
            this.openButton.element.style.display = "initial";
            this.closeButton.element.style.display = "none";
            DOM.style("#" + this.bodyDivId, "display", "none");
            if (!this.hidden) {
                DOM.style("#" + this.closedBodyDivId, "display", "block");
            }
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
     */
    ParamGui.prototype.remove = function(element) {
        for (var i = this.elements.length - 1; i >= 0; i--) {
            if (this.elements[i] === 5) {
                arr.splice(i, 1);
            }
        }
        element.destroy();
    };

    /**
     * remove a folder means destroying it and removing from the list of elements
     */




    /**
     * destroy everything
     * @method ParamGui#destroy
     */
    ParamGui.prototype.destroy = function() {
        console.log("destroy");
        // destroy the ui elements and folders
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].destroy();
            this.elements[i] = null;
        }
        this.elements.length = 0;
        // if exist destroy open/close buttons, and closedBodyDiv
        if (this.closeOnTop) {
            this.closeButton.destroy();
            this.closeButton = null;
            this.openButton.destroy();
            this.openButton = null;
            this.closedBodyDiv.remove();
            this.closedBodyDiv = null;
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
        }
    };


}());
