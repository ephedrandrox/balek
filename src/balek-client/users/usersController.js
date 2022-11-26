//##########################################################################################################
//Interface User Manager
//##########################################################################################################


define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful",
        "balek-client/users/usersController/interfaceCommands",

    ],
    function (declare, lang, topic, Stateful, InterfaceCommands) {

        return declare("usersManager", null, {

            _UserInfoState: null,
            _userInfoStates: {},

            _interfaceCommands: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._UserInfoState = declare([Stateful], {
                   userName: null,
                    userKey: null
                });

                this._interfaceCommands = new InterfaceCommands();
                this._interfaceCommands.setCommand("getUserInfoState", lang.hitch(this, this.getUserInfoState))



            },
            //##########################################################################################################
            //PRIVATE
            //##########################################################################################################
            _requestUserInfoInstanceWatch: function (userKey) {
                //PRIVATE Used To request state updates from User Manager Instance
            topic.publish("sendBalekProtocolMessageWithReplyCallback", {userManagerMessage: {messageData: {request: "userInfoWatch", userKey: userKey}}}, lang.hitch(this,
                function(returnValue){
                //
                    if(returnValue && returnValue.userInfoState
                        && returnValue.userInfoState.name
                        && returnValue.userInfoState.newState){
                        if(returnValue.userInfoState.name === "icon" && returnValue.userInfoState.newState.data)
                        {
                            returnValue.userInfoState.newState = "data:image/png;base64," + this.convertUint8ToBase64String(returnValue.userInfoState.newState.data);
                        }
                        this.getUserInfoState(userKey).set(returnValue.userInfoState.name, returnValue.userInfoState.newState)
                        console.log("🔶🔶🔷🔷🔹🔹_requestUserInfoInstanceWatch getUserInfoState set", returnValue.userInfoState.name, returnValue.userInfoState.newState)
                    }else{
                        console.log("🔶🔶🔷🔷🔹🔹_requestUserInfoInstanceWatch userManager received unexpected ❌❌❌❌", returnValue)
                    }
                }));
            },
            //##########################################################################################################
            //Interface Commands
            //##########################################################################################################
            getUserInfoState: function (userKey) {
                if (userKey && userKey.toString()) {
                    userKey = userKey.toString()
                    if (!this._userInfoStates[userKey]) {
                        this._userInfoStates[userKey] = new this._UserInfoState({
                            userName: null,
                            userKey: userKey
                        })
                        this._requestUserInfoInstanceWatch(userKey);
                    }
                    return this._userInfoStates[userKey]
                } else {
                    return null
                }
            },
            //##########################################################################################################
            //Utility
            //##########################################################################################################
            convertUint8ToBase64String(data) {
                let charCodeArray = new Uint8Array(data);
                let base64String = btoa(String.fromCharCode.apply(null, charCodeArray));
                return base64String;
            }
        });
    });