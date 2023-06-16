define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Module',
        'balek-modules/digivigil/tabular/Instance',
    ],
    function (declare, lang, topic, baseModule, moduleInstance) {

        return declare("digivigilTabularModule", baseModule, {
            _displayName: "Tabbed Data Importer",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("digivigilTabularModule  starting...");

            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


