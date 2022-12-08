//##########################################################################################################
//User
//##########################################################################################################
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/ui/input/chooseUsers/resources/html/user.html',
    ],
    function (declare, lang, topic, domClass, _WidgetBase, _TemplatedMixin, template) {
        return declare("diaplodeUIChooseUsersUser", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeUIChooseUsersUser",

            _userNameNode: null,
            _userImageNode: null,

            inputReplyCallback: null,

            _userInfoState: null,
            _userInfoStateWatchHandle: null,
            usersControllerCommands: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this.usersControllerCommands !== null && this._userData.userKey){
                    this._userInfoState = this.usersControllerCommands.getUserInfoState(this._userData.userKey)
                }
            },
            postCreate: function(){
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
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onUserInfoStateChange: function (name, oldState, newState) {
                console.log("onUserInfoStateChange", name, oldState, newState)
                name = name.toString()
                if(name == "userName"){
                    this._userNameNode.innerHTML = newState
                }else if(name == "icon" ){
                    console.log("icon", name, oldState, newState, this._userImageNode.src, this._userImageNode)
                    this._userImageNode.src = newState;
                }else {
                    console.log("🟡🟡🟡🟢🟢onUserInfoStateChange NOT WHAT WE WANT", name, oldState, newState)
                }
            },
            _onClickUser: function (eventObject) {
                this.inputReplyCallback(this._userData.userKey)
            },
            _mouseEnter: function (eventObject) {
                domClass.add(this.domNode, "mouseOverUserListItem");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this.domNode, "mouseOverUserListItem");
            },
            //##########################################################################################################
            //Unload
            //##########################################################################################################
            unload: function () {
                this._userInfoStateWatchHandle.unwatch();
                this._userInfoStateWatchHandle.remove();
            }
        });
    });