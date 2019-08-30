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
 */
ParamGui = function() {
    this.setup();
};

(function() {
    "use strict";

    const px = "px";

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
    ParamGui.width = 350;
    //ui spacing from border
    ParamGui.padding = 8;
    // the vertical white space between elements on different lines
    ParamGui.vSpace = 7;
    // (minimum) spacing between baseline of different elements
    ParamGui.vSpacing = 20;
    // alignment: tab (minimal width) for writing the key strings
    ParamGui.textTabWidth = 100;
    // width of border around ui panel
    ParamGui.borderWidth = 3; // set to zero to make border disappear
    // width for buttons showing numbers
    ParamGui.numberButtonWidth = 50;
    // width (length) of the range slider
    ParamGui.rangeWidth = 150;
    // vertical offset for the range sliders, to make them aligned
    ParamGui.rangeVOffset = 4;
    // font size for labels, ...
    ParamGui.textFontSize = 16;
    // font size for text in buttons
    ParamGui.buttonFontSize = 14;
    // size of the checkbox
    ParamGui.checkboxSize = 20;
    // vertical offset to align checkbox
    ParamGui.checkboxVOffset = 4;
    // colors
    // background of the ui panel
    ParamGui.backgroundColor = "#ffffff";
    // color for text
    ParamGui.textColor = "#444444";
    // color for the border of the ui panel
    ParamGui.borderColor = "#777777";
    // number button, default maximum value for numbers
    ParamGui.defaultMaxNumber = 1000;

    // setting the styles
    function styleDiv(id) {
        const fullId = "#" + id;
        const px = "px";
        const px0 = "0px";
        DOM.style(fullId, "zIndex", "10", "position", "fixed", ParamGui.verticalPosition, px0, ParamGui.horizontalPosition, px0);
        DOM.style(fullId, "width", ParamGui.width + px, "padding", ParamGui.padding + px);
        DOM.style(fullId, "maxHeight", (window.innerHeight - 2 * ParamGui.borderWidth - 2 * ParamGui.padding) + px, "overflow", "auto");
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
        DOM.style("#" + buttonId, "font-size", ParamGui.buttonFontSize + px);
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

        // space between
        const theHDiv = this.create("div");
        DOM.style("#" + theHDiv, "height", (ParamGui.padding - ParamGui.vSpace) + px);
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

    /**
     * setting the callback function of a uiElement with a uiElement.callback field
     * return this object after creating a uiElement
     * setCallback.uiElement=createdElement;
     * @object setCallback
     */
    const setCallback = {};
    setCallback.uiElement = null;

    /**
     * method for setting the callback for numberbutton, range, select
     * @method setCallback.onChange
     * @param {function} callback
     */
    setCallback.onChange = function(callback) {
        if (setCallback.uiElement != null) {
            setCallback.uiElement.callback = callback;
        } else {
            console.log("setCallback: uiElement is null!");
        }
    };

    /**
     * create an html element,return id
     * @function ParamGui#create
     * @param {String} tag
     * @param {String} text - inner text, optional
     * @return String, id of the element
     */
    ParamGui.prototype.create = function(tag, text) {
        const id = DOM.createId();
        if (arguments.length > 1) {
            DOM.create(tag, id, "#" + this.uiId, text);
        } else {
            DOM.create(tag, id, "#" + this.uiId);
        }
        return id;
    };

    /**
     * put a break in the ui
     * @method ParamGui#break
     */
    ParamGui.prototype.break = function() {
        this.create("br");
    };

    /**
     * create a verticl space in the ui
     * amount defined in ParamGui.vSpace
     * @method ParamGui#vSpace
     */
    ParamGui.prototype.vSpace = function() {
        const theDiv = this.create("div");
        DOM.style("#" + theDiv, "height", ParamGui.vSpace + px);
    };

    /**
     * put a horizontal spce in the ui
     * @method ParamGui#hSpace
     */
    ParamGui.prototype.hSpace = function() {
        DOM.addSpace(this.uiId);
    };

    /**
     * create a text with minimal width in the ui (text with tab)
     * minimum amount defined in ParamGui.textTab
     * @method ParamGui#textTab
     * @param {String} text
     */
    ParamGui.prototype.textTab = function(text) {
        const theSpan = this.create("span", text);
        DOM.style("#" + theSpan, "minWidth", ParamGui.textTabWidth + px, "display", "inline-block", "font-size", ParamGui.textFontSize + px);
    };

    /**
     * create a checkbox in the ui
     * @method ParamGui#checkbox
     * @param {function} action (callback, optional)
     * @return Checkbox
     */
    ParamGui.prototype.checkbox = function(action) {
        const id = this.create("input");
        const checkbox = new Checkbox(id);
        //        DOM.style("#" + checkbox.idName, "width", ParamGui.checkboxSize + px, "height", ParamGui.checkboxSize + px);
        //    DOM.style("#" + checkbox.idName, "position", "relative", "top", ParamGui.checkboxVOffset + px);
        if (arguments.length > 0) {
            checkbox.onChange = action;
        }
        this.uiElements.push(checkbox);
        return checkbox;
    };

    /**
     * create a button in the ui
     * @method ParamGui#button
     * @param {String} text
     * @param {function} action (callback, optional)
     * @return Button
     */
    ParamGui.prototype.button = function(text, action) {
        const id = this.create("button", text);
        const button = new Button(id);
        DOM.style("#" + button.idName, "font-size", ParamGui.buttonFontSize + px);
        if (arguments.length > 1) {
            button.onClick = action;
        }
        this.uiElements.push(button);
        return button;
    };

    /**
     * create a finite number button in the ui, in a span
     * formatting?
     * @method ParamGui#numberButton
     * @param {function} action (callback, optional)
     * @return NumberButton
     */
    ParamGui.prototype.numberButton = function(action) {
        const id = this.create("span");
        const button = NumberButton.create(id);
        DOM.style("#" + button.idName, "width", ParamGui.numberButtonWidth + px);
        DOM.style("#" + button.idName, "font-size", ParamGui.buttonFontSize + px);
        if (button.idPlus) {
            DOM.style("#" + button.idPlus, "font-size", ParamGui.buttonFontSize + px);
        }
        if (button.idMinus) {
            DOM.style("#" + button.idMinus, "font-size", ParamGui.buttonFontSize + px);
        }
        if (button.idInfinity) {
            DOM.style("#" + button.idInfinity, "font-size", ParamGui.buttonFontSize + px);
        }
        if (arguments.length > 0) {
            button.onChange = action;
        }
        this.uiElements.push(button);
        return button;
    };

    /**
     * create an "infinite" number button in the ui, in a span
     * formatting?
     * @method ParamGui#infinityNumberButton
     * @param {function} action (callback, optional)
     * @return NumberButton
     */
    ParamGui.prototype.infinityNumberButton = function(action) {
        const id = this.create("span");
        const button = NumberButton.createInfinity(id);
        DOM.style("#" + button.idName, "width", ParamGui.numberButtonWidth + px, "font-size", ParamGui.buttonFontSize + px);
        if (arguments.length > 0) {
            button.onChange = action;
        }
        this.uiElements.push(button);
        return button;
    };

    /**
     * create an range thing in the ui, in a span
     * formatting?
     * @method ParamGui#range
     * @param {function} action (callback, optional)
     * @return Range
     */
    ParamGui.prototype.range = function(action) {
        const id = this.create("span");
        const range = Range.create(id);
        DOM.style("#" + range.idText, "width", ParamGui.numberButtonWidth + px, "font-size", ParamGui.buttonFontSize + px);
        DOM.style("#" + range.idRange, "width", ParamGui.rangeWidth + px, "position", "relative", "top", ParamGui.rangeVOffset + px);
        if (arguments.length > 0) {
            range.onChange = action;
        }
        this.uiElements.push(range);
        return range;
    };

    /**
     * create an select thing in the ui, in a span
     * formatting?
     * @method ParamGui#select
     * @return Button
     */
    ParamGui.prototype.select = function() {
        const id = this.create("select");
        DOM.style("#" + id, "font-size", ParamGui.buttonFontSize + px);
        const select = new Select(id);
        this.uiElements.push(select);
        return select;
    };

    // freaking grunt
    function makeSelectOptionAction(select, params, key, option) {
        const action = function() {
            params[key] = option;
            select.callback();
        };
        return action;
    }

    /**
     * adding a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * params is an object that contains data as fields
     * key is a String, the key to the field of params we want to change
     * the value of params[key] determines the kind of uiElement together with
     * parameters that define the values/ value range possible
     * if the third parameter is an array or an object then this defines a selection ui element for all values of params[key]
     * else
     * if params[key] is boolean we get a checkbox
     * @method ParamGui#add 
     * @param {object} params - an object with fields taking parameter values
     * @param {String} key - id of the params field that the ui element changes, or button text
     * @param {float/integer/array} low - determines lower limit/choices (optional)
     * @param {float/integer} high - determines upper limit (optional)
     * @param {float/integer} step - determines step size (optional)
     * @return setCallback - as defined above
     */
    ParamGui.prototype.add = function(params, key, low, high, step) {
        setCallback.uiElement = null;
        // everything in a div
        const elementDivId = DOM.createId();
        DOM.create("div", elementDivId, "#" + this.uiId);
        DOM.style("#" + elementDivId, "minHeight", ParamGui.vSpacing + px);
        DOM.style("#" + elementDivId, "backgroundColor", "yellow");
        DOM.style("#" + elementDivId, "borderColor", "black", "borderWidth", "1px", "borderStyle", "solid");




        return setCallback;
    };


}());
