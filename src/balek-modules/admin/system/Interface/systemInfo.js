define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/admin/system/resources/html/systemInfo.html',
        'dojo/text!balek-modules/admin/system/resources/css/systemInfo.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleAdminSystemInfoInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "systemInfo",

            _userData: {},
            constructor: function (args) {
                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());
            },
            postCreate() {
                this.updateView();
            },
            setData(systemData) {
                this._systemData = systemData;
                this.updateView();
            },
            updateView: function () {
                this._mainDiv.innerHTML = JSON.stringify(this._systemData);
                setTimeout(lang.hitch(this, function () {
                    topic.publish("sendBalekProtocolMessage", {
                        moduleMessage: {
                            instanceKey: this._instanceKey,
                            messageData: {request: "systemData"}
                        }
                    });
                }), 1000);
            },
            unload: function () {
                this.destroy();
            }
        });
    });