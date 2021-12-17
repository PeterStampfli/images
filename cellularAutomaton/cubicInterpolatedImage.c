/*==========================================================
 * make nearest neighbour image from cell array
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *  the double border does not count for the image
 *
 * image array of integers
 *
 * optional: imageFactor, default 1
 *  scaless from states to image colors, for intermediate values
 *
 * maps pixels to cells with nearest neighbor interpolation
 * show image with mapped colors, imshow(image,colors)
 *
 *  cd /home/peter/images/cellularAutomaton
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

/*
 * the interpolation kernel: linear interpolation is much slower, the arrow function form is slightly slower
 * it is normalized to 1 within an error of about 1.00001 ! (good enough)
 */
float kernel(float x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int cellSize, imageSize, *cells, *image;
    int center, i, j, jImageSize, jCell, jCellSize, jMCellSize, j1CellSize, j2CellSize, iCell;
    int cellIndex, cellIndexM, cellIndex1, cellIndex2;
    float dx, dy, kx, kym, ky, ky1, ky2;
    float scale, offset, sum, imageFactor;
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:nrhs","A cell array and an image array input required.");
    }
    /* check number of dimensions of the cell (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The cell array has to have two dimensions.");
    }
    if(mxGetNumberOfDimensions(prhs[1]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The image array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    cellSize = dims[0];
    dims = mxGetDimensions(prhs[1]);
    imageSize = dims[0];
    scale = (cellSize - 4) / ((float) imageSize);
    offset = (3 + scale) / 2;
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
    image = mxGetInt32s(prhs[1]);
#else
    cells = (int *) mxGetPr(prhs[0]);
    image = (int *) mxGetPr(prhs[1]);
#endif
    if (nrhs >= 3){
        imageFactor = (float) mxGetScalar(prhs[2]);
    } else {
        imageFactor = 1;
    }
    for (j = 0; j < imageSize; j++){
        jImageSize = j * imageSize;
        dy = j * scale + offset;
        jCell = (int) floorf(dy);
        jCellSize = cellSize * jCell;
        jMCellSize = jCellSize - cellSize;
        j1CellSize = jCellSize + cellSize;
        j2CellSize = j1CellSize + cellSize;
        kym = kernel(1 + dy);
        ky = kernel(dy);
        ky1 = kernel(1 - dy);
        ky2 = kernel(2 - dy);
        dy -= jCell;
        for (i = 0; i < imageSize; i++){
            dx = i * scale + offset;
            iCell = (int) floorf(dx);
            cellIndex = jCellSize + iCell;
            cellIndexM = jMCellSize + iCell;
            cellIndex1 = j1CellSize + iCell;
            cellIndex2 = j2CellSize + iCell;
            dx -= iCell;
            kx = kernel(1 + dx);
            sum = kx * (kym * cells[cellIndexM - 1] + ky * cells[cellIndex - 1] + ky1 * cells[cellIndex1 - 1] + ky2 * cells[cellIndex2 - 1]);
            kx = kernel(dx);
            sum += kx * (kym * cells[cellIndexM] + ky * cells[cellIndex] + ky1 * cells[cellIndex1] + ky2 * cells[cellIndex2]);
            kx = kernel(1 - dx);
            sum += kx * (kym * cells[cellIndexM + 1] + ky * cells[cellIndex + 1] + ky1 * cells[cellIndex1 + 1] + ky2 * cells[cellIndex2 + 1]);
            kx = kernel(2 - dx);
            sum += kx * (kym * cells[cellIndexM + 2] + ky * cells[cellIndex + 2] + ky1 * cells[cellIndex1 + 2] + ky2 * cells[cellIndex2 + 2]);
            image[jImageSize + i] = (int) roundf(imageFactor * sum);
        }
    }
}