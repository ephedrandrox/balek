define([ 	'dojo/_base/declare',
        'dojo/_base/lang',


    ],
    function (declare, lang ) {

        return declare( "balekClientWorkspaceManagerInterfaceCommands",null, {
            _containers: null,
            _sessionKey: null,


            _workspaceInterfaceCommands: {},

            constructor: function (args) {


                declare.safeMixin(this, args);


                console.log("Initializing Balek Workspace Manager Interface Commands...");


            },
           getCommands: function()
           {
                return this._workspaceInterfaceCommands;
           },
            setCommand: function(key, commandFunction)
            {
                this._workspaceInterfaceCommands[String(key)] = commandFunction;
            }


        });
    });