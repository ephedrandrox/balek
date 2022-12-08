//##########################################################################################################
//User Management Main Interface - Lists, Edits, and Adds Users
//##########################################################################################################
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
        'balek-modules/admin/users/Interface/newUser',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang, topic, domConstruct, win, aspect, _WidgetBase, _TemplatedMixin,
              template, cssFile, userListItem, UserEdit, NewUser,
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
            _newUserWidget: null,

            usersControllerCommands: null,

            _userList: null,
            _userStateWatchHandle: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {

                declare.safeMixin(this, args)
                this._userListItems = {}
                this._userEditWidgets = {}

                domConstruct.place(domConstruct.toDom("<style>" + this._cssString + "</style>"), win.body());

                if(this.usersControllerCommands !== null){
                    this._userList = this.usersControllerCommands.getUserList()
                }else {
                    console.log("Cannot get User List: no this.usersControllerCommands", this.usersControllerCommands, this._userList)
                }

            },
            postCreate: function () {
                this.initializeContainable();
                if(this._userList)
                {
                        this.loadUserList()
                        this._userListWatchHandle = this._userList.watch( lang.hitch(this, this.userListStateChange));
                }
            },
            startupContainable(){
                //Containable startup event
            },
            //##########################################################################################################
            //Remote Events and Changes
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
            },
            userListStateChange: function(name, oldState, newState){
                // _userList watcher function
                this.addUserWidget(newState)
            },
            //##########################################################################################################
            //Local Events and Changes
            //##########################################################################################################
            _onClickAddUser: function (clickEvent) {
                this.newUser()
            },
            //##########################################################################################################
            //UI Functionality
            //##########################################################################################################
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
            editUser: function (userKey) {
                // called to either create or bring to front user edit widget container
                if (this._userEditWidgets[userKey]) {
                    this._userEditWidgets[userKey].focus()
                }else{
                    this._interface._instanceCommands.getEditUserComponentKey(userKey).then(lang.hitch(this, function(Result){
                        let success = Result.SUCCESS
                        let error = Result.ERROR
                        if(success){
                            let componentKey = success.componentKey
                            let userKey = success.userKey
                            if(componentKey && componentKey.toString()){
                                let userEdit = null
                                if (this._userEditWidgets[userKey]){
                                    userEdit = this._userEditWidgets[userKey]
                                }else{
                                    userEdit = new UserEdit({
                                        _interface: this._interface,
                                        _userManagementInterface: this,
                                        _instanceKey: this._instanceKey,
                                        _componentKey: componentKey,
                                        usersControllerCommands: this.usersControllerCommands,
                                        _userData: {userKey: userKey, name: "" , icon: ""}
                                    });
                                    this._userEditWidgets[userKey] = userEdit
                                    aspect.after(this._userEditWidgets[userKey], "destroy", lang.hitch(this, function () {
                                        this._userEditWidgets[userKey] = null
                                    }));
                                    this._interface.putInWorkspace(this._userEditWidgets[userKey])
                                }
                            }
                        }else{
                            console.log("🟣🟣🟣🟣 editUser Error getEditUserComponentKey not expected result", error, Result)
                        }
                    })).catch(lang.hitch(this, function(Error){
                        console.log("🟣🟣🟣🟣", Error)
                    }))
                }

            },
            newUser: function(){
                if(this._newUserWidget !== null)
                {
                    console.log("_onClickAddUser Already here, want to bring forward")
                }else
                {
                    this._interface._instanceCommands.getNewUserComponentKey().then(lang.hitch(this, function(Result){
                        let success = Result.SUCCESS
                        let error = Result.ERROR
                        if(success){
                            let componentKey = success.componentKey
                            if(componentKey && componentKey.toString()){
                                if(this._newUserWidget === null){
                                    this._newUserWidget = new NewUser({
                                        _interface: this._interface,
                                        _userManagementInterface: this,
                                        _instanceKey: this._instanceKey,
                                        _componentKey: componentKey,
                                        usersControllerCommands: this.usersControllerCommands
                                    })

                                    this._interface.putInWorkspace(this._newUserWidget)
                                }else {
                                    console.log("_onClickAddUser Already have _newUserWidget, must have double clicked, focus widget")
                                }
                            }
                        }
                    })).catch(lang.hitch(this, function(Error){
                        console.log("🟣🟣🟣🟣", Error)
                    }))
                }
            },
            unload: function () {
                this._userListWatchHandle.unwatch();
                this._userListWatchHandle.remove();
            }
        });
    }
);



