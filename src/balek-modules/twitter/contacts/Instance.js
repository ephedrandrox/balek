//This file is loaded by the module when it is loaded into the Balek Instance
//And is used to create a new instance when it is requested by the moduleManager
define(['dojo/_base/declare',
        'dojo/_base/lang',
        "dojo/topic",
        //Balek Instances to include
        "balek-modules/twitter/contacts/Instance/contactsMenu",
        "balek-modules/twitter/contacts/Instance/contactsList",
        //Balek Service Includes
        'balek-modules/twitter/services/userLookup',
        //Balek Instance extension include
        'balek-modules/components/syncedCommander/Instance',],                          //Array of files to include
    function (declare,
              lang,
              topic,
              //Balek Instances to include
              contactsMenuInstance,
              contactsListInstance,
              //Balek Service Includes
              twitterUserLookup,
              //Balek Instance extension include
              _syncedCommanderInstance) {   //variables from array of included files
        return declare("moduleTwitterContactsInstance", _syncedCommanderInstance, {     //Declares instance extending base instance
            _instanceKey: null,                                                         //used to identify instance, set by moduleManager
            _sessionKey: null,                                                          //used to identify session, set by sessionManager

            _contactsMenu: null,                                                        //Contacts Menu Instance created after getting session key
            _contactsList: null,

            _twitterUserLookup: null,                                                   //Twitter user lookup service initialized in constructor
            _twitterUserLookupServiceState:null,
            _twitterUserLookupServiceStateWatchHandle: null,
            _twitterUserLookupDataState:null,
            _twitterUserLookupDataStateWatchHandle: null,
            _twitterUserLookupErrorDataState:null,
            _twitterUserLookupErrorDataStateWatchHandle: null,

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

                    this._contactsList = new contactsListInstance({_instanceKey: this._instanceKey,
                        _sessionKey: this._sessionKey,
                        _userKey: userKey });
                    this._interfaceState.set("contactsListInstanceKeys", {  instanceKey: this._contactsList._instanceKey,
                                                                            sessionKey: this._contactsList._sessionKey,
                                                                            userKey: this._contactsList._userKey,
                                                                            componentKey: this._contactsList._componentKey});

                    this._contactsList._interfaceState.set("Status", "Ready");

                    this._twitterUserLookup = new twitterUserLookup();
                    this._twitterUserLookupServiceState = this._twitterUserLookup.getServiceState();
                    this._twitterUserLookupServiceStateWatchHandle = this._twitterUserLookupServiceState.watch(lang.hitch(this, this.onTwitterUserLookupServiceStateChange));
                    this._twitterUserLookupDataState = this._twitterUserLookup.getDataState();
                    this._twitterUserLookupDataStateWatchHandle = this._twitterUserLookupDataState.watch(lang.hitch(this, this.onTwitterUserLookupDataStateChange));
                    this._twitterUserLookupErrorDataState = this._twitterUserLookup.getErrorDataState();
                    this._twitterUserLookupErrorDataStateWatchHandle = this._twitterUserLookupErrorDataState.watch(lang.hitch(this, this.onTwitterErrorDataStateChange));


                    //set the contactsMenuInstanceKeys to trigger interface to load
                    this._interfaceState.set("contactsMenuInstanceKeys", {  instanceKey: this._contactsMenu._instanceKey,
                                                                            sessionKey: this._contactsMenu._sessionKey,
                                                                            userKey: this._contactsMenu._userKey,
                                                                            componentKey: this._contactsMenu._componentKey});
                    //let the twitter/contacts Interface know Instance is ready
                    this._interfaceState.set("Status", "Ready");
                }));
                console.log("moduleTwitterContactsInstance starting...", this._instanceKey);
            },

            //##########################################################################################################
            //State Events Methods Section
            //##########################################################################################################

            onTwitterUserLookupServiceStateChange(name, oldState, newState)
            {
                if(name === "Status"){
                    this._contactsMenu._interfaceState.set("twitterStatus", newState);
                }else if(name === "requestsRemaining"){
                    this._contactsMenu._interfaceState.set("twitterRequestsRemaining", newState);

                }else if(name === "usersInQueue" )
                {
                    this._contactsMenu._interfaceState.set("twitterRequestsInQueue", newState);
                }else if(name === "processingQueue" )
                {
                    this._contactsMenu._interfaceState.set("twitterProcessingQueue", newState);
                }
            },
            onTwitterUserLookupDataStateChange(name, oldState, newState)
            {
                //have this update list state
                this._contactsList._interfaceState.set("ContactListItem"+name.toLowerCase(), newState);
            },
            onTwitterErrorDataStateChange(name, oldState, newState)
            {
                this._contactsList._interfaceState.set("ContactListError"+name.toLowerCase(), newState);
            },

            //##########################################################################################################
            //Remote Commands Methods Section
            //##########################################################################################################

            //This is the function that is called when Interface calls the importContacts remote command
            importContacts(names, remoteCommanderCallback){
                console.log("newName", arguments);
                console.log("Names to find is " + names);
                //check if we got a string or array from Interface
                if(typeof names === "string")
                {
                    names = names.split(",");
                }

                if(typeof names === "object" && Array.isArray(names))
                {
                    if(names.length >0 && names[0] !== '' ){
                        this._twitterUserLookup.requestUsersInfo(names);
                        remoteCommanderCallback({name: "Added Names to Queue"});
                    }else
                    {
                        remoteCommanderCallback({name: "Could not find names to lookup: " + names.toString()});
                    }
                }else {
                    remoteCommanderCallback({name: "Could not find names to lookup: " + names.toString()});
                }
            },

            //##########################################################################################################
            //Instance Inherited Methods Section
            //##########################################################################################################

            _end(){
                this._twitterUserLookupServiceStateWatchHandle.unwatch();
                this._twitterUserLookupServiceStateWatchHandle.remove();
                this._twitterUserLookupDataStateWatchHandle.unwatch();
                this._twitterUserLookupDataStateWatchHandle.remove();
                this._twitterUserLookupErrorDataStateWatchHandle.unwatch();
                this._twitterUserLookupErrorDataStateWatchHandle.remove();
               return  this.inherited(arguments);
            }
        });
    }
);