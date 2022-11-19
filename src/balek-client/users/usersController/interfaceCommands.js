define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
    ],
    function (declare, lang ) {

        return declare( "balekUsersInterfaceCommands",null, {


            _sessionsInterfaceCommands: {},

            constructor: function (args) {


                declare.safeMixin(this, args);


                console.log("Initializing balekUsersInterfaceCommands...");


            },
            getCommands: function()
            {
                return this._sessionsInterfaceCommands;
            },
            setCommand: function(key, commandFunction)
            {
                this._sessionsInterfaceCommands[String(key)] = commandFunction;
            }


        });
    })