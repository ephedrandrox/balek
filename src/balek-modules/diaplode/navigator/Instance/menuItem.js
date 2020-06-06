define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance',

        'balek-modules/base/state/synced'
    ],
    function (declare, lang,  baseInstance, stateSynced) {

        return declare("moduleDiaplodeNavigatorRadialMenuItemInstance", [baseInstance,stateSynced], {



            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeNavigatorRadialMenuInstance")

                this._interfaceState.set("menuItemKey", this._menuItemKey);
            },
            _end: function(){
                this.inherited(arguments);

            }


        });
    });