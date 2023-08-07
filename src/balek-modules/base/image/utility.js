
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/node!canvas'
    ],
    function (declare, lang, canvas) {
        return declare("moduleBaseImageUtility", null, {

            constructor: function (args) {
                declare.safeMixin(this, args);
console.log("CANVAS🦷🦷", canvas)
            },
            resizeImageBase64: function (base64Image, targetMaxWidthAndHeight) {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    const loadImage = canvas.loadImage
                    const createCanvas = canvas.createCanvas

                    if(typeof createCanvas === 'function' && typeof loadImage === 'function')
                    {
                        loadImage(`data:image/jpeg;base64,${base64Image}`).then(function(image){
                            if(image && image.width && image.height){
                                const originalWidth = image.width;
                                const originalHeight = image.height;
                                let targetWidth = targetMaxWidthAndHeight
                                let targetHeight = targetMaxWidthAndHeight

                                if(originalWidth > originalHeight){
                                   targetHeight = (targetMaxWidthAndHeight / originalWidth) * originalHeight;
                                }else{
                                    targetWidth = (targetMaxWidthAndHeight / originalHeight) * originalWidth;
                                }
                                const canvas = createCanvas(targetWidth, targetHeight);


                                const context = canvas.getContext('2d');
                                context.drawImage(image, 0, 0, targetWidth, targetHeight);


                                const resizedImage = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '');



                                Resolve(resizedImage)
                            }else {
                                Reject({Error: "base64Image could not be converted to Image"})
                            }
                        })
                    }
                }))


            // const image = await loadImage(`data:image/jpeg;base64,${base64Image}`);
            // const originalWidth = image.width;
            // const originalHeight = image.height;
            // const targetHeight = (targetWidth / originalWidth) * originalHeight;
            //
            // const canvas = createCanvas(targetWidth, targetHeight);
            // const context = canvas.getContext('2d');
            // context.drawImage(image, 0, 0, targetWidth, targetHeight);
            //
            // const resizedImage = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '');
            // return resizedImage;
        }


    });
    });
