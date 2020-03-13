define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',

        "dojo/dom-construct",
        "dojo/_base/window",

        'balek-modules/session/menu/Interface/menu',


    ],
    function (declare, lang, baseInterface, topic, domConstruct, win, sessionMenu) {

        return declare("moduleUserInfoInterface", baseInterface, {
            _instanceKey: null,
            _sessionMenu: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._sessionMenu = new sessionMenu({_instanceKey: this._instanceKey});
            },
            receiveMessage: function (moduleMessage) {
                console.log("shouldn't be seeing this", moduleMessage);
            },
            unload: function () {
                this._sessionMenu.unload();
            }
        });
    }
);



