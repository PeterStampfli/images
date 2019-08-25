/**
 * emulator of  https://github.com/dataarts/dat.gui
 * simply use: "dat.GUI=ParamGui;" to switch from old gui to new one
 * 
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
 */
ParamGui = function() {
    this.setup();
    console.log("setup");
};


(function() {
    "use strict";


    // add some defaults, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program
    // position (at corners)
    ParamGui.zIndex = 5; // z-index for ui divs, to keep them above others
    // position in corners, default top right
    ParamGui.verticalPosition = "top";
    ParamGui.horizontalPosition = "right";
    // dimensions, in terms of pixels, if they should scale with window
    // then change these fieldsn in a resize function
    ParamGui.width = 200;
    ParamGui.padding = 5;
    ParamGui.borderWidth = 3; // set to zero to make border disappear
    // colors
    ParamGui.backgroundColor = "#ffffff";
    ParamGui.textColor = "#444444";
    ParamGui.borderColor = "#777777";


    // setting the styles
    function styleDiv(id) {
        const fullId = "#" + id;
        const px = "px";
        const px0 = "0px";
        DOM.style(fullId, "zIndex", "10", "position", "fixed", ParamGui.verticalPosition, px0, ParamGui.horizontalPosition, px0);
        DOM.style(fullId, "width", ParamGui.width + px, "padding", ParamGui.padding + px);
        DOM.style(fullId, "backgroundColor", ParamGui.backgroundColor, "color", ParamGui.textColor);
        DOM.style(fullId, "borderWidth", ParamGui.borderWidth + px, "borderStyle", "solid", "borderColor", ParamGui.borderColor);
    }

    // creating a centered html button inside a container div 
    // returns the button id
    function createCenteredButton(parentId, text) {
        const divId = DOM.createId();
        const buttonId = DOM.createId();
        DOM.create("div", divId, "#" + parentId);
        DOM.style("#" + divId, "textAlign", "center");
        DOM.create("button", buttonId, "#" + divId, text);
        return buttonId;
    }

    // setup for a new ParamGui instance
    ParamGui.prototype.setup = function() {
        // a list of ui elements for destruction
        this.uiElements = [];
        const paramGui = this;
        // setting up the ui div with button to hide
        this.uiId = DOM.createId();
        this.ui = DOM.create("div", this.uiId, "body");
        styleDiv(this.uiId);
        const hideButtonId = createCenteredButton(this.uiId, "hide controls");
        const hideButton = new Button(hideButtonId);
        this.uiElements.push(hideButton);
        hideButton.onClick = function() {
            DOM.displayNone(paramGui.uiId);
            DOM.display(paramGui.handleId);
        };
        // setting up the handle div with button to show the ui
        this.handleId = DOM.createId();
        this.handle = DOM.create("div", this.handleId, "body");
        styleDiv(this.handleId);
        DOM.displayNone(this.handleId);
        const showButtonId = createCenteredButton(this.handleId, "show controls");
        const showButton = new Button(showButtonId);
        this.uiElements.push(showButton);
        showButton.onClick = function() {
            DOM.display(paramGui.uiId);
            DOM.displayNone(paramGui.handleId);
        };
    };



    /**
     * destroy the gui, taking care of referencies
     * trying to avoid memory leaks
     * @method ParamGui#destroy
     */
    ParamGui.prototype.destroy = function() {
        for (var i = 0; i < this.uiElements.length; i++) {
            this.uiElements[i].destroy();
            this.uiElements[i] = null;
        }
        this.uiElements.length = 0;
        this.ui.remove();
        this.ui = null;
        this.handle.remove();
        this.handle = null;
    };


}());
