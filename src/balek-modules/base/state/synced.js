/*


This Object can be mixed into both an interface and an instance to
sync the _interfaceState object between the two

To use, create your instance object with "_stateChangeInterfaceCallback"
Which should be a messageCallback
_stateChangeInterfaceCallback sends the State change to the Interface

this._interfaceState.set() in your instance object to change the state;


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
            _components: {},
            _componentKey: null,

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
                if(this._stateChangeInterfaceCallback)
                {
                    let interfaceStateObject = {[String(name)] : newState};
                    this._stateChangeInterfaceCallback({interfaceState: JSON.stringify(interfaceStateObject)});
                }

            },
            askToConnectInterface: function(){
                this.sendInstanceCallbackMessage({
                    request: "State Connect",
                    componentKey: this._componentKey
                }, lang.hitch(this, this._InstanceStateChangeCallback));


            },
            getComponentKey: function(){
                return this._componentKey;
            },
            prepareSyncedState: function()
            {
                this._componentKey = this.getUniqueComponentKey();
                this._components[this._componentKey] = this;
                this._interfaceState.set("componentKey",  this._componentKey);

            },
            connectInterface: function(instanceKey, componentKey, interfaceCallback) {
                if (this._components[componentKey] && this._components[componentKey]._instanceKey === instanceKey) {
                    console.log("connecting component to interface");

                    this._components[componentKey].setNewInterfaceCallback(interfaceCallback);

                    interfaceCallback({interfaceState: JSON.stringify(this._interfaceState)});
                }
                else{
                    console.log("THe component does not match");

                }
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

            },
            setNewInterfaceCallback: function(newInterfaceCallback){
                this._stateChangeInterfaceCallback = newInterfaceCallback;
                this._stateChangeInterfaceCallback({interfaceState: JSON.stringify(this._interfaceState)});
            },
            _end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying Interface State Watch handles");

                    this._interfaceStateWatchHandle.unwatch();
                    this._interfaceStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            unload: function () {
                console.log("destroying Interface State Watch handles");

                this._interfaceStateWatchHandle.unwatch();
                this._interfaceStateWatchHandle.remove();
                this.destroy();
            },
            getUniqueComponentKey: function () {

                let crypto = require('dojo/node!crypto');

                do {
                    let id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._components[id] == "undefined")
                        this._components[id] = "Waiting for Object";
                    return id;
                } while (true);

            },

        });
    });