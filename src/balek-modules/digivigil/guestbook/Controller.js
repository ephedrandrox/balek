define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek-modules/digivigil/guestbook/Database/entries',
        "dojo/node!sanitize-html",
    ],
    function (declare, lang, topic,
              Stateful,
              entriesDatabase,
              nodeSanitizeHtml) {
        return declare("digivigilGuestbookController", null, {
            _module: null,              //Module instance
            entries: null,              //Dojo State Object
            _entriesDatabase: null,     //Entries Database controller

            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object

                let EntriesState = declare([Stateful], {});
                this.entries = new EntriesState({})

                if(this._module === null){
                    console.log("digivigilGuestbookController  Cannot Start!...");
                }else{
                    this._entriesDatabase = new entriesDatabase({_instanceKey: this._instanceKey});
                    console.log("digivigilGuestbookController  starting...");
                    this.loadEntries().then(lang.hitch(this, function(Result){
                        console.log("Entries Loaded", Result);
                    }))
                }
            },
            loadEntries: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._entriesDatabase.getEntries().then(lang.hitch(this, function(Result){
                        if(Array.isArray(Result)){
                            Result.forEach(lang.hitch(this, function(Entry){
                                let id = Entry._id.toString()
                                this.entries.set(id, Entry)
                            }))
                            Resolve({SUCCESS: "getEntries database result"})
                        }else{
                            Reject({Error: "Entries are not an array! loadEntries"})
                        }
                    })).catch(lang.hitch(this, function(Error){
                        Reject({Error: Error})
                        console.log("getEntries  Error:", Error)
                    }))
                }));
            },
            getEntries: function() {
                return this.entries
            },
            addEntry: function(Entry){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    Entry = this.checkAndReturnValidGuestbookEntry(Entry)
                    if(Entry)
                    {
                        this._entriesDatabase.addEntry(Entry).then(lang.hitch(this, function(Result){
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
                                console.log("Error Getting Devices:", Error);
                                Reject(Error)
                            }
                        }))
                    }else {
                        Reject({ERROR: "Not a valid Guestbook Entry"})
                    }
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
            checkAndReturnValidGuestbookEntry(guestbookEntry) {
                let validGuestbookEntry = {};
                let now = new Date(Date.now());
                let currentDate = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
                if (guestbookEntry.name && guestbookEntry.home && guestbookEntry.note) {
                    validGuestbookEntry.name = nodeSanitizeHtml(guestbookEntry.name);
                    validGuestbookEntry.home = nodeSanitizeHtml(guestbookEntry.home);
                    validGuestbookEntry.note = nodeSanitizeHtml(guestbookEntry.note);
                    validGuestbookEntry.date = currentDate;
                    return validGuestbookEntry;
                } else {
                    return false;
                }
            }
        });
    }
);
