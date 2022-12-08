define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Module',
        'balek-modules/balekute/connect/Controller',
        'balek-modules/balekute/connect/Instance',


    ],
    function (declare, lang, topic, baseModule, moduleController,
      moduleInstance) {

        return declare("balekuteConnectModule", baseModule, {
            _displayName: "Balekute Connect",
            _allowedSessions: [0, 1],
            _instances: {},
            _iconPath: 'balek-modules/balekute/connect/resources/images/icon.svg',

            _Controller: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("balekuteConnectModule  starting...");

                this._Controller = new moduleController({_module: this});


            },
            newInstance: function (args) {
                args.moduleController = this._Controller;

                this._instances[args._instanceKey] = new moduleInstance(args);
                return new moduleInstance(args);
            }
        });
    }
);

