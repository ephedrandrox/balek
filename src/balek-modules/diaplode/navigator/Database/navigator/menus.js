define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'balek-modules/diaplode/navigator/Database',


    ],
    function (declare, lang, topic, crypto, diaplodeNavigatorDatabaseController) {
        return declare("moduleDiaplodeNavigatorMenusDatabaseController", [diaplodeNavigatorDatabaseController], {
            _instanceKey: null,
            _Collection: "NavigatorMenus",

            _userKey: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
debugger;

                console.log("moduleDiaplodeNavigatorMenusDatabaseController starting...");
            },
            newMenu: function(newMenuName)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){





                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (err, collection) {
                        if(err){
                            Reject(err);
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


