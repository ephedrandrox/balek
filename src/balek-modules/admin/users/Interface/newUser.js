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

        'dojo/text!balek-modules/admin/users/resources/html/newUser.html',
        'dojo/text!balek-modules/admin/users/resources/css/newUser.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dijitFocus, dojoKeys,
              InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              template, templateCSS,
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable
        ) {

        return declare("moduleAdminUserManagementNewUserInterface", [_WidgetBase, _TemplatedMixin,
                                                                        _syncedCommanderInterface,
                                                                        _balekWorkspaceContainerContainable], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userManagementWidgetNewUser",

            defaultIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaCAYAAAA2BoVjAAAEtGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjQxMCIKICAgZXhpZjpQaXhlbFlEaW1lbnNpb249IjQxMCIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICB0aWZmOkltYWdlV2lkdGg9IjQxMCIKICAgdGlmZjpJbWFnZUxlbmd0aD0iNDEwIgogICB0aWZmOlJlc29sdXRpb25Vbml0PSIyIgogICB0aWZmOlhSZXNvbHV0aW9uPSI3Mi8xIgogICB0aWZmOllSZXNvbHV0aW9uPSI3Mi8xIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIy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",

            _usernameInlineEditBox: null,
            _userIconImage: null,


            usersControllerCommands: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());
                if(this.usersControllerCommands === null){
                 console.log("🟠🟠🟠🟠usersControllerCommands not provided to userManagementWidgetNewUser" )
                }
            },
            startupContainable(){
                this.setFocus()
            },
            postCreate() {
                this.initializeContainable();
                this._usernameInlineEditBox = new InlineEditBox({
                    editor: TextBox,
                    autoSave: true
                }, this._userNameField);

                this._usernameInlineEditBox.startup();
                this.updateStatus();

            },
            setFocus: function () {
                //todo may need to check domReady here
                //dijitFocus.focus(this._mainDiv);
            },
           //##########################################################################################################
            //Remote Events and Changes
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works

            },
            //##########################################################################################################
            //Local Events and Changes
            //##########################################################################################################
            _onIconFileChange: function (eventObject) {
                let file = eventObject.target.files[0];
                if (file.size / 1024 < 64) {
                    if (file.type.match('image.png')) {
                        let reader = new FileReader();
                        reader.onload = lang.hitch(this, function (onLoadEvent) {
                            this._userIconImage.src = onLoadEvent.target.result
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
            _onClickAddUserButton: function (eventObject) {
                //Get Input
                let newUserIcon = this.getIconBuffer()
                let password = this.getPasswordInput()
                let userName = this.getUserNameInput()

                //Make sure the password is valid
                if(password !== null){
                    //make a hash of the password
                    cryptoPromise = crypto.subtle.digest('SHA-512', new TextEncoder("utf-8").encode(this._passwordField1.value));
                    cryptoPromise.then(lang.hitch(this, function (passwordHash) {
                       let passwordHashHex = Array.prototype.map.call(new Uint8Array(passwordHash), x => (('00' + x.toString(16)).slice(-2))).join('');
                       //Send the input and hashed password to the addNewUser Instance Command
                        this._interface._instanceCommands.addNewUser({userName: userName, icon: newUserIcon, password: passwordHashHex}).then(lang.hitch(this, function(Result){
                                console.log("New User request", Result)
                            })).catch(function(Error){
                                console.log("Error sending new user request", Error)
                            })
                    })).catch(function(Error){
                        console.log("Error Preparing New User request", Error)
                    });

                }else{
                    console.log("Error: invalid password input",newUserIcon,password,userName)
                }

            },
            _mouseEnterUserImage: function (eventObject) {
                domClass.add(this._userIconImageDiv, "mouseOverNewUserImage");
                console.log("No Password EntereddomClass.add(this._userIconImageDiv");

            },
            _mouseLeaveUserImage: function (eventObject) {
                domClass.remove(this._userIconImageDiv, "mouseOverNewUserImage");
                console.log("NRemove domClass.add(this._userIconImageDiv");

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
            //##########################################################################################################
            //UI Functionality
            //##########################################################################################################
            setFocus: function () {
                //todo may need to check domReady here
                dijitFocus.focus(this._mainDiv);
            },
            getIconBuffer: function(){
                let base64String = domAttr.get(this._userIconImage, "src").substr(22);
                let base64Array = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                return  {type: "Buffer", data: base64Array}
            },
            getUserNameInput: function() {
                return this._userNameField.innerHTML
            },
            getPasswordInput: function(){
                let password = null
                if (this._passwordField1 && this._passwordField1.value) {
                        if (this._passwordField1.value === this._passwordField2.value) {
                            password = this._passwordField1.value
                        } else {
                            console.log("Passwords do not match");
                        }
                }else{
                    console.log("No Password Entered");
                }
                return password
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
            unload: function () {

            }

        });
    });