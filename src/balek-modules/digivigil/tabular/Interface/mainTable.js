define([//------------------------------|
        // Base Includes:---------------|
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/on',
        'dojo/query',
        //------------------------------|
        //Dom Includes:-----------------|
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/_base/window",
        //------------------------------|
        //Input Includes:---------------|
        "dojo/keys",
        //------------------------------|
        //Widget Declare Mixins:--------|
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        //------------------------------|
        //Widget HTML and CSS:----------|
        'dojo/text!balek-modules/digivigil/tabular/resources/html/mainTable.html',
        'dojo/text!balek-modules/digivigil/tabular/resources/css/table.css',
    ],
    function (
        //------------------------------|
        //Base Modules:-----------------|
        declare,
        lang,
        on,
        query,
        //------------------------------|
        //Dom Modules:------------------|
        domConstruct,
        domStyle,
        domClass,
        domAttr,
        win,
        //------------------------------|
        //Input Modules:----------------|
        dojoKeys,
        //------------------------------|
        //Widget Declare Extenstions:---|
        _WidgetBase,
        _TemplatedMixin,
        //------------------------------|
        //Widget HTML and CSS Strings:--|
        interfaceHTMLFile,
        interfaceCSSFile
    ) {
        return declare("moduleDigivigilTabularMainTableInterface",
            [_WidgetBase,_TemplatedMixin], {
            //Widget Variables:---------
            baseClass: "digivigilTabularMainTableInterface",
            templateString: interfaceHTMLFile,
            templateCssString: interfaceCSSFile,
            //---------------------------
            //Build Variables:-----------
            buildPromise: null,
            buildPromiseResolve: null,
            buildPromiseReject: null,
            tableBuilding: false,
            buildPosition: 0,
            headerRow : 0,
            footerRow : 0,
            firstRowInRange: 0,
            lastRowInRange: 0,

            displayCount: 500,
            scrollUpdating: false,
            doubleScrollUpdate: false,
            //----------------------------
            //Dom Node Elements:----------
            _tableDiv: null,
            _tableDisplayHead: null,
            _domDisplayTable : null,
            _tableStatusDiv: null,
            _tableDivHeaderSpacer: null,
            _tableDivFooterSpacer: null,

            //----------------------------
            //Table Model:----------------
            tableModel: null,
            tableModelState: null,
            tableModelStateWatchHandle: null,
                
            constructor: function (args) {
                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this.templateCssString + "</style>"), win.body());
                if(this.tableModel != null)
                {
                    this.tableModelState = this.tableModel.getModelState()
                    this.tableModelStateWatchHandle = this.tableModelState.watch(lang.hitch(this, this.onTableStateChange))
                }else {
                    console.log("🤖🤖No Table Nodel")
                }

            },
            postCreate: function(){
                this._domDisplayTable = this.createTable()
                domConstruct.place(this._domDisplayTable, this._tableDivHeaderSpacer, "after")
                let dataProcessedWhen = this.tableModel.getDataProcessedWhen()
                if(dataProcessedWhen != 0)
                {
                    this.reloadTable()
                }else {
                    console.log("🤖🤖ERRORRRR DONNNNNE dataProcessedWhen 0", dataProcessedWhen)

                }

            },
            _onTableScroll: function(scrollEvent){
                this.updateTableScroll()
            },
            updateTableScroll: function(){
                if(! this.scrollUpdating){
                    this.scrollUpdating = true
                    console.log("💌🤖🤖updateTableScroll ")
                    this.updateTableViewPosition()
                    this.updateSpacers()
                   // this.updateTableStatus()
                    setTimeout(lang.hitch(this, function(){
                        require(["dojo/domReady!"], lang.hitch(this, function(){
                            console.log("🤖🤖No scrollUpdating Nodel")
                            this.scrollUpdating = false
                            if(this.doubleScrollUpdate)
                            {
                                this.doubleScrollUpdate = false
                            this.updateTableScroll()
                            }
                        }))
                    }), 0)
                }else{
                    console.log("💌🤖🤖updateTableScroll not nnec")
                    this.doubleScrollUpdate = true
                }
            },
            reloadTable(){
                this.stopBuild()
                console.log("🤖🤖reloadTable", this.tableModel)

                this.buildTable().then(
                    lang.hitch(this, this.onTableBuilt)
                ).catch(lang.hitch(this, function(Error){
                    console.log("ERRORRRR 🤖🤖reloadTable", Error)
                    this.stopBuild()
                    this.buildPromise = null
                    this.buildPromiseResolve = null
                    this.buildPromiseReject = null
                }))
            },

            onTableStateChange: function(name, oldState, newState){
                console.log("💌 TableModelStateChange in mainTable onTableStateChange()", name, oldState, newState)

              if(name=="dataProcessedWhen"){
                  this.reloadTable()
              }
              if(name=="headerStart" )
              {
                  console.log("Header Start Changed",name, oldState, newState)
                  this.checkAndAddOrRemoveRowsToTopOfDisplay()
              }
              if(name=="footerStart" ){
                  console.log("Footer Start Changed",name, oldState, newState)
                  this.checkAndAddOrRemoveRowsToBottomOfDisplay()
              }
            },
            //--------------------------------------|
            //View Update Functions:----------------|
            addFooterRows: function(rowsToAdd){
                let maxLine = this.tableModel.getFooterRow()


               // console.log(`➕🦶add FooterRows  rowsToAdd: ${rowsToAdd} `);
                let startAt = parseInt(this.lastRowInRange) + 1

                if( startAt <= maxLine){
                    let finishAt = parseInt(startAt+rowsToAdd)
                    console.log(`➕🦶add FooterRows  startAt: ${startAt} #|# finishAt: ${finishAt}   this.lastRowInRang:${this.lastRowInRange} \``);
                    for ( i = startAt  ; i < finishAt ; ++i) {

                        if(i>= this.las)
                            console.log(`➕🦶add i : ${i} `);
                        let rowToAdd = this.buildRow(i)
                        if(this._domDisplayTable && rowToAdd){
                            domConstruct.place(rowToAdd, this._domDisplayTable, "last")
                        }else{
                            console.log(`🧠`, i)
                        }

                        this.lastRowInRange = i
                    }
                    //console.log(`➕🦶add this.lastRowInRange : ${this.lastRowInRange} `);
                    this.checkAndAddOrRemoveRowsToTopOfDisplay()
                }else {
                 //   alert("cannot add footer rows!")
                    //todo uncomment this to find bad caller
                }

            },
            removeFooterRows: function(rowsToRemove){
                //todo check this function
              //  console.log(`➖🦶removeFooterRows  rowsToRemove: ${rowsToRemove} `);
                let  startAt = this.lastRowInRange
                let finishAt = parseInt(startAt-rowsToRemove)
               // console.log(`➖🦶removeFooterRows  startAt: ${startAt} #|# finishAt: ${finishAt}   this.lastRowInRang:${this.lastRowInRange} \``);
                for ( i = parseInt(startAt)  ; i > finishAt   ; --i) {
              //      console.log(`➖🦶remove i : ${i} `);
                    let rowToRemove = this.getTableRow(i)
                    domConstruct.destroy(rowToRemove)
                }

                this.lastRowInRange = finishAt
              //  console.log(`➖🦶remove this.lastRowInRange : ${this.lastRowInRange} `);
                this.checkAndAddOrRemoveRowsToTopOfDisplay()
            },
            removeHeaderRows: function(rowsToRemove) {
             //   console.log(`➖🐮removeHeaderRows  rowsToRemove: ${rowsToRemove} `);
                let startAt = this.firstRowInRange
                let finishAt = startAt+ rowsToRemove
              //  console.log(`➖🐮removeHeaderRows  startAt: ${startAt} #|# finishAt: ${finishAt}   this.firstRowInRange:${this.firstRowInRange} \``);
                for ( i = parseInt(startAt)  ; i < parseInt(finishAt)  ; ++i) {
              //      console.log(`➖🐮remove i : ${i} `);
                    let rowToMove = this.getTableRow(i)
                    domConstruct.destroy(rowToMove)
                    this.firstRowInRange = i+1
                }
               // console.log(`➖🐮removeHeaderRows this.firstRowInRange : ${this.firstRowInRange} `);
                this.checkAndAddOrRemoveRowsToBottomOfDisplay()
            },
            addHeaderRows: function(rowsToAdd) {
              //  console.log(`➕🐮addHeaderRows  rowsToAdd: ${ rowsToAdd} `);
                let startAt = this.firstRowInRange
                let finishAt = startAt-rowsToAdd
              //  console.log(`➕🐮addHeaderRows  startAt: ${startAt} #|# finishAt: ${finishAt}   this.firstRowInRange:${this.firstRowInRange} \``);
                for ( i = parseInt(startAt-1)  ; i >= parseInt(finishAt)  ; --i) {
             //       console.log(`➕🐮add i : ${i} `);
                    let rowToADD = this.buildRow(i)
                    domConstruct.place(rowToADD, this._tableDisplayHead, "after")
                }
                this.firstRowInRange = finishAt
             //   console.log(`➕🐮addHeaderRows this.firstRowInRange : ${this.firstRowInRange} `);
                //Add bottom rows
                this.checkAndAddOrRemoveRowsToBottomOfDisplay()
            },
                resetViewRows: function(firstRow){
                    console.log(`🚜🚜🚜add firstRow : ${firstRow} `);

                   domConstruct.place(this._tableDisplayHead, this._domDisplayTable, "only")
                    console.log(`🚜🚜🚜continue `);
                    let displayCount = parseInt(lang.clone(this.displayCount))
                    this.firstRowInRange = firstRow
                    let startAt = this.firstRowInRange
                    let finishAt = Math.min(firstRow + displayCount , this.footerRow)
                    console.log(`🚜🚜🚜add finishAt : ${finishAt}| startAt : ${startAt} `);

                    for ( i = parseInt(startAt)  ; i <= parseInt(finishAt)  ; ++i) {
                       // console.log(`🚜🚜🚜add i : ${i} `);

                        let rowToADD = this.buildRow(i)
                        domConstruct.place(rowToADD, this._domDisplayTable, "last")
                        this.lastRowInRange = i
                    }
                    console.log(`🚜🚜🚜add done : ${i} `);

                },
                checkAndAddOrRemoveRowsToTopOfDisplay: function(){
                    let headerRow = parseInt(this.tableModel.getHeaderRow())
                    let rowsInDisplayTable = this.getRowsInDisplayTable()
                    let totalTableRows = this.tableModel.getNumberOfFilteredLines()
                    if(rowsInDisplayTable < this.displayCount && rowsInDisplayTable < totalTableRows && headerRow < this.firstRowInRange ){
             //           console.log(`⚙️🏹🏹️🏹rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                        let rowsToAdd = this.firstRowInRange-headerRow
                        this.addHeaderRows(rowsToAdd)
                    }else if(rowsInDisplayTable > this.displayCount ){
             //           console.log(`️⚙️🏹🏹REMOVING Header ROAWS rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                        let rowsToRemove = rowsInDisplayTable - this.displayCount
                        this.removeHeaderRows(rowsToRemove)
                    }else if (this.firstRowInRange<headerRow) {
            //            console.log(`️⚙️🏹REMOVING Header ROAWS rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                        let rowsToRemove = headerRow - this.firstRowInRange
                        this.removeHeaderRows(rowsToRemove)
                    }else{
                        let scrollTop = this._tableDiv.scrollTop
                        if(scrollTop<=5 && headerRow < this.firstRowInRange){
            //                console.log(`⚙️rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                            let rowsToAdd = this.firstRowInRange-headerRow
                            this.addHeaderRows(rowsToAdd)
                            this.checkAndAddOrRemoveRowsToBottomOfDisplay()
                        }
            //            console.log(`️⚙️🏹Checking Scroll ROAWS scrollTop:${scrollTop} `);
            //            console.log(`️🏹🏹Didn't remove anything enough to add?`);
            //            console.log(`️🏹🏹rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                    }
                    this.updateTableStatus();
                },
            checkAndAddOrRemoveRowsToBottomOfDisplay: function(){
                let footerRow = this.tableModel.getFooterRow()
                let rowsInDisplayTable = this.getRowsInDisplayTable()
                let totalTableRows = this.tableModel.getNumberOfFilteredLines()
                if(rowsInDisplayTable < this.displayCount && rowsInDisplayTable < totalTableRows ){
            //        console.log(`☎️⏰rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                        let rowsToAdd = Math.min(this.displayCount,footerRow) -rowsInDisplayTable
                        this.addFooterRows(rowsToAdd)
                }else if(rowsInDisplayTable > this.displayCount ){
              //      console.log(`☎️⏰REMOVING FOOTER ROAWS rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                    let rowsToRemove = rowsInDisplayTable - this.displayCount
                    this.removeFooterRows(rowsToRemove)
                }else if (this.lastRowInRange>footerRow) {
                    let rowsToRemove = this.lastRowInRange - footerRow
                    this.removeFooterRows(rowsToRemove)
                }else{
           //         console.log(`☎️⏰Didn't remove anything enough to add?`);
           //         console.log(`☎️⏰rowsInDisplayTable:${rowsInDisplayTable} | totalTableRows${totalTableRows}`);
                }
                this.updateTableStatus();
            },
            getRowsInDisplayTable: function(){
                return this.lastRowInRange - this.firstRowInRange +1
            },
            getDisplayedRowsRang: function(){
                let firstRowInRange = this.firstRowInRange
                let lastRowInRange =  this.lastRowInRange
                return { first: firstRowInRange,
                last: lastRowInRange}
            },
            getTableRow: function(rowNumber){
                let queryString = '#TableRow' + rowNumber + ''
                let node = dojo.query(String(queryString))
                return node[0]
            },
             updateTableStatus: function(){
                let rowsInDisplayTable = this.getRowsInDisplayTable()
                 let totalTableRows = this.tableModel.getNumberOfFilteredLines()
                 let scrollPercent = this.getScrollPercentage()
                // this._tableStatusDiv.innerHTML=`firstRowInRange ${this.firstRowInRange} | lastRowInRange ${this.lastRowInRange} | rowsInDisplayTable ${rowsInDisplayTable} | totalTableRows ${totalTableRows}
                // getScrollPercentage ${scrollPercent}`
             },
                //---------------------------------------|
                //Dom Calculated Values:----------------|
            getRowHeight(){
                let rowHeight = this._tableDisplayHead.offsetHeight +4
                return rowHeight
            },
            updateSpacers: function() {
                this.updateFooterSpacerHeight();
                this.updateHeaderSpacerHeight()
            },
               updateHeaderSpacerHeight: function (){
                   let headerRow = this.tableModel.getHeaderRow()

                   let firstRowInRange = this.firstRowInRange
                    let lastRowInRange = this.lastRowInRange
                    let rowsInDisplayTable = this.getRowsInDisplayTable()
                    let totalRows = this.tableModel.getNumberOfFilteredLines()
                    let scrollHeight = this._tableDiv.scrollHeight
                    let scrollAreaHeight = this._tableDiv.clientHeight


                    let rowHeight = this.getRowHeight()
                    let spacerHeight = Math.max((firstRowInRange-headerRow)*rowHeight, 0)


                   domStyle.set(this._tableDivHeaderSpacer, "height", spacerHeight+"px")

                   console.log(`🛶🛶spacerHeight${spacerHeight}rowHeight${rowHeight}
                   firstRowInRange${firstRowInRange}headerRow${headerRow}`)

                },
                updateFooterSpacerHeight: function(){
                    let firstRowInRange = this.firstRowInRange
                    let lastRowInRange = this.lastRowInRange
                    let rowsInDisplayTable = this.getRowsInDisplayTable()
                    let totalRows = this.tableModel.getNumberOfFilteredLines()
                    let scrollHeight = this._tableDiv.scrollHeight
                    let scrollAreaHeight = this._tableDiv.clientHeight


                    let rowHeight = this.getRowHeight()
                    let spacerHeight = Math.max((totalRows-lastRowInRange)*rowHeight, 0)

                    domStyle.set(this._tableDivFooterSpacer, "height", spacerHeight+"px")
                    console.log(`🎠🎠spacerHeight${spacerHeight}rowHeight${rowHeight}`)

                },
                getScrollPercentage: function(){
                    let scrollTop = this._tableDiv.scrollTop
                    let scrollHeight = this._tableDiv.scrollHeight
                    let scrollAreaHeight = this._tableDiv.clientHeight

                    let percentage = (scrollTop)/(scrollHeight-scrollAreaHeight)
                    return percentage
                },
                updateTableViewPosition: function(){
                    let headerRow = this.tableModel.getHeaderRow()
                    let footerRow = this.tableModel.getFooterRow()
                    let displayCount = this.displayCount

                    let firstRowInRange = this.firstRowInRange
                    let lastRowInRange = this.lastRowInRange
                    let rowsInDisplayTable = this.getRowsInDisplayTable()
                    let totalRows = this.tableModel.getNumberOfFilteredLines()
                    let scrollHeight = this._tableDiv.scrollHeight
                    let scrollAreaHeight = this._tableDiv.clientHeight
                    let scrollTop = this._tableDiv.scrollTop
                    let rowHeight = this.getRowHeight()
                    let rowsInView = scrollAreaHeight/rowHeight
                    let scrollPercent = this.getScrollPercentage()


                    let firstRow = Math.max((totalRows*scrollPercent)+headerRow-1, headerRow)
                    let midRow = parseInt(firstRow+rowsInView/2)
                    let lastRow = parseInt(midRow + rowsInView/2)


                    let addedRows = 0


                    let rowsAboveViewInRange = firstRow - firstRowInRange
                    let rowsBelowViewInRange = lastRowInRange - lastRow

                    let totalRowsAboveView = firstRow - headerRow
                    let totalRowsBelowView = footerRow - lastRow


                    let maxFooterAdd = (footerRow-lastRowInRange)
                    let maxHeaderAdd = (firstRowInRange-headerRow)

                    let targetFirstRowInRange = Math.max(midRow - (displayCount/2), headerRow)
                    let targetLastRowInRange =Math.min(midRow + (displayCount/2), footerRow)
                    let marginRows = rowsInDisplayTable*.1



                    if(displayCount>=totalRows){
                    console.log("🪂Nothing to scroll for🪂")
                        return
                    }
                    console.log("🛹Looking to 🛹 to scroll for")
                    if(scrollPercent <=.5)
                    {
                        let amountChanged = Math.max( targetFirstRowInRange-firstRowInRange, firstRowInRange - targetFirstRowInRange)

                        if(amountChanged < (this.displayCount/2)){
                            if(targetFirstRowInRange>firstRowInRange)
                            {
                                addedRows = targetFirstRowInRange-firstRowInRange
                                this.removeHeaderRows(parseInt(addedRows))
                            }else if(targetFirstRowInRange<firstRowInRange){
                                addedRows = firstRowInRange - targetFirstRowInRange
                                this.addHeaderRows(parseInt(addedRows))
                            }
                        }else{
                            console.log(`🚜🚜🚜add amountChanged header : ${amountChanged} `);

                            this.resetViewRows(targetFirstRowInRange)
                        }



                    }else {
                        let amountChanged = Math.max(targetLastRowInRange - lastRowInRange,lastRowInRange-targetLastRowInRange)
                        if(amountChanged < (this.displayCount/2)) {
                            if (targetLastRowInRange > lastRowInRange) {

                                addedRows = targetLastRowInRange - lastRowInRange
                                this.addFooterRows(parseInt(addedRows))
                            } else if (targetLastRowInRange < lastRowInRange) {
                                addedRows = lastRowInRange - targetLastRowInRange
                                this.addHeaderRows(parseInt(addedRows))
                            }
                        }else{
                            console.log(`🚜🚜🚜add amountChanged footer : ${amountChanged} `);

                            this.resetViewRows(targetFirstRowInRange)
                        }
                    }



                    /*this._tableStatusDiv.innerHTML=`firstRowInRange ${firstRowInRange} | lastRowInRange ${lastRowInRange} | rowsInDisplayTable ${rowsInDisplayTable}
                    | totalRows ${totalRows} | scrollHeight ${scrollHeight}    | scrollAreaHeight ${scrollAreaHeight} | rowHeight ${rowHeight}
                    | rowsInView ${rowsInView}| midRow ${midRow}| firstRow ${firstRow}| lastRow ${lastRow}
                    rowsAboveViewInRange ${rowsAboveViewInRange} totalRowsAboveView ${totalRowsAboveView} | rowsBelowViewInRange ${rowsBelowViewInRange} totalRowsBelowView ${totalRowsBelowView}
                    | scrollPercent ${scrollPercent}|addedRows ${addedRows}| maxHeaderAdd ${maxHeaderAdd}| maxFooterAdd ${maxFooterAdd}|
                    targetFirstRowInRange ${targetFirstRowInRange}| targetLastRowInRange ${targetLastRowInRange}|`
                    */


                },
            //---------------------------------------|
            //Dom Builders Functions:----------------|
            createTable(){
                let table = domConstruct.create("table");
                let tableClassString = this.baseClass+"Table"
                domClass.add(table, tableClassString)
                let headerRow = domConstruct.create("tr")

                domStyle.set(headerRow, "z-index", 20)
              //  domStyle.set(headerRow, "background-color", "white")
                let headerCount = 0;
                do {
                    let colHead = domConstruct.create("th")
                    let headerClassString = this.getColumnClass(headerCount-1)
                    domClass.add(colHead, headerClassString)
                    domStyle.set(colHead, "z-index", 20)
                    colHead.innerHTML = headerCount;
                    domConstruct.place(colHead, headerRow)
                    this.setColumnHeaderActions(colHead, headerCount-1)
                    headerCount++
                }while(this.tableModel.getMostValuesInAnyLine() >= headerCount)
                let tableHead = domConstruct.create("thead")
                this._tableDisplayHead = tableHead;
                domConstruct.place(headerRow, tableHead)
                domConstruct.place(tableHead, table)

                return table

            },
            buildRow(lineNumber){
                    let lines = this.tableModel.getLines()
                    let line = lines[parseInt(lineNumber)]
                    if(Array.isArray(line))
                    {
                        let row = domConstruct.create("tr")
                        let rowClassString = this.baseClass+"TableRow"
                        let valuePosition = 0
                        let firstTableData = domConstruct.create("td")
                        let tableClassString = this.baseClass+"TableRowIdentityCell"


                        domAttr.set(row, "id", `TableRow${lineNumber}`)
                        domClass.add(row, rowClassString)
                        domClass.add(firstTableData, tableClassString)

                        //Create First Column Row Cell With Import Line Number and Head/Foot Set

                        let setSpan = domConstruct.create("span")
                        domClass.add(setSpan, this.baseClass+"SetSpan")

                        let setHeaderDiv = domConstruct.create("div")
                        domConstruct.place(`<img src='balek-modules/digivigil/tabular/resources/images/triangleUp.svg' class='${this.baseClass}SetDivImage' alt="Set Header" />`, setHeaderDiv)
                        domClass.add(setHeaderDiv, this.baseClass+"SetHeaderDiv")

                        on(setHeaderDiv, "mousedown", lang.hitch(this, function (linePosition, mouseEvent ){
                            //query(String("." + tableClassString)).style("backgroundColor", "orange");
                            console.log("mousedown Header",mouseEvent)
                            this.tableModel.setHeaderRow(linePosition)
                        }, lang.clone(lineNumber) ))

                        let lineNumberDiv = domConstruct.create("span")
                        lineNumberDiv.innerHTML = lineNumber.toString()
                        domClass.add(lineNumberDiv, this.baseClass+"FileNumberSpan")

                        let setFooterDiv = domConstruct.create("div")
                        domClass.add(setFooterDiv, this.baseClass+"SetFooterDiv")
                        domConstruct.place(`<img src='balek-modules/digivigil/tabular/resources/images/triangleDown.svg' class='${this.baseClass}SetDivImage' alt="Set Footer" />`, setFooterDiv)



                        on(setFooterDiv, "mousedown", lang.hitch(this, function (linePosition, mouseEvent ){
                            //query(String("." + tableClassString)).style("backgroundColor", "orange");
                            console.log("mousedown Header",mouseEvent)

                            this.tableModel.setFooterRow(linePosition)
                        }, lineNumber.valueOf()  ))



                        domConstruct.place(setHeaderDiv, setSpan)
                        domConstruct.place(setFooterDiv, setSpan)
                        domConstruct.place(setSpan, firstTableData)
                        domConstruct.place(lineNumberDiv, firstTableData)
                        domConstruct.place(firstTableData, row)


                        for( const value of line)
                        {
                            let tableData = domConstruct.create("td")


                            domClass.add(tableData, this.getColumnClass(valuePosition))

                            valuePosition++;
                            tableData.innerHTML = value;
                            domConstruct.place(tableData, row)
                        }
                        return row
                    }else {
                        console.log(`🥊 Line not array in buildRow:${line} | no Reject`, line);
                    }

                },
            //--------------------------------------|
            //Dom Update Functions:----------------|

            //remove after build refactor
            getColumnClass: function(headerPosition){
                    return this.baseClass+"TableRowIdentityCell" + headerPosition.toString()
                },
            onTableBuilt: function(){
                console.log("DONNNNNE")
            },
            buildTable: function(){
                if(this.buildPromise != null ){
                    this.buildPromiseReject({Status: "New Build Requested"})
                    console.log(`🥊 Build Promise:${this.buildPromise} | Reject`, this.buildPromiseReject);
                    this.stopBuild()
                }
                this.buildPromise = new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.buildPromiseResolve = Resolve
                    this.buildPromiseReject = Reject
                    this._built = false
                    this.headerRow = this.tableModel.getHeaderRow()
                    this.footerRow = this.tableModel.getFooterRow()

                    this.startBuild()
                }));
                return this.buildPromise

            },
            startBuild: function(){
                try{

                    this.scrollUpdating = true;
                domConstruct.destroy(this._domDisplayTable)
                this._domDisplayTable = this.createTable()
                require(["dojo/domReady!"], lang.hitch(this, function(){
                    domConstruct.place(this._domDisplayTable, this._tableDivHeaderSpacer, "after")
                }));

                this._tableStatusDiv.innerHTML=`Building Table ${this.tableModel.getLines().length} lines`




                let footerRow = parseInt(this.tableModel.getFooterRow())
                let headerRow = parseInt(this.tableModel.getHeaderRow())
                let lines = this.tableModel.getLines()
                let totalLines = lines.length
                let displayCount = this.displayCount ; //How Many table rows to display
                let numberOfRowsInTable = this.tableModel.getNumberOfFilteredLines()
                let numberOfRowsToBuild = Math.min(displayCount, numberOfRowsInTable)
                let buildPosition = parseInt(this.tableModel.getHeaderRow())
                console.log(`🔋I:numberOfRowsToBuild: ${numberOfRowsToBuild} numberOfRowsInTable: ${numberOfRowsInTable} displayCount: ${displayCount}`);

                if(this.buildPromiseResolve == null ) {
                    debugger;
                    console.log("📝 Attempt to Keep building after promise return")
                    return null
                }

                if(!(footerRow < totalLines
                    && footerRow >= headerRow && buildPosition <= footerRow )) {
                    console.log("📝 Adjust Footer Rows to make sense")
                    this.stopBuild()
                    return null
                }

                this.firstRowInRange = buildPosition

                //Loop Through and create up to displayCount Rows
                for ( i = 0 ; i < numberOfRowsToBuild ; ++i)
                {
                   // console.log(`I:buildPosition: ${buildPosition} numberOfRowsToBuild: ${numberOfRowsToBuild} i: ${i}`);

                    if(buildPosition >= headerRow && buildPosition <= footerRow)
                    {
                        let row = this.buildRow(buildPosition)
                        domConstruct.place(row, this._domDisplayTable)
                        this.lastRowInRange = buildPosition

                            buildPosition++
                    }else {
                        console.log("🔋ERROR should not happen Header or footer out of bounds")
                        console.log(`🔋I:buildPosition: ${buildPosition} numberOfRowsToBuild: ${numberOfRowsToBuild} i: ${i}`);
                       // throw("ERROR should not happen Header or footer out of bounds");
                    }

                }


                    if(totalLines>displayCount){
                        this._tableStatusDiv.innerHTML =`Table Displayed`
                    }
                    let buildResolve = this.buildPromiseResolve
                    buildResolve(true);
                    this.stopBuild()

                    require(["dojo/domReady!"], lang.hitch(this, function(){
                        this.updateFooterSpacerHeight();
                        this.updateHeaderSpacerHeight();
                        this.scrollUpdating = false;
                    }));


                }catch(error){
                    throw(error)
                }

            },

                    stopBuild: function(){


                if(this.buildPromise != null && this.buildPromiseReject != null)
                {
                    this.buildPromiseReject({reason: "stopBuild Stopped"})
                    this.buildPromise = null
                    this.buildPromiseResolve = null
                    this.buildPromiseReject = null
                }
            },
            buildShowTableButton(){
                let button = domConstruct.create("div")
               button.innerHTML=`Double Click to Show Table with ${this.tableModel.getFooterRow() - this.tableModel.getHeaderRow() } Items`
                this.setShowTableButtonActions(button)
                return button;
            },
            setColumnHeaderActions: function(headerNode, valuePosition){
                    let tableClassString = this.getColumnClass(valuePosition)
                    on(headerNode, "mouseenter", function (mouseEvent){
                        //query(String("." + tableClassString)).style("backgroundColor", "orange");
                        let nodeList = query(String("." + tableClassString), this._tableDiv);

                        for ( const node of nodeList)
                        {
                            domStyle.set(node,"backgroundColor", "rgba(123, 178, 91, 0.8)" );
                            domStyle.set(node,"cursor", "pointer" );

                        }
                    });

                    on(headerNode, "mouseleave", function (mouseEvent){
                        //query(String("." + tableClassString)).style("backgroundColor", "orange");
                        let nodeList = query(String("." + tableClassString), this._tableDiv);

                        for ( const node of nodeList)
                        {
                            domStyle.set(node,"backgroundColor", "unset" )
                            domStyle.set(node,"cursor", "unset" )

                        }
                    });

                    on(headerNode, "click", function (mouseEvent){
                        let nodeList = query(String("." + tableClassString), this._tableDiv);

                        if (mouseEvent.shiftKey && !mouseEvent.altKey ){
                            let nodeList = query(String("." + tableClassString), this._tableDiv);

                            for ( const node in nodeList)
                            {
                                domStyle.set(node,"visibility", "collapse" )
                            }
                            //Chose COlumn for output selection
                        }

                        if (mouseEvent.altKey && mouseEvent.shiftKey ){
                            //   alert("unchose:" + valuePosition)
                            //remove from output selection
                        }


                    });


                    let currentColumn = valuePosition.valueOf()
                    on(headerNode, "dblclick", lang.hitch(this, function (mouseEvent){
                        if (mouseEvent.altKey && mouseEvent.shiftKey ){
                            alert("remove:" + valuePosition)
                            //remove from output selection
                        }else {
                            //query(String("." + tableClassString)).style("backgroundColor", "orange");
                            let nodeList = query(String("." + tableClassString), this._tableDiv);

                            let currentColumnValueArray = this.tableModel.getColumnValueArray(currentColumn)

                            console.log("Get currentColumnValueArray:", currentColumnValueArray);

                            this.outputPreviewPane.innerHTML = currentColumnValueArray.join(",")
                            for ( const node of nodeList)
                            {
                                domStyle.set(node,"backgroundColor", "unset" )
                                domStyle.set(node,"cursor", "unset" )

                            }
                        }


                    }));

                },
            unload: function () {
                this.destroy();
            }
        });
    }
);



