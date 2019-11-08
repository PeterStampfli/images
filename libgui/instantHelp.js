/**
 * create instantaneously appearing help popups
 * @creator InstantHelp
 * @param {String} content - for the popup, using html markup
 * @param {domElement} parent
 */
export function InstantHelp(content, parent) {
    this.element = document.createElement("button");
    this.element.innerHTML = "&nbsp;?&nbsp;";
    this.element.style.borderRadius = "1000px"; // semicircle
    this.element.style.float = "right";
    this.element.style.cursor = "pointer";
    this.element.style.backgroundColor = "white";
    parent.appendChild(this.element);

    // the actions
    const help = this;

    function start(event) {
        event.preventDefault();
        help.element.style.backgroundColor = InstantHelp.style.handleActiveColor;
        InstantHelp.open(content);
    }

    function end(event) {
        event.preventDefault();
        help.element.style.backgroundColor = "white";
        InstantHelp.close();
    }
    this.element.onmouseenter = start;
    this.element.onmouseleave = end;
    this.element.addEventListener("touchstart", start);
    this.element.addEventListener("touchend", end);

    this.destroy = function() {
        this.element.removeEventListener("touchstart", start);
        this.element.removeEventListener("touchend", end);
        this.element.onmouseenter = null;
        this.element.onmouseleave = null;
        this.element.remove();
    };
}

/**
 * set fontsize of the handle, in px
 * @method InstantHelp#setFontSize
 * @param {integer} size
 */
InstantHelp.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

// the styling of the popup, and of the handles
InstantHelp.style = {
    // the popup
    width: 300,
    fontFamily: "FontAwesome, FreeSans, sans-serif",
    fontSize: 18,
    textColor: "#444444",
    backgroundColor: "#ffffaa",
    borderColor: "#777777",
    borderWidth: 4,
    padding: 10,
    zIndex: 20,
    handleActiveColor: "#ffff88"
};

// make the popup and set/change its style
InstantHelp.popup = document.createElement("div");

/**
 * set the styles, use if you change the style parameters
 * @method InstantHelp.setPopupStyle
 * @param {...Object} newStyle - with parameter values that have to change, optional
 */
InstantHelp.setStyle = function(newStyle) {
    for (var i = 0; i < arguments.length; i++) {
        Object.assign(InstantHelp.style, arguments[i]);
    }
    InstantHelp.popup.style.position = "absolute";
    InstantHelp.popup.style.top = "50%";
    InstantHelp.popup.style.left = "50%";
    InstantHelp.popup.style.transform = "translate(-50%,-50%)";
    InstantHelp.popup.style.zIndex = InstantHelp.style.zIndex;
    InstantHelp.popup.style.backgroundColor = InstantHelp.style.backgroundColor;
    InstantHelp.popup.style.color = InstantHelp.style.textColor;
    InstantHelp.popup.style.fontSize = InstantHelp.style.fontSize + "px";
    InstantHelp.popup.style.fontFamily = InstantHelp.style.fontFamily;
    InstantHelp.popup.style.width = InstantHelp.style.width + "px";
    InstantHelp.popup.style.padding = InstantHelp.style.padding + "px";
    InstantHelp.popup.style.border = "solid";
    InstantHelp.popup.style.borderColor = InstantHelp.style.borderColor;
    InstantHelp.popup.style.borderWidth = InstantHelp.style.borderWidth;
};

/**
 * open the popup, optionally set its content
 * @method InstantHelp.open
 * @param {String} content - optional html
 */
InstantHelp.open = function(content) {
    if (arguments.length > 0) {
        InstantHelp.setContent(content);
    }
    InstantHelp.popup.style.display = "block";
};

/**
 * close the popup
 * @method InstantHelp.close
 */
InstantHelp.close = function() {
    InstantHelp.popup.style.display = "none";
};

/**
 * set the content (HTML markup)
 * @method InstantHelp.setContent
 * @param {String} content - html
 */
InstantHelp.setContent = function(content) {
    InstantHelp.popup.innerHTML = content;
};

// initialize style, and append to the dom
InstantHelp.setStyle();
document.body.appendChild(InstantHelp.popup);
// close the popup
InstantHelp.close();
