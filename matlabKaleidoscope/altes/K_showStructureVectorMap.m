function K_showStructureVectorMap(map)
%show the structure of a vector map (:,:,x,y,inversions)
% it is the 3rd component of the map,
%either 0, 1 or negative (for invalid points)
global K;
[height,width,~]=size(map);
im=zeros(height,width);
for iy=1:height
    for ix=1:width
        color=map(iy,ix,3);
        if (color<0)
            color=0.5;
        end
        im(iy,ix)=color;
    end
end
imshow(im)
end