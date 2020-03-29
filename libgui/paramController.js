/* jshint esversion: 6 */
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
    //  args.type = args.type.toLowerCase();
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;
    // put controller in list of elements (for destruction, popup controll,...)
    gui.elements.push(this);
    this.type = args.type;
    if (guiUtils.isObject(args.colorObject)){
        this.colorObject=args.colorObject;
    }
    this.useRGBFields = args.useRGBFields;
    // see if the args object has a parameter value
    this.hasParameter = false;
    var parameterValue;
    // test if the args.property is defined, then we need an args.params object or array
    if (guiUtils.isDefined(args.property)) {
        if (guiUtils.isString(args.property) || guiUtils.isNumber(args.property)) {
            this.property = args.property;
            // we have a property, so we should have a parameter object
            if (guiUtils.isObject(args.params) || guiUtils.isArray(args.params)) {
                this.params = args.params;
                parameterValue = args.params[args.property]; // this may be undefined, no problem, gets value later
                this.hasParameter = true;
            } else {
                console.error("add controller: params is not an object or array although there is a property.");
                console.log("its value is " + args.params + " of type " + (typeof args.params));
                console.log("the arguments object:");
                console.log(args);
            }
        } else {
            console.error("add Controller: property is not a string.");
            console.log("its value is " + args.property + " of type " + (typeof args.property));
            console.log("the arguments object:");
            console.log(args);
        }
    } else if (guiUtils.isDefined(args.params)) {
        console.error("add Controller: property is not defined although there is a params object or array.");
        console.log("the arguments object:");
        console.log(args);
    }

    /**
     * default callback for changes
     * @method ParamController#callback
     * @param {anything} value
     */
    this.callback = function(value) {
        // console.log("callback value " + value);
    };

    // get callback from different arguments. For a button it might be the (initial) parameter value. A button never has a parameter.
    if (args.type === "button") {
        this.callback = guiUtils.check(args.onChange, args.onClick, parameterValue, this.callback);
        this.hasParameter = false;
    } else {
        this.callback = guiUtils.check(args.onChange, args.onClick, this.callback);
    }
    // get label text, button is special: the property might be the button text but not the label text
    var labelText, buttonText;
    if (args.type === "button") {
        labelText = guiUtils.check(args.labelText, "");
        buttonText = guiUtils.check(args.buttonText, args.property, "missing text");
    } else {
        labelText = guiUtils.check(args.labelText, args.property, "");
    }
    // get initial value, not for button. special for color controller with color object
    if ((args.type === "color") && guiUtils.isObject(args.colorObject)) {
        this.hasParameter = false; // for safety, in case there is some property value (that should not be)
        this.initialValue = guiUtils.check(args.initialValue, ColorInput.stringFromObject(args.colorObject));
    } else if (args.type !== "button") {
        this.initialValue = guiUtils.check(args.initialValue, parameterValue);
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

    // call if there is no good initial value, makes messages
    // parameter 'details' gives more information about the error (type of initial value)
    // set initial value to default value of the ui element
    function noGoodInitialValue(details) {
        const message = document.createElement("span");
        message.innerHTML = "&nbsp " + details;
        controller.domElement.appendChild(message);
        console.error('add "' + args.type + '" controller: ' + details);
        console.log('using ' + controller.uiElement.getValue() + ' instead of ' + controller.initialValue + ' with type "' + (typeof controller.initialValue) + '"');
        console.log("the arguments object is:");
        console.log(args);
        controller.initialValue = controller.uiElement.getValue();
    }

    // catch error that type is not a string
    if (guiUtils.isString(args.type)) {
        switch (args.type.toLowerCase()) {
            case "selection":
                const selectValues = new SelectValues(this.domElement);
                selectValues.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = selectValues;
                this.setupOnChange();
                this.setupOnInteraction();
                if (guiUtils.isArray(args.options) || guiUtils.isObject(args.options)) {
                    selectValues.addOptions(args.options);
                    // check if the initial value is in the options, accepts option names and values
                    // sets value to one of the option values, so parameter value will be equal to initial value
                    if (selectValues.findIndex(this.initialValue) >= 0) {
                        this.setValueOnly(this.initialValue); // index found, initial value might be its name or value
                    } else {
                        // fallback: use first value of the options, set this value for the parameter too
                        selectValues.setIndex(0);
                        this.setValueOnly(selectValues.getValue());
                        noGoodInitialValue("initial value is not in options");
                    }
                } else {
                    const message = document.createElement("span");
                    message.innerHTML = "&nbsp selection: options is not an array or object";
                    this.domElement.appendChild(message);
                    console.error("add selection: options is not an array or object:");
                    console.log('its value is ' + args.options + ' of type "' + (typeof args.options) + '"');
                    console.log("the arguments object is:");
                    console.log(args);
                }
                break;
            case "boolean":
                const booleanButton = new BooleanButton(this.domElement);
                booleanButton.setWidth(this.design.booleanButtonWidth);
                booleanButton.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = booleanButton;
                this.setupOnChange();
                this.setupOnInteraction();
                if (guiUtils.isBoolean(this.initialValue)) {
                    this.setValueOnly(this.initialValue); // that is safe, does not change value
                } else {
                    // fallback: somehow convert to boolean
                    this.setValueOnly(!!this.initialValue);
                    noGoodInitialValue("initial value is not a boolean");
                }
                break;
            case "button":
                const button = new Button(buttonText, this.domElement);
                button.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                this.uiElement = button;
                this.setupOnInteraction();
                button.onClick = function() {
                    controller.callback('"click"');
                };
                this.setValue = function() {};
                this.setValueOnly = function() {};
                this.getValue = function() {};
                this.updateDisplay = function() {};
                break;
            case "text":
                const textInput = new TextInput(this.domElement);
                this.uiElement = textInput;
                this.setupOnChange();
                this.setupOnInteraction();
                textInput.setWidth(this.design.textInputWidth);
                textInput.setFontSize(this.design.buttonFontSize);
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                if (guiUtils.isString(this.initialValue)) {
                    this.setValueOnly(this.initialValue); // safe, does not change value
                } else {
                    // fallback: convert initial value to string
                    if (guiUtils.isDefined(this.initialValue)) {
                        this.setValueOnly(this.initialValue.toString());
                    }
                    this.setValueOnly("undefined");
                    noGoodInitialValue("initial value is not a string");
                }
                break;
            case "number":
                const numberButton = new NumberButton(this.domElement);
                this.uiElement = numberButton;
                this.setupOnChange();
                this.setupOnInteraction();
                this.buttonContainer = false;
                numberButton.setInputWidth(this.design.numberInputWidth);
                // separating space to additional elements
                guiUtils.hSpace(this.domElement, ParamGui.spaceWidth);
                // set limits and step
                if (guiUtils.isNumber(args.min)) {
                    numberButton.setLow(args.min);
                }
                if (guiUtils.isNumber(args.max)) {
                    numberButton.setHigh(args.max);
                }
                if (guiUtils.isNumber(args.step)) {
                    numberButton.setStep(args.step);
                } else {
                    numberButton.setStep(NumberButton.findStep(this.initialValue));
                }
                // error checking and correction of initial value
                if (guiUtils.isNumber(this.initialValue)) {
                    this.setValueOnly(this.initialValue); // changes value if out of bounds or does not agree with step size
                } else {
                    // fallback: use zero as number
                    this.setValueOnly(0);
                    noGoodInitialValue("initial value is not a number");
                }
                break;
            case "color":
                let hasAlpha = false;
                if (guiUtils.isColorString(this.initialValue)) {
                    hasAlpha = ColorInput.hasAlpha(this.initialValue);
                }
                const colorInput = new ColorInput(this.domElement, hasAlpha);
                this.uiElement = colorInput;
                this.setupOnChange();
                this.setupOnInteraction();
                colorInput.setWidths(this.design.colorTextWidth, this.design.colorColorWidth, this.design.colorRangeWidth);
                colorInput.setFontSize(this.design.buttonFontSize);
                if (guiUtils.isColorString(this.initialValue)) {
                    this.setValueOnly(this.initialValue);
                } else {
                    // fallback: opaque blue
                    this.setValueOnly("#0000ff");
                    noGoodInitialValue("initial value is not a color string");
                }
                break;
            case "image":
                this.label.style.verticalAlign = "middle";
                // the input elements in the main UI (not the popup)
                // stacking vertically
                const selectDiv = document.createElement("div");
                selectDiv.style.display = "inline-block";
                selectDiv.style.verticalAlign = "middle";
                selectDiv.style.textAlign = "center";
                this.domElement.appendChild(selectDiv);
                const imageSelect = new ImageSelect(selectDiv, this.design);
                this.uiElement = imageSelect;
                this.setupOnChange();
                this.setupOnInteraction();
                this.hasPopup = true;
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
                if (guiUtils.isArray(args.options) || guiUtils.isObject(args.options)) {
                    imageSelect.addOptions(args.options);
                    // check if the initial value is in the options, accepts option names and values
                    // sets value to one of the option values
                    if (imageSelect.findIndex(this.initialValue) >= 0) {
                        this.setValueOnly(this.initialValue);
                    } else {
                        // fallback: use first value of the options, set this value for the parameter too
                        imageSelect.setIndex(0);
                        this.setValueOnly(imageSelect.getValue());
                        noGoodInitialValue("initial value is not in options");
                    }
                } else {
                    const message = document.createElement("span");
                    message.innerHTML = "&nbsps image: options is not an array or object";
                    this.domElement.appendChild(message);
                    console.error("add image: options is not an array or object:");
                    console.log('its value is ' + args.options + ' of type "' + (typeof args.options) + '"');
                    console.log("the arguments object is:");
                    console.log(args);
                }
                break;
            case "notype":
                const noTypeMessage = document.createElement("span");
                noTypeMessage.innerHTML = 'error in datGui API parameters';
                this.domElement.appendChild(noTypeMessage);
                break;
            default:
                const message = document.createElement("span");
                message.innerHTML = 'unknown controller type: "<strong>' + args.type + '</strong>"';
                this.domElement.appendChild(message);
                console.error('add controller: unknown type: "' + args.type + '"');
                console.log('type has to be: "button", "boolean", "image", "selection", "color", "text", or "number"');
                console.log("the arguments object is:");
                console.log(args);
                break;
        }
        // error message if there is not a good callback function
        if (!guiUtils.isFunction(this.callback)) {
            const message = document.createElement("span");
            message.innerHTML = "&nbsp callback is not a function";
            this.domElement.appendChild(message);
            console.error('add "' + args.type + '" controller: onClick, onChange or parameter value is not a function:');
            console.log('it is ' + this.callback + ' of type "' + (typeof this.callback) + '"');
            console.log("the arguments object is:");
            console.log(args);
            this.callback = function(value) {
                console.log("no good callback function(" + value + ")");
            };
        }
        // error messages for changed initial value, not for click button controllers
        // numbers might be slightly different due to floating point representation
        if (guiUtils.isObject(this.uiElement) && (args.type.toLowerCase() !== "button") &&
            (!guiUtils.isNumber(this.initialValue) && (this.initialValue !== this.uiElement.getValue())) ||
            (guiUtils.isNumber(this.initialValue) && (Math.abs(this.uiElement.getValue() - this.initialValue)) > 0.01)) {
            console.error('add "' + args.type + '" controller: changed value to ' + this.uiElement.getValue() + ' instead of ' + this.initialValue + ' with type "' + (typeof this.initialValue) + '"');
            console.log("the arguments object is:");
            console.log(args);
            this.initialValue = this.uiElement.getValue();
        }
        // change the minimum element width if we have a controller
        if (guiUtils.isObject(this.uiElement) && guiUtils.isNumber(args.minElementWidth)) {
            this.uiElement.setMinWidth(args.minElementWidth);
        }
    } else {
        const message = document.createElement("span");
        message.innerHTML = 'controller type is not a string';
        console.error('add controller: type is not a string');
        console.log('its value is ' + args.type + ' of type "' + (typeof args.type) + '"');
        console.log("the arguments object is:");
        console.log(args);
        this.domElement.appendChild(message);
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
        if (controller.hasParameter) {
            controller.params[controller.property] = value;
        } else if ((controller.type === "color") && (controller.colorObject)) {
            ColorInput.setObject(controller.colorObject, value);
        }
        controller.callback(value);
    };
};

