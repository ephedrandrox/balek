define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/session/menu/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("sessionMenuModule", baseModule, {
            _displayName: "Session Menu",

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("sessionMenuModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


