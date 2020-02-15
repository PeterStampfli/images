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
 * @param {object} args - collection of arguments defining the controller
 */
export function ParamController(gui, domElement, args) {
    this.gui = gui;
    this.design = gui.design;
    this.domElement = domElement;
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;
    // put controller in list of elements (for destruction, popup controll,...)
    gui.elements.push(this);
    // extract params and property from the args object
    // replace undefined objects (params) by empty object
    this.args = args;
    this.params = guiUtils.check(args.params);
    this.property = guiUtils.check(args.property);
    this.listening = guiUtils.isDefined(args.params) && guiUtils.isDefined(args.property) && guiUtils.check(args.listen);
    if (this.listening) {
        ParamGui.startListening(); // automatically update display
    }


    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    if (guiUtils.isFunction(args.onChange)) {
        this.callBack = args.onChange;
    } else if (guiUtils.isFunction(args.onClick)) {
        this.callBack = args.onClick;
    }


}

/**
 * get an initial value from the args object
 * it's the value field if exists, else it is the value from the params object
 * @method ParamController#getInitialValue
 * @return the value
 */
ParamController.prototype.getInitialValue = function() {
    let result = 0;
    if ((guiUtils.isObject(this.params)) && (guiUtils.isDefined(this.property))) {
        result = this.params[this.property];
    }
    result = guiUtils.check(this.args.value, result); // if args.value is defined, then take this one
    return result;
};

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
    return controller;
};


/**
 * add a button controller with simple interface
 * @method ParamController#addButton
 * @param {string} text - for the button
 * @param {function} action - what the button does
 * @return {controller} with the button
 */
ParamController.prototype.addButton = function(text, action) {
    const controller = ParamController.createButton(this.gui, this.domElement, text, action);
    return controller;
};

/**
 * create a select ui, the options are an array or object
 * @method ParamController.addSelect
 * @param {string} labelText
 * @param {array||object} options - array with values for both name/value or an object={name1: value1, name2: value2, ...}
 * @param {value} value
 * @param {function} action - optional, does it upon onChange
 */
ParamController.prototype.addSelect = function(labelText, options, value, action = false) {
    const controller = ParamController.createSelect(this.gui, this.domElement, labelText, options, value, action);
    return controller;
};

/**
 * add a boolean button
 * @method ParamController.addBooleanButton
 * @param {string} labelText - for the label
 * @param {boolean} value
 * @param {function} action - optional, does it upon onChange
 */
ParamController.prototype.addBooleanButton = function(labelText, value, action = false) {
    const controller = ParamController.createBooleanButton(this.gui, this.domElement, labelText, value, action);
    return controller;
};

/**
 * add an ui element to input text
 * @method ParamController.addTextInput
 * @param {string} labelText - for the label
 * @param {string} text
 * @param {function} action - optional, does it upon onChange
 */
ParamController.prototype.addTextInput = function(labelText, text, action = false) {
    const controller = ParamController.createTextInput(this.gui, this.domElement, labelText, text, action);
    return controller;
};

/**
 *  add ui element to input numbers, with action
 * .addNumberButton("label",3.1,function action(){...}) is possible
 * @method ParamController.addNumberButton
 * @param {string} labelText - for the label
 * @param {number} value
 * @param {number} low - optional
 * @param {number} high - optional, requires low
 * @param {number} step - optional, requires low and high
 * @param {function} action - optional, does it upon onChange, independent of low, high and step
 */
ParamController.prototype.addNumberButton = function(labelText, value, low, high, step, action = false) {
    const controller = ParamController.createNumberButton(this.gui, this.domElement, labelText, value, low, high, step, action);
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
        controller = ParamController.createButton(gui, domElement, property, paramValue);
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
 * @method ParamController.createButton
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} buttonText - the label is empty
 * @param {function} action - optional, does it upon click
 */
ParamController.createButton = function(gui, domElement, buttonText, action = false) {
    const controller = new ParamController(gui, domElement);
    controller.createLabel("");
    const button = new Button(buttonText, controller.domElement);
    button.setFontSize(controller.design.buttonFontSize);
    guiUtils.hSpace(controller.domElement, ParamGui.spaceWidth);
    controller.uiElement = button;
    if (action) {
        controller.callback = action;
    }
    button.onClick = function() {
        controller.callback();
    };
    controller.setValue = function() {};
    controller.setValueOnly = function() {};
    controller.getValue = function() {};
    controller.updateDisplay = function() {};
    controller.setupOnInteraction();
    return controller;
};

/**
 * create a select ui, the options are an array or object
 * @method Paramcontroller.createSelect
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText
 * @param {array||object} options - array with values for both name/value or an object={name1: value1, name2: value2, ...}
 * @param {value} value
 * @param {function} action - optional, does it upon onChange
 */
