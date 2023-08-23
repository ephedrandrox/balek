define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        //Controller Includes
        'balek-modules/digivigil/digiscan/Controller/Captures',
        'balek-modules/digivigil/digiscan/Controller/CaptureSets'
    ],
    function (declare, lang, topic,
              Stateful,
              Captures,
              CaptureSets
    ) {
        return declare("digivigilDigiscanController", null, {
            _module: null,              //Module instance

            Captures: null,             //Captures Controller
            CaptureSets: null,          //Capture sets Controller

            constructor: function (args) {
                declare.safeMixin(this, args);

                if(this._module === null){
                    console.log("digivigilDigiscanController  Cannot Start!...");
                }else{
                    //initialize controllers
                    this.Captures = new Captures({_module: this._module, _instanceController: this})
                    this.CaptureSets = new CaptureSets({_module: this._module, _instanceController: this})
                }
            },
            //Captures Relays
            getCaptures: function() {
                return this.Captures.getCaptures()
            },
            getCaptureSyncedMap: function(captureID, instanceKey){
                return this.Captures.getCaptureSyncedMap(captureID, instanceKey)
            },
            getCaptureSetSyncedMap: function(captureSetID, instanceKey){
             //   console.log("getCaptureSetSyncedMap2:", captureSetID)

                return this.CaptureSets.getCaptureSetSyncedMap(captureSetID, instanceKey)
            },
            getStatefulCaptureSet: function(captureID){
                return this.CaptureSets.getStatefulCaptureSet(captureID)
            },
            getCapturesForUser: function(userKey) {
                return this.Captures.getCapturesForUser(userKey)
            },
            addCapture: function(Capture){
                return this.Captures.add(Capture)
            },
            removeAllCapturesFor: function(userKey){
                return this.Captures.removeAllCapturesFor(userKey)
            },
            updateCaptureImage: function(updateEntry){
                return this.Captures.updateCaptureImage(updateEntry)
            },
            retrieveCaptureImage:  function(captureID){
            return this.Captures.retrieveCaptureImage(captureID)
            },
            retrieveCaptureImagePreview: function(captureID){
                return this.Captures.retrieveCaptureImagePreview(captureID)
            },
            //Capture Sets Relays
            //Get All Capture Sets
            getCaptureSets: function() {
                return this.CaptureSets.getCaptureSets()
            },
            getCaptureSetsForUser: function(userKey) {
                return this.CaptureSets.getCaptureSetsForUser(userKey)
            },
            addCaptureSet: function(CaptureSet, userKey){
                return this.CaptureSets.add(CaptureSet, userKey)
            },
            getCaptureSet: function(id) {
                return this.CaptureSets.get(id)
            },
            removeCaptureFromSet: function(captureSetId, captureID) {
                return this.CaptureSets.removeCaptureFromSet(captureSetId, captureID)
            },
            addCaptureToSet: function(captureSetId, captureID) {
                return this.CaptureSets.addCaptureToSet(captureSetId, captureID)
            },
            deleteCaptureSet: function(id){
                return this.CaptureSets.delete(id)
            },
            renameCaptureSet: function(id, name){
                return this.CaptureSets.rename(id, name)
            },
            clearCaptureSet: function(id){
                return this.CaptureSets.clear(id)
            }
        });
    }
);
