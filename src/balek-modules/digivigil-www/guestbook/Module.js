define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Module',
        'balek-modules/digivigil-www/guestbook/Controller',
        'balek-modules/digivigil-www/guestbook/Instance',
       ],
    function (declare, lang, topic,
              baseModule, moduleController, moduleInstance) {
        return declare("digivigilGuestbookModule", baseModule, {
            //Module Config
            _displayName: "Digivigil Guestbook",
            _allowedSessions: [0, 1],
            _iconPath: 'balek-modules/digivigil-www/guestbook/resources/images/book.svg',
            //End Config
            _instances: {},
            _Controller: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("digivigilGuestbookModule  starting...");
                this._Controller = new moduleController({_module: this});
            },
            newInstance: function (args) {
                //Called by Balek when a new Instance is requested
                args._module = this;
                args._moduleController = this._Controller;
                this._instances[args._instanceKey] = new moduleInstance(args);
                return new moduleInstance(args);
            }
        });
    }
);


