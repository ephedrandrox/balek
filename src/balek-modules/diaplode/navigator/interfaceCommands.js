define([ 	'dojo/_base/declare',
    "dojo/_base/lang"


    ],
    function (declare, lang ) {

        return declare( "diaplodeNavigatorInterfaceCommands",null, {
            _containers: null,
            _sessionKey: null,

            _shared: {},

            _interfaceCommands: {},
            _resolvesWaiting: [],

            constructor: function (args) {


                declare.safeMixin(this, args);

                if(this._shared.navigatorReady === undefined)
                {
                    this._shared.navigatorReady = false;
                }

                console.log("Initializing Diaplode Navigator Interface Commands...");


            },
            setNavigatorReady: function(){
                this._shared.navigatorReady = true;
                this.resolveCommandRequests();
            },
            getCommands: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if (this._shared.navigatorReady === true)
                    {

                        Resolve(this._interfaceCommands);
                    }
                    else
                    {
                        this._resolvesWaiting.push({Resolve: Resolve, Reject: Reject});

                        //Reject({error: "Navigator has not set any commands"});
                    }
                }));


            },
            setCommand: function(key, commandFunction)
            {
                this._interfaceCommands[String(key)] = commandFunction;
            },
            resolveCommandRequests: function(){
                this._resolvesWaiting.forEach(lang.hitch(this, function(commandRequest){
                    commandRequest.Resolve(this._interfaceCommands);
                }));
            }

        });
    });