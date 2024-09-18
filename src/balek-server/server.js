require(["balek-server/Instance",
    'dojo/_base/lang'
], function (serverInstance, lang) {

    console.log("🚀 Launching Balek Server Instance");
    let BalekServerInstance = serverInstance();

    let serverIsReady = new Promise(lang.hitch(this, function (serverPromiseResolve, serverPromiseReject) {
        BalekServerInstance._start(serverPromiseResolve, serverPromiseReject);
    }));

    serverIsReady.then(lang.hitch(this, function (value) {
        console.log("🛰️ Server Is Started ")
    })).catch(lang.hitch(this, function (error) {
        console.log("🚨 Server Started ERROR 🚨️" , error)
        console.log(error);
    }));

});
