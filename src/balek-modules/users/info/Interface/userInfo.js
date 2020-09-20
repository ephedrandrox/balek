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

        'dojo/text!balek-modules/users/info/resources/html/userInfo.html',
        'dojo/text!balek-modules/users/info/resources/css/userInfo.css'

    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS) {
        return declare("moduleUserInfoInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userInfo",

            _sessionState: null,
            _userState: null,
            _availableSessionsState: null,


            _availableSessionsNode: null,
            _availableSessionsListNodes: {},

            _userData: {
                icon: null,
                name: null
            },
            constructor: function (args) {

                declare.safeMixin(this, args);
                this._availableSessionsListNodes = {};

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            userStateChange: function (name, oldState, newState) {
                if (name === "userData") {
                    this.updateUserData();
                }
            },
            updateUserData: function () {
                let userData = this._userState.get("userData");
                let sessionUser = this._sessionState.get("_username");
                //this is silly, should index by key
                //todo make userDataByNameStore
                for (const user in userData) {

                    if (userData[user].name === sessionUser) {
                        this._userData = userData[user];
                    }

                }

                this._userNameNode.innerHTML = this._userData.name;
                this._userImageNode.src = this._userData.icon;
            },
            availableSessionsStateChange: function (name, oldState, newState) {
                if (name === "availableSessions") {
                    this.updateSessionsView();
                }
            },
            updateSessionsView: function () {
                let availableSessions = this._availableSessionsState.get("availableSessions");

                for (const sessionKey in availableSessions) {
                    if (!this._availableSessionsListNodes[sessionKey]) {
                        let newSessionDiv = domConstruct.create("div");

                        this._availableSessionsListNodes[sessionKey] = newSessionDiv;

                        domClass.add(newSessionDiv, "userInfoAvailableSessionDiv");
                        newSessionDiv.innerHTML = sessionKey;
                        on(newSessionDiv, 'click', lang.hitch(sessionKey, function (evt) {
                            evt.stopPropagation();
                            topic.publish("requestSessionChange", sessionKey);
                        }));
                        domConstruct.place(newSessionDiv, this._availableSessionsNode);


                        let newSessionUnloadDiv = domConstruct.create("div");
                        newSessionUnloadDiv.innerHTML = "Close";

                        on(newSessionUnloadDiv, 'click', lang.hitch(sessionKey, function (evt) {
                            evt.stopPropagation();
                            topic.publish("requestSessionUnload", sessionKey, function(value){
                                console.log(value);
                                //todo do something with this info. Should make session state, updating state changes interface
                            });
                        }));
                        domConstruct.place(newSessionUnloadDiv, newSessionDiv);


                    }

                }
            },

            postCreate() {

                topic.publish("getSessionState", lang.hitch(this, function (sessionState) {
                    this._sessionState = sessionState;

                    topic.publish("getUserState", lang.hitch(this, function (userState) {
                        this._userState = userState;
                        this.updateUserData();
                        this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange))
                    }));

                }));

                topic.publish("getAvailableSessionsState", lang.hitch(this, function (availableSessionsState) {
                    this._availableSessionsState = availableSessionsState;
                    this.updateSessionsView();
                    this._availableSessionsStateeWatchHandle = this._availableSessionsState.watch("availableSessions", lang.hitch(this, this.availableSessionsStateChange))
                }));
            },
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
                this._availableSessionsStateeWatchHandle.unwatch();
                this._availableSessionsStateeWatchHandle.remove();
            }
        });
    });