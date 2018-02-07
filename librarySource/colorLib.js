/**
 * representing color by rgba values or hue, colorIntensity and grey
 * all fields are integers, except hue, which is float
 * red, green, blue and alpha are integers (bytes) 0...255
 * hue is float 0..6, hue=0 or 6 is red, 2 is green and 4 is blue
 * @example see colorTest.html
 *
 * @constructor Color
 */

function Color() {
    "use strict";
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.grey = 0;
    this.hue = 0;
    this.colorIntensity = 0;
    this.grey = 0;
    this.alpha = 255;
}

(function() {
    "use strict";

    /**
     * log the rgba components, overrides toString()
     * @method Color#toString
     */
    Color.prototype.toString = function() {
        return "Color rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
    };

    /**
     * set red, green and blue component values
     * @method Color#setRgb
     * @param {integer} red 
     * @param {integer} green 
     * @param {integer} blue 
     */
    Color.prototype.setRgb = function(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    };

    /**
     * copy values from another color
     * @method Color#copy
     * @param {Color} color 
     */
    Color.prototype.copy = function(color) {
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        this.hue = color.hue;
        this.colorIntensity = color.colorIntensity;
        this.grey = color.grey;
        this.alpha = color.alpha;
    };

    /**
     * interpolate linearly to another color, t=0 gives this color, t=1 gives the parameters color
     * acts only on the rgba components, we cannot easily interpolate the hue, if needed convert to rgb first
     * @method Color#interpolate
     * @param {float} t interpolation parameter
     * @param {Color} color the other color we interpolate to
     */
    Color.prototype.interpolate = function(t, color) {
        this.red = Math.round((1 - t) * this.red + t * color.red);
        this.green = Math.round((1 - t) * this.green + t * color.green);
        this.blue = Math.round((1 - t) * this.blue + t * color.blue);
        this.alpha = Math.round((1 - t) * this.alpha + t * color.alpha);
    };

    /**
     * bleach the color, interpolation to white, x=0 no bleach, x=1 fully bleached (white)
     * @method Color#bleach
     * @param {float} t - interpolation parameter
     */
    Color.prototype.bleach = function(t) {
        this.interpolate(t, Color.white);
    }

    /**
     * simple color inversion (makes the negative)
     * @method Color#negate
     */
    Color.prototype.negate = function() {
        this.red = 255 - this.red;
        this.green = 255 - this.green;
        this.blue = 255 - this.blue;
    }


    /**
     * improved color inversion (makes the negative hue)
     * @method Color#negateHue
     */
    Color.prototype.negateHue = function() {
        var pixMaxMin = Math.max(this.red, this.green, this.blue) + Math.min(this.red, this.green, this.blue);
        this.red = pixMaxMin - this.red;
        this.green = pixMaxMin - this.green;
        this.blue = pixMaxMin - this.blue;
    }

    /**
     * color rotation, exchange components cyclically, r<-g<-b<-r
     * @method Color#rotation
     */
    Color.prototype.rotation = function() {
        var h = this.red;
        this.red = this.green;
        this.green = this.blue;
        this.blue = h;
    }


    /**
     * inverse color rotation, exchange components cyclically, r->g->b->r
     * @method Color#inverseRotation
     */
    Color.prototype.inverseRotation = function() {
        var h = this.red;
        this.red = this.blue;
        this.blue = this.green;
        this.green = h;
    }

    /**
     *determine hue, colorIntensity and grey from red,green and blue
     * @method Color#higFromRgb
     */
    Color.prototype.higFromRgb = function() {
        // get and subtract grey 
        // integer grey between 0 and 255
        var red = this.red;
        var green = this.green;
        var blue = this.blue;
        this.grey = Math.min(red, green, blue);
        red -= this.grey;
        green -= this.grey;
        blue -= this.grey;
        // analyze color part, integer pixels!
        // integer color intensity between 0 and 255
        // float hue between 0 and 6
        // javascript always makes float division
        if ((red >= green) && (red >= blue)) { // going from magenta to red to yellow
            if (red > 0) {
                this.colorIntensity = red;
                this.hue = (green > blue) ? green / red : 6 - blue / red;
            } else {
                this.colorIntensity = 0;
                this.hue = 0;
            }
        } else if ((green >= red) && (green >= blue)) { // going from yellow to green to cyan
            this.colorIntensity = green;
            this.hue = (blue > red) ? 2 + blue / green : 2 - red / green;
        } else { // going from cyan to blue to magenta
            this.colorIntensity = blue;
            this.hue = (red > green) ? 4 + red / blue : 4 - green / blue;
        }
    }

    /**
     * determine red, green and blue from hue, colorIntensity and grey
     * @method Color.rgbFromHig
     */
    Color.prototype.rgbFromHig = function() {
        this.hue -= 6 * Math.floor(this.hue / 6); //reduce to range 0..6
        var intHue = Math.floor(this.hue);
        var fracHue = this.hue - intHue;
        switch (intHue) {
            case 0: // red to yellow
                this.red = this.colorIntensity;
                this.green = this.colorIntensity * fracHue;
                this.blue = 0;
                break;
            case 1: // yellow to green
                this.red = this.colorIntensity * (1 - fracHue);
                this.green = this.colorIntensity;
                this.blue = 0;
                break;
            case 2: // green to cyan
                this.red = 0;
                this.green = this.colorIntensity;
                this.blue = this.colorIntensity * fracHue;
                break;
            case 3: // cyan to blue
                this.red = 0;
                this.green = this.colorIntensity * (1 - fracHue);
                this.blue = this.colorIntensity;
                break;
            case 4: // blue to magenta
                this.red = this.colorIntensity * fracHue;
                this.green = 0;
                this.blue = this.colorIntensity;
                break;
            case 5: // magenta to red
                this.red = this.colorIntensity;
                this.green = 0;
                this.blue = this.colorIntensity * (1 - fracHue);
                break;
        }
        this.red = Math.round(this.grey + this.red) & 0xff;
        this.green = Math.round(this.grey + this.green) & 0xff;
        this.blue = Math.round(this.grey + this.blue) & 0xff;
    }

    /**
     * shift the hue to change the color
     * @method Color#shiftHue
     * @param {float} amount - size of the shift
     */
    Color.prototype.shiftHue = function(amount) {
        this.higFromRgb();
        this.hue += amount;
        this.rgbFromHig();
    }


    /**
     * white color (r=g=b=255)
     * @static Color.White
     */
    Color.white = new Color();
    Color.white.setRgb(255, 255, 255);
}());
