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
                    this.Captures = new Captures({_module: this._module})
                    this.CaptureSets = new CaptureSets({_module: this._module})
                }
            },
            //Captures Relays
            getCaptures: function() {
                return this.Captures.getCaptures()
            },
            getCaptureSyncedMap: function(captureID, instanceKey){
                return this.Captures.getCaptureSyncedMap(captureID, instanceKey)
            },
            getCapturesForUser: function(userKey) {
                return this.Captures.getCapturesForUser(userKey)
            },
            addCapture: function(Capture){
                return this.Captures.add(Capture)
            },
            removeAllCaptures: function(){
                return this.Captures.removeAll()
            },
            //Capture Sets Relays
            //Get All Capture Sets
            getCaptureSets: function() {
                return this.CaptureSets.getCaptureSets()
            },
            addCaptureSet: function(CaptureSet){
                return this.CaptureSets.add(CaptureSet)
            },
            getCaptureSet: function(id) {
                return this.CaptureSets.get(id)
            },
            removeCaptureFromSet: function(captureSetId, captureID) {
                return this.CaptureSets.removeCaptureFromSet(captureSetId, captureID)
            },
            deleteCaptureSet: function(id){
                return this.CaptureSets.delete(id)
            },

        });
    }
);
