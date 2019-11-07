import {
    Button
} from "./modules.js";

/**
 * an alert similar as the default alert of the browser
 * without nagging
 * flexible formatting
 * you can use html- markup in the message
 * @namespace myAlert
 */

const myAlert = {
    surroundColor: "#00000044",
    backgroundColor: "#cccccc",
    width: 300,
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    fontSize: 14,
    buttonFontSize: 12,
    textColor: "#444444",
    borderColor: "#777777",
    borderWidth: 4,
    display: "none",
    padding: 10,
    closeButtonWidth: 100,
    zIndex: 20
};

// generate elements

myAlert.window = document.createElement("div");


myAlert.main = document.createElement("div");

myAlert.content = document.createElement("div");
myAlert.main.appendChild(myAlert.content);

myAlert.content.innerHTML = "blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb blabs dhferedj d vbffgbb ";
myAlert.closeButtonDiv = document.createElement("div");
myAlert.main.appendChild(myAlert.closeButtonDiv);
myAlert.closeButton = new Button("ok", myAlert.closeButtonDiv);
myAlert.closeButton.onClick = function() {
    myAlert.close();
};


myAlert.window.appendChild(myAlert.main);

/**
 * open the alert
 * @method myAlert.open
 */
myAlert.open = function() {
    myAlert.window.style.display = "block";
};

/**
 * close the alert
 * @method myAlert.close
 */
myAlert.close = function() {
    myAlert.window.style.display = "none";
};

/**
 * set the styles, use if you change the style parameters
 * @method myAlert.setStyle
 * @param {...Object} newStyle - with parameter values that have to change, optional
 */
myAlert.setStyle = function(newStyle) {
    for (var i = 0; i < arguments.length; i++) {
        Object.assign(myAlert, arguments[i]);
    }
    myAlert.window.style.backgroundColor = myAlert.surroundColor;
    myAlert.window.style.position = "fixed";
    myAlert.window.style.top = "0px";
    myAlert.window.style.left = "0px";
    myAlert.window.style.width = "100%";
    myAlert.window.style.height = "100%";
    myAlert.window.style.height = "100%";
    myAlert.window.style.display = myAlert.display;
    myAlert.window.style.zIndex = myAlert.zIndex;

    myAlert.main.style.position = "absolute";
    myAlert.main.style.top = "50%";
    myAlert.main.style.left = "50%";
    myAlert.main.style.transform = "translate(-50%,-50%)";
    myAlert.main.style.backgroundColor = myAlert.backgroundColor;
    myAlert.main.style.width = myAlert.width + "px";
    myAlert.main.style.padding = myAlert.padding + "px";
    myAlert.main.style.border = "solid";
    myAlert.main.style.borderColor = myAlert.borderColor;
    myAlert.main.style.borderWidth = myAlert.borderWidth;

    myAlert.closeButton.setFontSize(myAlert.buttonFontSize);
    myAlert.closeButton.setWidth(myAlert.closeButtonWidth);
    myAlert.closeButtonDiv.style.textAlign = "center";
    myAlert.closeButtonDiv.style.paddingTop = myAlert.padding + "px";

};

myAlert.setStyle({
    display: "block"
});
document.body.appendChild(myAlert.window);