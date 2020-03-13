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

        'dojo/text!balek-modules/admin/system/resources/html/moduleInfo.html',
        'dojo/text!balek-modules/admin/system/resources/css/moduleInfo.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleAdminModuleInfoInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "moduleInfo",

            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            setData(systemData) {
                this._systemData = systemData;
                this.updateView();
            },
            updateModuleList: function (moduleList) {
                for (const name in moduleList) {

                    let newButton = domConstruct.create("div");

                    newButton.innerHTML = moduleList[name].displayName;
                    domClass.add(newButton, "moduleInfoModuleButton");

                    domConstruct.place(newButton, this._mainDiv);
                    on(newButton, "click", function (e) {
                        topic.publish("requestModuleLoad", name);
                    });

                }
                let newBr = domConstruct.create("br");
                domConstruct.place(newBr, this._mainDiv);
            },
            updateRunningInstances: function (runningInstances) {

                let sessions = {};
                for (const instanceKey in runningInstances) {
                    if (!sessions[runningInstances[instanceKey].sessionKey]) {
                        sessions[runningInstances[instanceKey].sessionKey] = {};
                    }
                    sessions[runningInstances[instanceKey].sessionKey][instanceKey] = runningInstances[instanceKey];
                }
                for (const sessionKey in sessions) {
                    let newSessionInfo = domConstruct.create("div");
                    newSessionInfo.innerHTML = sessionKey;
                    domClass.add(newSessionInfo, "moduleInfoSessionDiv");
                    on(newSessionInfo, 'click', lang.hitch(sessionKey, function (evt) {
                        evt.stopPropagation();
                        topic.publish("requestSessionChange", sessionKey);
                    }));
                    for (const instanceKey in sessions[sessionKey]) {
                        let newInstanceInfo = domConstruct.create("div");

                        newInstanceInfo.innerHTML = runningInstances[instanceKey].moduleDisplayName;
                        domClass.add(newInstanceInfo, "moduleInfoInstanceInfo");

                        domConstruct.place(newInstanceInfo, newSessionInfo);
                    }
                    domConstruct.place(newSessionInfo, this._mainDiv);
                }
            },
            unload: function () {
                this.destroy();
            }
        });
    });