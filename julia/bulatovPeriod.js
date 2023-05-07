// calculate periodic length of bulatov band in x-direction
/* jshint esversion:6 */



function getBulatovPeriod(k, m) {
    const n = 2;
    const gamma = Math.PI / k;
    const alpha = Math.PI / n;
    const beta = Math.PI / m;
    const angleSum = 1 / k + 1 / n + 1 / m;
    // check for elliptic and euklidic case
    // just some arbitrary length
    if (angleSum > 0.999) {
        return 1;
    }
    // hyperbolic case assuming circle r=1, circle is on x-axis
    let centerX = Math.cos(beta) / Math.sin(gamma);
    // renormalize to poincare radius 1 (devide by poincare radius)
    const radius = 1 / sqrt(centerX * centerX - 1);
    centerX = radius * centerX;
    if ((k % 2) === 0) {
        return 8 / Math.PI * Math.atanh(centerX - radius);
    } else {
        const angle = Math.PI * (0.5 - 1 / k - 1 / m);
        const a = Math.sqrt(centerX * centerX + radius * radius - 2 * centerX * radius * Math.cos(angle));
        return 8 / Math.PI * (Math.atanh(centerX - radius) + Math.atanh(a));
    }
}