colors=[1,0,0;0,1,0;0,0,1;1,1,0;1 0.5 0;1 0 1;0 1 1];

rs=[roots(3,1)]
[~,dim]=size(rs);
one=ones(1,dim);
eps=0.01;
itemax=100;

nPixels=400;
image=ones(nPixels,nPixels,3);
width=3;
centerX=0;
centerY=0;
dx=width/nPixels;
zeroSize=0.05;
nPixels2=nPixels/2;
zLimit=30;

for h=1:nPixels
    for k=1:nPixels
        z=((k-nPixels2)-i*(h-nPixels2))*dx+centerX+centerY*i;
        iniz=z;
        atZero=false;
        for ix=1:dim
            if (abs(z-rs(ix))<zeroSize)
                atZero=true;
                break;
            end;
        end
        if (atZero)
            image(h,k,:)=0;
        else
            iter=0;
            minerr=1000;
            while (minerr>eps)&&(iter<itemax)
                iter=iter+1;
                       iminerr=dim+1;
                minerr=1000;
                corr=-1/z;
                for ix=1:dim
                    dz=z-rs(ix);
                    liz=z;
                    d=abs(dz);
                    if (minerr>d)
                        minerr=d;
                        if (d<eps)
                        iminerr=ix;
                        break;
                        end
                    end
                    if (abs(z)>zLimit)
                       minerr=0;
                       break;
                    end
                    corr=corr+1/dz;
                end
                z=z-1/corr;
                
                
            end
            image(h,k,:)=colors(iminerr,:);
        end
    end
end
imshow(image)
%imwrite(I,"newton.jpg")