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
 * @class Complex
 */

var complexN;

(function() {
    "use strict";

    // static private variables

    var numberOfDigits, eps, eps2, iEps;
    const pool = [];

    complexN = class {

        constructor(x = 0, y = 0) {
            this.re = x;
            this.im = y;
        }

        /**
         * set the number of digits for ouput
         * @method complexN.setNumberOfDigits
         * @param {integer} n
         */
        static setNumberOfDigits(n) {
            numberOfDigits = n;
        }

        /**
         * set numerical precision
         * @method setNumericalPrecision
         * @param {float} epsilon - default 1e-8
         */
        static setNumericalPrecision(epsilon = 1e-8) {
            eps = epsilon;
            eps2 = eps * eps;
            iEps = 1 / eps;
        }

        /**
         * limit the maximum absolute value of real and imaginary parts by scaling
         * @method complexN#limit
         * @return complexN
         */
        limit() {
            const maxi = Math.max(Math.abs(this.re), Math.abs(this.im));
            if (maxi > iEps) {
                const factor = iEps / maxi;
                this.re *= factor;
                this.im *= factor;
            }
            return this;
        }

        /**
         * transform to string, using given number of digits
         * @method complexN#toString
         * @return complex number as string
         */
        toString() {
            let result = "(" + this.re.toPrecision(numberOfDigits) + " ";
            if (this.im > 0) {
                result += "+";
            } else {
                result += "-";
            }
            result += " " + Math.abs(this.im).toPrecision(numberOfDigits) + " * i)";
            return result;
        }

        /**
         * log a complex number to the console
         * @method complexN.log
         * @param {String} text
         * @return complexN this
         */
        log(text) {
            if (arguments.length > 0) {
                console.log(text + ": " + this.toString());
            } else {
                console.log(this.toString());
            }
            return this;
        }

        // using the pool for recycling
        /**
         * add the complex number to the pool
         * be careful to make it thread-safe
         * @method complexN#toPool
         */
        toPool() {
            pool.push(this);
            console.log(pool.length);
        }

        /**
         * create a complex number or get one from the pool
         * @method complexN.create
         * @param {float} re - default 0
         * @param {float} im - default 0
         * @return complexN
         */
        static create(re = 0, im = 0) {
            console.log(pool.length);
            if (pool.length > 0) {
                console.log("from pool");
                const z = pool.pop();
                z.re = re;
                z.im = im;
                return z;
            } else {
                console.log("new");
                return new complexN(re, im);
            }
        }

        // copying complex numbers, setting their values

        /**
         * make and return a copy of this
         * to keep this unchanged in following oparations
         * @method complexN#copy
         * @return complexN
         */
        copy() {
            return complexN.create(this.re, this.im);
        }

        /**
         * set this number equal to another one, return the number
         * @method complexN#set
         * @param {complexN} that
         * @return this, set to that
         */
        set(that) {
            this.re = that.re;
            this.im = that.im;
            return this;
        }

        /**
         * set real and imaginary part of this number, default values are 0
         * @method complexN#setReIm
         * @param {float} re
         * @param {float} im
         * @return this, set to that
         */
        setReIm(re = 0, im = 0) {
            this.re = re;
            this.im = im;
            return this;
        }

        // real valued properties

        /**
         * calculate the absolute value
         * @method complexN.abs 
         * @return float
         */
        abs() {
            return Math.hypot(this.re, this.im);
        }

        /**
         * calculate the argument (angle, phase)
         * @method complexN.arg 
         * @return float
         */
        arg() {
            return Math.atan2(this.im, this.re);
        }

        // modifying operations

        /**
         * conjugate this, changing this and returning it
         * @method complexN#add
         * @return complexN  for chaining
         */
        conj() {
            this.im = -this.im;
            return this;
        }

        /**
         * invert this, changing this and returning it
         * @method complexN#add
         * @return complexN  for chaining
         */
        inv() {
            const factor = 1 / (this.re * this.re + this.im * this.im + eps2);
            this.re *= factor;
            this.im *= -factor;
            return this;
        }

        /**
         * calculate the square root of this, changing this and returning it
         * @method complexN#rt
         * @return complexN  for chaining
         */
        rt() {
            const a = this.abs();
            // mapping to the upper complex plane
            const sign = (this.im < 0) ? -1 : 1;
            this.im = Math.sqrt(0.5 * (a - this.re));
            this.re = sign * Math.sqrt(0.5 * (a + this.re));
            return this;
        }



        /**
         * add that to this, changing this and returning it
         * @method complexN#add
         * @param {complexN} that
         * @return complexN  for chaining
         */
        add(that) {
            this.re += that.re;
            this.im += that.im;
            return this;
        }

        /**
         * subtract that from this, changing this and returning it
         * @method complexN#sub
         * @param {complexN} that
         * @return complexN for chaining
         */
        sub(that) {
            this.re -= that.re;
            this.im -= that.im;
            return this;
        }

        /**
         * scale this, limiting its max component, changing this and returning it
         * @method complexN#scale
         * @param {float} s
         * @return complexN for chaining
         */
        scale(s) {
            this.re *= s;
            this.im *= s;
            this.limit();
            return this;
        }

        /**
         * multiply this with that, limiting the product, changing this and returning it
         * checks type of argument to do real numbers too, for compatibility with previous work
         * @method complexN#mul
         * @param {complexN} that or simple real number (better use scale)
         * @return complexN for chaining
         */
        mul(that) {
            if (that instanceof complexN) {
                const re = this.re * that.re - this.im * that.im;
                this.im = this.re * that.im + this.im * that.re;
                this.re = re;
            } else if ((typeof that) == "number") {
                this.re = this.re * that;
                this.im = this.im * that;
            }
            this.limit();
            return this;
        }

        /**
         * divide this by that, limiting the result, changing this and returning it
         * @method complexN#div
         * @param {complexN} that
         * @return complexN for chaining
         */
        div(that) {
            const factor = 1 / (that.re * that.re + that.im * that.im + eps2);
            const re = factor * (this.re * that.re + this.im * that.im);
            this.im = factor * (this.im * that.re - this.re * that.im);
            this.re = re;
            this.limit();
            return this;
        }



    };

    // initialization
    complexN.setNumberOfDigits(4);
    complexN.setNumericalPrecision();
}());
