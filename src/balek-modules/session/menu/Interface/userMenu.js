define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        ///------------
        "balek-client/users/usersController/interfaceCommands",
        "balek-client/session/sessionController/interfaceCommands",
        ///------------
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        //-------------
        'dojo/text!balek-modules/session/menu/resources/html/userMenu.html',
        'dojo/text!balek-modules/session/menu/resources/css/userMenu.css'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr,
              UsersControllerInterfaceCommands, SessionControllerInterfaceCommands,
              _WidgetBase, _TemplatedMixin,
              template, templateCSS) {
        return declare("moduleSessionUserMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionUserMenu",

            usersControllerCommands: null,
            sessionControllerCommands: null,

            _userInfoState: null,
            _userInfoStateWatchHandle: null,

            _sessionState: null,
            _sessionStateWatchHandle: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {

                declare.safeMixin(this, args);

                let sessionControllerInterfaceCommands = new SessionControllerInterfaceCommands();
                this.sessionControllerCommands = sessionControllerInterfaceCommands.getCommands();

                let usersControllerInterfaceCommands = new UsersControllerInterfaceCommands();
                this.usersControllerCommands = usersControllerInterfaceCommands.getCommands();

                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            postCreate() {

                this._sessionState = this.sessionControllerCommands.getSessionState()
                this._sessionStateWatchHandle = this._sessionState.watch(lang.hitch(this, this.onSessionStateChange))
                this.checkAndLoadUserInfoState()

            },
            //##########################################################################################################
            //Event and State Changes
            //##########################################################################################################
            _mouseEnter: function (eventObject) {
                domClass.add(this._userIconDiv, "mouseOverSessionUserMenuUserIcon");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this._userIconDiv, "mouseOverSessionUserMenuUserIcon");
            },
            _onClick: function (eventObject) {
                topic.publish("isModuleLoaded", "users/info", function (moduleIsLoaded) {
                    if (moduleIsLoaded) {
                        moduleIsLoaded.toggleShowView();
                    } else {
                        topic.publish("requestModuleLoad", "users/info");
                    }
                });
            },
            onSessionStateChange(name, oldState, newState){
                console.log("🔻🔻🔻🔻UserMenu",name, oldState, newState)
                if(name = "userKey"){
                    this.checkAndLoadUserInfoState()
                }
            },
            checkAndLoadUserInfoState(){
                let userKey = this.sessionControllerCommands.getSessionUserKey()
                if(userKey && this._userInfoState === null  ) {
                    this._userInfoState = this.usersControllerCommands.getUserInfoState(userKey)
                    if(this._userInfoState.get("icon")){
                        this.onUserInfoUpdate("icon", null, this._userInfoState.get("icon"))
                    }
                    this._userInfoStateWatchHandle = this._userInfoState.watch( lang.hitch(this, this.onUserInfoUpdate));
                }
            },
            onUserInfoUpdate: function(name, oldValue, newValue){
                if(name === "icon" && this._userImage){
                    this._userImage.src = newValue;
                }else{
                    console.log("Unused State Update", name, oldValue, newValue)
                }
            },
            //##########################################################################################################
            //Unload
            //##########################################################################################################
            unload: function () {
                this._userInfoStateWatchHandle.unwatch();
                this._userInfoStateWatchHandle.remove();
                this._sessionStateWatchHandle.unwatch();
                this._sessionStateWatchHandle.remove()
            }
        });
    });