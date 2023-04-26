
    // set rgb components of a polygon depending on its hue, brightness and saturation values
    // hue can have any value, cyclic, interval 0 to 1
    // brightness and saturation are clamped to interval 0 to 1
    Polygon.prototype.setRGBFromHBS = function() {
        let red = 0;
        let green = 0;
        let blue = 0;
        let hue = this.hue; // hue cyclic from 0 to 1
        hue = 6 * (hue - Math.floor(hue));
        const c = Math.floor(hue);
        const x = hue - c;
        switch (c) {
            case 0:
                blue = 1;
                red = x;
                break;
            case 1:
                blue = 1 - x;
                red = 1;
                break;
            case 2:
                green = x;
                red = 1;
                break;
            case 3:
                green = 1;
                red = 1 - x;
                break;
            case 4:
                blue = x;
                green = 1;
                break;
            case 5:
                blue = 1;
                green = 1 - x;
                break;
        }
        const saturation = Math.max(0, Math.min(1, this.saturation));
        const brightness = 255.9 * Math.max(0, Math.min(1, this.brightness));
        this.red = Math.floor(brightness * (saturation * red + 1 - saturation));
        this.green = Math.floor(brightness * (saturation * green + 1 - saturation));
        this.blue = Math.floor(brightness * (saturation * blue + 1 - saturation));
    };