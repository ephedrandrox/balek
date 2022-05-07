define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'balek-modules/diaplode/Database',


    ],
    function (declare, lang, topic, crypto, diaplodeNavigatorDatabaseController) {
        return declare("moduleDiaplodeNavigatorMenusDatabaseController", [diaplodeNavigatorDatabaseController], {
            _instanceKey: null,
            _Collection: "NavigatorMenus",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeNavigatorMenusDatabaseController starting...");
            },
            getUserMenus: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                collection.find({_userKey: this._userKey}, lang.hitch(this, function (error, response) {
                                    if(error){
                                        Reject(error);
                                    }
                                    else if(response){
                                        Resolve(response);
                                    }
                                }));
                            }
                        }));
                    }else {
                        Reject({error: "userKey Not set in menus Database Controller"});
                    }
                }));
            },
            newMenu: function(newMenuName)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            collection.insertOne({_userKey: this._userKey, name: newMenuName}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                   Resolve(response);
                                }
                            }));
                        }
                    }));
                }));

            }
        });
    }
);


