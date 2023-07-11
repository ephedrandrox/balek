define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
    ],
    function (declare, lang ) {

        return declare( "balekuteConnectControllerInstanceCommands",null, {


            _shared: {},
            _controllerInterfaceCommands: {},
            _resolveRequests: [],

            constructor: function (args) {


                declare.safeMixin(this, args);

                if(typeof this._shared.initialized === 'undefined'){
                    this._shared.initialized = false;
                }

                console.log("Initializing balekuteConnectControllerInstanceCommands...");


            },
            getCommands: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(this._shared.initialized)
                    {
                        Resolve(this._controllerInterfaceCommands)
                    }else{
                        this._resolveRequests.push(Resolve)
                    }
                }));


            },
            setCommand: function(key, commandFunction)
            {
                this._controllerInterfaceCommands[String(key)] = commandFunction;
            },
            initialize: function(){
                this._shared.initialized = true;
                for( const ResolveKey in this._resolveRequests)
                {
                    this._resolveRequests[ResolveKey](this._controllerInterfaceCommands)
                }
            }


        });
    });