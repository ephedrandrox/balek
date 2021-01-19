define([ 	'dojo/_base/declare',
        "dojo/_base/lang"
    ],
    function (declare, lang ) {

        return declare( "diaplodeNavigatorInterfaceSystemMenu",null, {
            _syncedMap: null,
            _menuCompanion: null,

            constructor: function (args) {


                declare.safeMixin(this, args);
                console.log("Initializing Diaplode Navigator Interface System Menu...");

                if(this._syncedMap === null || this._menuCompanion === null )
                {
                    console.log("Menu Could not be initialized");
                }else {
                   // console.log("creating System Menu", this._syncedMap , this._menuCompanion);
                   // this._syncedMap.setStateWatcher(lang.hitch(this, this.syncedMapItemStateChange));
                }

            },
            syncedMapItemStateChange: function(itemKey, oldState, newState)
            {
                //console.log("item", itemKey, oldState, newState);
            },
            loadItem: function(itemKey){
             //   console.log("Load item", itemKey);
                if(this._menuCompanion && this._menuCompanion.load)
                {
                    this._menuCompanion.load(itemKey).then().catch();
                }
            }

        });
    });