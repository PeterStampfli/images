/* jshint esversion: 6 */

/**
 * speedy 4*4 matrices, defined as Float32Array(45)
 * use as mat[i,j]=array[j*10+i]
 * matrix calculations only required once for update of parameters
 * thus garbage collection will not be important
 * we can create extra matrices in methodss and return them
 * @namespace matrix
 */

export const matrix = {};

/**
 * logging the 4*4 matrix part
 * @method matrix.log
 * @param {float array} matrix - 4*4 matrix
 * @param {String} message - optional
 */
matrix.log = function(matrix,message) {
    if (arguments.length>1){
        console.log(message);
    }
    console.log(matrix[11], matrix[12], matrix[13], matrix[14]);
    console.log(matrix[21], matrix[22], matrix[23], matrix[24]);
    console.log(matrix[31], matrix[32], matrix[33], matrix[34]);
    console.log(matrix[41], matrix[42], matrix[43], matrix[44]);
};

/**
 * create a matrix from a list of components
 * missing components or undefined or infinites or not numbers are set to zero
 * @method matrix.create
 * @param {float...} components - optional, beginning with first row, ...
 * @return {float array}
 */

function safeNumber(x) {
    if ((typeof x === 'number') && isFinite(x)) {
        return x;
    } else {
        return 0;
    }
}

matrix.create = function(components) {
    const m = new Float32Array(45);
    if (arguments.length > 0) {
        for (var i = 1; i < 5; i++) {
            m[10 + i] = safeNumber(arguments[i - 1]);
            m[20 + i] = safeNumber(arguments[i + 3]);
            m[30 + i] = safeNumber(arguments[i + 7]);
            m[40 + i] = safeNumber(arguments[i + 11]);
        }
    }
    return m;
};

/**
 * add matrices
 * @method matrix.sum
 * @param {float array} b - 4*4 matrix
 * @param {float array} a - 4*4 matrix
 * @return {float array} c - 4*4 matrix, will be sum b+a
 */
matrix.sum = function(b, a) {
    const c = matrix.create();
    for (var i = 0; i < 45; i++) {
        c[i] = b[i] + a[i];
    }
    return c;
};

/**
 * multiply matrices
 * @method matrix.prod
 * @param {float array} b - 4*4 matrix
 * @param {float array} a - 4*4 matrix
 * @return {float array} 4*4 matrix, will be product b*a
 */
matrix.prod = function(b, a) {
    const c = matrix.create();
    for (var i = 10; i < 41; i += 10) {
        for (var j = 1; j < 5; j++) {
            let sum = 0;
            for (var k = 1; k < 5; k++) {
                sum += b[i + k] * a[10 * k + j];
            }
            c[i + j] = sum;
        }
    }
    return c;
};

/**
 * make a projector from a vector
 * @method matrix.projector
 * @param {float} x - component of vector
 * @param {float} y
 * @param {float} y
 * @param {float} y
 * @return {float array} 4*4 matrix
 */
matrix.projector = function(x, y, z, w) {
    const c = matrix.create(x * x, x * y, x * z, x * w, y * x, y * y, y * z, y * w, z * x, z * y, z * z, z * w, w * x, w * y, w * z, w * w);
    return c;
};

/**
 * make a combination from a scalar and two vectors
 * a matrix that makes m p=s a (b . p)
 * @method matrix.combine
 * @param {float} s
 * @param {array of float} a - 4-vector
 * @param {array of float} b - 4-vector
 * @return {float array} 4*4 matrix
 */
matrix.combine = function(s, a, b) {
    const c = matrix.create();
    for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
            c[10 * i + j] = s * a[i] * b[j];
        }
    }
    return c;
};

/**
 * make the transpose of a matrix
 * @method matrix.transpose
 * @param {array of float} m - 4*4 matrix
 * @return {float array} 4*4 matrix
 */
matrix.transpose = function(m) {
    const c = matrix.create();
    for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
            c[10 * i + j] = m[i + 10 * j];
        }
    }
    return c;
};

/**
 * check if a matrix is an orthogonal matrix m*mTransposed=identitymatrix
 * log the result if fail
 * a rotation matrix is orthogonal
 * @method matrix.isOrthogonal
 * @param {array of floats} m
 */

const eps = 0.001;

function isSmall(x) {
    return (Math.abs(x) < eps);
}

matrix.isOrthogonal = function(m) {
    const product = matrix.prod(m, matrix.transpose(m));
    for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
            let v = product[10 * i + j];
            if (i === j) {
                v -= 1;
            }
            if (!isSmall(v)) {
                console.log('Not orthogonal matrix:');
                matrix.log(m);
                console.log('m * m_transposed:');
                matrix.log(product);
                return;
            }
        }
    }
};

/**
 * make 3d rotation matrix from Euler angles
 * @method matrix.euler
 * @param {float} alpha - angle in degrees
 * @param {float} beta
 * @param {float} gamma
 */
matrix.euler = function(alpha, beta, gamma) {
    const fromDeg = Math.PI / 180;
    const c1 = Math.cos(fromDeg * alpha);
    const s1 = Math.sin(fromDeg * alpha);
    const c2 = Math.cos(fromDeg * beta);
    const s2 = Math.sin(fromDeg * beta);
    const c3 = Math.cos(fromDeg * gamma);
    const s3 = Math.sin(fromDeg * gamma);
    const m = matrix.create();
    m[11] = c1 * c3 - c2 * s1 * s3;
    m[12] = -c1 * s3 - c2 * c3 * s1;
    m[13] = s1 * s2;
    m[21] = c3 * s1 + c1 * c2 * s3;
    m[22] = c1 * c2 * c3 - s1 * s3;
    m[23] = -c1 * s2;
    m[31] = s2 * s3;
    m[32] = c3 * s2;
    m[33] = c2;
    m[44] = 1;
    return m;
};


// working with vectors
//====================================

var x, y, z, w;

/**
 * apply a matrix on the (x,y,z,w)-vector
 * as four variables
 * need to copy directly to using module (scope!)
 * @method matrix.apply
 * @param {array of floats} m - has the 4*4 matrix
 */
matrix.apply = function(m) {
    const newX = m[11] * x + m[12] * y + m[13] * z + m[14] * w;
    const newY = m[21] * x + m[22] * y + m[23] * z + m[24] * w;
    const newZ = m[31] * x + m[32] * y + m[33] * z + m[34] * w;
    const newW = m[41] * x + m[42] * y + m[43] * z + m[44] * w;
    x = newX;
    y = newY;
    z = newZ;
    w = newW;
};

/**
 * log the vector x,y,z,w
 * @method matrix.logVector
 */
matrix.logVector = function() {
    console.log(x, y, z, w);
};