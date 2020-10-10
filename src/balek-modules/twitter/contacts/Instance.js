//This file is loaded by the module when it is loaded into the Balek Instance
//And is used to create a new instance when it is requested by the moduleManager
define(['dojo/_base/declare',
        'dojo/_base/lang',
        "dojo/topic",
        //Balek Instances to include
        "balek-modules/twitter/contacts/Instance/contactsMenu",
        //Balek Instance extension include
        'balek-modules/components/syncedCommander/Instance',],                          //Array of files to include
    function (declare,
              lang,
              topic,
              //Balek Instances to include
              contactsMenuInstance,
              //Balek Instance extension include
              _syncedCommanderInstance) {   //variables from array of included files
        return declare("moduleTwitterContactsInstance", _syncedCommanderInstance, {     //Declares instance extending base instance
            _instanceKey: null,                                                         //used to identify instance, set by moduleManager
            _sessionKey: null,                                                          //used to identify session, set by sessionManager

            _contactsMenu: null,                                                        //Contacts Menu Instance created after getting session key

            constructor: function (args) {                                              //called when a new instance is created by moduleManager for a session
                declare.safeMixin(this, args);                                          //mixes in args from moduleManager like _instanceKey

                //set syncedCommander commands
                this._commands={
                    "importContacts" : lang.hitch(this, this.importContacts)
                };
                //activate syncedCommander commands
                this.setInterfaceCommands();
                //set the log state, will not show up in interface unless it connects to state before overwritten
                this._interfaceState.set("log", "log Started");
                //get Session User Key
                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey){
                    //set the log state
                    this._interfaceState.set("log", "creating contacts Menu instance");
                    //create the contactsMenu Instance
                    this._contactsMenu = new contactsMenuInstance({ _instanceKey: this._instanceKey,
                                                                    _sessionKey: this._sessionKey,
                                                                    _userKey: userKey });
                    //set the contactsMenuInstanceKeys to trigger interface to load
                    this._interfaceState.set("contactsMenuInstanceKeys", {instanceKey: this._contactsMenu._instanceKey, sessionKey: this._contactsMenu._sessionKey, userKey: this._contactsMenu._userKey, componentKey: this._contactsMenu._componentKey});
                    //let the twitter/contacts Interface know Instance is ready
                    this._interfaceState.set("Status", "Ready");
                }));
                console.log("moduleTwitterContactsInstance starting...", this._instanceKey);
            },
            //This is the function that is called when Interface calls the importContacts remote command
            importContacts(names, remoteCommanderCallback){
                console.log("newName", arguments);
                console.log("Names to find is " + names);
                //check if we got a string or array from Interface
                if(typeof names === "string")
                {
                    //let the Interface know that can not look up a name yet
                    remoteCommanderCallback({name: "Could not look for single name: " + names.toString()});
                }else if(typeof names === "object" && Array.isArray(names))
                {
                    //let the Interface know that can not look up a names yet
                    remoteCommanderCallback({name: "Could not look for Array of names: " + names.toString()});
                }

            }
        });
    }
);


