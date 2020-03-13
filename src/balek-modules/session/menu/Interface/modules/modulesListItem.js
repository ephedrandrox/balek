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

        'dojo/text!balek-modules/session/menu/Interface/modules/resources/html/modulesListItem.html',
        'dojo/text!balek-modules/session/menu/Interface/modules/resources/css/modulesListItem.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS) {
        return declare("moduleSessionModulesInterfaceModuleListItem", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _moduleID: null,
            _iconPath: null,

            templateString: template,
            baseClass: "modulesListItem",

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            _onActivateWorkspaceButtonClick: function () {
                let moduleID = this._moduleID;
                topic.publish("isModuleLoaded", moduleID, function (moduleIsLoaded) {
                    if (moduleIsLoaded) {
                        moduleIsLoaded.toggleShowView();
                    } else {
                        topic.publish("requestModuleLoad", moduleID);
                    }
                });
            }
        });
    });