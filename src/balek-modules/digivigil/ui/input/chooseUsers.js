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

        'balek-modules/digivigil/ui/input/chooseUsers/user',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/digivigil/ui/input/chooseUsers/resources/html/chooseUsers.html',
        'dojo/text!balek-modules/digivigil/ui/input/chooseUsers/resources/css/chooseUsers.css',
    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,
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
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                topic.publish("getUserState", lang.hitch(this, function (userState) {
                    //topic.publish("addToCurrentWorkspace", this);
                    this._userState = userState;
                    this.userStateChange();
                    this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange));
                }));
            },
            postCreate: function () {
                topic.publish("displayAsDialog", this);

            },
            userStateChange: function (name, oldState, newState) {
                if (name === "userData") {
                    this.updateUserData();
                }
            },
            updateUserData: function () {
                let userData = this._userState.get("userData");

                this._userList.innnerHTML = "";
                for (const user in userData) {

                    let newWidget = userWidget({_userData: userData[user], inputReplyCallback: lang.hitch(this, this.inputReplyCallback)});

                    domConstruct.place(newWidget.domNode, this._userList)

                }
            },
            _onFocus: function(){

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

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
                this.destroy();
            }
        });
    });