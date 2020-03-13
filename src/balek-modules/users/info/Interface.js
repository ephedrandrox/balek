define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/users/info/Interface/userInfo',
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, userInfo) {
        return declare("moduleUserInfoInterface", baseInterface, {
            _instanceKey: null,

            _userInfoInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._userInfoInterface = new userInfo({_instanceKey: this._instanceKey});
                topic.publish("addToCurrentWorkspace", this);

            },
            getWorkspaceDomNode: function () {
                return this._userInfoInterface.domNode;
            },
            receiveMessage: function (moduleMessage) {
                console.log("shouldn't be seeing anything here", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._userInfoInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._userInfoInterface.domNode, "visibility")]});
            },
            unload: function () {
                console.log("Unloading user info Main interface");
                this._userInfoInterface.unload();
                delete this._userInfoInterface;
            }
        });
    }
);



