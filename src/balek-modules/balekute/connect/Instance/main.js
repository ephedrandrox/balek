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

            _connectController: null,
            target : null,
            targetState: null,
            targetStateWatchHandle: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleBalekuteConnectMainInstance");


                //set setRemoteCommander commands
                if(this._connectController !== null)
                {
                    this._commands={
                        "getQRCode": lang.hitch(this, this.getQRCode)
                    };
                    this.setInterfaceCommands();

                   this.target =  this._connectController.createTarget(this._sessionKey);


                    this.targetState = this.target.getState()

                    this._interfaceState.set("Component Name","Connect Main");
                    this._interfaceState.set("targetKey",this.target.getKey())

                    this.targetStateWatchHandle = this.targetState.watch(lang.hitch(this, this.onTargetStateUpdate))
                    //creates component Key that can be used to connect to state
                    this.prepareSyncedState();

                    this._interfaceState.set("Status", "Ready");

                }


            },
            onTargetStateUpdate: function(name, oldState, newState)
            {
                if(name == "targetActivated")
                {
                    this._interfaceState.set("targetActivated", newState)

                }
            },
            getQRCode: function(input, remoteCallback){

                QRCode.toDataURL(input,{type:'terminal'}, function (err, url) {

                    remoteCallback({Result: url})
                })
            },
            //##########################################################################################################
            //Instance Override Functions Section
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.targetStateWatchHandle.unwatch()
                this.inherited(arguments);
            }
        });
    });