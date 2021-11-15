/*==========================================================
 * fastPoincareDiscMapping: Maps the tiled Poincare disc into the basic hyperbolic
 * triangle, does also elliptic and euklidic geometry
 *
 * input parameters: (int) action plus variable arguments depending on action
 * output: depending on action
 *
 * The action input parameter determines what the function does:
 *
 * action = 0 is for initialization
 *  additional input: 3 integers, k, m ,n. Determine the symmetries and the
 *  basic triangle.
 *  no output
 *  k is order of dihedral symmetry at center, pi/k the angle between the
 *  straight mirror lines (x-axis and oblique line), k<=100 !
 *  m is order of dihedral symmetry arising at the oblique line
 *  and the third side of the triangle (circle or straight line), angle pi/n
 *  n is order of dihedral symmetry arising at x-axis and the third side of
 *  the triangle (circle or straight line), angle pi/n
 *  the radius of the poincare disc is equal to 1
 *  the radius of the equator in stereographic projection is equal to 1
 *  call as
 *  fastPoincareDiscMapping(0,5,4,2);
 *  for a hyperbolic tiling, *542, with pentagons
 *
 * action=1 is for the mapping itself.
 *  input=[x y inverted], real numbers, will be transformed to
 *  output=[x y inverted], which makes porting to C easy
 *  (x,y) are coordinates of the point
 *  inverted=0 is for an even number of reflections
 *  inverted=1 is for an odd number of reflections
 *  inverted=-1 is for invalid points (no convergence or outside defined
 *  region)
 *========================================================*/

#include "mex.h"
#include "matrix.h"
#include <math.h>
#define PI 3.14159f
#define maxIterations 100

void mexFunction(int nlhs, mxArray * plhs[], int nrhs, const mxArray * prhs[]) {
    mxArray *outputVectorMatrix;   /* goes to plhs*/
    float *output, *input;
    static int k,m,n;
    enum geometryType {elliptic, euklidic, hyperbolic};
    static enum geometryType geometry;
    static float alpha, beta , gamma;
    static float sines[100],cosines[100];
    static float mirrorX, mirrorNormalX, mirrorNormalY;
    static float circleCenterX, circleCenterY, circleRadius2;
    /* make sure that there is an action input*/
    if (nrhs == 0) {
        mexErrMsgIdAndTxt("poincareDiscMapping:nrhs", "The action parameter is missing.");
    }
    int action = (int) mxGetScalar(prhs[0]);
    switch (action) {
    case 0:
        /* initialize, input should be an array of 3 (integer) numbers*/
        if (nrhs != 4) {
            mexErrMsgIdAndTxt("poincareDiscMapping:nrhs","Initialization needs 4 inputs, action and k, m, n data required.");
        }
        if (nlhs > 0) {
            mexErrMsgIdAndTxt("poincareDiscMapping:nlhs","Initialization has no output.");
        }
        /* here comes the geometry*/
        k = (int) mxGetScalar(prhs[1]);
        m = (int) mxGetScalar(prhs[2]);
        n = (int) mxGetScalar(prhs[3]);
        gamma = PI / k;
        alpha = PI / n;
        beta = PI / m;
        float angleSum;
        angleSum = 1.0f / k + 1.0f / n + 1.0f / m;
        if (angleSum > 1.001){
            geometry = elliptic;
        }
        else if (angleSum > 0.999){
            geometry = euklidic;
        }
        else{
            geometry = hyperbolic;
        }
        /* the rotations of the dihedral group, order k*/
        if (k > 100){
            mexErrMsgIdAndTxt("poincareDiscMapping:k","Initialization, k has to be smaller or equal to 100.");
        }
        float dAngle;
        dAngle = 2.0f * PI / k;
        for (int i = 0; i < k; i++){
            sines[i] = sin(i*dAngle);
            cosines[i] = cos(i*dAngle);
        }
        /* define the inverting circle/mirror line*/
        if (geometry == euklidic){
            /* euklidic geometry with mirror line*/
            /* mirror position is arbitrary, mirror line passes through (mirrorX,0)*/
            mirrorX = 0.5f; 
            /* normal vector to the mirror line, pointing outside*/
            mirrorNormalX = sin(alpha);
            mirrorNormalY = cos(alpha);
        }
        else {
            /* elliptic or hyperbolic geometry with inverting circle*/
            /* calculation of center for circle radius=1*/
            float centerY = cos(alpha);
            float centerX = centerY / tan(gamma) + cos(beta) / sin(gamma);
            if (geometry == 0){
                /* elliptic geometry: flip circle center*/
                /* renormalize to get equator radius of 1 in stereographic projection*/
                float factor = 1 / sqrt(1-centerX*centerX-centerY*centerY);
                circleCenterX = -factor * centerX;
                circleCenterY = -factor * centerY;
                circleRadius2 = factor * factor;
            }
            else {
                /* hyperbolic geometry: renormalize for poincare radius=1*/
                float factor = 1 / sqrt(centerX*centerX+centerY*centerY-1);
                circleCenterX = factor * centerX;
                circleCenterY = factor * centerY;
                circleRadius2 = factor * factor;
            }
        } 
        break;
   case 1:
        printf("mapping\n");
        /* make sure that there is an action and an input*/
        if (nrhs != 2) {
            mexErrMsgIdAndTxt("poincareDiscMapping:nrhs", "Mapping, needs action and input vector parameter.");
        }
        /* make sure that the input vector has 3 components */
        if (mxGetNumberOfElements(prhs[1]) != 3) {
            mexErrMsgIdAndTxt("poincareDiscMapping:notVector","Mapping, input vector has 3 components (x, y, inverted).");
        }
        /* there is one output vector*/
        if (nlhs != 1) {
            mexErrMsgIdAndTxt("poincareDiscMapping:nlhs","Mapping has an output vector.");
        }
        plhs[0]=mxCreateNumericMatrix(1,3,mxSINGLE_CLASS,mxREAL);
        #if MX_HAS_INTERLEAVED_COMPLEX
            output = mxGetSingles(plhs[0]);
            input = mxGetSingles(prhs[1]);
        #else
            output = (float *) mxGetPr(plhs[0]);
            input = (float *) mxGetPr(prhs[1]);
        #endif
        output[1]=34463467;
        break;
   default:
        mexErrMsgIdAndTxt("poincareDiscMapping:action", "Unknown action for parameter value %d.", action);
   }
}