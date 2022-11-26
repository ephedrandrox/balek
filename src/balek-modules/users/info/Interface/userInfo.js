define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        "balek-client/users/usersController/interfaceCommands",
        "balek-client/session/sessionController/interfaceCommands",

        "balek-modules/diaplode/ui/input/getUserInput",


        'balek-modules/users/info/Interface/sessionInfo',



        'dojo/text!balek-modules/users/info/resources/html/userInfo.html',
        'dojo/text!balek-modules/users/info/resources/css/userInfo.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',


    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win,
              on, domAttr, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              UsersControllerInterfaceCommands, SessionControllerInterfaceCommands,
              getUserInput,SessionWidget,
              template, templateCSS,_SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("moduleUserInfoInterface", [_WidgetBase, _TemplatedMixin,_SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "userInfo",

            _userNameNode: null,

            _sessionState: null,
            _userState: null,
            _availableSessionsState: null,
            _availableSessions: null,

            _availableSessionsNode: null,

            _sessionWidgets: null,


            usersControllerCommands: null,
            sessionControllerCommands: null,

            _usersSessionsStateList: null,
            _usersSessionsStateListWatchHandle: null,
            _userInfoState: null,
            _userInfoStateWatchHandle: null,

            _userData: {
                icon: null,
                name: null
            },
            constructor: function (args) {

                declare.safeMixin(this, args)
                this._availableSessionsListNodes = {}
                this._sessionWidgets = {}

                let sessionControllerInterfaceCommands = new SessionControllerInterfaceCommands();
                this.sessionControllerCommands = sessionControllerInterfaceCommands.getCommands();

                let usersControllerInterfaceCommands = new UsersControllerInterfaceCommands();
                this.usersControllerCommands = usersControllerInterfaceCommands.getCommands();


                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

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
                            this._interface._instanceCommands.updateUserIcon(iconForTransfer).then(lang.hitch(this, function(Result){
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
            _onChangeNameDblClicked:function(clickEvent){
                console.log("Username request", this)
                let getDataForName = new getUserInput({question: "Change Username...",
                    inputReplyCallback: lang.hitch(this, function(newName){
                        this._interface._instanceCommands.updateUsername(newName).then(lang.hitch(this, function(Result){
                            console.log("Username request", Result)
                        })).catch(function(Error){
                            console.log("Error sending update Username request", Error)
                        })
                        getDataForName.unload();
                    }) });
            },
            addSessionWidget: function(sessionKey){
                    if(!this._sessionWidgets[sessionKey]){
                        this._sessionWidgets[sessionKey] = new SessionWidget({_instancekey: this._instancekey,
                            sessionInfo: {key: sessionKey}})
                    }
                    domConstruct.place(this._sessionWidgets[sessionKey].domNode, this._availableSessionsNode)
            },
            removeSessionWidget: function(sessionKey){
                if(this._sessionWidgets[sessionKey]){
                    let removeNode = this._sessionWidgets[sessionKey]
                    console.log("🔇🔇🔇♥️",removeNode.domNode)
                    domConstruct.destroy(removeNode.domNode)
                    delete this._sessionWidgets[sessionKey]
                }
            },
            onUserInfoStateChange: function (name, oldState, newState) {
                console.log("onUserInfoStateChange", name, oldState, newState)
                 name = name.toString()
                if(name == "userName"){
                    console.log("userName", name, oldState, newState)
                    this._userNameNode.innerHTML = newState
                }else if(name == "userKey"){
                    console.log("userKey", name, oldState, newState)
                }else if(name == "icon" ){
                    console.log("icon", name, oldState, newState)
                         this._userImageNode.src = newState;
                }else {
                    console.log("onUserInfoStateChange NOT WHAT WE WANT", name, oldState, newState)
                }
            },
            onAvailableSessionsStateChange: function (name, oldState, newState) {
                console.log("onAvailableSessionsStateChange", name, oldState, newState)
                let id = name.toString()
                if(newState && typeof newState.toString === 'function' &&
                    id == newState.toString()){
                    this.addSessionWidget(id)
                }else if(newState === null){
                    this.removeSessionWidget(id)
                }else {
                        console.log("onAvailableSessionsStateChange NOT WHAT WE WANT", name, oldState, newState)
                }
            },

            postCreate() {
                this.initializeContainable();

                let userKey = this.sessionControllerCommands.getSessionUserKey()
                this._userInfoState = this.usersControllerCommands.getUserInfoState(userKey)

                if(this._userInfoState.get("icon")){
                    this.onUserInfoStateChange("icon", null, this._userInfoState.get("icon"))
                }
                if(this._userInfoState.get("userName")){
                    this.onUserInfoStateChange("userName", null, this._userInfoState.get("userName"))
                }

                this._userInfoStateWatchHandle = this._userInfoState.watch( lang.hitch(this, this.onUserInfoStateChange));


                this._usersSessionsStateList = this.sessionControllerCommands.getUserSessionsList()

                for (const key in this._usersSessionsStateList) {
                    let value = this._usersSessionsStateList[key]
                    if(typeof value !== 'function' && key != "_attrPairNames"
                        && key != "declaredClass"){
                        console.log("adding objects from  State", key, value)
                        this.onAvailableSessionsStateChange(key, null, value );
                    }
                }

                this._usersSessionsStateListWatchHandle = this._usersSessionsStateList.watch(lang.hitch(this, this.onAvailableSessionsStateChange))

            },
            startupContainable: function(){
                //called after containable is started
                console.log("startupContainable main User Info interface containable");
            },
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
                this._usersSessionsStateListWatchHandle.unwatch();
                this._usersSessionsStateListWatchHandle.remove();
            }
        });
    });