import {
    guiUtils,
    BooleanButton,
    Button,
    SelectValues,
    TextInput,
    ColorInput,
    ImageSelect,
    Popup,
    NumberButton,
    ParamGui,
    InstantHelp
} from "./modules.js";

// note: a line with several ui elements is similar to a folder
// it has its own design style with design.popupForNumberController=true

/**
 * a controller for a simple parameter
 * inside a given container, using given design
 * @creator ParamController
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div
 * @param {object} args - collection of arguments defining the controller
 */
export function ParamController(gui, domElement, args) {
    this.gui = gui;
    this.design = gui.design;
    const design = gui.design;
    this.domElement = domElement;
    const controller = this;
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;
    // put controller in list of elements (for destruction, popup controll,...)
    gui.elements.push(this);
    this.type = args.type;
    // see if we have a params object, then we might have a parameter to control and an initial value
    this.hasParameter = false;
    this.initialValue = 0;
    if (guiUtils.isObject(args.params)) {
        this.params = args.params;
        // now args.property should be a string as key to the params object
        if (guiUtils.isString(args.property)) {
            this.property = args.property;
            // for buttons, the parameter value might be undefined or a function, else it might be everything
            if (guiUtils.isDefined(this.params[this.property])) {
                this.hasParameter = true;
                this.initialValue = this.params[this.property];
            }
        } else {
            console.log("*** ParamController: args.property is not a string. It is " + args.property);
        }
    }
    // activate listening if we have a parameter and args.listening is true
    this.listening = this.hasParameter && guiUtils.check(args.listening);
    if (this.listening) {
        ParamGui.startListening(); // automatically update display
    }
    // use popup depending on args.usePopup and design.usePopup
    this.usePopup = guiUtils.check(args.usePopup, this.design.usePopup);
    // but we have not yet a popup. thus in any case
    this.hasPopup = false;
    this.callsClosePopup = false;

    /**
     * callback for changes
     * @method ParamController#callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    // get callback from different arguments. For a button it might be the (initial) parameter value
    // get label text, button is special: the property might be the button text but not the label text
    var labelText, buttonText;
    if (args.type === "button") {
        this.callback = guiUtils.check(args.onChange, args.onClick, this.initialValue, this.callback);
        this.hasParameter = false;
        labelText = guiUtils.check(args.labelText, "");
        buttonText = guiUtils.check(args.buttonText, this.property, "missing text");
    } else {
        this.callback = guiUtils.check(args.onChange, args.onClick, this.callback);
        // get initial value from args or from parameter value
        this.initialValue = guiUtils.check(args.initialValue, this.initialValue);
        labelText = guiUtils.check(args.labelText, this.property, "");
    }

    // create a label. If you want a space instead
    // the set labelText="" and adjust minLabelWidth, or change style
    this.label = document.createElement("span");
    this.label.style.fontSize = design.labelFontSize + "px";
    // minimum width for alignment of inputs
    this.label.style.display = "inline-block";


    this.label.style.minWidth = guiUtils.check(args.minLabelWidth, design.labelWidth) + "px";
    this.label.style.textAlign = design.labelTextAlign;
    // space between label and controller or left border
    this.label.style.paddingLeft = design.spaceWidth + "px";
    this.label.style.paddingRight = design.spaceWidth + "px";
    this.domElement.appendChild(this.label);
    this.label.textContent = labelText;

    switch (args.type) {
        case "selection":
            {
                const selectValues = new SelectValues(this.domElement);
                selectValues.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = selectValues;
                selectValues.addOptions(args.options);
                selectValues.setValue(this.initialValue);
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        case "boolean":
            {
                const button = new BooleanButton(this.domElement);
                button.setWidth(this.design.booleanButtonWidth);
                button.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = button;
                button.setValue(this.initialValue);
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        case "button":
            {
                const button = new Button(buttonText, this.domElement);
                button.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = button;
                button.onClick = function() {
                    controller.callback();
                };
                this.setValue = function() {};
                this.setValueOnly = function() {};
                this.getValue = function() {};
                this.updateDisplay = function() {};
                this.setupOnInteraction();
                break;
            }
        case "text":
            {
                const textInput = new TextInput(this.domElement);
                textInput.setWidth(this.design.textInputWidth);
                textInput.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                textInput.setValue(this.initialValue);
                this.uiElement = textInput;
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        case "number":
            {
                const button = new NumberButton(this.domElement);
                this.buttonContainer = false;
                button.setInputWidth(this.design.numberInputWidth);
                // separating space to additional elements
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                // set limits and step
                if (guiUtils.isNumber(args.min)) {
                    button.setLow(args.min);
                }
                if (guiUtils.isNumber(args.max)) {
                    button.setHigh(args.max);
                }
                if (guiUtils.isNumber(args.stepSize)) {
                    button.setStep(args.stepSize);
                } else {
                    button.setStep(NumberButton.findStep(this.initialValue));
                }
                button.setValue(this.initialValue);
                this.uiElement = button;
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        case "color":
            {
                const hasAlpha = ColorInput.hasAlpha(this.initialValue);
                const colorInput = new ColorInput(this.domElement, hasAlpha);
                colorInput.setWidths(this.design.colorTextWidth, this.design.colorColorWidth, this.design.colorRangeWidth);
                colorInput.setValue(this.initialValue);
                colorInput.setFontSize(this.design.buttonFontSize);
                this.uiElement = colorInput;
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        case "image":
            {
                this.label.style.verticalAlign = "middle";
                // the input elements in the main UI (not the popup)
                // stacking vertically
                const selectDiv = document.createElement("div");
                selectDiv.style.display = "inline-block";
                selectDiv.style.verticalAlign = "middle";
                selectDiv.style.textAlign = "center";
                this.domElement.appendChild(selectDiv);
                const imageSelect = new ImageSelect(selectDiv, this.design);
                // manage the popup: attention, it is a field of the uiElement object
                this.hasPopup = true;

                this.closePopup = function() {
                    if (!this.callsClosePopup) {
                        this.uiElement.closePopup();
                    }
                };
                // if user images can be loaded, then add a vertical space and a button
                if (this.design.acceptUserImages) {
                    // the user image input button
                    const vSpace = document.createElement("div");
                    vSpace.style.height = this.design.spaceWidth + "px";
                    selectDiv.appendChild(vSpace);
                    imageSelect.acceptUserImages(selectDiv);
                }
                // add the gui image
                guiUtils.hSpace(this.domElement, this.design.spaceWidth);
                imageSelect.createGuiImage(this.domElement);
                imageSelect.addChoices(args.options);
                imageSelect.setValue(this.initialValue);
                this.uiElement = imageSelect;
                this.setupOnChange();
                this.setupOnInteraction();
                break;
            }
        default:
            const message = document.createElement("span");
            message.innerText = 'problem with type: "' + args.type + '"';
            message.style.fontSize = this.design.titleFontSize + "px";
            this.domElement.appendChild(message);
            break;
    }

    // maybe change the minimum element width
    if (guiUtils.isNumber(args.minElementWidth)) {
        this.uiElement.setMinWidth(args.minElementWidth);
    }
}

/**
 * close popup function: does nothing if there is no popup
 * leave popup open if this controller called it
 * @method ParamController#closePopup
 */
ParamController.prototype.closePopup = function() {
    if (this.hasPopup && !this.callsClosePopup) {
        if (this.type === "image") {
            this.uiElement.closePopup();
        } else {
            this.popup.close();
        }
    }
};

/**
 * setup the onInteraction function of the ui element:
 * calling the ParamGui#closePopup method
 * open popup if there is one
 * adjust top of popup if it is part of the controller object
 * @method ParamController#setupOnInteraction
 */
ParamController.prototype.setupOnInteraction = function() {
    const controller = this;
    this.uiElement.onInteraction = function() {
        if (controller.hasPopup) {
            if (controller.popup && !controller.popup.isOpen()) {
                controller.popup.open();
                const topPosition = guiUtils.topPosition(controller.domElement);
                controller.popup.setTopPosition(topPosition - controller.design.paddingVertical);
            }
            controller.callsClosePopup = true;
            ParamGui.closePopups();
            controller.callsClosePopup = false;
        } else {
            ParamGui.closePopups();
        }
    };
};

/**
 * connect the ui controller with the param object:
 * sets the onChange function of the ui element
 * onChange sets the param[property] value if param and property are defined
 * (synchronizes ui display and data object)
 * basic functionality, redefine element.onChange for complicated controllers
 * @method ParamController#setupOnChange
 */
ParamController.prototype.setupOnChange = function() {
    const element = this.uiElement;
    const controller = this;
    // element.onChange gets called only if the value changes
    element.onChange = function() {
        const value = element.getValue();
        if (this.hasParameter) {
            this.params[this.property] = value;
        }
        controller.callback(value);
    };
};

/**
 * add another controller to the domElement of this controller
 * @method ParamController#add
 * @param {Object} theParams - object that has the parameter as a field, or an object with all information for the controller
 * @param {String} theProperty - key for the field of params to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */
ParamController.prototype.add = function(theParams, theProperty, low, high, step) {
    var args;
    if (arguments.length === 1) {
        args = theParams; // the new version
    } else {
        args = ParamGui.createArgs(theParams, theProperty, low, high, step);
    }
    const controller = new ParamController(this.gui, this.domElement, args);
    return controller;
};

/**
 * add a controller for color, datGui.js style parameters
 * @method ParamGui#addColor
 * @param {Object} theParams - object that has the parameter as a field, or args object that has all data
 * @param {String} theProperty - key for the field of params to change, theParams[theProperty]
 * @return {ParamController} object
 */
ParamController.prototype.addColor = function(theParams, theProperty) {
    var args;
    if (arguments.length === 1) {
        args = theParams; // the new version
    } else {
        console.log("generating an args object from old-style parameters");
        args = {
            params: theParams,
            property: theProperty,
            type: "color"
        };
        args.type = "color";
        console.log(args);
    }
    return this.add(args);
};

/**
 * add a help alert
 * @method ParamController#addHelp
 * @param {String} message - with html markup
 * @return this, for chaining
 */
ParamController.prototype.addHelp = function(message) {
    this.helpButton = new InstantHelp(message, this.domElement);
    this.helpButton.setFontSize(this.design.buttonFontSize);
    return this;
};

// setting and getting values. Be careful if a params object exists
//===========================================
// Two different values, of the ui and the object.
// they have to be synchronized
// different values: use the ui value, change the object value
// if the value of the param object changes, then update the object via callback

/**
 * updates display and set the value of the param object if it exists
 * DOES NOT call the callback()
 * (good for multiple parameter changes, use callback only at last change
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * Can we assume that the param object is synchronized with its data? Is this probable? Can we save work?
 * @method ParamController#setValue
 * @param {whatever} value
 */
ParamController.prototype.setValueOnly = function(value) {
    if (this.hasParameter) {
        this.params[this.property] = value;
    }
    this.uiElement.setValue(value);
};

/**
 * set the value of the controller
 * set the value of the param object (if exists) and call the callback to enforce synchronization
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * @method ParamController#setValue
 * @param {whatever} value
 */
ParamController.prototype.setValue = function(value) {
    this.setValueOnly();
    this.callback(value);
};

/**
 * get the value of the controller
 * (should be the same as the value for the param object
 * the param object should be updated to reflect the value
 * @method ParamController#getValue
 * @return {whatever} value
 */
ParamController.prototype.getValue = function() {
    return this.uiElement.getValue();
};

/**
 * set the value of the display (controller) according to the actual value of the parameter in the params object
 * if params exist, else do nothing
 * @method ParamController#updateDisplay
 */
ParamController.prototype.updateDisplay = function() {
    if (this.hasParameter) {
        const value = this.params[this.property];
        this.uiElement.setValue(value);
    }
};

/**
 * updateDisplay If controller is Listening
 * happens even if parameter value has not changed, as this requires not much work
 * @method ParamController#updateDisplayIfListening
 */
ParamController.prototype.updateDisplayIfListening = function() {
    if (this.listening) {
        this.updateDisplay();
    }
};

/**
 * periodically call updateDisplay to show changes automatically
 * because of dat.gui api
 * @method ParamController#listen
 * @return this, for chaining
 */
ParamController.prototype.listen = function() {
    this.listening = true;
    ParamGui.startListening();
    return this;
};

/**
 * make the controller disappear including its space (display==none)
 * @method ParamController#hide
 * @return this
 */
ParamController.prototype.hide = function() {
    this.domElement.style.display = "none";
    return this;
};

/**
 * make the controller visible including its space (display==initial)
 * @method ParamController#show
 * @return this
 */
ParamController.prototype.show = function() {
    this.domElement.style.display = "block";
    return this;
};

// for compatibility with datGui
// dublicates things you can do with the args object
//========================================================

/**
 * changes the label text, instead of the property string, to show something more interesting
 * for buttons: changes the button text
 * does nothing if there is no label
 * same as datGui
 * @method ParamController#name
 * @param {String} label
 * @return this, for chaining
 */
ParamController.prototype.name = function(label) {
    if (this.type === "button") {
        this.uiElement.setText(label);
    } else if (this.label) {
        this.label.textContent = label;
    }
    return this;
};

/**
 * set the callback function for onchange events
 * this is DIFFERENT to my usual definition to be compatible with dat.gui
 * @method ParamController#onChange
 * @param {function} callback - function(value), with value of controller as argument
 * @return this
 */
ParamController.prototype.onChange = function(callback) {
    this.callback = callback;
    return this;
};

/**
 * set the callback function for onclick events
 * (same as onChange)
 * @method ParamController#onClick
 * @param {function} callback - function()
 * @return this
 */
ParamController.prototype.onClick = ParamController.prototype.onChange;

/**
 * set the callback function for onchange events
 * will be called for any input changes
 * same as onChange
 * this is here for compatibility to datGui
 * @method ParamController#onFinishChange
 * @param {function} callback - function(value), with value of controller as argument
 * @return this
 */

ParamController.prototype.onFinishChange = function(callback) {
    this.callback = callback;
    return this;
};

// to control the appearance 
//===============================================0

/**
 * layout: add a space
 * @method ParamController#hSpace
 * @param {number} width
 * @return this
 */
ParamController.prototype.hSpace = function(width) {
    guiUtils.hSpace(this.domElement, width);
    return this;
};

/**
 * register parent domElement in guiUtils for styling
 * see docu of guiUtils.style
 * use: controller.style().backgroundColor("red")
 * @method ParamController#style
 * @return guiUtils
 */
ParamController.prototype.style = function() {
    return guiUtils.style(this.parent);
};

/**
 * for buttons only, changes the button text
 * same as datGui
 * @method ParamController#setButtonText
 * @param {String} label
 * @return this, for chaining
 */
ParamController.prototype.setButtonText = function(label) {
    if (this.type === "button") {
        this.uiElement.setText(label);
    }
    return this;
};

/**
 * changes the label text, instead of property name, to show something more interesting
 * for buttons: changes label (starts as empty string)
 * @method ParamController#setLabelText
 * @param {String} label
 * @return this, for chaining
 */
ParamController.prototype.setLabelText = function(label) {
    if (this.label) {
        this.label.textContent = label;
    }
    return this;
};

/**
 * delete the label, including its space
 * @method ParamController#deleteLabel
 * @return this, for chaining
 */
ParamController.prototype.deleteLabel = function() {
    if (this.label) {
        this.label.remove();
        this.label = false;
    }
    return this;
};

/**
 * set a minimum width for label
 * @method ParamController#setMinLabelWidth
 * @param {int} width
 * @return this, for chaining
 */
ParamController.prototype.setMinLabelWidth = function(width) {
    if (this.label) {
        this.label.style.minWidth = width + "px";
    }
    return this;
};

/**
 * set a minimum width for the main ui element
 * @method ParamController#setMinElementWidth
 * @param {int} width
 * @return this, for chaining
 */
ParamController.prototype.setMinElementWidth = function(width) {
    this.uiElement.setMinWidth(width);
    return this;
};

// for the number controller
//===================================================

// special parameters for these popups, not specified in paramGui
ParamController.popupDesign = {
    popupBorderRadius: 0,
    popupShadowWidth: 0,
    popupShadowBlur: 0,
    popupInnerWidth: 0
};

/**
 * setup the buttonContainer for additional buttons if it does not exist
 * either the domElement or create a popup and use the contentdiv
 * if popup is created, then modify the element.onInteraction method to open/close popup 
 * (this method is called after the standard setupOnInteraction method)
 * @method ParamController#setupButtonContainer
 */
ParamController.prototype.setupButtonContainer = function() {
    if (!this.buttonContainer) {
        if (this.usePopup) {
            this.popup = new Popup(this.design, ParamController.popupDesign);
            this.popup.addCloseButton();
            this.popup.contentDiv.style.backgroundColor = this.design.backgroundColor;
            this.popup.close();
            this.hasPopup = true;
            this.buttonContainer = this.popup.contentDiv;
        } else {
            this.buttonContainer = this.domElement;
        }
    }
};

/**
 * make an add button
 * @method ParamController#createAddButton
 * @param {string} text
 * @param {number} amount
 * @return this controller
 */
ParamController.prototype.createAddButton = function(text, amount) {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createAddButton(text, this.buttonContainer, amount);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * make plus and minus 1 buttons
 * @method ParamController#createPlusMinusButtons
 * @param {number} amount - default is 1
 * @return this controller
 */
ParamController.prototype.createPlusMinusButtons = function(amount = 1) {
    this.createAddButton("-" + amount, -amount);
    this.createAddButton("+" + amount, amount);
    return this;
};

/**
 * make an multiplication button
 * @method ParamController#createMulButton
 * @param {string} text
 * @param {number} amount
 * @return this controller
 */
ParamController.prototype.createMulButton = function(text, amount) {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createMulButton(text, this.buttonContainer, amount);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * make multiply and divide by 2 buttons
 * @method ParamController#createMulDivButtons
 * @param {number} factor - default is 2
 * @return this controller
 */
ParamController.prototype.createMulDivButtons = function(factor = 2) {
    this.createMulButton("/ " + factor, 1 / factor);
    this.createMulButton("* " + factor, factor);
    return this;
};

/**
 * create a button that sets the minimum value
 * @method ParamController#createMiniButton
 * @return this - the controller
 */
ParamController.prototype.createMiniButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createMiniButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a button that sets the maximum value
 * @method ParamController#createMaxiButton
 * @return this - the controller
 */
ParamController.prototype.createMaxiButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createMaxiButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * make min and max buttons
 * @method ParamController#createMaxMinButtons
 * @return this controller
 */
ParamController.prototype.createMaxMinButtons = function() {
    this.createMiniButton();
    this.createMaxiButton();
    return this;
};

/**
 * create a button that moves cursor to the left
 * @method ParamController#createLeftButton
 * @return this - the controller
 */
ParamController.prototype.createLeftButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createLeftButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a button that moves cursor to the right
 * @method ParamController#createRightButton
 * @return this - the controller
 */
ParamController.prototype.createRightButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createRightButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a button that decreases value at cursor
 * @method ParamController#createDecButton
 * @return this - the controller
 */
ParamController.prototype.createDecButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createDecButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a button that increases value at cursor
 * @method ParamController#createIncButton
 * @return this - the controller
 */
ParamController.prototype.createIncButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createIncButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create the leftDownUpRight buttons
 * @method ParamController#createLeftDownUpRightButtons
 * @return this - the controller
 */
ParamController.prototype.createLeftDownUpRightButtons = function() {
    this.createLeftButton();
    this.createDecButton();
    this.createIncButton();
    this.createRightButton();
    return this;
};

/**
 * create a button with a suggested value
 * @method ParamController#createSuggestButton
 * @param {number} value
 * @return this - the controller
 */
ParamController.prototype.createSuggestButton = function(value) {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createSuggestButton(this.buttonContainer, value);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a range element of short length
 * @method ParamController#createSmallRange
 * @return this - the controller
 */
ParamController.prototype.createSmallRange = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createRange(this.buttonContainer);
        this.uiElement.setRangeWidth(this.design.rangeSliderLengthShort);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    }
};

/**
 * create a range element of long length
 * @method ParamController#createLongRange
 * @return this - the controller
 */
ParamController.prototype.createLongRange = function() {
    if (this.type === "number") {
        this.createSmallRange();
        this.uiElement.setRangeWidth(this.design.rangeSliderLengthLong);
        return this;
    }
};

/**
 * create a range element of very long length
 * @method ParamController#createVeryLongRange
 * @return this - the controller
 */
ParamController.prototype.createVeryLongRange = function() {
    if (this.type === "number") {
        this.createSmallRange();
        this.uiElement.setRangeWidth(this.design.rangeSliderLengthVeryLong);
        return this;
    }
};

/**
 * make that the number input is cyclic 
 * @method ParamController#cyclic
 * @return this - for chaining
 */
ParamController.prototype.cyclic = function() {
    if (this.type === "number") {
        this.uiElement.setCyclic();
        return this;
    }
};

/**
 * activate indicator in the main element (this.domElement)
 * @method ParamController#createIndicatorMain
 */
ParamController.prototype.createIndicatorMain = function() {
    this.uiElement.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
    this.uiElement.setIndicatorElement(this.domElement);
    return this;
};

/**
 * activate indicator in the popup element (if exists, else in main element)
 * @method ParamController#createIndicatorPopup
 */
ParamController.prototype.createIndicator = function() {
    this.setupButtonContainer();
    this.uiElement.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
    this.uiElement.setIndicatorElement(this.buttonContainer);
    return this;
};

/**
 * destroy the controller, and the containing dom element
 * @method ParamController#destroy
 */
ParamController.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
    this.uiElement.destroy(); // destroyes the additional secondary buttons and the range too
    this.uiElement = null;
    if (this.label) {
        this.label.remove();
        this.label = null;
    }
    if (this.popup) {
        this.popup.destroy();
        this.popup = null;
    }
    if (this.domElement) { // domElement might have been removed by another secondary element
        this.domElement.remove();
        this.domElement = null;
    }
    this.buttonContainer = null;
    this.params = null;
    this.callback = null;
};

/**
 * same as destroy, but is in dat.gui api
 * @method ParamController.remove
 */
ParamController.prototype.remove = ParamController.prototype.destroy;
