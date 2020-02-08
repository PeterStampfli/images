import {
    guiUtils,
    paramControllerMethods,
    ParamImageSelection,
    BooleanButton,
    Button,
    SelectValues,
    TextInput,
    Popup,
    NumberButton,
    ParamGui
} from "./modules.js";

// note: a line with several ui elements is similar to a folder
// it has its own design style with design.popupForNumberController=true

/**
 * a controller for a simple parameter
 * inside a given container, using given design
 * @creator ParamController
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div
 */
export function ParamController(gui, domElement) {
    this.gui = gui;
    this.design = gui.design;
    this.domElement = domElement;
    this.params = false; // a priori no params object and no property
    this.property = false;
    this.listening = false; // automatically update display, only if explicitely activated
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
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
 * add another controller to the domElement of this controller
 * @method ParamController#add
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */
ParamController.prototype.add = function(params, property, low, high, step) {
    const controller = ParamController.create(this.gui, this.domElement, params, property);
    this.gui.elements.push(controller);
    return controller;
};

/**
 * make that numberbuttons and range elements become cyclic
 * deafult: other buttons without effect
 * @method ParamController#cyclic
 * @return this for chaining
 */
// here a do nothing stub for non-number controllers
ParamController.prototype.cyclic = function() {
    return this;
};

/**
 * create a select ui, this.low has the options (array or object)
 * @method Paramcontroller#createSelect
 * @param {string} labelText
 * @param {array||object} options - array with values for both name/value or an object={name1: value1, name2: value2, ...}
 * @param {value} value
 */
ParamController.prototype.createSelect = function(labelText, options, value) {
    this.createLabel(labelText);
    const selectValues = new SelectValues(this.domElement);
    selectValues.setFontSize(this.design.buttonFontSize);
    guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
    this.uiElement = selectValues;
    selectValues.addOptions(options);
    selectValues.setValue(value);
    this.setupOnChange();
    this.setupOnInteraction();
};

/**
 * create a boolean button
 * @method Paramcontroller#createBooleanButton
 * @param {string} labelText - for the label
 * @param {boolean} value
 */
ParamController.prototype.createBooleanButton = function(labelText, value) {
    this.createLabel(labelText);
    const button = new BooleanButton(this.domElement);
    button.setWidth(this.design.booleanButtonWidth);
    button.setFontSize(this.design.buttonFontSize);
    guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
    this.uiElement = button;
    button.setValue(value);
    this.setupOnChange();
    this.setupOnInteraction();
};

/**
 * create a button to click
 * button has some text, executes a function (if given)
 * @method ParamController#createClickButton
 * @param {string} buttonText - empty label
 * @param {function} action - optional, does it upon click
 */
ParamController.prototype.createClickButton = function(buttonText, action) {
    this.createLabel("");
    const button = new Button(buttonText, this.domElement);
    button.setFontSize(this.design.buttonFontSize);
    guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
    this.uiElement = button;
    if (guiUtils.isFunction(action)) {
        this.callback = action;
    }
    const controller = this;
    button.onClick = function() {
        controller.callback();
    };
    controller.setValue = function() {};
    controller.setValueOnly = function() {};
    controller.getValue = function() {};
    controller.updateDisplay = function() {};
    this.setupOnInteraction();
};

/**
 * create an ui element to input text
 * @method ParamController#createTextInput
 * @param {string} labelText - for the label
 * @param {string} text
 */
ParamController.prototype.createTextInput = function(labelText, text) {
    this.createLabel(labelText);
    const textInput = new TextInput(this.domElement);
    textInput.setWidth(this.design.textInputWidth);
    textInput.setFontSize(this.design.buttonFontSize);
    guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
    textInput.setValue(text);
    this.uiElement = textInput;
    this.setupOnChange();
    this.setupOnInteraction();
};

// special parameters for these popups, not specified in paramGui
ParamController.popupDesign = {
    popupBorderRadius: 0,
    popupShadowWidth: 0,
    popupShadowBlur: 0,
    popupInnerWidth: 0
};

/**
 * create popup for number button, make that onInteraction opens the popup
 * open the popup close to the ui element
 * @method ParamController#createPopup
 * @return this
 */
ParamController.prototype.createPopup = function() {
    // a popup for additional buttons
    this.popup = new Popup(this.design, ParamController.popupDesign);
    this.popup.addCloseButton();
    this.popup.contentDiv.style.backgroundColor = this.design.backgroundColor;
    this.popup.close();
    // on interaction: call close popups, 
    // mark that this controller interacts, do not close its own popup
    this.callsClosePopup = false;

    // change onInteraction callback to close/open popup
    const controller = this;
    this.uiElement.onInteraction = function() {
        controller.popup.open();
        controller.callsClosePopup = true;
        ParamGui.closePopups();
        controller.callsClosePopup = false;
        const topPosition = guiUtils.topPosition(controller.domElement);
        controller.popup.setTopPosition(topPosition - controller.design.paddingVertical);
    };
    // change close popup function to leave popup open if this called it
    this.closePopup = function() {
        if (!this.callsClosePopup) {
            this.popup.close();
        }
    };

    // the container for additional buttons
    this.buttonContainer = this.popup.contentDiv;
};

/**
 * setup the buttonContainer if it does not exist
 * either the domElement or create a popup and use the contentdiv
 * if popup is created, then modify the element.onInteraction method to open/close popup 
 * (this method is called after the standard setupOnInteraction method)
 * @method ParamController#setupButtonContainer
 */
ParamController.prototype.setupButtonContainer = function() {
    if (!this.buttonContainer) {
        if (this.design.popupForNumberController) {
            this.createPopup();
        } else {
            this.buttonContainer = this.domElement;
        }
    }
};

/**
 * create methods for creating the additional buttons for number input
 * @method ParamController#setupCreationOfAdditionalButtons
 */
ParamController.prototype.setupCreationOfAdditionalButtons = function() {
    const button = this.uiElement;

    /**
     * make an add button
     * @method ParamController#createAddButton
     * @param {string} text
     * @param {number} amount
     * @return this controller
     */
    this.createAddButton = function(text, amount) {
        this.setupButtonContainer();
        button.createAddButton(text, this.buttonContainer, amount);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * make plus and minus 1 buttons
     * @method ParamController#createPlusMinusButtons
     * @return this controller
     */
    ParamController.prototype.createPlusMinusButtons = function() {
        this.createAddButton("-1", -1);
        this.createAddButton("+1", 1);
        return this;
    };

    /**
     * make an multiplication button
     * @method ParamController#createMulButton
     * @param {string} text
     * @param {number} amount
     * @return this controller
     */
    this.createMulButton = function(text, amount) {
        this.setupButtonContainer();
        button.createMulButton(text, this.buttonContainer, amount);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * make multiply and divide by 2 buttons
     * @method ParamController#createMulDivButtons
     * @return this controller
     */
    ParamController.prototype.createMulDivButtons = function() {
        this.createMulButton("/ 2", 0.5);
        this.createMulButton("* 2", 2);
        return this;
    };

    /**
     * create a button that sets the minimum value
     * @method ParamController#createMiniButton
     * @return this - the controller
     */
    this.createMiniButton = function() {
        this.setupButtonContainer();
        button.createMiniButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a button that sets the maximum value
     * @method ParamController#createMaxiButton
     * @return this - the controller
     */
    this.createMaxiButton = function() {
        this.setupButtonContainer();
        button.createMaxiButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
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
    this.createLeftButton = function() {
        this.setupButtonContainer();
        button.createLeftButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a button that moves cursor to the right
     * @method ParamController#createRightButton
     * @return this - the controller
     */
    this.createRightButton = function() {
        this.setupButtonContainer();
        button.createRightButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a button that decreases value at cursor
     * @method ParamController#createDecButton
     * @return this - the controller
     */
    this.createDecButton = function() {
        this.setupButtonContainer();
        button.createDecButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a button that increases value at cursor
     * @method ParamController#createIncButton
     * @return this - the controller
     */
    this.createIncButton = function() {
        this.setupButtonContainer();
        button.createIncButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create the leftDownUpRight buttons
     * @method ParamController#createLeftDownUpRightButtons
     * @return this - the controller
     */
    this.createLeftDownUpRightButtons = function() {
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
    this.createSuggestButton = function(value) {
        this.setupButtonContainer();
        button.createSuggestButton(this.buttonContainer, value);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a range element of short length
     * @method ParamController#createSmallRange
     * @return this - the controller
     */
    this.createSmallRange = function() {
        this.setupButtonContainer();
        button.createRange(this.buttonContainer);
        button.setRangeWidth(this.design.rangeSliderLengthShort);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        return this;
    };

    /**
     * create a range element of long length
     * @method ParamController#createLongRange
     * @return this - the controller
     */
    this.createLongRange = function() {
        this.createSmallRange();
        button.setRangeWidth(this.design.rangeSliderLengthLong);
        return this;
    };

    /**
     * create a range element of very long length
     * @method ParamController#createVeryLongRange
     * @return this - the controller
     */
    this.createVeryLongRange = function() {
        this.createSmallRange();
        button.setRangeWidth(this.design.rangeSliderLengthVeryLong);
        return this;
    };
};

/**
 *  create all things required to input numbers
 * @method ParamController#createNumberButton
 * @param {string} labelText - for the label
 * @param {number} value
 * @param {number} low - optional
 * @param {number} high - optional
 * @param {number} step - optional
 */
ParamController.prototype.createNumberButton = function(labelText, value, low, high, step) {
    this.createLabel(labelText);
    const button = new NumberButton(this.domElement);
    this.popup = false;
    this.buttonContainer = false;
    button.setInputWidth(this.design.numberInputWidth);
    // separating space to additional elements
    guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
    // set limits and step
    if (guiUtils.isNumber(low)) {
        button.setLow(low);
    }
    if (guiUtils.isNumber(high)) {
        button.setHigh(high);
    }
    if (guiUtils.isNumber(step)) {
        button.setStep(step);
    } else {
        button.setStep(NumberButton.findStep(value));
    }
    button.setValue(value);
    this.uiElement = button;

    /**
     * make that the number input is cyclic (redefine do nothing stub)
     * @method ParamController#cyclic
     * @return this - for chaining
     */
    this.cyclic = function() {
        button.setCyclic();
        return this;
    };

    /**
     * activate indicator in the main element
     * @method ParamController#createIndicatorMain
     */
    this.createIndicatorMain = function() {
        const button = this.uiElement;
        button.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
        button.setIndicatorElement(this.domElement);
        return this;
    };

    /**
     * activate indicator in the popup element (if exists, else in main element)
     * @method ParamController#createIndicatorPopup
     */
    this.createIndicatorPopup = function() {
        const button = this.uiElement;
        button.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
        if (this.popup) {
            button.setIndicatorElement(this.popup.contentDiv);
        } else {
            button.setIndicatorElement(this.domElement);
        }
        return this;
    };

    this.setupCreationOfAdditionalButtons(); // handles the popup if required
    this.setupOnChange();
    this.setupOnInteraction();
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
    if (this.domElement) {
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

// ParamController factories
//===============================================================

/**
 * create a controller for a simple parameter
 * inside a given container, using given design
 * @method ParamController.create
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 *  @return the controller
 */
ParamController.create = function(gui, domElement, params, property, low, high, step) {
    var controller;
    const paramValue = params[property];
    if (guiUtils.isArray(low) || guiUtils.isObject(low)) {
        // low, the first parameter for limits is an array or object, thus make a selection
        controller = ParamController.createSelect(gui, domElement, property, low, paramValue);
    } else if (guiUtils.isBoolean(paramValue)) {
        // the parameter value is boolean, thus make a BooleanButton
        controller = ParamController.createBooleanButton(gui, domElement, property, paramValue);
    } else if (!guiUtils.isDefined(paramValue) || guiUtils.isFunction(paramValue)) {
        // there is no parameter value with the property or it is a function
        // thus make a button with the property as text, no label
        controller = ParamController.createClickButton(gui, domElement, property, paramValue);
    } else if (guiUtils.isString(paramValue)) {
        // the parameter value is a string thus make a text input button
        controller = ParamController.createTextInput(gui, domElement, property, paramValue);
    } else if (guiUtils.isNumber(paramValue)) {
        controller = ParamController.createNumberButton(gui, domElement, property, paramValue, low, high, step);
    } else {
        // no idea/error
        controller = new ParamController(gui, domElement);
        controller.createLabel("*** " + property + " - error: no fitting controll found");
        console.log("no fitting controller found:");
        console.log("property " + property);
        console.log("low " + low + ", high " + high + ", step " + step);
    }
    controller.params = params; // required for transmitting data
    controller.property = property;
    return controller;
};

/**
 * create a button to click
 * button has some text, executes a function (if given)
 * inside a given container, using given design
 * does not depend on aparameter object
 * @method ParamController.createClickButton
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} buttonText - the label is empty
 * @param {function} action - optional, does it upon click
 */
ParamController.createClickButton = function(gui, domElement, buttonText, action) {
    const controller = new ParamController(gui, domElement);
    controller.createClickButton(buttonText, action);
    return controller;
};

/**
 * create a select ui, the options (array or object)
 * @method Paramcontroller.createSelect
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText
 * @param {array||object} options - array with values for both name/value or an object={name1: value1, name2: value2, ...}
 * @param {value} value
 */
ParamController.createSelect = function(gui, domElement, labelText, options, value) {
    const controller = new ParamController(gui, domElement);
    controller.createSelect(labelText, options, value);
    return controller;
};

/**
 * create a boolean button
 * @method Paramcontroller.createBooleanButton
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText - for the label
 * @param {boolean} value
 */
ParamController.createBooleanButton = function(gui, domElement, labelText, value) {
    const controller = new ParamController(gui, domElement);
    controller.createBooleanButton(labelText, value);
    return controller;
};

/**
 * create an ui element to input text
 * @method ParamController.createTextInput
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText - for the label
 * @param {string} text
 */
ParamController.createTextInput = function(gui, domElement, labelText, text) {
    const controller = new ParamController(gui, domElement);
    controller.createTextInput(labelText, text);
    return controller;
};

/**
 *  create ui element to input numbers
 * @method ParamController.createNumberButton
 * @param {string} labelText - for the label
 * @method ParamController.createTextInput
 * @param {ParamGui} gui - the gui it is in
 * @param {number} value
 * @param {number} low - optional
 * @param {number} high - optional
 * @param {number} step - optional
 */
ParamController.createNumberButton = function(gui, domElement, labelText, value, low, high, step) {
    const controller = new ParamController(gui, domElement);
    controller.createNumberButton(labelText, value, low, high, step);
    return controller;
};
