/**
 * layout/managing multiple control  divs in the html main page
 * 
 * @namespace divCollection
 */

/* jshint esversion:6 */

const divCollection = {};

(function() {
    "use strict";

    // design parameters with default values
    // you can change the values, best at startup in window.onload (?)
    // background color and color for panel at the top
    divCollection.topBackgroundColor = "#ffffff";
    divCollection.topColor = "#444444";
    // background color and color for panels below
    divCollection.lowBackgroundColor = "#eeeeee";
    divCollection.lowColor = "#000000";
    // fontsize as a fraction of smaller window dimension
    divCollection.fontsizeToWindowDefault = 0.025;
    divCollection.fontsizeToWindow = divCollection.fontsizeToWindowDefault;
    // width of basic control panel as multiple of font size
    divCollection.controlWidthToFontsize = 20;
    // width of the top navigation button as a multiple of basic control panel size
    divCollection.navButtonWidthToControlWidth = 0.75;
    // h1 titel font size is larger 
    divCollection.relativeH1Fontsize = 1.0;
    // relative size of margins
    divCollection.marginToFontsize = 0.5;
    // weight of button borders
    divCollection.borderWidthToFontsize = 0.15;
    // z-index for handles
    divCollection.handleZIndex = 9;
    // basic z-index for divs, will be augmented by index to displayed
    divCollection.divBaseZIndex = 10;

    // private things
    const px = "px";
    // collection of divs with controls
    // list of id names (Strings)of the divs, for (re)sizing
    const divIds = [];
    // list of id names (Strings) of the handles, for (re)sizing
    const handleIds = [];
    // list of relative widths
    const widths = [];
    // list for display divs, indices to the list, in inverse order of visibility, first is drawn first
    const displayed = [];

    divCollection.log = function() {
        console.log("all div ids: " + divIds);
        console.log("all widths: " + widths);
        console.log("all handle ids: " + handleIds);
        console.log("displayed (indices to div ids): " + displayed);
    };

    // update the z-indices of the divs according to indices
    function updateZIndices() {
        for (var i = 0; i < displayed.length; i++) {
            DOM.style("#" + divIds[displayed[i]], "zIndex", divCollection.divBaseZIndex + i + "");
        }
    }

    // update the z-indices of the divs according to indices
    function updateColors() {
        for (var i = 0; i < displayed.length - 1; i++) {
            DOM.style("#" + divIds[displayed[i]], "color", divCollection.lowColor);
            DOM.style("#" + divIds[displayed[i]], "backgroundColor", divCollection.lowBackgroundColor);
        }
        DOM.style("#" + divIds[displayed[displayed.length - 1]], "color", divCollection.topColor);
        DOM.style("#" + divIds[displayed[displayed.length - 1]], "backgroundColor", divCollection.topBackgroundColor);
    }

    // move element at given index to the end/top to make it full visible/remove
    function moveToTop(index) {
        const element = displayed[index];
        for (var i = index + 1; i < displayed.length; i++) {
            displayed[i - 1] = displayed[i];
        }
        displayed[displayed.length - 1] = element;
    }

    // add an element to the list of displayed, if already there, move to top 
    divCollection.show = function(id) {
        const indexOfId = divIds.indexOf(id); // find index to the id
        if (indexOfId >= 0) {
            const index = displayed.indexOf(indexOfId);
            if (index < 0) { // previously hidden
                DOM.style("#" + id, "display", "block");
                const handleId = handleIds[indexOfId];
                if (handleId != "") {
                    DOM.style("#" + handleId, "display", "none");
                }
                displayed.push(indexOfId);
            } else {
                moveToTop(index);
            }
            updateZIndices();
            updateColors();
        }
    };

    // hide the element at the top of the list
    divCollection.hideTop = function() {
        const indexOfId = displayed.pop();
        DOM.style("#" + divIds[indexOfId], "display", "none");
        const handleId = handleIds[indexOfId];
        if (handleId != "") {
            DOM.style("#" + handleId, "display", "block");
        }
        updateZIndices();
        updateColors();
    };

    // hide an element/ make it invisible
    divCollection.hide = function(id) {
        let indexOfId = divIds.indexOf(id); // find index to the id
        console.log("index to id " + indexOfId);
        if (indexOfId >= 0) {
            const index = displayed.indexOf(indexOfId);
            if (index >= 0) {
                moveToTop(index);
                divCollection.hideTop();
            }
        }
    };

    // add a hide button  
    // return id of button
    function createHideButton(divId, hideButtonId) {
        DOM.create("button", hideButtonId, "body", "hide");
        DOM.style("#" + hideButtonId, "float", "right");
        DOM.class("#" + hideButtonId, "hasMargin");
        const hideButton = new Button(hideButtonId);
        hideButton.onClick = function() {
            divCollection.hide(divId);
        };
    }

    divCollection.hideButtonAtTop = function(divId) {
        const hideButtonId = divId + "HideButtonAtTop";
        createHideButton(divId, hideButtonId);
        const theDiv = document.getElementById(divId);
        theDiv.insertBefore(document.getElementById(hideButtonId), theDiv.firstChild);
    };

    divCollection.hideButtonAtBottom = function(divId) {
        const hideButtonId = divId + "HideButtonAtBottom";
        createHideButton(divId, hideButtonId);
        const theDiv = document.getElementById(divId);
        theDiv.insertBefore(document.getElementById(hideButtonId), null);
    };

    /*
     * create a handle as a button in a div to show a div
     * return id of handle
     */

    // id of the dic and text for the button
    divCollection.createHandle = function(divId, text) {
        const handleId = divId + "handle";
        const buttonId = handleId + "Button";
        DOM.create("div", handleId, "body");
        DOM.create("button", buttonId, "#" + handleId, text);
        DOM.class("#" + buttonId, "hasMargin");
        DOM.style("#" + handleId, "color", divCollection.lowColor, "backgroundColor", divCollection.lowBackgroundColor);
        const showButton = new Button(buttonId);
        showButton.onClick = function() {
            divCollection.show(divId);
        };
        return handleId;
    };


    /**
     * register a div ( for setting dimensions) and apply basic styles, hide
     */
    divCollection.register = function(divId, width = 1, handleId = "") {
        if (DOM.idExists(divId)) {
            divIds.push(divId);
            widths.push(width);
            handleIds.push(handleId);
            DOM.style("#" + divId, "maxHeight", window.innerHeight + px);
            DOM.style("#" + divId, "overflow", "auto", "display", "none");
            if (handleId != "") {
                DOM.style("#" + handleId, "display", "block");
            }
            // make the div go to top if clicked, and visible !
            const element = document.getElementById(divId);
            element.onclick = function() {
                let indexOfId = divIds.indexOf(divId); // find index to the id
                if (indexOfId >= 0) {
                    const index = displayed.indexOf(indexOfId);
                    if (index >= 0) {
                        divCollection.show(divId);
                    }
                }
            };
        } else {
            console.log("**** divCollection.register: no element with id " + divId);
        }
    };

    // setting fontsize
    divCollection.changeFontsize = function(factor) {
        divCollection.fontsizeToWindow *= factor;
        console.log(divCollection.fontsizeToWindow);
        localStorage.setItem("fontsize", "" + divCollection.fontsizeToWindow);
    };

    const changeFontsizeFactor = 1.1;

    // create change fontsize buttons in a span
    divCollection.createChangeFontsizeButtons = function(idSpan) {
        const increaseId = idSpan + "increase";
        const decreaseId = idSpan + "decrease";
        DOM.create("button", increaseId, "#" + idSpan, "increase");
        DOM.create("span", idSpan + "extraspace", "#" + idSpan, " ");
        DOM.create("button", decreaseId, "#" + idSpan, "decrease");
        const increaseButton = new Button(increaseId);
        increaseButton.onClick = function() {
            divCollection.changeFontsize(changeFontsizeFactor);
            divCollection.setDimensions();
        };
        const decreaseButton = new Button(decreaseId);
        decreaseButton.onClick = function() {
            divCollection.changeFontsize(1 / changeFontsizeFactor);
            divCollection.setDimensions();
        };
    };

    // setting dimensions, call in startup and resize
    // uses custom fontsizetowindow value if on localstorage, else default value (TODO)

    divCollection.setDimensions = function() {
        if (localStorage.getItem("fontsize")) {
            divCollection.fontsizeToWindow = parseFloat(localStorage.getItem("fontsize"));
            console.log(localStorage.getItem("fontsize"));
            console.log("fontsize custom stored: " + divCollection.fontsizeToWindow);
        } else {
            divCollection.fontsizeToWindow = divCollection.fontsizeToWindowDefault;
            console.log("fontsize defaultsize: " + divCollection.fontsizeToWindow);
        }

        // set the font size, depending on the window height 
        // trying to fit controls to window without vertical scrolling
        const fontsize = divCollection.fontsizeToWindow * window.innerHeight;
        // beware of too narrow portrait format
        // the lines in controls should be short
        // prevents horizontal scrolling
        // worst case might cause vertical scrolling
        const controlWidth = Math.min(divCollection.controlWidthToFontsize * fontsize, window.innerWidth);
        DOM.style("h1", "fontSize", divCollection.relativeH1Fontsize * fontsize + px);
        DOM.style("p,button,input,table,select", "fontSize", fontsize + px);
        // class "hasMargin" for buttons ... with margin
        DOM.style("p,h1,table,.hasMargin", "margin", divCollection.marginToFontsize * fontsize + px);
        DOM.style("button,input", "borderWidth", divCollection.borderWidthToFontsize * fontsize + px);

        for (var i = 0; i < divIds.length; i++) {
            if (widths[i] > 0) {
                DOM.style("#" + divIds[i], "width", Math.min(widths[i] * controlWidth, window.innerWidth) + px);
            }
        }
    };


    // keyboard event to hide top div 
    divCollection.addHideKey = function(key) {
        KeyboardEvents.addFunction(function() {
            divCollection.hideTop();
        }, key);
    };

    // keyboard event to increase/decrease font size
    divCollection.addFontsizeChangeKeys = function(keyUp, keyDown) {
        KeyboardEvents.addFunction(function() {
            divCollection.changeFontsize(changeFontsizeFactor);
            divCollection.setDimensions();
        }, keyUp);
        KeyboardEvents.addFunction(function() {
            divCollection.changeFontsize(1 / changeFontsizeFactor);
            divCollection.setDimensions();
        }, keyDown);
    };


}());
