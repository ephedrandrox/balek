define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'balek-modules/conspiron/Database',


    ],
    function (declare, lang, topic, crypto, conspironNavigatorUserSettingsDatabaseController) {
        return declare("moduleConspironNavigatorUserSettingsDatabaseController", [conspironNavigatorUserSettingsDatabaseController], {
            _instanceKey: null,
            _Collection: "NavigatorSettings",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleConspironNavigatorUserSettinsDatabaseController starting...");
            },
            getUserSettings: function(){

            },
            setUserSettings: function(newNavigatorName)
            {


            }
        });
    }
);


