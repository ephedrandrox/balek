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

        'balek-modules/users/info/Interface/sessionInfo',

        'dojo/text!balek-modules/users/info/resources/html/userInfo.html',
        'dojo/text!balek-modules/users/info/resources/css/userInfo.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',


    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win,
              on, domAttr, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              SessionWidget,
              template, templateCSS,_SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("moduleUserInfoInterface", [_WidgetBase, _TemplatedMixin,_SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "userInfo",



            _sessionState: null,
            _userState: null,
            _availableSessionsState: null,
            _availableSessions: null,

            _availableSessionsNode: null,

            _sessionWidgets: null,


            _userData: {
                icon: null,
                name: null
            },
            constructor: function (args) {

                declare.safeMixin(this, args)
                this._availableSessionsListNodes = {}
                this._sessionWidgets = {}
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            userStateChange: function (name, oldState, newState) {
                if (name === "userData") {
                    this.updateUserData();
                }
            },
            updateUserData: function () {
                let userData = this._userState.get("userData");
                let sessionUser = "Demo";
                //this is silly, should index by key
                //todo make userDataByNameStore
                for (const user in userData) {

                    if (userData[user].name === sessionUser) {
                        this._userData = userData[user];
                    }

                }

                this._userNameNode.innerHTML = this._userData.name;
                if(this._userData.icon !=null)
                {
                    this._userImageNode.src = this._userData.icon;
                }
            },
            addSessionWidget: function(sessionKey){
                    if(!this._sessionWidgets[sessionKey]){
                        this._sessionWidgets[sessionKey] = new SessionWidget({_instancekey: this._instancekey,
                            sessionInfo: {key: sessionKey}})
                    }
                    domConstruct.place(this._sessionWidgets[sessionKey].domNode, this._availableSessionsNode)
            },
            removeSessionWidget: function(sessionKey){
                // Use this to check all?
                // this._availableSessions.forEach(lang.hitch( this, function(sessionKey, Session){ }))
                if(this._sessionWidgets[sessionKey]){
                    let removeNode = this._sessionWidgets[sessionKey]
                    console.log("🔇🔇🔇♥️",removeNode.domNode)
                    domConstruct.destroy(removeNode.domNode)
                    delete this._sessionWidgets[sessionKey]
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
            // updateSessionsView: function () {
            //     let availableSessions = this._availableSessions
            //     let replacementDiv=domConstruct.create("div");
            //
            //     for (const sessionKey in availableSessions) {
            //
            //             let newSessionDiv = domConstruct.create("div");
            //
            //
            //             domClass.add(newSessionDiv, "userInfoAvailableSessionDiv");
            //             newSessionDiv.innerHTML = sessionKey;
            //             on(newSessionDiv, 'click', lang.hitch(sessionKey, function (evt) {
            //                 evt.stopPropagation();
            //                 topic.publish("requestSessionChange", sessionKey);
            //             }));
            //             domConstruct.place(newSessionDiv, replacementDiv);
            //
            //
            //             let newSessionUnloadDiv = domConstruct.create("div");
            //             newSessionUnloadDiv.innerHTML = "Close";
            //
            //             on(newSessionUnloadDiv, 'click', lang.hitch(sessionKey, function (evt) {
            //                 evt.stopPropagation();
            //                 topic.publish("requestSessionUnload", sessionKey, function(value){
            //                     console.log(value);
            //                     //todo do something with this info. Should make session state, updating state changes interface
            //                 });
            //             }));
            //             domConstruct.place(newSessionUnloadDiv, newSessionDiv);
            //
            //
            //         let newSessionUnloadAllDiv = domConstruct.create("div");
            //         newSessionUnloadAllDiv.innerHTML = "change and unload all";
            //         on(newSessionUnloadAllDiv, 'click', lang.hitch(sessionKey, function (evt) {
            //             evt.stopPropagation();
            //             topic.publish("requestSessionChangeAndUnloadAll", sessionKey, function(value){
            //                 console.log(value);
            //                 //todo do something with this info. Should make session state, updating state changes interface
            //             });
            //         }));
            //         domConstruct.place(newSessionUnloadAllDiv, newSessionDiv);
            //
            //
            //     }
            //     domConstruct.empty(this._availableSessionsNode);
            //     domConstruct.place(replacementDiv, this._availableSessionsNode);
            // },

            postCreate() {
                this.initializeContainable();

                // topic.publish("getSessionState", lang.hitch(this, function (sessionState) {
                //     this._sessionState = sessionState;
                //     //just add available states to session state and watch that!
                //
                //     //this.updateSessionsView();
                //
                //     this._availableSessionsStateWatchHandle = this._sessionState.watch(lang.hitch(this, this.availableSessionsStateChange))
                //
                // }));

                topic.publish("getUserState", lang.hitch(this, function (userState) {
                    this._userState = userState;
                    this.updateUserData();
                    this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange))
                }));

                this._interface.getAvailableSessions().then(lang.hitch(this, function(Sessions){
                    this._availableSessions = Sessions
                    console.log("Sessions availableSessions", Sessions);

                    this.availableSessionsWatchHandle = this._availableSessions.setStateWatcher(lang.hitch(this, this.onAvailableSessionsStateChange));
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))

              /*  topic.publish("getAvailableSessionsState", lang.hitch(this, function (availableSessionsState) {
                    this._availableSessionsState = availableSessionsState;
                    this._availableSessionsStateWatchHandle = this._availableSessionsState.watch("availableSessions", lang.hitch(this, this.availableSessionsStateChange))
                }));*/
            },
            startupContainable: function(){
                //called after containable is started
                console.log("startupContainable main User Info interface containable");
            },
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
                this._availableSessionsStateWatchHandle.unwatch();
                this._availableSessionsStateWatchHandle.remove();
            }
        });
    });