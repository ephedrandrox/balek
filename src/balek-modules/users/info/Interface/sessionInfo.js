define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/users/info/resources/html/sessionInfo.html',
        'dojo/text!balek-modules/users/info/resources/css/sessionInfo.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("usersInfoSessionInfoInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "usersInfoSessionInfoInterface",

            _mainCssString: mainCss,

            sessionInfo: null,

            _mainDiv: null,
            _keyDiv: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));
                dijitFocus.focus(this.domNode);
            },
            _onSwitchToButtonClicked: function (clickEvent) {
                topic.publish("requestSessionChange", this.sessionInfo.key);
            },
            _onCloseButtonClicked: function (clickEvent) {
                topic.publish("requestSessionUnload", this.sessionInfo.key, function(value){
                                console.log(value);
                            });
            },
            _onSwitchAndCloseButtonClicked: function (clickEvent) {
                topic.publish("requestSessionChangeAndUnloadAll", this.sessionInfo.key);
            },

            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                this.destroy();
            }


        });
    });