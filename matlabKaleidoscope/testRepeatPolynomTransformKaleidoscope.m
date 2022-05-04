

k=5; m =4; n = 2; 

vm = testPolynomTranformKaleidoscope2(k, m, n); 
im=createStructureImage(vm);
imshow(im); 

function vm = testPolynomTranformKaleidoscope2(k, m, n)
    s = 1000;
    mPix=s*s/1e6;
    xMin=-1.5;xMax=1.5;yMax=1.5;yMin=-1.5;
   % coeffs=[0 1 0 1 0 0 0 0 2 ];
   % imCos=[0  0.5 0.2];
   coeffs=[0 1 0 1  ];
    imCos=[0 0.3];
    
    map=createIdentityMap(mPix,xMin,xMax,yMin,yMax);
    for p=1:4 
        polynomTransformMap(map,coeffs,imCos); 
        max(map,[],'all')
    end 
    vm = basicKaleidoscope(map,k,m,n);
end
