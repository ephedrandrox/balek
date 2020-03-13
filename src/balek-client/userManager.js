define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful"],
    function (declare, lang, topic, Stateful) {

        return declare("usersManager", null, {

            _userState: null,

            constructor: function (args) {


                declare.safeMixin(this, args);

                let userState = declare([Stateful], {
                    currentUser: null,
                    availableUsers: null,
                    userData: null,
                    userDataByKey: null,
                });

                this._userState = new userState({
                    currentUser: {},
                    availableUsers: {},
                    userData: null,
                    userDataByKey: null,

                });

                topic.subscribe("getUserState", lang.hitch(this, this.getUserState));
                topic.subscribe("receiveUserManagerMessage", lang.hitch(this, this.receiveUserManagerMessage));
                topic.subscribe("updateUserDataOnServer", lang.hitch(this, this.updateUserDataOnServer));

            },
            getUserData: function () {
                topic.publish("sendBalekProtocolMessage", {userManagerMessage: {messageData: {request: "usersData"}}});
            },
            getUserState: function (userStateReturn) {
                userStateReturn(this._userState);
                this.getUserData();
            },
            receiveUserManagerMessage(userManagerMessage) {
                if (userManagerMessage.messageData) {
                    if (userManagerMessage.messageData.userData) {
                        let userUpdateData = userManagerMessage.messageData.userData;
                        let userData = this._userState.get("userData");
                        if (userData === null)
                            userData = {};

                        for (const user in userUpdateData) {
                            if (userUpdateData[user].icon != null) {
                                userUpdateData[user].icon = "data:image/png;base64," + this.convertUint8ToBase64String(userUpdateData[user].icon.data);
                            }
                            userData[userUpdateData[user].userKey] = userUpdateData[user];
                        }

                        this._userState.set("userData", userData);

                    }
                }
            },
            updateUserDataOnServer(userDataUpdate, replyCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {userManagerMessage: {messageData: {updateUserData: userDataUpdate}}},
                    lang.hitch(this, function (replyMessage) {

                        if (!replyMessage.userManagerMessage.messageData.error) {
                            userDataUpdate.password = undefined;

                            if (userDataUpdate.icon != null) {
                                userDataUpdate.icon = "data:image/png;base64," + this.convertUint8ToBase64String(userDataUpdate.icon.data);
                            }

                            let userData = this._userState.get('userData');
                            userData[userDataUpdate.userKey] = userDataUpdate;
                            this._userState.set('userData', userData);
                        }
                        replyCallback(replyMessage.userManagerMessage);
                    }));
            },
            convertUint8ToBase64String(data) {
                let charCodeArray = new Uint8Array(data);
                let base64String = btoa(String.fromCharCode.apply(null, charCodeArray));
                return base64String;
            }
        });
    });