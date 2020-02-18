import {
    guiUtils,
    paramControllerMethods,
    BooleanButton,
    Button,
    SelectValues,
    TextInput,
    ColorInput,
    ImageSelect,
    Popup,
    NumberButton,
    ParamGui,
    InstantHelp,
    NUMBER,
    TEXT,
    SELECTION,
    BUTTON,
    IMAGE,
    COLOR,
    ERROR,
    BOOLEAN
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
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    // get callback from different arguments. For a button it might be the (initial) parameter value
    // get label text, button is special: the property might be the button text but not the label text
    var labelText, buttonText;
    if (args.type === BUTTON) {
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
        case SELECTION:
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
        case BOOLEAN:
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
        case BUTTON:
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
        case TEXT:
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
        case NUMBER:
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
        case COLOR:
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
        case IMAGE:
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

// "inherit" paramControllerMethods:
//======================================
//
// this.createLabel
// this.setupOnChange
// this.show
// this.onChange 
// this.onClick
// this.onFinishChange
// this.setValueOnly
// this.setValue
// this.getValue
// this.updateDisplay
// this.updateDisplayIfListening
// this.listening
// this.name

Object.assign(ParamController.prototype, paramControllerMethods);

/**
 * close popup function: does nothing if there is no popup
 * leave popup open if this controller called it
 * @method ParamController#closePopup
 */
ParamController.prototype.closePopup = function() {
    if (this.hasPopup && !this.callsClosePopup) {
        if (this.type === IMAGE) {
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
 * add another controller to the domElement of this controller
 * @method ParamController#add
 * @param {Object} args - object that defines the controller
 */
ParamController.prototype.add = function(args) {
    const controller = new ParamController(this.gui, this.domElement, args);
    return controller;
};

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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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
    if (this.type === NUMBER) {
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