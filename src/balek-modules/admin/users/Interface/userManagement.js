define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        "dojo/aspect",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",


        'dojo/text!balek-modules/admin/users/resources/html/userManagement.html',
        'dojo/text!balek-modules/admin/users/resources/css/userManagement.css',
        'balek-modules/admin/users/Interface/userListItem',
        'balek-modules/admin/users/Interface/userEdit',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang, topic, domConstruct, win, aspect, _WidgetBase, _TemplatedMixin,
              template, cssFile, userListItem, userEdit,
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable) {
        return declare("moduleAdminUsersInterfaceUserManagementInterface", [_WidgetBase, _TemplatedMixin,
                                                                            _syncedCommanderInterface,
                                                                            _balekWorkspaceContainerContainable], {
            _interface: null,
            _instanceKey: null,
            templateString: template,
            _cssString: cssFile,
            baseClass: "userManagementWidget",

            _userListItems: {},
            userListDiv: null,
            _userEditWidgets: null,

            usersControllerCommands: null,


            _userList: null,
            _userStateWatchHandle: null,
            constructor: function (args) {

                declare.safeMixin(this, args)
                this._userListItems = {}
                this._userEditWidgets = {}

                domConstruct.place(domConstruct.toDom("<style>" + this._cssString + "</style>"), win.body());

                if(this.usersControllerCommands !== null){
                    this._userList = this.usersControllerCommands.getUserList()
                    console.log("YUP", this.usersControllerCommands, this._userList)


                }else {
                    console.log("NOPE", this.usersControllerCommands, this._userList)
                }

            },
            postCreate: function () {
                this.initializeContainable();

                if(this._userList)
                {
                    //let userData = this._userList.get("userData")
                  //  setTimeout(lang.hitch(this, function(){
                        this.loadUserList()
                        this._userListWatchHandle = this._userList.watch( lang.hitch(this, this.userListStateChange));

                   // }), 3000)
                    //this.updateUserData(userData)

                }
                 // topic.publish("getUserState", lang.hitch(this, function (userState) {
                 //     //topic.publish("addToCurrentWorkspace", this);
                 //     this._userState = userState;
                 //     let userData = userState.get("userData")
                 //     this.updateUserData(userData)
                 //     this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange));
                 // }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works

            },
            userListStateChange: function(name, oldState, newState){
                // _userList watcher function
                this.addUserWidget(newState)
            },
            addUserWidget: function(userKey){
                // called when a new userKey is received and set in _userList
                // or when initial _userList state is loaded
                if (!this._userListItems[userKey]) {
                    let userListItemOBJECT = new userListItem({
                        _interface: this._interface,
                        _userManagementInterface: this,
                        _instanceKey: this._instanceKey,
                        usersControllerCommands: this.usersControllerCommands,
                        _userData: {userKey: userKey, icon: "", name: "" }
                    });
                    this._userListItems[userKey] = userListItemOBJECT;
                    domConstruct.place(userListItemOBJECT.domNode, this.userListDiv);
                }
            },
            loadUserList: function(){
                //Called before watching _userList state
                //There may be no objects yet in case it already has
                //todo add to state utility as triggerInitialState or similar
                let state = this._userList
                for (const key in state) {
                    let value = state[key]
                    if(typeof value !== 'function' && key != "_attrPairNames"
                        && key != "declaredClass"){
                        this.addUserWidget(key)
                    }
                }
            },
            _onClickAddUser: function (clickEvent) {
                // let userData = {id: "new", name: this.newUserField.value, icon: ""};
                // this.editUser(userData);
            },
            updateUserData: function (userData) {
               // this._userData = userData;

                // for (user in userData) {
                //
                //     if (this._userListItems[user]) {
                //         this._userListItems[user].updateData(userData[user]);
                //     } else {
                //
                //         let userListItemOBJECT = new userListItem({
                //             _interface: this._interface,
                //             _userManagementInterface: this,
                //             _instanceKey: this._instanceKey,
                //             usersControllerCommands: this.usersControllerCommands,
                //             _userData: userData[user]
                //         });
                //         this._userListItems[user] = userListItemOBJECT;
                //         domConstruct.place(userListItemOBJECT.domNode, this.userListDiv);
                //     }
                // }
            },
            editUser: function (userKey) {
                let newUserEdit = null
                if (this._userEditWidgets[userKey]){
                    newUserEdit = this._userEditWidgets[userKey]
                }else{
                    newUserEdit = new userEdit({
                        _interface: this._interface,
                        _userManagementInterface: this,
                        _instanceKey: this._instanceKey,
                        usersControllerCommands: this.usersControllerCommands,
                        _userData: {userKey: userKey, name: "" , icon: ""}
                    });

                    this._userEditWidgets[userKey] = newUserEdit
                    aspect.after(this._userEditWidgets[userKey], "destroy", lang.hitch(this, function () {
                        this._userEditWidgets[userKey] = null
                    }));
                    //this._interface.putInWorkspace(this._userEditWidgets[userKey])
                    topic.publish("displayAsDialog", newUserEdit);
                }



//todo make this work and add new user that also floats
              //  topic.publish("displayAsDialog", this._userEditWidget);

                newUserEdit.setFocus();
            },
            unload: function () {
                this._userListWatchHandle.unwatch();
                this._userListWatchHandle.remove();
            }
        });
    }
);



