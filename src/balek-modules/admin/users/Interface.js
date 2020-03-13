define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/admin/users/Interface/userManagement',
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, userManagement) {

        return declare("moduleAdminUsersInterface", baseInterface, {
            _instanceKey: null,
            _userManagementInterface: null,

            _userState: null,
            _userStateWatchHandle: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._userManagementInterface = new userManagement({
                    _instanceKey: this._instanceKey,
                    _userData: null
                });

                topic.publish("getUserState", lang.hitch(this, function (userState) {
                    topic.publish("addToCurrentWorkspace", this);
                    this._userState = userState;
                    this.userStateChange();
                    this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange));
                }));
            },
            getWorkspaceDomNode: function () {
                return this._userManagementInterface.domNode;
            },
            userStateChange: function (name, oldState, newState) {
                if (name === "userData") {
                    this.updateUserData();
                }
            },
            receiveMessage: function (moduleMessage) {

                console.log("Shouldn't be seeing this", moduleMessage);

            },
            updateUserData: function () {
                let userData = this._userState.get("userData");

                if (userData !== null) {
                    this._userManagementInterface.updateUserData(userData);
                }
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._userManagementInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._userManagementInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
            }
        });
    }
);



