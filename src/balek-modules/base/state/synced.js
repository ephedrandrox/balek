/*

This Object can be mixed into both an interface and an instance to
sync the _interfaceState object between the two

To use, create your instance object with "_stateChangeInterfaceCallback"
_stateChangeInterfaceCallback sends the State change to the Interface

this._interfaceState.set() in your instance objectto change the state;


The interface object can ask the instance to create the object with
a message callback pointing to _InstanceStateChangeCallback

overwrite onInterfaceStateChange in the interface to check state on change

*/

define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
    ],
    function (declare, lang, Stateful) {

        return declare("moduleBaseStateTransmitter", null, {

            _interfaceState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                let interfaceState = declare([Stateful], {
                });

                this._interfaceState = new interfaceState({

                });

                this._interfaceStateWatchHandle = this._interfaceState.watch( lang.hitch(this, this.onInterfaceStateChange));

            },
            onInterfaceStateChange: function(name, oldState, newState){
                //overwrite in Interface
                let interfaceStateObject = {[String(name)] : newState};
                this._stateChangeInterfaceCallback({interfaceState: JSON.stringify(interfaceStateObject)});
            },

            _InstanceStateChangeCallback(stateChangeUpdate) {

                if(stateChangeUpdate.interfaceState)
                {
                    let interfaceState = JSON.parse(stateChangeUpdate.interfaceState);


                    for (const name in interfaceState)
                    {
                        this._interfaceState.set(name, interfaceState[name]);
                    }

                }

            },_end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._interfaceStateWatchHandle.unwatch();
                    this._interfaceStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            unload: function () {
                console.log("destroying transmitter handles");

                this._interfaceStateWatchHandle.unwatch();
                this._interfaceStateWatchHandle.remove();
                this.destroy();
            }

        });
    });