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

        'dojo/text!balek-modules/session/menu/Interface/modules/resources/html/modules.html',
        'dojo/text!balek-modules/session/menu/Interface/modules/resources/css/modules.css',

        'balek-modules/session/menu/Interface/modules/modulesListItem',
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS, modulesListItem) {
        return declare("moduleSessionMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionModules",
            _availableModuleStore: null,
            _availableModulesList: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                if (this._availableModuleStore === null) {
                    this._availableModuleStore = {};
                }
                this._availableModulesList = {};
            },
            requestNewWorkspace: function () {
                topic.publish("requestNewWorkspace");
            },
            reload() {
                let availableModulesList = this._availableModulesStore.get("availableModules");
                for (moduleID in availableModulesList) {
                    if (this._availableModulesList[availableModulesList[moduleID].interfacePath] === undefined
                        && availableModulesList[moduleID].interfacePath.indexOf("session") !== 0
                    ) {
                        let interfacePath = availableModulesList[moduleID].interfacePath;
                        let iconPath = "";
                        let displayName = "";
                        if (availableModulesList[moduleID].iconPath) {
                            iconPath = availableModulesList[moduleID].iconPath;
                        }
                        if (availableModulesList[moduleID].displayName) {
                            displayName = availableModulesList[moduleID].displayName;
                        }
                        this._availableModulesList[interfacePath] = new modulesListItem({
                            _instanceKey: this._instanceKey,
                            _moduleID: interfacePath,
                            _displayName: displayName,
                            _iconPath: iconPath
                        });
                        domConstruct.place(this._availableModulesList[interfacePath].domNode, this._modulesListDiv);
                    }
                }
            },
            unload: function () {
                this.destroy();
            }
        });
    });