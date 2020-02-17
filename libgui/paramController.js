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
    ParamGui,
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
    this.domElement = domElement;
    const controller = this;
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;
    // put controller in list of elements (for destruction, popup controll,...)
    gui.elements.push(this);
    this.args = args;
    // see if we have a params object with parameters to control
    if (guiUtils.isObject(args.params)) {
        this.params = args.params;
        // now args.property should be a string as key to the params object
        if (guiUtils.isString(args.property)) {
            this.property = args.property;
            // for buttons, the parameter value might be undefined, else it might be everything
            if (guiUtils.isDefined(this.params[this.property])) {
                this.paramValue = this.params[this.property];
                console.log(this.paramValue);
            }
        } else {
            console.log("*** ParamController: args.property is not a string. It is " + args.property);
        }
    }
    // activate listening if we have a parameter object, key and args.listening is true
    this.listening = guiUtils.isDefined(args.params) && guiUtils.isDefined(args.property) && guiUtils.check(args.listening);
    if (this.listening) {
        ParamGui.startListening(); // automatically update display
    }
    // use popup depending on args.usePopup and design.usePopup
    this.usePopup = guiUtils.check(args.usePopup, this.design.usePopup);

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };

    // get callback from different arguments. For a button it might be the parameter value
    if (args.type === BUTTON) {
        this.callback = guiUtils.check(args.onChange, args.onClick, this.paramValue, this.callback);
    } else {
        this.callback = guiUtils.check(args.onChange, args.onClick, this.callback);
        this.initialValue = guiUtils.check(args.initialValue, this.paramValue);
    }
    // get initial value from different arguments. Not for button
    if (args.type !== BUTTON) {
        this.initialValue = guiUtils.check(args.initialValue, this.paramValue);
    }
    var labelText, buttonText;
    // get label text, again button is special: the property might be the button text but not the label text
    if (args.type === BUTTON) {
        labelText = guiUtils.check(args.labelText, "");
        buttonText = guiUtils.check(args.buttonText, this.property, "missing text");
    } else {
        labelText = guiUtils.check(args.labelText, this.property, "");
    }
    this.createLabel(labelText);

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
            break;
        case COLOR:
            break;
        case IMAGE:
            break;
        default:
            const mess = document.createElement("span");
            mess.innerText = 'problem with type: "' + args.type + '"';
            mess.style.fontSize = this.design.titleFontSize + "px";
            this.domElement.appendChild(mess);
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