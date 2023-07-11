define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'balek-modules/digivigil/digiscan/Database/captureSets',

        "dojo/node!sanitize-html",
    ],
    function (declare, lang, topic,
              Stateful,
              captureSetsDatabase,
              nodeSanitizeHtml) {
        return declare("digivigilScapturaCaptureSetsController", null, {
            _module: null,              //Module instance

            captureSets: null,          //Dojo State Object
            _captureSetsDatabase: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object


                let CaptureSetsState = declare([Stateful], {});
                this.captureSets = new CaptureSetsState({})

                if(this._module === null){
                    console.log("digivigilScapturaCaptureSetsController  Cannot Start!...");
                }else{


                    this._captureSetsDatabase = new captureSetsDatabase({_instanceKey: this._instanceKey});
                    console.log("Loading Captures Sets...");

                    this.load().then(lang.hitch(this, function(Result){
                        console.log("Capture Sets Loaded", Result);
                    }))
                }
            },

            load: function (){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._captureSetsDatabase.getCaptureSets().then(lang.hitch(this, function(CaptureSets){
                        if(Array.isArray(CaptureSets)){
                            CaptureSets.forEach(lang.hitch(this, function(CaptureSet){
                                let id = CaptureSet._id.toString()
                                this.captureSets.set(id, CaptureSet)
                            }))
                            Resolve({SUCCESS: "getCaptureSets database results Loaded"})
                        }else{
                            Reject({Error: "CaptureSets are not an array! loadCaptureSets"})
                        }
                    })).catch(lang.hitch(this, function(Error){
                        Reject({Error: Error})
                        console.log("getCaptures  Error:", Error)
                    }))
                }));
            },

            getCaptureSets: function() {
                return this.captureSets
            },
            //
            // addCaptureToAllCaptureSets: function(id, Entry) {
            //     console.log("addCaptureToAllCaptureSets", id, Entry, this.captureSets)
            //
            //
            //     const captureSetIDs = Object.keys(this.captureSets)
            //     console.log("addCaptureToAllCaptureSets", id, Entry, this.captureSets, captureSetIDs)
            //
            //     captureSetIDs.forEach (lang.hitch(this, function(captureSetID) {
            //         console.log("addCaptureToAllCaptureSets", id, Entry, captureSetID)
            //
            //         if (captureSetID !== 'declaredClass'&& captureSetID !== 'watch' &&
            //             this.captureSets[captureSetID] !== null
            //             && typeof this.captureSets[captureSetID] !== "function"
            //             && typeof this.captureSets[captureSetID].CaptureSet === "object") {
            //
            //             console.log("addCaptureToAllCaptureSets", captureSetID, this.captureSets[captureSetID])
            //
            //             let CaptureSet = this.captureSets.get(captureSetID).CaptureSet;
            //             const appendAll = CaptureSet.appendAll;
            //
            //
            //             CaptureSet.captures[id] = {inSet: appendAll};
            //             console.log("addCaptureToAllCaptureSets before checkAndReturnValidCaptureSet", CaptureSet)
            //
            //             CaptureSet = this.checkAndReturnValidCaptureSet(CaptureSet)
            //             console.log("addCaptureToAllCaptureSets after checkAndReturnValidCaptureSet", CaptureSet)
            //
            //             //save it to the database
            //             console.log("addCaptureToAllCaptureSets", captureSetID, this.captureSets[captureSetID], CaptureSet)
            //
            //
            //             if(CaptureSet)
            //             {
            //                 console.log("Controller Adding Capture Set to Database", CaptureSet)
            //                 this._captureSetsDatabase.updateCaptureSet(captureSetID, CaptureSet).then(lang.hitch(this, function(Result){
            //                     console.log("Capture Set Updated", Result);
            //                     // try{
            //                     //
            //                     //     this.getCaptureSet(Result).then(lang.hitch(this, function(DBCaptureSet){
            //                     //         console.log("Capture Set Retreived",id, DBCaptureSet);
            //                     //
            //                     //         this.captureSets.set(id, DBCaptureSet)
            //                     //         console.log({SUCCESS: Entry})
            //                     //     })).catch(lang.hitch(this, function(Error){
            //                     //         console.log({Error: Error})
            //                     //     }))
            //                     // }catch(Error){
            //                     //     console.log("Error Getting Entry:", Error);
            //                     //     console.log(Error)
            //                     // }
            //
            //                     if(Result.modifiedCount === 1){
            //                         this.captureSets.set(captureSetID, {_id: captureSetID, CaptureSet: CaptureSet})
            //                     }else
            //                     {
            //                         console.log("Database didnt save capturese:", CaptureSet, captureSetID);
            //                     }
            //                 })).catch(lang.hitch(this, function(Error){
            //                     console.log("Controller could not add Capture to Database", Error);
            //
            //                     console.log({Error})
            //                 }))
            //             }else {
            //                 console.log({ERROR: "Invalid Digiscan Capture"})
            //             }
            //
            //         }else{
            //         //    console.log("addCaptureToAllCaptureSets", captureSetID, this.captureSets[captureSetID])
            //         }
            //     }))
            // },
            add: function(CaptureSet){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    CaptureSet = this.checkAndReturnValidCaptureSet(CaptureSet)
                    if(CaptureSet)
                    {
                        console.log("Controller Adding Capture Set to Database", CaptureSet)
                        this._captureSetsDatabase.addCaptureSet(CaptureSet).then(lang.hitch(this, function(Result){
                            console.log("Capture Set Added", Result);
                            try{
                                const id = Result
                                this.get(id).then(lang.hitch(this, function(DBCaptureSet){
                                    console.log("Capture Set Retreived", DBCaptureSet);
                                    let id = DBCaptureSet._id.toString()
                                    this.captureSets.set(id, DBCaptureSet)
                                    Resolve({SUCCESS: Entry})
                                })).catch(lang.hitch(this, function(Error){
                                    Reject({Error: Error})
                                }))
                            }catch(Error){
                                console.log("Error Getting Entry:", Error);
                                Reject(Error)
                            }
                        })).catch(lang.hitch(this, function(Error){
                            console.log("Controller could not add Capture to Database", Error);

                            Reject({Error})
                        }))
                    }else {
                        Reject({ERROR: "Invalid Digiscan Capture"})
                    }
                }));
            },

            get: function(id) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._captureSetsDatabase.getCaptureSet(id).then(lang.hitch(this, function(Result){
                        console.log("Capture Set Loaded", Result);
                        try{
                            Resolve(Result)
                        }catch(Error){
                            console.log("Error Getting Capture Set:", id, Error);
                            Reject(Error)
                        }
                    }))
                }));
            },
            removeCaptureFromSet: function(captureSetId, captureID) {

                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    console.log("Controller removeCaptureFromSet:", captureSetId, captureID, this.captureSets);

                    //get the capture set
                    let captureSet = this.captureSets.get(captureSetId)


                    console.log("Controller removeCaptureFromSet:", captureSetId, captureID, captureSet);


                    //if the capture set exists in state
                    if (captureSet && captureSet.CaptureSet
                    && typeof captureSet.CaptureSet.captures[captureID] === "object")
                    {
                        //edit the capture set
                        captureSet.CaptureSet.captures[captureID].inSet = false

                        //save the capture set

                        //transmit the capture set

                        console.log("UnSetting Capture Set:", captureSetId, captureSet);


                        this.captureSets.set(captureSetId, captureSet)
                        console.log("UnSetting Capture Set   this.captureSets:",  this.captureSets);

                        Resolve({SUCCESS: "removeCaptureFromSet"})

                    }else {
                        Reject({Error: "Capture set is not as expected"})
                    }

                }));


            },
            delete: function(id){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {


                    try{

                        this._captureSetsDatabase.removeCaptureSet(id).then(lang.hitch(this, function(Result){
                        console.log("Capture Set Removed", Result);
                            Resolve(Result)

                        })).catch(lang.hitch(this, function(Error){
                            Reject(Error)
                        }))

                    }catch(Error){
                        console.log("Error Deleting Capture Set:", id, Error);
                        Reject(Error)
                    }


                }));
            },

            checkAndReturnValidCaptureSet(CaptureSet) {
                let validCaptureSet = {};
               if ( typeof CaptureSet.name === 'string' && typeof CaptureSet.appendAll === 'boolean'
                   && typeof CaptureSet.captures === 'object') {
                   validCaptureSet.name = nodeSanitizeHtml(CaptureSet.name);
                   validCaptureSet.appendAll = CaptureSet.appendAll
                   validCaptureSet.captures = CaptureSet.captures

                    return validCaptureSet;
                } else {
                    return false;
                }
            }
        });
    }
);