/**
 * add another controller to the domElement of this controller
 * details: see ParamGui#add
 * @method ParamController#add
 * @param {Object} theParams - object that has the parameter as a field, or an object with all information for the controller
 * @param {String} theProperty - key for the field of params to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */
ParamController.prototype.add = function(theParams, theProperty, low, high, step) {
    var args = ParamGui.combineObject(arguments);
    if (!guiUtils.isObject(args)) {
        // didn't do, see if we have datgui style parameters
        args = ParamGui.createArgs(theParams, theProperty, low, high, step);
    }
    if (!guiUtils.isObject(args)) {
        const message = document.createElement("span");
        message.innerHTML = "&nbsp parameters are not ok";
        console.error("no controller generated because parameters are not ok");
        this.domElement.appendChild(message);
        return false;
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
ParamController.prototype.addColor = ParamGui.prototype.addColor;

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
 * updates display and set the value of the param object field if it exists
 * the ui element checks the value and may change it if it is not consistent with the controller type
 * DOES NOT call the callback(), which might result in wasted work
 * (for multiple parameter changes, use callback only at last change)
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * @method ParamController#setValue
 * @param {whatever} value
 */
ParamController.prototype.setValueOnly = function(value) {
    if (this.uiElement) {
        this.uiElement.setValue(value);
        if (this.hasParameter) {
            this.params[this.property] = this.uiElement.getValue();
        }
    } else {
        console.error('Controller.setValueOnly: There is no ui element because of unknown controller type "' + this.type + '".');
    }
};

/**
 * set the value of the controller
 * set the value of the param object (if exists) and call the callback to enforce synchronization
 * the ui element checks the value and may change it if it is not consistent with the controller type
 * it can also only make an error message
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * @method ParamController#setValue
 * @param {whatever} value
 */
ParamController.prototype.setValue = function(value) {
    if (this.uiElement) {
        this.setValueOnly(value);
        this.callback(this.getValue());
    } else {
        console.error('Controller.setValue: There is no ui element because of unknown controller type "' + this.type + '".');
    }
};

/**
 * get the value of the controller
 * (should be the same as the value for the param object)
 * if there is a parameter, then its value is relevant, controller value will be updated if it is different
 * @method ParamController#getValue
 * @return {whatever} value
 */
ParamController.prototype.getValue = function() {
    if (this.uiElement) {
        let value = this.uiElement.getValue();
        if (this.hasParameter) {
            const parameterValue = this.params[this.property];
            if (value !== parameterValue) {
                value = parameterValue;
                this.uiElement.setValue(parameterValue);
            }
            return value;
        }
    } else {
        console.error('Controller.getValue: There is no ui element because of unknown controller type "' + this.type + '".');
    }
};

/**
 * set the value of the display (controller) according to the actual value of the parameter in the params object
 * if params exist, else do nothing
 * does not call the callback
 * @method ParamController#updateDisplay
 */
ParamController.prototype.updateDisplay = function() {
    if (this.uiElement) {
        if (this.hasParameter) {
            const value = this.params[this.property];
            this.uiElement.setValue(value);
        }
    } else {
        console.error('Controller.updateDisplay: There is no ui element because of unknown controller type "' + this.type + '".');
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
    if (this.uiElement) {
        this.listening = true;
        ParamGui.startListening();
    } else {
        console.error('Controller.listen: There is no ui element because of unknown controller type "' + this.type + '".');
    }
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

/**
 * set if controller is active
 * @method ParamController#setActive
 * @param {boolean} isActive
 */
ParamController.prototype.setActive = function(isActive) {
    if (this.uiElement) {
        this.uiElement.setActive(isActive);
    } else {
        console.error('Controller.setActive: There is no ui element because of unknown controller type "' + this.type + '".');
    }
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
    if (this.uiElement) {
        if (this.type === "button") {
            this.uiElement.setText(label);
        } else if (this.label) {
            this.label.textContent = label;
        }
    } else {
        console.error('Controller.name: There is no ui element because of unknown controller type "' + this.type + '".');
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
    if (guiUtils.isFunction(callback)) {
        this.callback = callback;
    } else {
        console.error('Controller.onChange: Argument is not a function, it is ' + callback + ' of type "' + (typeof callback) + '"');
    }
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
ParamController.prototype.onFinishChange = ParamController.prototype.onChange;

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
    } else {
        console.error('Controller.setButtonText: The controller is not a "button", it' + "'" + 's type is "' + this.type + '".');
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
    if (this.uiElement) {
        this.uiElement.setMinWidth(width);
    } else {
        console.error('Controller.setMinWidth: There is no ui element because of unknown controller type "' + this.type + '".');
    }
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
            // the ui elements go into their own div, the this.bodyDiv
            // append as child to this.domElement
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
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
ParamController.prototype.createLeftButton = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.createLeftButton(this.buttonContainer);
        guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
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
    }
    return this;
};

/**
 * make that the number input is cyclic 
 * @method ParamController#cyclic
 * @return this - for chaining
 */
ParamController.prototype.cyclic = function() {
    if (this.type === "number") {
        this.uiElement.setCyclic();
    }
    return this;
};

/**
 * activate indicator in the main element (this.domElement)
 * @method ParamController#createIndicatorMain
 */
ParamController.prototype.createIndicatorMain = function() {
    if (this.type === "number") {
        this.uiElement.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
        this.uiElement.setIndicatorElement(this.domElement);
    }
    return this;
};

/**
 * activate indicator in the popup element (if exists, else in main element)
 * @method ParamController#createIndicatorPopup
 */
ParamController.prototype.createIndicator = function() {
    if (this.type === "number") {
        this.setupButtonContainer();
        this.uiElement.setIndicatorColors(this.design.indicatorColorLeft, this.design.indicatorColorRight);
        this.uiElement.setIndicatorElement(this.buttonContainer);
    }
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