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
 * closeOnTop - boolean - make a titlebar with show/hide button - default: false
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
        console.log(keys);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = params[keys[i]];
            console.log(this[keys[i]]);
        }
    }
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
    // color for top of folder with hide/show button
    ParamGui.folderTopColor = "#000000";
    ParamGui.folderTopBackgroundColor = "#bbbbbb";

    ParamGui.prototype.setup = function() {
        if (this.parent === null) {
            // the root element has to generate a div as containing DOMElement
            console.log("generate div");
            this.containerId = DOM.createId();
            this.container = DOM.create("div", this.containerId, "body");
            // put it on top
            DOM.style("#" + this.containerId, "zIndex", "" + ParamGui.zIndex);
            if (this.autoPlace) { // autoplacing into a corner
                DOM.style("#" + this.containerId,
                    "position", "fixed", ParamGui.verticalPosition, px0,
                    ParamGui.horizontalPosition, px0);
            }
            // width, no padding, define spacing on elements
            DOM.style("#" + this.containerId,
                "width", ParamGui.width + px,
                "maxHeight", (window.innerHeight - 2 * ParamGui.borderWidth) + px,
                "overflowY", "auto", "overflowX", "hidden");
            DOM.style("#" + this.containerId,
                "borderWidth", ParamGui.borderWidth + px,
                "borderStyle", "solid",
                "borderColor", ParamGui.borderColor,
                "backgroundColor", ParamGui.backgroundColor);
        } else {
            // folders have the parent div as container
            this.containerId = this.parent.domElementId;
            this.container = this.parent.domElement;
        }
        if (this.closeOnTop) {
            // create divs with show/hide buttons
            console.log("closeOnTop");
            this.topDivId = DOM.createId();
            DOM.create("div", this.topDivId, "#" + this.containerId);

            DOM.style("#" + this.topDivId,
                "backgroundColor", ParamGui.folderTopBackgroundColor,
                "color", ParamGui.folderTopColor,
                "width", ParamGui.width + px,
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


            const hideButtonElementId = DOM.createId();

            const hideButtonElement = DOM.create("button", hideButtonElementId, "#" + this.topDivId, "hide");
            const showButtonElementId = DOM.createId();

            const showButtonElement = DOM.create("button", showButtonElementId, "#" + this.topDivId, "show");

            DOM.style("#" + hideButtonElementId + ",#" + showButtonElementId,
                "font-size", ParamGui.buttonFontSize + px);

            this.hideButton = new Button(hideButtonElementId);
            this.showButton = new Button(showButtonElementId);
        }

        // the ui elements go into their own div, this.domElement


        this.domElementId = DOM.createId();
        this.domElement = DOM.create("div", this.domElementId, "#" + this.containerId);
        DOM.style("#" + this.domElementId,
            "width", ParamGui.width + px,
            "paddingTop", ParamGui.paddingVertical + px,
            "paddingBottom", ParamGui.paddingVertical + px);

    };
}());
