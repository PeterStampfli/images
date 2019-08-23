/**
 * emulator of  https://github.com/dataarts/dat.gui
 * simply use: "dat=newDat;" to switch from old gui to new one
 * 
 * @namespace newDat
 */

/* jshint esversion:6 */

newDat = {};

// add some defaults, especially styles


(function() {
    "use strict";
    // styles, change the values of these fields if you do not like them
    // do changes in your program
    // position (at corners)
    newDat.zIndex = 5; // z-index for ui divs, to keep them above others
    newDat.verticalPosition = "top";
    newDat.horizontalPosition = "right";
    // dimension, with respect to windowWidth
    newDat.widthFraction = 0.3;
    newDat.marginFraction = 0.01;
    // colors
    newDat.backgroundColor = "#ffffff";
    newDat.textColor = "#444444";
    newDat.borderColor = "#777777";
    // maybe no border is better - set false
    newDat.hasBorder = true;

}());


(function() {
    "use strict";

    /**
     * this is the actual ui
     * @class newDat.GUI
     */

    // setting the styles
    function style(id) {
        const fullId = "#" + id;
        const px = "px";
        const px0 = "0px";
        const windowWidth = window.innerWidth;
        DOM.style(fullId, "zIndex", "10", "position", "fixed", newDat.verticalPosition, px0, newDat.horizontalPosition, px0);
        DOM.style(fullId, "width", windowWidth * newDat.widthFraction + px, "padding", windowWidth * newDat.marginFraction + px);
        DOM.style(fullId, "backgroundColor", newDat.backgroundColor, "color", newDat.textColor);
        if (newDat.hasBorder) {
            DOM.style(fullId, "borderStyle", "solid", "borderColor", newDat.borderColor);
        }
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

    /**
     * creating an empty div to show the controls
     * hiding and showing the controls
     * @creator newDat.GUI
     */
    newDat.GUI = function() {
        // a list of ui elements for destruction
        this.uiElements = [];
        const thisGui = this;
        // setting up the ui div with button to hide
        this.uiId = DOM.createId();
        this.ui = DOM.create("div", this.uiId, "body");
        style(this.uiId);
        const hideButtonId = createCenteredButton(this.uiId, "hide controls");
        const hideButton = new Button(hideButtonId);
        this.uiElements.push(hideButton);
        hideButton.onClick = function() {
            DOM.displayNone(thisGui.uiId);
            DOM.display(thisGui.handleId);
        };
        // setting up the handle div with button to show the ui
        this.handleId = DOM.createId();
        this.handle = DOM.create("div", this.handleId, "body");
        style(this.handleId);
        DOM.displayNone(this.handleId);
        const showButtonId = createCenteredButton(this.handleId, "show controls");
        const showButton = new Button(showButtonId);
        this.uiElements.push(showButton);
        showButton.onClick = function() {
            DOM.display(thisGui.uiId);
            DOM.displayNone(thisGui.handleId);
        };


    };

    /**
     * destroy the gui, taking care of referencies
     * trying to avoid memory leaks
     * @method newDat.GUI#destroy
     */
    newDat.GUI.prototype.destroy = function() {
        this.uiElements.forEach(function(element) {
            element.destroy();
        });
        this.ui.remove();
        this.handle.remove();
    };


}());
