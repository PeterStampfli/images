colors=[1,0,0;0,1,0;0,0,1;1,1,0;1 0.5 0;1 0 1;0 1 1];

rs=[roots(3,1) roots(3,1.5) 0]
[~,dim]=size(rs);
one=ones(1,dim);
eps=0.01;
itemax=100;

nPixels=1000;
image=ones(nPixels,nPixels,3);
width=4;
centerX=0;
centerY=0;
dx=width/nPixels;
zeroSize=0.05;
nPixels2=nPixels/2;

for h=1:nPixels
    for k=1:nPixels
        z=((k-nPixels2)-i*(h-nPixels2))*dx+centerX+centerY*i;
            deltas=rs-z;
            [minerr,~]=min(abs(deltas));
        if (minerr<zeroSize)
            image(h,k,:)=0;
        else
        iter=0;
        minerr=1;
        while (minerr>eps)&&(iter<itemax)
            iter=iter+1;
            deltas=rs-z;
            z=z+1/sum(one./deltas);
            
            [minerr,iminerr]=min(abs(deltas));
            
        end
        image(h,k,:)=colors(iminerr,:);
        end
    end
end
imshow(image)
%imwrite(I,"newton.jpg")