define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/users/guide/Interface/usersGuide',
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, usersGuide) {
        return declare("moduleUsersGuideInterface", baseInterface, {
            _instanceKey: null,

            _usersGuideInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._usersGuideInterface = new usersGuide({_instanceKey: this._instanceKey});
                topic.publish("addToCurrentWorkspace", this);

            },
            getWorkspaceDomNode: function () {
                return this._usersGuideInterface.domNode;
            },
            receiveMessage: function (moduleMessage) {
                console.log("shouldn't be seeing anything here", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._usersGuideInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._usersGuideInterface.domNode, "visibility")]});
            },
            unload: function () {
                console.log("Unloading user guide Main interface");
                this._usersGuideInterface.unload();
                delete this._usersGuideInterface;
            }
        });
    }
);



