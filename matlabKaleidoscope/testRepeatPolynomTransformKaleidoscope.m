

k=5; m =4; n = 2; 

vm = testPolynomTranformKaleidoscope2(k, m, n); 
im=createStructureImage(vm);
imshow(im); 

function vm = testPolynomTranformKaleidoscope2(k, m, n)
    s = 1000;
    mPix=s*s/1e6;
    range=2;
    xMin=-range;xMax=range;yMax=range;yMin=-range;
    coeffs=[0 1 0 1 0 0 0 0 2 ];
    coeffs=[0 1 0 10 0 0 0 0 2 ];
    imCos=[0  0.5 0.2];
   coeffs=[0 1.2 0.1 0.25  ];
    imCos=[0 0.12 ];
    limit=1;
    
    map=createIdentityMap(mPix,xMin,xMax,yMin,yMax);
 %    inversionMap(map,limit);
    for p=1:4 
        polynomTransformMap(map,coeffs,imCos); 
     %   max(map,[],'all')
  %   rescaleMap(map,limit);
  %   blackoutMap(map,limit);
     inversionMap(map,limit);
    end 
    vm = basicKaleidoscope(map,k,m,n);
end
