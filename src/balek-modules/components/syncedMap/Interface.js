define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, lang, baseInterface, stateSyncer ,remoteCommander ) {
        return declare("moduleBaseSyncedMapInterface", [baseInterface, stateSyncer ,remoteCommander ],{
            _instanceKey: null,

            _objects: null,

            _stateWatcher: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleBaseSyncedMapInterface started");
              //  console.log("moduleBaseSyncedMapInterface started", this._componentKey, this._instanceKey);

                this._objects = {};

                if(!this._componentKey){
                    this.sendInstanceCallbackMessage({
                        request: "Component Key",
                    }, lang.hitch(this, function (requestResults) {
                      //  console.log("got command return results", requestResults);
                        this._componentKey = requestResults.componentKey
                        this.askToConnectInterface();

                    }));
                }else {


                    this.askToConnectInterface();
                }


            },
            onInterfaceStateChange: function (name, oldState, newState) {

                //console.log("SyncedMap",name, oldState, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                if (name === "componentKey") {

                }else if (name === "Module") {

                }else {
                    //console.log("Got a list Item",name, newState);
                    //Got a list Item
                    this._objects[name.toString()] =newState;

                    if(this._stateWatcher !== null){
                        this._stateWatcher(name.toString(), oldState, newState);
                    }

                }

            },
            setStateWatcher:function(stateWatcher){
                if(this._stateWatcher === null){
                    this._stateWatcher = stateWatcher;
                }

                for(objectIndex in this._objects)
                {
                    this._stateWatcher(objectIndex, undefined,this._objects[objectIndex] )
                }
            }
        });
    }
);



