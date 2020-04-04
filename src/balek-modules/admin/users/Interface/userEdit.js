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
        'dojo/text!balek-modules/admin/users/resources/css/userEdit.css'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dijitFocus, dojoKeys, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleAdminUserManagementUserEditInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userManagementWidgetUserEdit",

            _usernameInlineEditBox: null,

            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            setFocus: function () {
                //todo may need to check domReady here
                dijitFocus.focus(this._mainDiv);
            },
            postCreate() {

                this._usernameInlineEditBox = new InlineEditBox({
                    editor: TextBox,
                    autoSave: true
                }, this._userNameField);

                this._usernameInlineEditBox.startup();
                this.updateStatus();

            },
            _onClickEditUserButton: function (eventObject) {
                this.updateUserInfoAndClose();
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
                            domAttr.set(this._userIconImage, "src", onLoadEvent.target.result);

                        });
                        // Read in the image file as a data URL.
                        reader.readAsDataURL(file);
                    } else {
                        alert("File not png");
                    }
                } else {
                    alert("File too big > 64k");
                    this._userIconFile.value = null;
                }
            }
        });
    });