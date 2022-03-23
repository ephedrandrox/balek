define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/conversations/Controller',
        'balek-modules/diaplode/conversations/Instance'],
    function (declare,  baseModule, moduleController, moduleInstance) {

        return declare("diaplodeConversationsModule", baseModule, {
            _displayName: "Diaplode Conversations",
            _allowedSessions: [1],
            _iconPath: 'balek-modules/diaplode/conversations/resources/images/book.svg',

            _instances: {},

            _Controller: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("diaplodeConversationsModule  starting...");

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


