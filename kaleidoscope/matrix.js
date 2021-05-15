/* jshint esversion: 6 */

// speedy 4*4 matrices
// defined as Float32Array(45)
// using as mat[i,j]=array[j*10+i]

export const matrix = {};


const x = new Float32Array(45);
var i, j;
for (i = 0; i < 45; i++) {
    x[i] = i;
}
console.log(x);

/**
 * logging the 4*4 matrix part
 * @method matrix.log
 * @param {float array} matrix - 4*4 matrix
 */
matrix.log = function(matrix) {
    console.log(matrix[11], matrix[12], matrix[13], matrix[14]);
    console.log(matrix[21], matrix[22], matrix[23], matrix[24]);
    console.log(matrix[31], matrix[32], matrix[33], matrix[34]);
    console.log(matrix[41], matrix[42], matrix[43], matrix[44]);
};

/**
 * multiply matrices
 * @method matrix.mul
 * @param {float array} c - 4*4 matrix, will be product b*a
 * @param {float array} b - 4*4 matrix
 * @param {float array} a - 4*4 matrix
 */
matrix.mul = function(c, b, a) {
    for (var i = 10; i < 41; i += 10) {
        for (var j = 1; j < 5; j++) {
            let sum = 0;
            for (var k = 1; k < 5; k++) {
                sum += b[i + k] * a[10 * k + j];
            }
            c[i + j] = sum;
        }
    }
};

/**
 * set a matrix
 * @method matrix.set
 * @param {float array} m - 4*4 matrix
 * @param {float...} components -beginning with forst row, ...
 */
matrix.set = function(m, components) {
    for (var i = 1; i < 5; i++) {
        m[10 + i] = arguments[i];
        m[20 + i] = arguments[i + 4];
        m[30 + i] = arguments[i + 8];
        m[40 + i] = arguments[i + 12];
    }
};

const c = new Float32Array(45);
const b = new Float32Array(45);
b.fill(1);

matrix.log(x);
matrix.log(b);
matrix.mul(c, b, x);
matrix.log(c);
matrix.set(c,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)
matrix.log(c)
matrix.set(b,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)
matrix.log(b)
matrix.mul(c,b,x)
matrix.log(c)