ParamController.createSelect = function(gui, domElement, labelText, options, value, action = false) {
    const controller = new ParamController(gui, domElement);
    controller.createLabel(labelText);
    const selectValues = new SelectValues(controller.domElement);
    selectValues.setFontSize(controller.design.buttonFontSize);
    guiUtils.hSpace(controller.domElement, ParamGui.spaceWidth);
    controller.uiElement = selectValues;
    selectValues.addOptions(options);
    selectValues.setValue(value);
    controller.setupOnChange();
    if (action) {
        controller.callback = action;
    }
    controller.setupOnInteraction();
    return controller;
};

/**
 * create a boolean button
 * @method Paramcontroller.createBooleanButton
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText - for the label
 * @param {boolean} value
 * @param {function} action - optional, does it upon onChange
 */
ParamController.createBooleanButton = function(gui, domElement, labelText, value, action = false) {
    const controller = new ParamController(gui, domElement);
    controller.createLabel(labelText);
    const button = new BooleanButton(controller.domElement);
    button.setWidth(controller.design.booleanButtonWidth);
    button.setFontSize(controller.design.buttonFontSize);
    guiUtils.hSpace(controller.domElement, ParamGui.spaceWidth);
    controller.uiElement = button;
    button.setValue(value);
    controller.setupOnChange();
    if (action) {
        controller.callback = action;
    }
    controller.setupOnInteraction();
    return controller;
};

/**
 * create an ui element to input text
 * @method ParamController.createTextInput
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText - for the label
 * @param {string} text
 * @param {function} action - optional, does it upon onChange
 */
ParamController.createTextInput = function(gui, domElement, labelText, text, action = false) {
    const controller = new ParamController(gui, domElement);
    controller.createLabel(labelText);
    const textInput = new TextInput(controller.domElement);
    textInput.setWidth(controller.design.textInputWidth);
    textInput.setFontSize(controller.design.buttonFontSize);
    guiUtils.hSpace(controller.domElement, ParamGui.spaceWidth);
    textInput.setValue(text);
    controller.uiElement = textInput;
    controller.setupOnChange();
    if (action) {
        controller.callback = action;
    }
    controller.setupOnInteraction();
    return controller;
};

/**
 *  create ui element to input numbers
 * @method ParamController.createNumberButton
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style)
 * @param {string} labelText - for the label
 * @param {number} value
 * @param {number} low - optional
 * @param {number} high - optional, requires low
 * @param {number} step - optional, requires low and high
 * @param {function} action - optional, does it upon onChange, independent of low, high and step
 */
ParamController.createNumberButton = function(gui, domElement, labelText, value, low, high, step, action = false) {
    const controller = new ParamController(gui, domElement);
    controller.createLabel(labelText);
    const button = new NumberButton(controller.domElement);
    controller.popup = false;
    controller.buttonContainer = false;
    button.setInputWidth(controller.design.numberInputWidth);
    // separating space to additional elements
    guiUtils.hSpace(controller.domElement, ParamGui.spaceWidth);
    // set limits and step
    if (guiUtils.isNumber(low)) {
        button.setLow(low);
    } else if (guiUtils.isFunction(low)) {
        action = low;
    }
    if (guiUtils.isNumber(high)) {
        button.setHigh(high);
    } else if (guiUtils.isFunction(high)) {
        action = high;
    }
    if (guiUtils.isNumber(step)) {
        button.setStep(step);
    } else {
        button.setStep(NumberButton.findStep(value));
        if (guiUtils.isFunction(step)) {
            action = step;
        }
    }
    button.setValue(value);
    controller.uiElement = button;

    /**
     * make that the number input is cyclic (redefine do nothing stub)
     * @method ParamController#cyclic
     * @return this - for chaining
     */
    controller.cyclic = function() {
        button.setCyclic();
        return this;
    };

    /**
     * activate indicator in the main element
     * @method ParamController#createIndicatorMain
     */
    controller.createIndicatorMain = function() {
        const button = controller.uiElement;
        button.setIndicatorColors(controller.design.indicatorColorLeft, controller.design.indicatorColorRight);
        button.setIndicatorElement(controller.domElement);
        return this;
    };

    /**
     * activate indicator in the popup element (if exists, else in main element)
     * @method ParamController#createIndicatorPopup
     */
    controller.createIndicatorPopup = function() {
        const button = controller.uiElement;
        button.setIndicatorColors(controller.design.indicatorColorLeft, controller.design.indicatorColorRight);
        if (controller.popup) {
            button.setIndicatorElement(controller.popup.contentDiv);
        } else {
            button.setIndicatorElement(controller.domElement);
        }
        return this;
    };

    controller.setupCreationOfAdditionalButtons(); // handles the popup if required
    controller.setupOnChange();
    if (action) {
        controller.callback = action;
    }
    controller.setupOnInteraction();
    return controller;
};
