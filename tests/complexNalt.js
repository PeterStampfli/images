/****************************************************************************************
 * 
 * on numerical precision
 * **************************
 * 
Observations:
- The numerical precision of javascript numbers is 17 digits.
- The absolute value of numbers is typically around 1 to 10. We want an optimum precision in this range.
- Addition and Subtraction destroyes numerical accuracy. We want an absolute error of less than 10⁻⁸. Thus, the absolute value of numbers should be less than 10⁸.
- Numbers less than 10⁻⁸ including zero are essentially equivalent to 10⁻⁸.
- Numbers larger than 10⁸ including infinity are essentially equivalent to 10⁸. This agrees with the symmetry of the Riemann sphere (stereographic projection of the complex plane to a sphere) as exchanging the upper and lower hemisphere is the same as z->1/conjugate(z).

Proposal (for the four basic operations):
- Define a number eps=10⁻⁸. Its value corresponds to precision and can be changed if necessary.
- Addition and subtraction do not need modifications.
- Inversion and division: Replace 1/(this.re+this.im) by 1/(this.re^2+this.im^2+eps^2). Avoids division by zero and limits the absolute value of the inverted number. Does not change the precision of the calculation and is fast.
- Multiplication and division: Check for "overflow" resulting from multiplication of two large numbers. "Renomalize", if the absolute values of the real or imaginary components of the result become larger than 1/eps. Thus

if (abs(this.re)>1/eps){
z.scale(1/eps/abs(this.re
))
}

and similar for this.im. (programming it a bit more efficient. Of course.) This should be rather fast without detroying accuracy.

Other calculations too should be programmed to avoid numerical traps.
***************************************************************************************/

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Complex Arithmetic
// complex numbers are (this.re + this.im * i)

/* jshint esversion:6 */

/**
 * a class for complex number arithmetics and more
 * @class complexN
 */

class complexN {

    constructor(x, y) {
        this.re = x;
        this.im = y;
    }

    /**
     * set the number of digits for ouput
     * @method complexN.setNumberOfDigits
     * @param {integer} n
     */
    static setNumberOfDigits(n) {
        complexN.numberOfDigits = n;
    }

    /**
     * transform to string, using given number of digits
     * @method complexN#toString
     * @return complex number as string
     */
    toString() {
        let result = "(" + this.re.toPrecision(complexN.numberOfDigits) + " ";
        if (this.im > 0) {
            result += "+";
        } else {
            result += "-";
        }
        result += " " + Math.abs(this.im).toPrecision(complexN.numberOfDigits) + " * i)";
        return result;
    }
}

complexN.setNumberOfDigits(4);
