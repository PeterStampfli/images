

function testScaleKaleidoscope()
s = 1000;
mPix=s*s/1e6;
range=3;
map=createIdentityMap(mPix,-range,range,-range,range);
limit=2;
inversionMap(map,limit);

scale(map, limit,1);

basicKaleidoscope(map,4,3,2);
im=createStructureImage(map);
imshow(im)
end
