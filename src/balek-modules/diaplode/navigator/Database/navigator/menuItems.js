define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'balek-modules/diaplode/navigator/Database',


    ],
    function (declare, lang, topic, crypto, diaplodeNavigatorDatabaseController) {
        return declare("moduleDiaplodeNavigatorMenuItemsDatabaseController", [diaplodeNavigatorDatabaseController], {
            _instanceKey: null,
            _Collection: "NavigatorMenuItems",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeNavigatorMenuItemsDatabaseController starting...");
            },
            getMenuItems: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                collection.find({_userKey: this._userKey, _menuID: this._menuID},
                                    lang.hitch(this, function (error, response) {
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
            newMenuItem: function(newMenuItemName)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            collection.insertOne({_userKey: this._userKey, _menuID: this._menuID, name: newMenuItemName}, lang.hitch(this, function (error, response) {
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


