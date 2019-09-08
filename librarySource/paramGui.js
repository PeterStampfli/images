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
            DOM.create("div", this.topDivId, "#" + this.domElementId);
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
            DOM.style("#" + this.bodyDivId, "display", "none");
        }
        this.hidden = true;
    };

    /**
     * show the gui/folder. (makes it reappear)
     * note difference between root and folders
     * @method ParamGui#show
     */
    ParamGui.prototype.show = function() {
        if (this.parent === null) {
            // root, hide all
            DOM.style("#" + this.domElementId, "display", "block");
        } else {
            // folder, show topDiv if exists, show bodyDiv
            if ((this.closeOnTop) || (this.name !== "")) {
                DOM.style("#" + this.topDivId, "display", "block");
            }
            DOM.style("#" + this.bodyDivId, "display", "block");
        }
        this.hidden = false;
    };

    /**
     * open the body of a gui 
     * only if there are open/close buttons
     * @method ParamGui#open
     */
    ParamGui.prototype.open = function() {
        if (this.closeOnTop) {
            this.closed = false;
            this.openButton.element.style.display = "none";
            this.closeButton.element.style.display = "initial";
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
            this.closed = false;
            this.openButton.element.style.display = "initial";
            this.closeButton.element.style.display = "none";
            DOM.style("#" + this.bodyDivId, "display", "none");
        }
    };



}());
