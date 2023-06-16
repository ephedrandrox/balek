define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',], function (declare, lang, Stateful){
    return declare("tabularFileModel", null, {

        fileDataString : null,

        //state variables
        fileDate : null,
        fileDataStringWhen: null,
        fileSize : null,
        fileName : null,

        modelState: null,

        constructor: function(args){

            this.fileDataString = ""
            declare.safeMixin(this, args);
            console.log("tabularTableModel")



            //Create the Model State
            let ModelState = declare([Stateful], {

            });

            this.modelState = new ModelState({
                fileDate : lang.clone(this.fileDate),
                fileDataStringWhen: lang.clone(this.fileDataStringWhen),
                fileSize : lang.clone(this.fileSize),
                fileName : lang.clone(this.fileName)
            });


        },
        //public Methods
        readFile : function(file){

            let reader = new FileReader();
            reader.onload = lang.hitch(this, function (onLoadEvent) {
                console.log("FILE:", file)
                let fileDate = new Date(file.lastModified)
                this.setFileDate(fileDate)

                this.fileDataString = onLoadEvent.target.result

                this.fileSize = file.size
                this.setFileSize(this.fileSize)

                this.fileName = file.name
                this.setFileName(this.fileName)

                this.fileDataStringWhen = Date.now()

                this.setFileDataStringWhen(this.fileDataStringWhen)

            });
            // Read in the image file as a data URL.
            reader.readAsText(file);

        },
        //State getters and setters
        getModelState: function(){
            return this.modelState;
        },

        getFileDate : function(){
            return this.modelState.get("fileDate");
        },
        setFileDate : function(setTo){
            this.modelState.set("fileDate", setTo);
        },

        getFileDataString : function(){
            return this.fileDataString
        },


        getFileDataStringWhen: function(){
            return this.modelState.get("fileDataStringWhen");
        },
        setFileDataStringWhen: function(setTo){
            this.modelState.set("fileDataStringWhen", setTo);
        },

        getFileSize : function(){
            return this.modelState.get("fileSize");
        },
        setFileSize : function(setTo){
            this.modelState.set("fileSize", setTo);
        },

        getFileName : function(){
            return this.modelState.get("fileName");
        },
        setFileName : function(setTo){
            this.modelState.set("fileName", setTo);
        }

    })

})