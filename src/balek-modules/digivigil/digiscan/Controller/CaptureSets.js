define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'balek-modules/digivigil/digiscan/Database/captureSets',
        'balek-modules/components/syncedMap/Instance',

        "dojo/node!sanitize-html",
    ],
    function (declare, lang, topic,
              Stateful,
              captureSetsDatabase,
              SyncedMapInstance,

              nodeSanitizeHtml) {
        return declare("digivigilScapturaCaptureSetsController", null, {
            _module: null,              //Module instance

            captureSets: null,          //Dojo State Object
            captureSetsByUserKey: null, //Object of Stateful Sets of all Users CaptureSets

            _captureSetsDatabase: null,

            StatefulCaptureSetChecksumsSet: null,       //stateful object
            statefulCaptureSetsByCaptureID: null,       //id map of all stateful CaptureSets

            syncedMaps: [],
            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object

                let CaptureSetsState = declare([Stateful], {});
                this.captureSets = new CaptureSetsState({})


                this.captureSetsByUserKey = {}

                this.StatefulCaptureSetChecksumsSet = declare([Stateful], {});
                this.statefulCaptureSetsByCaptureID = {}


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
                                this.updateStatefulCaptureSet(CaptureSet)
                                this.appendToUserList(CaptureSet)
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
            add: function(CaptureSet, userKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    CaptureSet = this.checkAndReturnValidCaptureSet(CaptureSet)
                    if(CaptureSet && typeof userKey === "string")
                    {
                        console.log("Controller Adding Capture Set to Database", CaptureSet)
                        this._captureSetsDatabase.addCaptureSet(CaptureSet, userKey).then(lang.hitch(this, function(Result){
                            console.log("Capture Set Added", Result);
                            try{
                                const id = Result
                                this.get(id).then(lang.hitch(this, function(DBCaptureSet){
                                    console.log("Capture Set Retreived", DBCaptureSet);
                                    let id = DBCaptureSet._id.toString()
                                    this.captureSets.set(id, DBCaptureSet)
                                    this.updateStatefulCaptureSet(DBCaptureSet)
                                    this.appendToUserList(DBCaptureSet)
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

            appendToUserList: function(CaptureSet){
                if(CaptureSet.CaptureSet && CaptureSet.userKey && CaptureSet._id && typeof CaptureSet._id.toString === "function")
                {
                    let userCaptureSets = this.getCaptureSetsForUser(CaptureSet.userKey)
                    let checksum = this.getCaptureSetCheckHash(CaptureSet)
                    userCaptureSets.set(CaptureSet._id.toString(), checksum)
                    console.log(this.captureSetsByUserKey,CaptureSet.userKey , userCaptureSets)
                }
            },
            getCaptureSetCheckHash: function(CaptureSet) {
              return CaptureSet.CaptureSet.name
            },
            getCaptureSetsForUser: function(userKey){
                if(!this.captureSetsByUserKey[userKey])
                {
                    let CapturesSetState = declare([Stateful], {});
                    this.captureSetsByUserKey[userKey] = new CapturesSetState({})
                }
                return this.captureSetsByUserKey[userKey]
            },
            updateStatefulCaptureSet: function(CaptureSet){
                if(CaptureSet && CaptureSet.CaptureSet && CaptureSet.CaptureSet.name && typeof CaptureSet.CaptureSet.appendAll === 'boolean'
                && typeof CaptureSet.CaptureSet.captures === 'object'){
                    console.log("ok,", CaptureSet)
                    let statefulCaptureSet = this.getStatefulCaptureSet(CaptureSet._id.toString())
                    //statefulCaptureSet.set("CaptureSet", CaptureSet.CaptureSet);

                    let capturesArray = Object.keys(CaptureSet.CaptureSet.captures).filter(key => !key.includes('_watchCallbacks'));

                  // let capturesArray = Object.keys(CaptureSet.CaptureSet.captures)
                    capturesArray.forEach(lang.hitch(this, function(captureID){
                        if(CaptureSet.CaptureSet.captures[captureID].inSet === true)
                        {
                            statefulCaptureSet.set(captureID, true)
                        }
                    }));
                    statefulCaptureSet.set("filterSettings", {appendAll: CaptureSet.CaptureSet.appendAll});
                }

            },
            getStatefulCaptureSet: function(id){
                console.log("ok,", id, this.statefulCaptureSetsByCaptureID )

                if (!this.statefulCaptureSetsByCaptureID[id]){
                    this.statefulCaptureSetsByCaptureID[id] = new this.StatefulCaptureSetChecksumsSet({})
                }
                return this.statefulCaptureSetsByCaptureID[id]
            },
            getCaptureSets: function() {
                return this.captureSets
            },
            getCaptureSetSyncedMap: function(captureSetID, instanceKey){
                console.log("getCaptureSetSyncedMap3:", captureSetID)

                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                    let CaptureSet =  this.captureSets.get(captureSetID)
                    console.log("getCaptureSetSyncedMap4:", captureSetID,CaptureSet)

                    if(typeof CaptureSet === "object")
                    {

                        let newMap = new SyncedMapInstance({_instanceKey: instanceKey});

                        let statefulCaptureSet = this.getStatefulCaptureSet(captureSetID)
                        Resolve({Success:"Capture Map Created", CaptureID: captureSetID, componentKey: newMap._componentKey, instanceKey: instanceKey})
                        console.log("getCaptureSetSyncedMap5:", captureSetID,statefulCaptureSet)

                        //todo relay a capture state that gets updated with database return
                      //  newMap.relayState(statefulCaptureSet) //todo - be able to calcle this

                        newMap.relayState(statefulCaptureSet)
                        console.log("look at name match",newMap, CaptureSet)

                        this.syncedMaps.push(newMap);
                    }else {
                        Reject({Error:"Capture Not found", CaptureID: captureID})

                    }
                }));
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

            get: function(id) {
                //get from database
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
            setCaptureInSet: function(captureSetId, captureID, inSet)
            {
                //todo set in database first
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    //get the capture set
                    let statefulCaptureSet = this.getStatefulCaptureSet(captureSetId)
                    let captureSet = this.captureSets.get(captureSetId)
                    //if the capture set exists in state
                    if (statefulCaptureSet && captureSet && captureSet.CaptureSet )
                    {
                        //set the capture set
                        let CaptureSet = captureSet.CaptureSet

                        //set inSet argument in database
                        CaptureSet.captures[captureID] = {inSet: inSet}




                        this._captureSetsDatabase.updateCaptureSet(captureSetId, CaptureSet).then(lang.hitch(this, function(Result){
                                                console.log("Capture Set Updated", Result);
                                                // try{
                                                //
                                                //     this.getCaptureSet(Result).then(lang.hitch(this, function(DBCaptureSet){
                                                //         console.log("Capture Set Retreived",id, DBCaptureSet);
                                                //
                                                //         this.captureSets.set(id, DBCaptureSet)
                                                //         console.log({SUCCESS: Entry})
                                                //     })).catch(lang.hitch(this, function(Error){
                                                //         console.log({Error: Error})
                                                //     }))
                                                // }catch(Error){
                                                //     console.log("Error Getting Entry:", Error);
                                                //     console.log(Error)
                                                // }

                                                if(Result.modifiedCount === 1){
                                                    this.captureSets.set(captureSetId, {_id: captureSetId, CaptureSet: CaptureSet})
                                                }else
                                                {
                                                    console.log("Database didnt save captures Set:", CaptureSet, captureSetId);
                                                }
                                            })).catch(lang.hitch(this, function(Error){
                                                console.log("Controller could not add Capture to Database", Error);

                                                console.log({Error})
                                            }))








                        //update Stateful CaptureSet list
                        statefulCaptureSet.set(captureID, inSet)
                        Resolve({SUCCESS: "removeCaptureFromSet"})
                    }else {
                        Reject({Error: "Capture set is not as expected"})
                    }
                }));

            },
            removeCaptureFromSet: function(captureSetId, captureID) {
               return this.setCaptureInSet(captureSetId, captureID, false);
            },
            addCaptureToSet: function(captureSetId, captureID) {
                return this.setCaptureInSet(captureSetId, captureID, true);
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
