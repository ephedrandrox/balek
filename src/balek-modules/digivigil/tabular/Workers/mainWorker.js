onmessage = function(e) {
    let data = e.data

    if(data.parseTabSeperatedString && data.parseParameters ) {
        console.log('👨‍🔧 🛠 parseTabSeperatedString Message received from worker', data.parseParameters );
        parseTabSeperatedString(data.parseTabSeperatedString,data.parseParameters )
    }

}
parseTabSeperatedString = function( stringToParse, parseParameters ){
    let lines = []
    let linesArray = stringToParse.split("\n")

    let mostValuesInALine = 0
    let autoHeaderStart = 0
    let autoFooterStart = 0

    for (const line of linesArray)
    {
        let valuesArray = line.split(parseParameters.valueSeparator)
        let valuesToSaveArray = [];

        if (mostValuesInALine < valuesArray.length){
            mostValuesInALine = valuesArray.length
            autoHeaderStart = lines.length
        }

        if (mostValuesInALine >= valuesArray.length){
            autoFooterStart = lines.length - 1
        }

        for (const value of valuesArray) {
            let valueWithoutQuotes = value.replace(/^["'](.+(?=["']$))["']$/, '$1');
            //regex removes quotes around value
            valuesToSaveArray.push(valueWithoutQuotes);

        }
        lines.push(valuesToSaveArray)

    }




    postMessage({parseTabSeperatedString: {lines: lines }, parseReturnParameters: {
            mostValuesInALine : mostValuesInALine,
            autoHeaderStart : autoHeaderStart,
            autoFooterStart : autoFooterStart,
            lastLine : lines.length - 1
        }});

}
