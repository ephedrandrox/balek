define(['dojo/_base/declare',
        'dojo/_base/lang',
        //Balek Instance Includes
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
    ],
    function (declare,
              lang,
              //Balek Instance Includes
              _baseInstance,
              _stateSynced) {
        return declare("moduleTwitterContactsInstanceContactsMenu", [_baseInstance, _stateSynced], {

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleTwitterContactsInstanceContactsMenu");

                this._interfaceState.set("Component Name","contactMenu");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();
                this._interfaceState.set("Status", "Ready");
            },
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });