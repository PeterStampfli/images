/* jshint esversion:6 */


// set rgb components of a color depending on hue, brightness and saturation values
// hue can have any value, cyclic, interval 0 to 1
// brightness and saturation are clamped to interval 0 to 1
function setRGBFromHBS(color, hue, brightness, saturation) {
    let red = 0;
    let green = 0;
    let blue = 0;
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
    saturation = Math.max(0, Math.min(1, saturation));
    brightness = 255.9 * Math.max(0, Math.min(1, brightness));
    color.red = Math.floor(brightness * (saturation * red + 1 - saturation));
    color.green = Math.floor(brightness * (saturation * green + 1 - saturation));
    color.blue = Math.floor(brightness * (saturation * blue + 1 - saturation));
}