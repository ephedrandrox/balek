define(['dojo/_base/declare',
        'dojo/_base/lang',

        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',
        'dojo/node!qrcode'
    ],
    function (declare,
              lang,

              //Balek Instance Includes
              _SyncedCommanderInstance,
              QRCode) {
        return declare("moduleBalekuteConnectMainInstance", [_SyncedCommanderInstance], {

            scanEntries: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleBalekuteConnectMainInstance");


                //set setRemoteCommander commands

                this._commands={
                    "getQRCode": lang.hitch(this, this.getQRCode)
                    };
                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","Connect Main");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();

                this._interfaceState.set("Status", "Ready");


            },
            getQRCode: function(input, remoteCallback){

                QRCode.toDataURL(input,{type:'terminal'}, function (err, url) {
                    //console.log(url)
                    console.log(url)
                    remoteCallback({Result: url})
                })
            },
            //##########################################################################################################
            //Instance Override Functions Section
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });