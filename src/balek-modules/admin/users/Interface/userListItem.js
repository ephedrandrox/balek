define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/admin/users/resources/html/userListItem.html',
    ],
    function (declare, lang, topic, domClass, _WidgetBase, _TemplatedMixin, template) {
        return declare("moduleAdminUsersInterfaceUserManagementInterfaceUserListItem", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userManagementWidgetUserListItem",

            _userNameNode: null,
            _userImageNode: null,

            _userManagementInterface: null,

            _userData: null,
            _userInfoState: null,

            usersControllerCommands: null,

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
            onUserInfoStateChange: function (name, oldState, newState) {
                name = name.toString()
                if(name == "userName"){
                    this._userNameNode.innerHTML = newState
                }else if(name == "icon" ){
                    this._userImageNode.src = newState;
                }
            },
            _onClickUserListItem: function (eventObject) {
                this._userManagementInterface.editUser(this._userData.userKey);
            },
            _mouseEnter: function (eventObject) {
                domClass.add(this.domNode, "mouseOverUserListItem");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this.domNode, "mouseOverUserListItem");
            },
            unload: function () {
                this._userInfoStateWatchHandle.unwatch();
                this._userInfoStateWatchHandle.remove();

            }
        });
    });