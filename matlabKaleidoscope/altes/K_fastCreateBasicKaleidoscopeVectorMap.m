function map=K_fastCreateBasicKaleidoscopeVectorMap(range,size)
% create a vector map of size x size pixels
% coordinates go from -range to +range
global K;
tic;
% setup persistent variables
  K_fastBasicKaleidoscopeMapping(true);
map=zeros(size,size,3,'single');
for iy=1:size
    for ix=1:size
        K.x=range*(2*ix/size-1);
        K.y=range*(2*iy/size-1);
        K.inverted=0;
  K_fastBasicKaleidoscopeMapping(false);
        map(iy,ix,1)=K.x;
        map(iy,ix,2)=K.y;
        map(iy,ix,3)=K.inverted;
    end
end
toc;
end

