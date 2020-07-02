define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/keys",
        "dojo/ready",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',



        'dojo/text!balek-modules/conspiron/navigator/resources/html/navigator.html',
        'dojo/text!balek-modules/conspiron/navigator/resources/css/navigator.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys, dojoReady, _WidgetBase, _TemplatedMixin,baseInterface,
              stateSynced,
              remoteCommander, template, templateCSS) {

        return declare("moduleConspironNavigatorInterface", [_WidgetBase, _TemplatedMixin,baseInterface, stateSynced, remoteCommander], {
            _instanceKey: null,
            templateString: template,
            baseClass: "conspironNavigatorInterface",

            _shiftDown: false,
            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);
                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());


                dojoReady(lang.hitch(this, function () {

                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }


                }));


            },
            loadOrToggleModule: function(moduleID){
                topic.publish("isModuleLoaded", moduleID, function (moduleIsLoaded) {
                    if (moduleIsLoaded) {
                        moduleIsLoaded.toggleShowView();
                    } else {
                        topic.publish("requestModuleLoad", moduleID);
                    }
                });
            },


            onInterfaceStateChange: function (name, oldState, newState) {
                console.log(name, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                if (name === "interfaceRemoteCommands") {
                    this.linkRemoteCommands(newState);
                    // this._instanceCommands.changeName("ThisNavigatorName").then(function (results) {
                    //     console.log(results);
                    // });
                    // ready to show widget now that we have our
                    // interface linked and received our remote commands;
               //     this.introAnimation();

                }

                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommandKey
                if (name === "interfaceRemoteCommandKey") {
                    console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;

                }



                if (name === "log") {
                    console.log("adding to log", newState);

                }



            },
            _onFocus: function () {

            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                           this.loadOrToggleModule("session/menu");
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this.loadOrToggleModule( "admin/system");
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;
                }
            },
            _onKeyDown: function (keyDownEvent) {
                switch (keyDownEvent.keyCode) {
                    case dojoKeys.SHIFT:
                        this._shiftDown = true;
                        break;
                    case dojoKeys.ESCAPE:
                        keyDownEvent.preventDefault();
                        break;

                }
            },
            unload() {
                this.destroy();
            }
        });
    });