/*
This Object can be mixed into both an interface and an instance to
call remote functions with a callback directly. Could be used to call
other sessions instance commands instance key

Step 1:
Import into your main module Instance and create a new remoteCommander like so:

    this._remoteCommander = remoteCommander({_instanceKey: this._instanceKey});

    You can then use this object to process moduleMessage.requests that are
    Remote Commands in your receiveMessage Function like so:

       if( moduleMessage.messageData.request === "Remote Command" &&
            moduleMessage.messageData.remoteCommanderKey &&
            moduleMessage.messageData.remoteCommand !== undefined) {
               this._remoteCommander.routeCommand(this._instanceKey,
               moduleMessage.messageData.remoteCommanderKey,
               moduleMessage.messageData.remoteCommand,
               messageCallback, moduleMessage.messageData.remoteCommandArguments);
       }

Step 2:
In your main modules sub modules' Instance and interface,
inherit this class as well as the base/state/synced.js

Step 3:
In the sub module Instance Constructor

            Use this to define your commands
            this._commands={

                    "commandNameOne" : lang.hitch(this, this.instanceFunctionOne),
                    "commandNameTwo" : lang.hitch(this, this.instanceFunctionTwo),
                };

            Then call to set them in state and send to Interface
            this.setInterfaceCommands();
Step 4:
In the sub module Interface onInterfaceStateChange method check for
these state changes:

                //the Instance has updated it's remote commands
                if (name === "interfaceRemoteCommands"){
                //so create the functions on the Interface
                    this.linkRemoteCommands(newState);
                }

                //This key is needed for routing the commands to the
                correct sub instance.
                if (name === "interfaceRemoteCommandKey"){
                    this._interfaceRemoteCommanderKey=newState;
                }

Step 5:
Create your command functions in the Instance
instanceFunctionTwo: function(arg1, arg2, remoteCommanderCallback)
{
remoteCommanderCallback({success: "We did the thing!"});
//callback needs an object to get message back
}


Call your Instance commands from your Interface like so:
this._instanceCommands.commandNameOne(1,2);.then(function(results){
                        console.log(results);
                        //should show {success: "We did the thing!"}
                   });


*/

define(['dojo/_base/declare',
        'dojo/_base/lang'],
    function (declare, lang) {

        return declare("moduleBaseRemoteCommander", null, {

            _commands: {},
            _instanceCommands: {},
            _interfaceRemoteCommanderKey: null,

            _interfaceRemoteCommanderKeys: {}, //this object is shared with all remoteCommanders

            constructor: function (args) {
                //todo check for inclusion of statesync mixin and do it if needed
                declare.safeMixin(this, args);
                this._instanceCommands = {};
                this._commands = {};

            },
            setInterfaceCommands() {
                //this is to be called from the constructor of superclass instance
                if (this._interfaceRemoteCommanderKey === null) {
                    this._interfaceRemoteCommanderKey = this.getUniqueCommandKey();
                    this._interfaceRemoteCommanderKeys[this._interfaceRemoteCommanderKey] = this;
                }
                this._interfaceState.set("interfaceRemoteCommandKey", this._interfaceRemoteCommanderKey);
                this._interfaceState.set("interfaceRemoteCommands", Object.keys(this._commands));
            },
            linkRemoteCommands: function (interfaceLinks) {
                //this is to be called in superclassed interface after remote commands are received
                //a good place is in the onInterfaceStateChange function
                for (const linkKey in interfaceLinks) {
                    this._instanceCommands[interfaceLinks[linkKey]] = lang.hitch(this, function () {
                        let commandArguments = arguments;
                        return new Promise(lang.hitch(this, function (Resolve) {
                            this.sendInstanceCallbackMessage({
                                request: "Remote Command",
                                remoteCommanderKey: this._interfaceRemoteCommanderKey,
                                remoteCommand: interfaceLinks[linkKey],
                                remoteCommandArguments: commandArguments,
                            }, function (commandResults) {
                                console.log("got command return results");
                                Resolve(commandResults);
                            });

                        }));
                    });

                    this._instanceCommands["_"+interfaceLinks[linkKey]] = lang.hitch(this, function () {
                        let args = Array.from(arguments);
                        let commandReturnCallback = args.pop()

                        if (typeof commandReturnCallback === 'function') {
                            let commandArguments = args;

                                this.sendInstanceCallbackMessage({
                                    request: "Remote Command",
                                    remoteCommanderKey: this._interfaceRemoteCommanderKey,
                                    remoteCommand: interfaceLinks[linkKey],
                                    remoteCommandArguments: commandArguments,
                                }, function (commandResults) {
                                    console.log("got command return results");
                                    commandReturnCallback(commandResults);
                                });


                        }else{
                            console.log("Instance command not given a callback")
                        }
                    });
                }
            },
            routeCommand: function (instanceKey, remoteCommanderKey, command, commandCallback, commandArguments) {
                //To be called from the main Module instance when it receives remoteCommand
                let commanders = this._interfaceRemoteCommanderKeys;
                if (this._interfaceRemoteCommanderKeys[remoteCommanderKey] &&
                    this._interfaceRemoteCommanderKeys[remoteCommanderKey]._instanceKey === instanceKey) {
                    this._interfaceRemoteCommanderKeys[remoteCommanderKey].processCommand(instanceKey,
                        remoteCommanderKey,
                        command,
                        commandCallback,
                        commandArguments);
                } else {
                    console.log("could not Route command");
                }
            },
            processCommand: function (instanceKey, remoteCommanderKey, command, commandCallback, commandArguments) {
                // used by route command
                if (this._instanceKey === instanceKey && this._interfaceRemoteCommanderKey === remoteCommanderKey) {
                    if (this._commands[command]) {
                        try {
                                let args =Object.values(commandArguments)
                                args.push(commandCallback);
                               this._commands[command].apply(this, args);
                        } catch (error) {
                            commandCallback({
                                error: "Command Found But Couldn't execute properly",
                                errorMessage: error.toString()
                            })
                        }
                    } else {
                        commandCallback({error: "Command Not available"})
                    }
                } else {
                    console.log("this should not be happening");
                }
            },
            getUniqueCommandKey: function () {
                let crypto = require('dojo/node!crypto');
                do {
                    let id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._interfaceRemoteCommanderKeys[id] == "undefined"){
                        this._interfaceRemoteCommanderKeys[id] = "Waiting for Object";
                        return id;
                    }
                } while (true);
            },
        });
    });