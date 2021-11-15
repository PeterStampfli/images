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
 * for a hyperbolic tiling, *542, with pentagons
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

void mexFunction(int nlhs, mxArray * plhs[], int nrhs, const mxArray * prhs[]) {
    mxArray *outputVectorThing;   /* goes to plhs*/
    float *outputVector, *inputVector;
static int k,m,n;
enum geometryType {elliptic, euklidic,hyperbolic};
static enum geometryType geometry;
static float alpha, beta , gamma;
static float sines[100],cosines[100];
   /* make sure that there is an action input*/
   if (nrhs == 0) {
      mexErrMsgIdAndTxt("poincareDiscMapping:nrhs", "The action parameter is missing.");
   }
        /* it should be scalar */
    if(   mxGetNumberOfElements(prhs[0])!=1 ) {
        mexErrMsgIdAndTxt("poincareDiscMapping:notScalar","Action parameter must be a scalar.");
    }
   int action = (int) mxGetScalar(prhs[0]);
   switch (action) {
   case 0:
      /* initialize, input should be an array of 3 (integer) numbers*/
          if(nrhs!=4) {
        mexErrMsgIdAndTxt("poincareDiscMapping:nrhs","Initialization needs 4 inputs, action and k, m, n data required.");
    }
      /* here comes the geometry*/
   k=(int) mxGetScalar(prhs[1]);
   m=(int) mxGetScalar(prhs[2]);
   n=(int)  mxGetScalar(prhs[3]);
           gamma = PI / k;
        alpha = PI / n;
        beta = PI / m;
float angleSum;
        angleSum = 1.0f / k + 1.0f / n + 1.0f / m;
           if (angleSum > 1.001){
            geometry = elliptic;}
        else if (angleSum > 0.999){
            geometry = euklidic;}
        else{
            geometry = hyperbolic;}
        /* the rotations of the dihedral group, order k*/
        if (k>100){
                    mexErrMsgIdAndTxt("poincareDiscMapping:k","Initialization, k has to be smaller or equal to 100.");
        }
        float dAngle;
                dAngle = 2.0f * PI / k;
                for (int i=0;i<k;i++){
                    sines[i]=sin(i*dAngle);
                    cosines[i]=cos(i*dAngle);
                }
                /* create output vector only once (if possible???), store pointer as static*/
                   outputVectorThing=   mxCreateNumericMatrix(1,3,mxSINGLE_CLASS,mxREAL);

    #if MX_HAS_INTERLEAVED_COMPLEX
    outputVector = mxGetSingles(outputVectorThing);
    #else
    outputVector =(float*) mxGetData(outputVectorThing);
    #endif
    printf("%d %d %d\n",k,n,m);
    
    printf("%f\n",angleSum);
      break;
   case 1:
      printf("mapping\n");
      break;
   default:
      mexErrMsgIdAndTxt("poincareDiscMapping:action", "Unknown action for value %d.", action);
   }

}