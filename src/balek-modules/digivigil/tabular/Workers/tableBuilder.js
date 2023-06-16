onmessage = function(e) {
    let data = e.data

    if(data.buildTable
        && data.buildTable.buildData
        && data.buildTable.buildParameters ) {
        console.log(' buildTable Message received from main script', e);

        buildTable(data.buildTable.buildData,data.buildTable.buildParameters )
    }
    console.log('Message received from main script', e);
    const workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    console.log('Posting message back to main script');
    sendStatusUpdate("Building Table")
}
sendStatusUpdate = function(message, completePercentage = 0){
    postMessage({type: "Status",
        message: message,
        completePercentage: completePercentage});
}
buildTable = function( lines, filterParameters ){
    require(["../../../../../lib/dojo-release-src/dojo/dom-construct"], lang.hitch(this, function(domConstruct){
        console.log("ready")

        let mainDiv = domConstruct.create("div")

        postMessage({builtTable: mainDiv});

    }));

}
