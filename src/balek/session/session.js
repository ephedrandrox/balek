define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful'

    ],
    function (declare, lang, Stateful) {

        return declare("balekSessionManagerSession", null, {
            _syncedState: null,

            constructor: function(args){

                declare.safeMixin(this, args);

                let syncedSessionState = declare([Stateful], {
                    sessionStatus: 0,
                    sessionKey: null,
                    userKey: null,
                    userName: null
                });

                this._syncedState = new syncedSessionState({
                    sessionStatus: 0
                });

                this._syncedStateWatchHandle = this._syncedState.watch(lang.hitch(this, this.onSyncedStateChange));
                console.log("Session synced States created");
            },
            onSyncedStateChange: function(name, oldState, newState){
                //overwrite in Interface
                if(this._syncedStateChangeInterfaceCallback)
                {

                    let interfaceStateObject = {[String(name)] : newState};
                    this._syncedStateChangeInterfaceCallback({syncedState: JSON.stringify(interfaceStateObject)});
                }
            },
            onSyncedStateChangeCallback(stateChangeUpdate){

                if(stateChangeUpdate.syncedState){
                    let syncedState = JSON.parse(stateChangeUpdate.syncedState);
                    for (const name in syncedState)
                    {
                     //   console.log(name, syncedState[name]);

                        this._syncedState.set(name, syncedState[name]);
                    }
                }
            },
            setNewInterfaceCallback: function(newInterfaceCallback){
                this._syncedStateChangeInterfaceCallback = newInterfaceCallback;
                this._syncedStateChangeInterfaceCallback({syncedState: JSON.stringify(this._syncedState)});
            },
            unload: function(){
                console.log("Destroying Session Synced State Watch Handle");
                this._syncedStateWatchHandle.unwatch();
                this._syncedStateWatchHandle.remove();

                this._syncedState.set("unloaded", true);
            },
            getStatus(){
                return this._syncedState.get("sessionStatus");
            },
            getUserKey(){
                return this._syncedState.get("userKey");

            },
            getPermissionGroups(){
                return this._syncedState.get("permissionGroups");

            },
            getUserName(){
                return this._syncedState.get("username");
            },
            getUserInfo: function()
            {
                 return {    userName: this.getUserName(),
                    userKey: this.getUserKey()
                }
            },
            getState(){
                return this._syncedState;
            }
        });
    });