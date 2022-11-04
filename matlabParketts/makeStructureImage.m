% create the structure image of some kaleidoscope
% shows pattern of inversions

function makeStructureImage()
% make the initial map
s = 1000;
mPix=s*s/1e6;
map=createIdentityMap(mPix,-1,1,-1,1);
% transform the map into a kaleidoscope
basicKaleidoscope(map,6,3,3);
% create and show the image of the structure
im=createStructureImage(map);
imshow(im)
end
