define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',
    ],
    function (declare, lang,  _baseInstance, _stateSynced) {
        return declare("moduleTwitterContactsInstanceContactsList", [_baseInstance, _stateSynced], {

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleTwitterContactsInstanceContactsMenu");

                this._interfaceState.set("Component Name","contactList");
                this.prepareSyncedState();
                this._interfaceState.set("Status", "Ready");

            },
            _end: function(){
                this.inherited(arguments);
            }
        });
    });