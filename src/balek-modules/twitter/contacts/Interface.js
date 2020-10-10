//This file is loaded by the Balek interface aka web client
//And is used to create a new module interface to connect to an module instance
define(['dojo/_base/declare',
        'dojo/topic',
        //Balek Interface Includes
        'balek-modules/twitter/contacts/Interface/contactsMenu',
        'balek-modules/components/syncedCommander/Interface',],                         //Array of files to include
    function (declare, topic, contactsMenuInterface, _syncedCommanderInterface ) {      //variables from array of included files
        return declare("moduleTwitterContactsInterface", _syncedCommanderInterface, {   //Declares Interface extending base Interface
            _instanceKey: null,                                                         //This is used to identify and communicate with the module instance

            _contactsMenuInterface: null,                                               //We create the menu interface when keys are received

            constructor: function (args) {                                              //called when a new interface is created
                declare.safeMixin(this, args);                                          //mixes in args from moduleManager like _instanceKey
                console.log("moduleTwitterContactsInstance started", this._instanceKey);
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be done so remoteCommander works
                this.inherited(arguments);

                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                    //we could do something based on error status here
                }else if (name === "contactsMenuInstanceKeys") {
                    //Check that we got all the keys
                    if(newState.instanceKey && newState.sessionKey && newState.userKey && newState.componentKey)
                    {
                        console.log("Creating contactsMenuInterface from Keys:", newState);
                        //create contactsMenuInterface from synced state keys
                        this._contactsMenuInterface = new contactsMenuInterface({   _instanceKey:newState.instanceKey,
                                                                                    _sessionKey:  newState.sessionKey,
                                                                                    _userKey: newState.userKey,
                                                                                    _componentKey: newState.componentKey,
                                                                                    _contactInstanceCommands:  this._instanceCommands });
                    }
                }
            }
        });
    }
);



