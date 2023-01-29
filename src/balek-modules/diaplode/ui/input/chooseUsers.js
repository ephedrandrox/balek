define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',
        "balek-client/users/usersController/interfaceCommands",

        'balek-modules/diaplode/ui/input/chooseUsers/user',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/ui/input/chooseUsers/resources/html/chooseUsers.html',
        'dojo/text!balek-modules/diaplode/ui/input/chooseUsers/resources/css/chooseUsers.css',
    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,
              UsersControllerInterfaceCommands,
              userWidget,
              _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("diaplodeUIChooseUsers", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _menuKey: null,
            templateString: template,
            baseClass: "diaplodeUIChooseUsers",

            question: null,
            inputReplyCallback: null,

            _mainCssString: mainCss,

            _userListDiv: null,

            usersControllerCommands: null,
            _userList: null,
            _userListWatchHandle: null,
            _userWidgets: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._userWidgets = {}

                let usersControllerInterfaceCommands = new UsersControllerInterfaceCommands();
                this.usersControllerCommands = usersControllerInterfaceCommands.getCommands();

                this._userList = this.usersControllerCommands.getUserList()

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                topic.publish("displayAsDialog", this);
                //load user list and watch for changes
                this.loadUserList()
                this._userListWatchHandle = this._userList.watch( lang.hitch(this, this.userListStateChange));
            },
            //##########################################################################################################
            //Event and State Changes
            //##########################################################################################################
            userListStateChange: function(name, oldState, newState){
                // _userList watcher function
                this.addUserWidget(newState)
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();

                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();

                        this.unload();
                        break;

                }
            }, _onKeyDown: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        this.inputReplyCallback(this.userInputValue.value)
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;

                }
            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            loadUserList: function(){
                //Called before watching _userList state
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
                if (!this._userWidgets[userKey]) {
                    let newUserWidget = new userWidget({
                        usersControllerCommands: this.usersControllerCommands,
                        inputReplyCallback: lang.hitch(this, this.inputReplyCallback),
                        _userData: {userKey: userKey, icon: "", name: "" }
                    });
                    this._userWidgets[userKey] = newUserWidget;
                    domConstruct.place(newUserWidget.domNode, this._userListDiv);
                }
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                //unload and unwatch user list
                if (this._userListWatchHandle){
                    this._userListWatchHandle.unwatch();
                    this._userListWatchHandle.remove();
                }

                //unload user widgets
                for (const userKey in this._userWidgets) {
                    let userWidget = this._userWidgets[userKey]
                    if(userWidget && userWidget.unload === 'function' ){
                        userWidget.unload()
                    }
                }

                this.destroy();
            }
        });
    });