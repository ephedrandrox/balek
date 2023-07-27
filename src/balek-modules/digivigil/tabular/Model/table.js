define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/text!balek-modules/digivigil/tabular/Workers/mainWorker.js',], function (declare, lang, Stateful, mainWorkerCode){
    return declare("tabularTableModel", null, {
        lineArray: null,

        _WorkerCode: mainWorkerCode,

        dataString: null,
        //State Variables
        mostValuesInAnyLine: null,
        headerStart : 0,
        footerStart : 0,
        dataProcessedWhen: 0,
        valueSeparator: "\t",
        autoTrim: false,

        modelState: null,
        parseWorker: null,

        constructor: function(args){
            this.lineArray = []
            declare.safeMixin(this, args);
            //console.log("tabularTableModel")



            //Create the Model State
            let ModelState = declare([Stateful], {

            });

            this.modelState = new ModelState({
                headerStart: lang.clone(this.headerStart),
                footerStart: lang.clone(this.footerStart),
                mostValuesInAnyLine: lang.clone(this.mostValuesInAnyLine),
                dataProcessedWhen: lang.clone(this.dataProcessedWhen),
                valueSeparator: lang.clone(this.valueSeparator),
                autoTrim: lang.clone(this.autoTrim),

            });

            //Create the worker for reading string passed to table
            if (window.Worker) {

              //  if( import.meta){
              //      this.parseWorker = new Worker(new URL('balek-modules/digivigil/tabular/Workers/mainWorker.js', import.meta.url));

              //  }else{
                //console.log(this._WorkerCode)
                let WorkerCodeBlob = new Blob([String(this._WorkerCode)], {type: 'application/javascript'})
                let URLCodeBlob = URL.createObjectURL(WorkerCodeBlob)
                this.parseWorker = new Worker(URLCodeBlob);

                this.parseWorker.onmessage = lang.hitch(this, this.parseWorkerDone)

            }else {
                alert("No Web Workers!")
            }

            if(this.dataString != null){
                alert("parsing", this.dataString)

               this.parseDataString()
            }
        },

        parseWorkerDone: function(parseDataReadyEvent){
         //   console.log('Message received from worker', parseDataReadyEvent.data);

            if(parseDataReadyEvent.data.parseTabSeperatedString && parseDataReadyEvent.data.parseTabSeperatedString.lines){

                let lines = parseDataReadyEvent.data.parseTabSeperatedString.lines
                this.lineArray = parseDataReadyEvent.data.parseTabSeperatedString.lines;
                this.autoHeaderStart = parseDataReadyEvent.data.parseReturnParameters.autoHeaderStart
                this.autoFooterStart = parseDataReadyEvent.data.parseReturnParameters.autoFooterStart
                if(parseDataReadyEvent.data.parseReturnParameters ){
                    this.setMostValuesInAnyLine(parseDataReadyEvent.data.parseReturnParameters.mostValuesInALine)
                    //this.setAutoTrim(this.getAutoTrim())
                }
                this.setHeaderRow(0)
                this.setFooterRow(this.lineArray.length-1)
                this.setDataProcessedWhen(Date.now())
            }
        },
        parseDataString: function(){
            this.parseWorker.postMessage({ parseTabSeperatedString: this.dataString,
                parseParameters: {  valueSeparator: this.getValueSeparator(),
                    autoTrim: this.getAutoTrim()
                }});
        },
        getNumberOfFilteredLines: function()
        {
            let footerRow = parseInt(this.modelState.get("footerStart"))
            let headerRow = parseInt(this.modelState.get("headerStart"))

            return (footerRow-headerRow+1)
        },
        setDataString: function(dataString){
            this.dataString = dataString
            this.parseDataString()

        },
        getModelState: function(){
            return this.modelState;
        },
        getColumnValueArray(columnIndex, startRow = this.getHeaderRow() , endRow = this.getFooterRow()){
            let returnIndex = []
            let linePosition = 0
            for( const line of this.lineArray)
            {
                if( linePosition >= startRow && linePosition < endRow+1) {
                    returnIndex.push(line[columnIndex])
                }
                linePosition++
            }


            return returnIndex
        },

        getLines: function(){
            return this.lineArray
        },
        getMostValuesInAnyLine: function (){
            return  this.modelState.get("mostValuesInAnyLine")
        },
        setMostValuesInAnyLine: function(mostValues){
            this.modelState.set("mostValuesInAnyLine", mostValues)
        },
        setHeaderRow: function(headerRow){
            if(parseInt(headerRow) >= 0 && parseInt(headerRow) <= parseInt(this.getFooterRow())){
                this.modelState.set("headerStart", parseInt(headerRow))
            }else
            {
                console.log('################Attempting to set to same"')
                this.modelState.set("headerStart", this.getHeaderRow())
            }
        },
        getHeaderRow: function(){
            return this.modelState.get("headerStart")
        },
        setFooterRow: function(footerRow){
            if(parseInt(footerRow )< this.lineArray.length && parseInt(footerRow) >= parseInt(this.getHeaderRow())){
                this.modelState.set("footerStart", parseInt(footerRow))
            }else
            {
             //   console.log('################Attempting to set to same"')
                this.modelState.set("footerStart", this.getFooterRow())
            }
        },
        getFooterRow: function(){
          return this.modelState.get("footerStart")
        },
        setAutoTrim: function(setTo){
            this.modelState.set("autoTrim",setTo)
            this.modelState.set("footerStart",setTo ? this.lineArray.length-1: this.autoFooterStart)
            this.modelState.set("headerStart",setTo ? 0: this.autoHeaderStart)
        },
        getAutoTrim: function(){
          return this.modelState.get("autoTrim")
        },


        setDataProcessedWhen: function(setTo){
                this.modelState.set("dataProcessedWhen", setTo)

        },
        getDataProcessedWhen: function(){
            return this.modelState.get("dataProcessedWhen")
        },

        setValueSeparator: function(setTo){
            this.modelState.set("valueSeparator", setTo)
            this.parseDataString()

        },

        getValueSeparator: function(setTo){
            return this.modelState.get("valueSeparator")

        },

    })

})