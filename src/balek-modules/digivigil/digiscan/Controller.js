define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek-modules/digivigil/digiscan/Database/entries',
        "dojo/node!sanitize-html",
    ],
    function (declare, lang, topic,
              Stateful,
              entriesDatabase,
              nodeSanitizeHtml) {
        return declare("digivigilDigiscanController", null, {
            _module: null,              //Module instance
            entries: null,              //Dojo State Object
            _entriesDatabase: null,     //Entries Database controller

            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object

                let EntriesState = declare([Stateful], {});
                this.entries = new EntriesState({})

                if(this._module === null){
                    console.log("digivigilDigiscanController  Cannot Start!...");
                }else{
                    this._entriesDatabase = new entriesDatabase({_instanceKey: this._instanceKey});
                    console.log("digivigilDigiscanController  starting...");
                    this.loadEntries().then(lang.hitch(this, function(Result){
                        console.log("Entries Loaded", Result);
                    }))
                }
            },
            loadEntries: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._entriesDatabase.getCaptures().then(lang.hitch(this, function(Result){
                        if(Array.isArray(Result)){
                            Result.forEach(lang.hitch(this, function(Entry){
                                let id = Entry._id.toString()
                                this.entries.set(id, Entry)
                            }))
                            Resolve({SUCCESS: "getCaptures database result"})
                        }else{
                            Reject({Error: "Entries are not an array! loadEntries"})
                        }
                    })).catch(lang.hitch(this, function(Error){
                        Reject({Error: Error})
                        console.log("getCaptures  Error:", Error)
                    }))
                }));
            },
            getCaptures: function() {
                return this.entries
            },
            addCapture: function(Capture){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    Capture = this.checkAndReturnValidDigiscanEntry(Capture)
                    if(Capture)
                    {
                        console.log("Controller Adding Capture to Database", Capture)
                        this._entriesDatabase.addCapture(Capture).then(lang.hitch(this, function(Result){
                            console.log("Entry Added", Result);
                            try{
                                const id = Result
                                this.getEntry(id).then(lang.hitch(this, function(Entry){
                                    console.log("Entry Retreived", Entry);
                                    let id = Entry._id.toString()
                                    this.entries.set(id, Entry)
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
            removeAllCaptures: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                        this._entriesDatabase.removeAllCaptures().then(lang.hitch(this, function(Result){
                            console.log("All Captures Removed Request Result", Result);

                                    Resolve({SUCCESS: Result})

                        })).catch(lang.hitch(this, function(Error){
                            console.log("Controller could not add Capture to Database", Error);

                            Reject({Error})
                        }))

                }));
            },
            getEntry: function(id) {
                //Returns a promise of an entry based on id
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._entriesDatabase.getEntry(id).then(lang.hitch(this, function(Result){
                        console.log("Entry Loaded", Result);
                        try{
                            Resolve(Result)
                        }catch(Error){
                            console.log("Error Getting Entry:", id, Error);
                            Reject(Error)
                        }
                    }))
                }));
            },
            checkAndReturnValidDigiscanEntry(Capture) {
                let validDigiscanCapture = {};
                let now = new Date(Date.now());
                let currentDate = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
                if (Capture.created  && Capture.id &&
                    typeof Capture.recognizedText !== "undefined" &&
                    typeof Capture.note !== "undefined") {
                    validDigiscanCapture.created = nodeSanitizeHtml(Capture.created);
                    validDigiscanCapture.id = nodeSanitizeHtml(Capture.id);
                    validDigiscanCapture.recognizedText = nodeSanitizeHtml(Capture.recognizedText);
                    validDigiscanCapture.note = nodeSanitizeHtml(Capture.note);
                    return validDigiscanCapture;
                } else {
                    return false;
                }
            }
        });
    }
);
