define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/focus",
        "dojo/keys",

        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/admin/users/resources/html/userEdit.html',
        'dojo/text!balek-modules/admin/users/resources/css/userEdit.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dijitFocus, dojoKeys,
              InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              template, templateCSS,
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable
        ) {

        return declare("moduleAdminUserManagementUserEditInterface", [_WidgetBase, _TemplatedMixin,
                                                                        _syncedCommanderInterface,
                                                                        _balekWorkspaceContainerContainable], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userManagementWidgetUserEdit",

            _usernameInlineEditBox: null,


            _editUserKey: "",
            _userData: {},
            usersControllerCommands: null,
            _userInfoState: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                this._editUserKey = this._userData.userKey

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());
                if(this.usersControllerCommands !== null && this._userData.userKey){
                    this._userInfoState = this.usersControllerCommands.getUserInfoState(this._userData.userKey)
                }
            },
            setFocus: function () {
                //todo may need to check domReady here
                dijitFocus.focus(this._mainDiv);
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works

            },
            startupContainable(){
                //called when containable is contained
            },
            postCreate() {
                this.initializeContainable();
                this._usernameInlineEditBox = new InlineEditBox({
                    editor: TextBox,
                    autoSave: true
                }, this._userNameField);

                this._usernameInlineEditBox.startup();
                this.updateStatus();


                if(this._userInfoState)
                {
                    if(this._userInfoState.get("icon")){
                        this.onUserInfoStateChange("icon", null, this._userInfoState.get("icon"))
                    }
                    if(this._userInfoState.get("userName")){
                        this.onUserInfoStateChange("userName", null, this._userInfoState.get("userName"))
                    }
                    this._userInfoStateWatchHandle = this._userInfoState.watch( lang.hitch(this, this.onUserInfoStateChange));
                }

            },
            onUserInfoStateChange: function (name, oldState, newState) {
                name = name.toString()
                if(name == "userName"){
                    this._userNameField.innerHTML = newState
                }else if(name == "icon" ){
                    this._userIconImage.src = newState;
                }
            },
            _onClickEditUserButton: function (eventObject) {
                let updatedName = this._userNameField.innerHTML
                let currentName = this._userInfoState.get("userName")

                if(updatedName.toString() !== currentName.toString()){
                    this._interface._instanceCommands.updateUsername(this._userData.userKey,updatedName ).then(lang.hitch(this, function(Result){
                        console.log("Username request", Result)
                    })).catch(function(Error){
                        console.log("Error sending update Username request", Error)
                    })
                }


                if (this._passwordField1 && this._passwordField1.value) {
                    if (this._passwordField1.value === this._passwordField2.value) {

                        cryptoPromise = crypto.subtle.digest('SHA-512', new TextEncoder("utf-8").encode(this._passwordField1.value));
                        cryptoPromise.then(lang.hitch(this, function (passwordHash) {

                            let passwordHashHex = Array.prototype.map.call(new Uint8Array(passwordHash), x => (('00' + x.toString(16)).slice(-2))).join('');


                            this._interface._instanceCommands.updateUserPassword(this._userData.userKey,passwordHashHex ).then(lang.hitch(this, function(Result){
                                console.log("Password request", Result)
                            })).catch(function(Error){
                                console.log("Error sending update Username request", Error)
                            })

                        }));
                    } else {
                        //todo make icon/info bar that shows if error or data needs to be saved
                        alert("Passwords do not match");
                    }
                }



            },
            _mouseEnterUserImage: function (eventObject) {
                domClass.add(this._userIconImageDiv, "mouseOverUserEditImage");

            },
            _mouseLeaveUserImage: function (eventObject) {
                domClass.remove(this._userIconImageDiv, "mouseOverUserEditImage");
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        this.updateUserInfoAndClose();
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this.destroy();
                        break;
                }
                this.updateStatus();
            },
            _onKeyDown: function (keyDownEvent) {
                switch (keyDownEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                        keyDownEvent.preventDefault();
                        break;
                }
            },
            updateStatus: function () {
                if (this._passwordField1 && !this.checkForAcceptablePasswordInputs()) {
                    domClass.add(this._passwordField1, "passwordError");
                    domClass.add(this._passwordField2, "passwordError");

                } else if (this._passwordField1) {
                    domClass.remove(this._passwordField1, "passwordError");
                    domClass.remove(this._passwordField2, "passwordError");
                }
            },
            checkForAcceptablePasswordInputs: function () {
                if (this._passwordField1 && this._passwordField1.value) {
                    if (this._passwordField1.value === this._passwordField2.value) {
                        return true;
                    }
                }
                return false;
            },
            updateUserInfoAndClose: function () {
                if (this._userData.id == "new") {
                    var userUpdateData = {name: this._userNameField.innerHTML};
                } else {
                    var userUpdateData = {id: this._userData.id};
                }

                if (this._passwordField1 && this._passwordField1.value) {
                    if (this._passwordField1.value === this._passwordField2.value) {

                        cryptoPromise = crypto.subtle.digest('SHA-512', new TextEncoder("utf-8").encode(this._passwordField1.value));
                        cryptoPromise.then(lang.hitch(this, function (passwordHash) {

                            let passwordHashHex = Array.prototype.map.call(new Uint8Array(passwordHash), x => (('00' + x.toString(16)).slice(-2))).join('');

                            userUpdateData.password = passwordHashHex;
                            let base64String = domAttr.get(this._userIconImage, "src").substr(22);
                            let base64Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));

                            userUpdateData.name = this._usernameInlineEditBox.value;
                            userUpdateData.icon = {type: "Buffer", data: base64Array};
                            userUpdateData.userKey = this._userData.userKey;
                            topic.publish("updateUserDataOnServer", userUpdateData, lang.hitch(this, function (updateMessageReply) {

                                if (updateMessageReply.messageData.error) {
                                    alert(updateMessageReply.messageData.error);
                                } else {
                                    //show status and fade out
                                    this.destroy();
                                }

                            }));
                        }));
                    } else {
                        //todo make icon/info bar that shows if error or data needs to be saved
                        alert("Passwords do not match");
                    }
                }
            },
            _onIconFileChange: function (eventObject) {
                let file = eventObject.target.files[0];
                if (file.size / 1024 < 64) {
                    if (file.type.match('image.png')) {
                        let reader = new FileReader();
                        reader.onload = lang.hitch(this, function (onLoadEvent) {
                            let base64String = onLoadEvent.target.result.substr(22)
                            let base64Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                            let iconForTransfer = {type: "Buffer", data: base64Array}
                            this._interface._instanceCommands.updateUserIcon(this._userData.userKey,iconForTransfer).then(lang.hitch(this, function(Result){
                                console.log("UserIcon request", Result)
                            })).catch(function(Error){
                                console.log("Error sending update UserIcon request", Error)
                            })
                        });
                        // Read in the image file as a data URL.
                        reader.readAsDataURL(file);
                    } else {
                        alert("File not png");
                    }
                } else {
                    alert("File too big > 64k");
                }
            },
            unload: function () {
            this._userInfoStateWatchHandle.unwatch();
            this._userInfoStateWatchHandle.remove();
        }
            // _onIconFileChange: function (eventObject) {
            //     let file = eventObject.target.files[0];
            //     if (file.size / 1024 < 64) {
            //         if (file.type.match('image.png')) {
            //             let reader = new FileReader();
            //             reader.onload = lang.hitch(this, function (onLoadEvent) {
            //                 domAttr.set(this._userIconImage, "src", onLoadEvent.target.result);
            //
            //             });
            //             // Read in the image file as a data URL.
            //             reader.readAsDataURL(file);
            //         } else {
            //             alert("File not png");
            //         }
            //     } else {
            //         alert("File too big > 64k");
            //         this._userIconFile.value = null;
            //     }
            // }
        });
    });