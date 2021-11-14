/*==========================================================
 * poincareDiscMapping: Maps the tiled Poincare disc into the basic hyperbolic
 * triangle, does also elliptic and euklidic geometry
 *
 * input parameters: (int) action plus variable arguments
 * output: depending on action
 *
 * The action input parameter determines what the function does:
 *
 * action = 0 is for initialization
 *  input=[k n m] a vector of integers, determines the symmetries and the
 *  basic triangle.
 *  output=0
 *  k is order of dihedral symmetry at center, pi/k the angle between the
 *  straight mirror lines (x-axis and oblique line)
 *  n is order of dihedral symmetry arising at x-axis and the third side of
 *  the triangle (circle or straight line), angle pi/n
 *  m is order of dihedral symmetry arising at the oblique line
 *  and the third side of the triangle (circle or straight line), angle pi/n
 *  the radius of the poincare disc is equal to 1
 *  the radius of the equator in stereographic projection is equal to 1
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
#include <math.h>

void mexFunction(int nlhs, mxArray * plhs[],
   int nrhs,
   const mxArray * prhs[]) {
   int action;
   double *output, *input;   /* change for float (single) data */
   double *geometryInput;
   static int k,n,m;

   /* make sure that there is an action input*/
   if (nrhs == 0) {
      mexErrMsgIdAndTxt("poincareDiscMapping:nrhs", "The action parameter is missing.");
   }
        /* it should be scalar */
    if(   mxGetNumberOfElements(prhs[0])!=1 ) {
        mexErrMsgIdAndTxt("poincareDiscMapping:notScalar","Action parameter must be a scalar.");
    }
   action = (int) mxGetScalar(prhs[0]);
   switch (action) {
   case 0:
      printf("initial\n");
      /* initialize, input should be an array of 3 (integer) numbers*/
          if(nrhs!=2) {
        mexErrMsgIdAndTxt("poincareDiscMapping:nrhs","Initialization, action and input data required.");
    }
    if(   mxGetNumberOfElements(prhs[1])!=3 ) {
        mexErrMsgIdAndTxt("poincareDiscMapping:not3","Initialization -input data has to have three numbers.");
    }
      /* pointer to input data for geometry as three double (matlab default) numbers*/     
    #if MX_HAS_INTERLEAVED_COMPLEX
    geometryInput = mxGetDoubles(prhs[1]);
    #else
    geometryInput = mxGetPr(prhs[1]);
    #endif
    k=(int) geometryInput[0];
    n=(int) geometryInput[1];
    m=(int) geometryInput[2];
    
    printf("%d %d %d\n",k,n,m);
      break;
   case 1:
      printf("mapping\n");
      break;
   default:
      mexErrMsgIdAndTxt("poincareDiscMapping:action", "Unknown action for value %d.", action);
   }

}