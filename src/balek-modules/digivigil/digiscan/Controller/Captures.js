define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek-modules/digivigil/digiscan/Database/captures',

        'balek-modules/digivigil/digiscan/Database/capturesImages',
        'balek-modules/balekute/connect/Controller/instanceCommands',
        'balek-modules/components/syncedMap/Instance',
        'balek-modules/base/image/utility',

        "dojo/node!sanitize-html",
    ],
    function (declare, lang, topic,
              Stateful,
              capturesDatabase,
              capturesImagesDatabase,
              ConnectControllerInstanceCommands,
              SyncedMapInstance,
              ImageUtility,
              nodeSanitizeHtml) {
        return declare("digivigilDigiscanCapturesController", null, {
            _module: null,              //Module instance


            ImageUtility: null,

            captures: null,              //Dojo State Object


            capturesByUserKey: null,

            statefulCapturesByCaptureID: null,

            StatefulCapture: null,

            _capturesDatabase: null,     //Captures Database controller
            _capturesImagesDatabase: null,     //Captures Images Database controller

            connectControllerCommands: null,

            CaptureIDList: null,
            syncedMaps: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object


                this.CaptureIDList = {}

                this.ImageUtility = new ImageUtility();
                let connectControllerInstanceCommands = new ConnectControllerInstanceCommands

                let CapturesState = declare([Stateful], {});
                this.captures = new CapturesState({})


                this.capturesByUserKey = {}  //Stateful Lists of CaptureID and Checksum

                this.StatefulCapture = declare([Stateful], {});
                this.statefulCapturesByCaptureID = {}

                if(this._module === null){
                    console.log("Scaptura Captures Controller  Cannot Start!...");
                }else{
                    connectControllerInstanceCommands.getCommands().then(lang.hitch(this, function(connectCommands) {
                    this.connectControllerCommands = connectCommands


                    this._capturesDatabase = new capturesDatabase({_instanceKey: this._instanceKey});

                    this._capturesImagesDatabase = new capturesImagesDatabase({_instanceKey: this._instanceKey});

                    console.log("Loading Captures(Captures)...");
                    this.load().then(lang.hitch(this, function(Result){
                        console.log("Captures Loaded Result", Result);
                        console.log("Captures Loaded captures", this.captures);

                    }))


                    })).catch(lang.hitch(this, function(error) {
                        console.log("digivigilDigiscanCapturesController connectControllerInstanceCommands.getCommands() Error:",error)
                    }))
                }
            },
            resetCaptureMemory: function() {

                let capturesByUserKey = this.capturesByUserKey

                let capturesByUserKeyArray = Object.keys(capturesByUserKey).filter(key => !(key.includes('_watchCallbacks') || key.includes('filterSettings')));
                console.log("Clearing these:", capturesByUserKeyArray);
                capturesByUserKeyArray.forEach(lang.hitch(this, function(userKey) {
                    let captures = capturesByUserKey[userKey]
                    console.log("Clearing these:",userKey,captures );

                    let capturesArray = Object.keys(captures).filter(key => !(key.includes('_watchCallbacks') || key.includes('filterSettings')));
                    console.log("Clearing these:", capturesArray);
                    capturesArray.forEach(lang.hitch(this, function(captureId) {
                       captures.set(captureId, undefined)
                        console.log("Clearing these@@@@@@:",captureId,captures );
                    }));


                }));
            },
            removeCaptureFromCaptureSets: function(captureID){
                this._instanceController.removeCaptureFromSets(captureID);
            },

            load: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._capturesDatabase.getCaptures().then(lang.hitch(this, function(Captures){
                        if(Array.isArray(Captures)){
                            Captures.forEach(lang.hitch(this, function(Capture){
                                let id = Capture._id.toString()
                                this.checkAndReturnValidCapture(Capture.capture).then(lang.hitch(this, function(VerifiedCapture){
                                   // console.log("Verified Capture", Capture, Capture.capture.signature.ownerUserKey , Capture.capture.signature["Public Key"])
                                    this.captures.set(id, Capture)

                                    this.addToCaptureIDList(Capture)
                                    this.updateStatefulCapture(Capture)
                                    this.appendToUserList(id, Capture)

                                    // this.addCaptureToCaptureSets(id, Capture)
                                    if(Capture.capture && Capture.capture.id
                                        && typeof Capture.capture.id.toString === "function" )
                                    {
                                        this.loadCaptureImageInfo(Capture.capture.id, id)

                                    }else {
                                        console.log("No Capture ID!", Capture, VerifiedCapture)
                                    }
                                })).catch(lang.hitch(this, function(Error){
                                    console.log("Error Verifying Capture", Error, Capture,Capture.capture.signature.ownerUserKey , Capture.capture.signature["Public Key"])
//remove from database
                                    this._capturesDatabase.removeCapture(Capture._id).then(lang.hitch(this, function(Result){
                                        console.log("Capture Removed", Result);
                                    })).catch(lang.hitch(this, function(Error){
                                        console.log("Error Removing Capture", Error)
                                    }));


                                }))



                            }))
                            Resolve({SUCCESS: "getCaptures database"})
                        }else{
                            Reject({Error: "Captures are not an array! loadCaptures"})
                        }
                    })).catch(lang.hitch(this, function(Error){
                        Reject({Error: Error})
                        console.log("getCaptures  Error:", Error)
                    }))
                }));
            },
            getCaptureObjectID(CaptureID)
            {

                return  this.CaptureIDList[CaptureID]
            },
            addToCaptureIDList(Capture)
            {

                this.CaptureIDList[Capture.capture.id] = Capture._id
            },

            loadCaptureImageInfo: function(CaptureID, CaptureObjectID = null)
            {
                if( CaptureObjectID === null){
                    CaptureObjectID = this.getCaptureObjectID(CaptureID)
                }

                this._capturesImagesDatabase.getCaptureImageInfo(CaptureID).then(lang.hitch(this, function(CaptureImageInfo) {
                    if(CaptureImageInfo && CaptureImageInfo.CaptureImage && CaptureImageInfo.CaptureImage.signature
                        && CaptureImageInfo.CaptureImage.image && CaptureImageInfo.CaptureImage.image.data){
                        this.checkAndReturnValidCaptureImage(CaptureImageInfo.CaptureImage).then(lang.hitch(this, function(validCaptureImage){
                            this.addImageInfoToCaptureStateful(validCaptureImage.signature, CaptureObjectID )

                        })).catch(lang.hitch(this, function(Error){

                            console.log("Error Verifying Capture Image", Error)
                            //remove the image info from the database
                            console.log("Remove Capture Image Info", CaptureID)

                            this._capturesImagesDatabase.removeCaptureImage(CaptureID)
                                .then(lang.hitch(this, function(Result){
                                console.log("Image Removed", Result);
                            })).catch(lang.hitch(this, function(Error){
                                console.log("Error Removing Image", Error)
                            }));


                        }));

                    }else{
                       // console.log("No inmageinfo", CaptureImageInfo)
                    }
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error Getting Capture Image", Error)
                }));
            },
            addImageInfoToCaptureStateful: function(imageInfo, CaptureID)
            {
                let statefulCapture = this.getStatefulCapture(CaptureID)
                //console.log("got statefulCapture", statefulCapture, CaptureID)
                //Set the statefulCapture imageInfo to the signature so interface can retrieve and check image
                statefulCapture.set("imageInfo", imageInfo)
            },
            addCaptureToCaptureSets: function(id, Capture){
                //todo: move this to CaptureSets
                if(Capture.capture
                    && Capture.capture.signature
                    && Capture.capture.signature.ownerUserKey)
                {
                    //get user Ca[ture Sets Stateful
                    let userCaptureSets = this._instanceController.getCaptureSetsForUser(Capture.capture.signature.ownerUserKey)
                    //filter out _watchCallbacks and create an array of Capture Set IDs
                    let captureSetsArray = Object.keys(userCaptureSets).filter(key => !key.includes('_watchCallbacks'));
                    //iterate through the array of Capture Set IDs
                    captureSetsArray.forEach(lang.hitch(this, function(captureSetID){
                       //get statefulCaptureSet which has FilterSettings and CaptureIDs
                        let captureSet = this._instanceController.getStatefulCaptureSet(captureSetID);
                        if(captureSet ){
                            let filterSettings = captureSet.get("filterSettings");
                            //get the filter settings and if appendAll is true
                            if (filterSettings && filterSettings.appendAll){
                                this._instanceController.addCaptureToSet(captureSetID, id, function(result){
                                   //Capture added to set
                                })
                            }
                        }
                    }));
                }
            },


            appendToUserList: function(id, Capture){
                if(Capture.capture && Capture.capture.signature && Capture.capture.signature.ownerUserKey && Capture.capture.signature.ownerUserKey)
                {
                    let userCaptures = this.getCapturesForUser(Capture.capture.signature.ownerUserKey)
                    let checksum = this.getCaptureCheckHash(Capture.capture)
                    userCaptures.set(id, checksum)
                    //get stateful capture and watch for removal
                    let captureStateful = this.getStatefulCapture(id)

                    console.log("Capture Added", id, Capture.capture.id, captureStateful)
                    let watchSubscription = captureStateful.watch(lang.hitch(this, function(name, oldValue, newValue){
                        console.log("Observed", name, oldValue, newValue)

                        if(name == "id"
                            && oldValue && oldValue != ""
                            && (newValue == "" || typeof newValue === 'undefined'))
                        {
                            console.log("Capture Removed", id, oldValue, newValue)
                            //Had a value but now doesn't remove from user list
                            userCaptures.set(id, undefined)
                            watchSubscription.unwatch()
                        }
                    }))
                }
            },
            updateStatefulCapture: function(Capture){
                let statefulCapture = this.getStatefulCapture(Capture._id)
                statefulCapture.set("id", Capture.capture.id);
                statefulCapture.set("created", Capture.capture.created);
                statefulCapture.set("barcode", Capture.capture.barcode);
                statefulCapture.set("recognizedText", Capture.capture.recognizedText);
                statefulCapture.set("note", Capture.capture.note);
            },
            removeStatefulCapture: function(CaptureID){

                if (this.statefulCapturesByCaptureID[CaptureID]){
                    let statefulCapture  = this.statefulCapturesByCaptureID[CaptureID]
                    console.log("removeStatefulCapture", statefulCapture, CaptureID);

                    statefulCapture.set("id", undefined);
                    statefulCapture.set("created", undefined);
                    statefulCapture.set("barcode", undefined);
                    statefulCapture.set("recognizedText", undefined);
                    statefulCapture.set("note", undefined);
                    statefulCapture.set("imageInfo", undefined);
                   // statefulCapture.set("imagePreview", undefined);


                    statefulCapture.set("removed", true);



                }



            },

            getCaptures: function() {
                //todo: make this a user specific class with a state given
                return this.captures
            },
            getCaptureSyncedMap: function(captureID, instanceKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                   let Capture =  this.captures.get(captureID)

                    if(typeof Capture === "object")
                    {

                        let newMap = new SyncedMapInstance({_instanceKey: instanceKey});

                        let statefulCapture = this.getStatefulCapture(captureID)
                        Resolve({Success:"Capture Map Created", CaptureID: captureID, componentKey: newMap._componentKey, instanceKey: instanceKey})

                        //todo relay a capture state that gets updated with database return
                         newMap.relayState(statefulCapture) //todo - be able to calcle this

                        newMap.relayState(statefulCapture)
                        //console.log("look",newMap, Capture)

                        this.syncedMaps.push(newMap);
                    }else {
                        Reject({Error:"Capture Not found", CaptureID: captureID})

                    }
                }));
            },

            getCapturesForUser: function(userKey){
                if(!this.capturesByUserKey[userKey])
                {
                    let CapturesState = declare([Stateful], {});
                    this.capturesByUserKey[userKey] = new CapturesState({})
                }
                return this.capturesByUserKey[userKey]
            },

            add: function(Capture){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                    if(this.connectControllerCommands === null){
                        Reject({Error: "connectControllerCommands have not been loaded into Captures Controller"})
                        return
                    }

                    console.log("🤢🤢🤢Capture:", Capture)
                    let updateRequest = Capture?.update ?? false
                    this.checkAndReturnValidCapture(Capture).then(lang.hitch(this, function(Capture){

                        if(Capture && updateRequest === false)
                        {
                            console.log("Controller Adding Capture to Database", Capture)
                            this._capturesDatabase.addCapture(Capture).then(lang.hitch(this, function(Result){
                                console.log("Capture Added", Result);
                                try{
                                    const id = Result
                                    this.getCapture(id).then(lang.hitch(this, function(Capture){
                                        console.log("Capture Retreived", Capture);
                                        let id = Capture._id.toString()
                                        this.captures.set(id, Capture)
                                        this.addToCaptureIDList(Capture)

                                        this.updateStatefulCapture(Capture)
                                        this.appendToUserList(id, Capture)
                                        this.addCaptureToCaptureSets(id, Capture)
                                        Resolve({SUCCESS: Capture})
                                    })).catch(lang.hitch(this, function(Error){
                                        Reject({Error: Error})
                                    }))
                                }catch(Error){
                                    console.log("Error Getting Capture:", Error);
                                    Reject(Error)
                                }
                            })).catch(lang.hitch(this, function(Error){
                                console.log("Controller could not add Capture to Database", Error);

                                Reject({Error})
                            }))
                        } else if (Capture && updateRequest === true)
                        {
                            console.log("🤢🤢🤢 Updating Capture:", Capture)

                            console.log("Controller Updating Capture to Database", Capture)
                            this._capturesDatabase.updateCapture(Capture).then(lang.hitch(this, function(Result){
                                console.log("Capture Updated", Result);
                                try{
                                    const id = Result
                                    this.getCapture(id).then(lang.hitch(this, function(Capture){
                                        console.log("Capture Retreived", Capture);
                                        let id = Capture._id.toString()
                                        this.captures.set(id, Capture)
                                        this.updateStatefulCapture(Capture)
                                        Resolve({SUCCESS: Capture})
                                    })).catch(lang.hitch(this, function(Error){
                                        Reject({Error: Error})
                                    }))
                                }catch(Error){
                                    console.log("Error Getting Capture:", Error);
                                    Reject(Error)
                                }
                            })).catch(lang.hitch(this, function(Error){
                                console.log("Controller could not add Capture to Database", Error);

                                Reject({Error})
                            }))
                        }else {
                            Reject({ERROR: "Invalid  Capture"})
                        }




                    })).catch(lang.hitch(this, function(Error){
                        Reject({Error: "Captures Controller Add function could not validate Capture", info: Error})

                    }))




                }));
            },
            remove: function(captureID){
                console.log("Capture Removed Request Result", captureID)
              return new Promise(lang.hitch(this, function(Resolve, Reject) {
                  this._capturesDatabase.removeCapture(captureID).then(lang.hitch(this, function(Result){
                    console.log("Capture Removed Request Result", Result);

                      console.log("Capture  captureID", this.captures, captureID);

                      //find this.captures with capture.id = captureID

                      Object.values(this.captures).forEach(lang.hitch(this, function(capture){

                            if(capture  && capture._id && capture.capture && capture.capture.id.toString() === captureID.toString())
                            {
                                let captureObjectID = capture._id.toString()
                               console.log("Matches Capture  captureID", capture, captureID,captureObjectID);
                                this.captures.set(captureObjectID, undefined)
                                console.log("removeStatefulCapture", capture, captureID,captureObjectID);
                                this.removeCaptureFromCaptureSets(captureObjectID)

                                this.removeStatefulCapture(captureObjectID)

                            }else if (capture && capture._id){
                                console.log("Not Matches Capture  captureID", capture.capture.id, captureID);

                            }

                      }))




                  })).catch(lang.hitch(this, function(Error){
                      Reject({Error: Error})
                  }))  ;
              }));
            },
            removeAllCapturesFor: function(userKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                    this._capturesDatabase.removeAllCapturesWithUserKey(userKey).then(lang.hitch(this, function(CapturesResult){
                        console.log("All Captures Removed Request Result", CapturesResult);
                        this._capturesImagesDatabase.removeAllImagesWithUserKey(userKey).then(lang.hitch(this, function(ImagesResult){
                            console.log("All Images Removed Request Result", ImagesResult);

                            Resolve({SUCCESS: "Data removed from bases", Results: {ImagesResult: ImagesResult, CapturesResult: CapturesResult}})

                        }))
                       let userCaptures =  this.getCapturesForUser(userKey)

                            for(objectIndex in userCaptures)
                            {
                                if(typeof userCaptures[objectIndex] !== "function"
                                    && userCaptures[objectIndex] !== null
                                    && objectIndex !== '_attrPairNames'
                                    && objectIndex !== 'declaredClass'){
                                   userCaptures.set(objectIndex, undefined)
                                }
                            }

//foreach getCapturesForUserKey

                    })).catch(lang.hitch(this, function(Error){
                        console.log("Controller could not add Capture to Database", Error);

                        Reject({Error})
                    }))

                }));
            },
            updateCaptureImage: function(captureImage){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    console.log("updateCaptureImage Promise");

                        this.checkAndReturnValidCaptureImage(captureImage).then(lang.hitch(this, function(validCaptureImage){
                            console.log("checkAndReturnValidCaptureImage");

                                        if (typeof validCaptureImage === "object" && typeof validCaptureImage.id === "string"
                                    && typeof validCaptureImage.image === "object"  && typeof validCaptureImage.signature === "object" )
                                {

                                    this._capturesImagesDatabase.addCaptureImage(validCaptureImage).then(lang.hitch(this, function(Result){
                                       console.log("Image Update Result", Result);

                                        Resolve({SUCCESS: "working"})

                                        this.addImageInfoToCaptureStateful(validCaptureImage.signature,  this.getCaptureObjectID(validCaptureImage.id))
                                        this.loadCaptureImageInfo(captureImage.id)

                                        //


                                    })).catch(lang.hitch(this, function(Error){
                                        console.log("Controller could not add Capture to Database", Error);
                                        this.loadCaptureImageInfo(captureImage.id)
                                        Reject({Error: Error, reason: "Controller could not add Capture Image to Database"})
                                    }))

                                }else {
                                    debugger;
                                    Reject({Error: "updateEntry was not as expected in updateCaptureImage", captureImage: captureImage})
                                }

                        })).catch(lang.hitch(this, function(Error){
                            Reject({Error: "Captures Controller Add function could not validate Capture", info: Error})

                        }))


                }));
            },
            retrieveCaptureImage: function(captureID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(captureID)
                    {
                        this._capturesImagesDatabase.getCaptureImage(captureID).then(lang.hitch(this, function(Result) {
                            if(Result){
                                Resolve(Result)
                            }else{
                                Reject({Error : "Result not complete"})

                            }
                        })).catch(lang.hitch(this, function(Error){
                            console.log("Error Getting Capture Image", Error)
                        }));
                    }else {
                        console.log("No Capture ID!", captureID)
                    }
                }));
            },
            retrieveCaptureImagePreview:function(captureID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(captureID)
                    {
                        this._capturesImagesDatabase.getCaptureImagePreview(captureID).then(lang.hitch(this, function(Result) {
                            if(Result){
                                Resolve(Result)
                            }else{
                                this._capturesImagesDatabase.getCaptureImage(captureID).then(lang.hitch(this, function(CaptureImage) {
                                   // console.log("Capture Image😰😰😰", Result)
                                    if(CaptureImage && CaptureImage.image && CaptureImage.image.data){
                                        this.ImageUtility.resizeImageBase64(CaptureImage.image.data, 200).then(lang.hitch(this, function(resizedImage) {
                                            CaptureImage.image = null
                                            CaptureImage.preview = resizedImage
                                            Resolve(CaptureImage)
                                            //save resized image as preview for capture in database
                                            this._capturesImagesDatabase.updateCaptureImagePreview(resizedImage, captureID).then(lang.hitch(this, function(Result) {
                                            })).catch(lang.hitch(this, function(Error){
                                            }))
                                        })).catch(lang.hitch(this, function(Error){
                                            Reject(Error)
                                        }))
                                    }else{
                                        Reject({Error : "No Image or Preview found"})
                                    }
                                })).catch(lang.hitch(this, function(Error){
                                    console.log("Error Getting Capture Image", Error)
                                }));
                            }
                        })).catch(lang.hitch(this, function(Error){
                            console.log("Error Getting Capture Image", Error)
                        }));
                    }else {
                        console.log("No Capture ID!", captureID)
                    }
                }));
            },
            retrieveCaptureImageCheckHash: function(captureID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(captureID )
                    {
                        this._capturesImagesDatabase.getCaptureImage(captureID).then(lang.hitch(this, function(CaptureImage) {
                            if(CaptureImage && isCaptureImageValid(CaptureImage)){
                                let hash = this.getCaptureImageHash(CaptureImage)
                                Resolve({computedHash: hash, signatureHash: CaptureImage.signature.Hash})
                            }else{
                            //    console.log("Not a valid Capture Image", captureID, CaptureImage);
                                Reject({Error : "Not a valid Capture Image"})
                            }
                        })).catch(lang.hitch(this, function(Error){
                            console.log("Error Getting Capture Image", Error)
                        }));
                    }else {
                        console.log("No Capture ID!", captureID)
                    }
                }));
            },
            retrieveCaptureCheckHash: function(captureID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(captureID )
                    {
                       // Resolve({SUCCESS: {computedHash: Capture}})

                        this.getCaptureByDeviceID(captureID).then(lang.hitch(this, function(Capture) {
                            if(Capture && Capture.capture && Capture.capture.signature && Capture.capture.signature.Hash){
                                 let hash = this.getCaptureCheckHash(Capture.capture)
                                 Resolve({computedHash: hash, signatureHash: Capture.capture.signature.Hash})
                               // Resolve({SUCCESS: {computedHash: ""}})

                            }else{
                                //return an empty for hash so client knows we know we don't have it.
                                console.log("Look at this capture", Capture)

                                Resolve({computedHash: "", signatureHash: ""})
                            }
                        })).catch(lang.hitch(this, function(Error){
                            console.log("Error Getting Capture Hash", Error)
                            Reject({Error : {"Error Getting Capture Hash": Error}})

                        }));
                    }else {
                        console.log("No Capture ID!", captureID)
                        Reject({Error : "No CaptureID"})

                    }
                }));
            },
            retrieveCaptureID: function(captureID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(captureID ) {
                        this.getCapture(captureID).then(lang.hitch(this, function (Capture) {
                            if (Capture && Capture.capture && Capture.capture.id) {
                                Resolve(Capture.capture.id)
                            } else {
                                Reject({Error: "No Capture ID"})
                            }
                        })).catch(lang.hitch(this, function (Error) {
                            console.log("Error Getting Capture ID", Error)
                        }));
                    }else {
                        console.log("No Capture ID!", captureID)
                        Reject({Error : "No CaptureID"})
                    }
                }));
            },
            getStatefulCapture: function(id){
                if (!this.statefulCapturesByCaptureID[id]){
                    this.statefulCapturesByCaptureID[id] = new this.StatefulCapture({})
                }
                return this.statefulCapturesByCaptureID[id]
            },
            getCaptureByDeviceID: function(id) {
                //Gets Capture from Database
                //Returns a promise of an capture based on id
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                   //                    console.log("ing Loaded", id);

                    this._capturesDatabase.getCaptureByDeviceID(id).then(lang.hitch(this, function(Result){
                       // console.log("Capture Loaded", Result);
                        try{
                            Resolve(Result)
                        }catch(Error){
                            console.log("Error Getting Capture:", id, Error);
                            Reject(Error)
                        }
                    }))
                }));
            },
            getCapture: function(id) {
                //Gets Capture from Database
                //Returns a promise of an capture based on id
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    console.log("ing Loaded", id);

                    this._capturesDatabase.getCapture(id).then(lang.hitch(this, function(Result){
                        console.log("Capture Loaded", Result);
                        try{
                            Resolve(Result)
                        }catch(Error){
                            console.log("Error Getting Capture:", id, Error);
                            Reject(Error)
                        }
                    }))
                }));
            },

            getCaptureCheckHash: function(Capture) {
                if (Capture.created  &&
                    Capture.id &&
                    typeof Capture.barcode !== "undefined" &&
                    typeof Capture.recognizedText !== "undefined" &&
                    typeof Capture.note !== "undefined"
                  ) {

                    let created = Capture.created
                    let barcode = Capture.barcode
                    let recognizedText = Capture.recognizedText
                    let id = Capture.id
                    let note = Capture.note

                    let signStringCombination = created + barcode + recognizedText + id + note

                    return this.connectControllerCommands.getStringHash(signStringCombination)
                }else {
                    return Capture
                }

            },
            checkCaptureSignature: function(Capture) {
                //Returns device owner user key if Capture is signed correctly
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (Capture.created  && Capture.id &&
                        typeof Capture.barcode !== "undefined" &&
                        typeof Capture.recognizedText !== "undefined" &&
                        typeof Capture.note !== "undefined" &&
                        typeof Capture.signature === "object" &&
                        Capture.signature["Public Key"] &&
                        Capture.signature["Proof"] &&
                        Capture.signature["Hash"]) {

                        let created = Capture.created
                        let barcode = Capture.barcode
                        let recognizedText = Capture.recognizedText
                        let id = Capture.id
                        let note = Capture.note

                        let publicKey = Capture.signature["Public Key"]
                        let proof = Capture.signature["Proof"]
                        let hash = Capture.signature["Hash"]

                        let signStringCombination = created + barcode + recognizedText + id + note

                        let device = this.connectControllerCommands.getDeviceByPublicSigningKey(publicKey)

                        let checkHash = this.connectControllerCommands.getStringHash(signStringCombination)

                        //console.log("🤢🤢🤢Capture checkCaptureSignature:", Capture, checkHash, hash)

                        if(checkHash === hash)
                        {
                            console.log("🤢🤢🤢Capture checkCaptureSignature hash match:", Capture, checkHash, hash)

                            this.connectControllerCommands.verifySignedString(signStringCombination, proof, publicKey ).then(lang.hitch(this, function(result){
                                if (result){
                                    if (device && device.getOwnerUserKey && typeof device.getOwnerUserKey == 'function') {
                                       // console.log("🤢Capture:", "Resolve")

                                        Resolve(device.getOwnerUserKey())
                                    }else{
                                        //instead of a user id send back "UnknownDevice" String
                                       // console.log("🤢Capture:", "UKNOIWN DEVICE")

                                        Resolve("UnknownDevice")

                                        //Reject({Error: "Signature Could not be verified: Signing Device Unknown"})
                                    }

                                }else{
                                   // console.log("🤢Capture:", "Signature Could not be verified: Bad signature")

                                    Reject({Error: "Signature Could not be verified: Bad signature"})

                                }
                            })).catch(lang.hitch(this, function(Error){
                              //  console.log("🤢Capture:", "Signature Could not be verified:  Error Caught")

                                Reject({Error: "Signature Could not be verified: Error Caught", caughtError: Error})

                            }))
                        }else {
                           // console.log("🤢Capture:", "Capture Hash Dose Not Match", checkHash,hash)

                            Reject({Error: "Capture Hash Dose Not Match", checkHash,hash})

                        }



                    }else {
                        Reject({Error: "Signature Could not be verified: Capture data unexpected format"})
                    }

                }));



            },
            checkAndReturnValidCapture(Capture) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    //Validate and Sanitize the Capture
                    //Returns False otherwise
                    let validCapture = {};

                    if (Capture.created  && Capture.id &&
                        typeof Capture.barcode !== "undefined" &&
                        typeof Capture.recognizedText !== "undefined" &&
                        typeof Capture.note !== "undefined" &&
                        typeof Capture.signature === "object") {

                        // validCapture.created = Capture.created
                        // validCapture.barcode = nodeSanitizeHtml(Capture.barcode);
                        // validCapture.id = nodeSanitizeHtml(Capture.id);
                        // validCapture.recognizedText = nodeSanitizeHtml(Capture.recognizedText);
                        // validCapture.note = nodeSanitizeHtml(Capture.note)
                        // validCapture.signature = Capture.signature
                        //

                        validCapture.created = Capture.created
                        validCapture.barcode = nodeSanitizeHtml(Capture.barcode);
                        validCapture.id = nodeSanitizeHtml(Capture.id);
                        validCapture.recognizedText = nodeSanitizeHtml(Capture.recognizedText);
                        validCapture.note = nodeSanitizeHtml(Capture.note)
                        validCapture.signature = Capture.signature



                        //todo check that sanitization didn't change signed data
                        //in the mean time, just dont sanitize

                      //  let validation = this.checkCaptureSignature(Capture)
                        console.log("🤢🤢🤢Capture:", Capture)

                        this.checkCaptureSignature(Capture).then(lang.hitch(this, function(validation){
                            if(validation)
                            {
                                validCapture.signature.ownerUserKey = validation
                                Resolve(Capture)
                            }else {

                                Reject({Error: "Signature Could not be verified: validation false"})
                            }

                        })).catch(lang.hitch(this, function(Error){
                            Reject({Error: "Signature Could not be verified", checkError: Error})
                        }))

                    } else {
                        Reject({Error: "Unexpected Data"})
                    }
                }));
            },
            getCaptureImageHash: function(CaptureImage) {
                if (CaptureImage.id &&
                    typeof CaptureImage.image !== "undefined" &&
                    typeof CaptureImage.image.data !== "undefined" &&
                    typeof CaptureImage.signature === "object" &&
                    CaptureImage.signature["Public Key"] &&
                    CaptureImage.signature["Proof"] &&
                    CaptureImage.signature["Hash"]){

                    let id = CaptureImage.id
                    let imageString = CaptureImage.image.data

                    let proof = id + imageString

                    let hash = this.connectControllerCommands.getStringHash(proof)
                    return hash
                }
            },









            checkCaptureImageSignature: function(CaptureImage) {
                //Returns device owner user key if Capture is signed correctly
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (CaptureImage.id &&
                        typeof CaptureImage.image !== "undefined" &&
                        typeof CaptureImage.image.data !== "undefined" &&
                        typeof CaptureImage.signature === "object" &&
                        CaptureImage.signature["Public Key"] &&
                        CaptureImage.signature["Proof"] &&
                        CaptureImage.signature["Hash"]) {


                        let id = CaptureImage.id
                        let imageString = CaptureImage.image.data

                        let publicKey = CaptureImage.signature["Public Key"]
                        let proof = CaptureImage.signature["Proof"]
                        let hash = CaptureImage.signature["Hash"]

                        let signStringCombination = id + imageString

                        let device = this.connectControllerCommands.getDeviceByPublicSigningKey(publicKey)

                        let checkHash = this.connectControllerCommands.getStringHash(signStringCombination)


                        if(checkHash === hash)
                        {
                            this.connectControllerCommands.verifySignedString(signStringCombination, proof, publicKey ).then(lang.hitch(this, function(result){
                                if (result){
                                    Resolve(device.getOwnerUserKey())

                                }else{
                                    Reject({Error: "Signature Could not be verified: Bad signature"})

                                }
                            })).catch(lang.hitch(this, function(Error){
                                Reject({Error: "Signature Could not be verified: Error Caught", caughtError: Error})

                            }))
                        }else {
                            console.log("Capture Image Hash Dose Not Match", CaptureImage, checkHash, hash, imageString)

                            Reject({Error: "Capture Image Hash Dose Not Match", id: id})

                        }



                    }else {
                        Reject({Error: "Signature Could not be verified: Capture data unexpected format", CaptureImage: CaptureImage})
                    }

                }));



            },
            checkAndReturnValidCaptureImage(CaptureImage) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    //Validate the Capture Image
                    //Returns False otherwise
                    let validCaptureImage = {};

                    if ( CaptureImage.id &&
                        typeof CaptureImage.image !== "undefined" &&
                        typeof CaptureImage.image.data !== "undefined" &&
                        typeof CaptureImage.signature === "object") {

                        validCaptureImage.id = CaptureImage.id
                        validCaptureImage.signature = CaptureImage.signature
                        validCaptureImage.image = CaptureImage.image


                        //todo check that sanitization didn't change signed data
                        //  let validation = this.checkCaptureSignature(Capture)

                        this.checkCaptureImageSignature(CaptureImage).then(lang.hitch(this, function(validation){
                            if(validation)
                            {
                                validCaptureImage.signature.ownerUserKey = validation
                                Resolve(validCaptureImage)
                            }else {
                                Reject({Error: "Signature Could not be verified: validation false"})
                            }

                        })).catch(lang.hitch(this, function(Error){
                            Reject({Error: "Signature Could not be verified", checkError: Error})
                        }))

                    } else {
                        Reject({Error: "Unexpected Data"})
                    }
                }));
            }
        });
    }
);


function isCaptureImageValid(CaptureImage) {
    return !!(CaptureImage.id &&
        typeof CaptureImage.image !== "undefined" &&
        typeof CaptureImage.image.data !== "undefined" &&
        typeof CaptureImage.signature === "object" &&
        CaptureImage.signature["Public Key"] &&
        CaptureImage.signature["Proof"] &&
        CaptureImage.signature["Hash"]);
}