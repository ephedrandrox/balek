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

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/resources/html/menuItem.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/menuItem.css',

        'balek-modules/Interface',

        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',


    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, baseInterface, stateSynced, remoteCommander) {

        return declare("moduleDiaplodeNavigatorInterfaceMenuItem", [_WidgetBase, _TemplatedMixin, baseInterface, stateSynced, remoteCommander], {
            _instanceKey: null,
            _menuKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceMenuItem",

            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {
                    if(  this._componentKey )
                    {
                        this.askToConnectInterface();
                    }
                }));

            },
            postCreate: function () {
                topic.publish("addToMainContentLayer", this.domNode);
            },

            //##########################################################################################################
            //State Functions Section
            //##########################################################################################################

            onInterfaceStateChange: function(name, oldState, newState){
               console.log("menu Items State change", name, newState);

                if (name === "interfaceRemoteCommands") {
                    this.linkRemoteCommands(newState);
                    //ready to show widget;
                    this.introAnimation();

                }

                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommandKey
                else if (name === "interfaceRemoteCommandKey") {
                    console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;

                }else if (name === "name") {
                   this._nameDiv.innerHTML = newState;
                }
                else{
                    console.log("state unaccounted for....", name, newState);
                }
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onFocus: function () {
                //todo make it do something
            },

            moveTo: function(x,y){
                //make this part of a Movable class that inherits
                this._xRelativePosition = x;
                this._yRelativePosition = y;


                domStyle.set(this.domNode, "top", y+"%");
                domStyle.set(this.domNode, "left", x+"%");
            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            introAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:1200,

                    properties: {
                        opacity: {end: 1},

                    }
                }).play();
            },
            outroAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:1200,

                    properties: {
                        opacity: {end: 0},

                    }
                }).play();
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################


            unload: function () {
                this.inherited(arguments);

                this.destroy();
            }


        });
    });