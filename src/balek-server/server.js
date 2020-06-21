require(["balek-server/Instance",
    'dojo/_base/lang'
], function (serverInstance, lang) {

    console.log("Starting Server");
    let BalekServerInstance = serverInstance();

    let serverIsReady = new Promise(lang.hitch(this, function (serverPromiseResolve, serverPromiseReject) {
        BalekServerInstance._start(serverPromiseResolve, serverPromiseReject);
    }));

    serverIsReady.then(lang.hitch(this, function (value) {
        console.log("SERVER Is Started" + value)
    })).catch(lang.hitch(this, function (error) {
        console.log(error);
    }));
    console.log("Began Startup");
});
