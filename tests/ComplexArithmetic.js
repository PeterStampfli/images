///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Complex Arithmetic
// complex numbers are (this.re + this.im * i)

/* jshint esversion:6 */

class complexN {
    constructor(x, y) {
        this.re = x;
        this.im = y;
    }

    //convert to string
    toString(forMathematicaQ = false, prec = 4) {
        if (forMathematicaQ) {
            return this.re.toFixed(prec) + "+ I " + this.im.toFixed(prec);
        }
        // =================== to make it nicer ???
        else {
            const imString = objectToString(this.im, false, prec);
            if (imString.charAt(0) == "-") {
                return ("(" + objectToString(this.re, false, prec) + " - " + imString.slice(1) + " * i)");
            } else {
                return ("(" + objectToString(this.re, false, prec) + " + " + imString + " * i)");
            }
        }
    }


    // the argument of this; returns a real number
    arg() {
        //===================================================== use atan2
        return Math.atan2(this.im, this.re);
    }

    // the modulus, or absolute value of this; returns a real number
    abs() {
        // ==========================================================use the faster Math.hypot function!
        return Math.hypot(this.re, this.im);
    }

    toArray() {
        return [this.re, this.im];
    }

    copy() {
        return new complexN(this.re, this.im);
    }


    //  Note that these arithmetic operations change this, and return this.
    // Further commands below return a new complexN.

    // inverts this and returns this
    // =========================================================== make it faster, correct typo
    inv() {
        const ss = 1 / (this.re * this.re + this.im * this.im);
        this.re *= ss;
        this.im *= -ss;
        return this;
    }

    // conjugates this and returns this
    conj() {
        this.im = -this.im;
        return this;
    }

    // takes the square root of this and returns this
    //    ====================================================== a better name ???  "toSqrt" (shows that this is modified)

    rt() {
        const a = this.abs();
        //==============================================================rewriting for more efficiency, correct sign?
        // mapping to the upper complex plane
        const sign = (this.im < 0) ? -1 : 1;
        this.im = sqrt(0.5 * (a - this.re));
        this.re = sign * sqrt(0.5 * (a + this.re));
        return this;
    }

    // add a complex number c to this; return this
    add(c) {
        this.re += c.re;
        this.im += c.im;
        return this;
    }

    // subtract a complex number c to this; return this
    sub(c) {
        this.re -= c.re;
        this.im -= c.im;
        return this;
    }

    // multiply a complex number or number  c to this; return this

    //============================================================ should we use two different methods ?
    //====================================================== a.mul(z) where z is complex
    //====================================================== a.scale(s) where s is a scaler (real number)
    //======================================== which finally could be faster if the compiler inlines the method

    mul(c) {
        if (c instanceof complexN) {
            const re = this.re * c.re - this.im * c.im;
            this.im = this.re * c.im + this.im * c.re;
            this.re = re;
        } else if ((typeof c) == "number") {
            this.re = this.re * c;
            this.im = this.im * c;
        }
        return this;
    }


    // divide a complex number c to this; return this
    //  ===================================================== attention: use mul for multiplication to modify this, use inv
    div(c) {
        var r = c.re,
            i = c.im;
        this.mul(c.inv());
        c.re = r;
        c.im = i;
        return this;
    }

    /*
    // returns the (real) distance in the poincare disk from this to a point c.
    // the version below is superior, using 
    poincareDiskDistanceTo(c){
    	var v = this.copy();
    	var w = c.copy();
    	var one = new complexN(1,0);
    	var vv = v.copy().conj();
    	
    	return 2*atanh(
    		((w.sub(v)).div(one.min(vv.conj().mul(w)))).abs())
    	
    }*/


    //  Note that these arithmetic operations do not change this, and return a new copy.



    // ==================================for complicated operations we can use this.copy().method() returns 
    //================================the method() applied on this, but this itself is not altered

    /*
     * is this really a good idea ?
     * It might be confusing and difficult to track
     * maybe better use only the modifying operations and write explicitely
     * 
     * a.copy().add() instead of a.plus(b)
     * 
     * This would strongly simplify troubleshooting and avoids creating too much new copies
     * 
     * note that a.times(b).minus(c) is equivalent to a.copy().mul(b).copy().sub(c)
     * this shows that the second copying is not needed
     * 
     * this approach allows a simple and elegant pooling method
     */

    // returns a new complexN = 1/this
    invert() {
        return this.copy.inv();
    }

    // returns a new complexN = conjugate of this
    conjugate() {
        return new complexN(this.re, -this.im);
    }

    // returns a new complexN = a sqrt of this
    sqrt() {
        return this.copy().rt();
    }

    // returns a new complexN = this + c
    plus(c) {
        return new complexN(this.re + c.re, this.im + c.im);
    }

    // returns a new complexN = this - c
    minus(c) {
        return new complexN(this.re - c.re, this.im - c.im);
    }

    // returns a new complexN = this * c
    times(c) {
        return this.copy().mul(c);
    }


    // returns a new complexN = this / c
    // maybe better to call this "dividedBy"
    divide(c) {
        return this.copy().div(c);
    }

    //=========================================================================== I did not check the following 

    // returns the (real) distance in the poincare disk from this to a point c.

    poincareDiskDistanceTo(v) {
        var one = new complexN(1, 0);
        var w = this;
        return 2 * atanh(
            ((w.minus(v)).divide(one.minus(v.conjugate().times(w)))).abs()); // this makes too many copies
    }


    // applies a mobius transformation to c
    // c.applyMobius(m) has the same functionality as m.applyTo(c)
    applyMobius(m) {
        if (m instanceof diskPreservingMobiusTransform) {
            let Z = m.opQ ? this : this.conjugate();
            return (Z.times(m.a).plus(m.c.conjugate())).divide(Z.times(m.c).plus(m.a.conjugate()));
        } else if (m instanceof mobiusTransform) {
            let Z = m.opQ ? this : this.conjugate();
            return (Z.times(m.a).plus(m.b)).divide(Z.times(m.c).plus(m.d));
        } else // presuming that m is an array [A,C,opQ]
        {
            return this.applyMobius(new diskPreservingMobiusTransform(m));
        }
    }

}
