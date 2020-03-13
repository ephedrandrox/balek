define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/resources/html/userMenu.html',
        'dojo/text!balek-modules/session/menu/resources/css/userMenu.css'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleSessionUserMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionUserMenu",

            _userState: null,
            _sessionState: null,
            _userStateWatchHandle: null,
            _userData: {name: null, icon: "balek-modules/session/menu/Interface/user/resources/images/user.svg"},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                this._userStateWatchHandle = {};
                this._userState = {};
            },
            postCreate() {
                topic.publish("getSessionState", lang.hitch(this, function (sessionState) {
                    this._sessionState = sessionState;
                    topic.publish("getUserState", lang.hitch(this, function (userState) {
                        this._userState = userState;
                        this.updateUserData();
                        this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.updateUserData));
                    }));
                }));
            },
            updateUserData: function () {
                let userData = this._userState.get("userData");
                let sessionUser = this._sessionState.get("_username");
                //this is silly, should index by key
                for (const user in userData) {
                    if (userData[user].name === sessionUser) {
                        this._userData = userData[user];
                    }
                }
                if (this._userImage) {
                    this._userImage.src = this._userData.icon;
                }
            },
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
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
            }
        });
    });