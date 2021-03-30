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

        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/resources/html/menuItem.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/resources/css/menuItem.css',

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



            },
            postCreate: function () {
                //topic.publish("addToMainContentLayer", this.domNode);
                this._nameDiv.innerHTML = this._name;

                if(this._menuWidget && this._menuWidget.domNode)
                {

                    domConstruct.place(this.domNode, this._menuWidget.domNode);
                }else
                {
                   // console.log("no place to go", this);
                }

            },

            //##########################################################################################################
            //State Functions Section
            //##########################################################################################################
           setName: function(name){
                this._name = name;
               this._nameDiv.innerHTML = this._name;
           },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function(){
                //console.log(this._menuCompanion, this._itemKey);
                this._menuCompanion.load(this._itemKey).then(function(Result){
                    console.log("Menu item load result", Result);
                    //todo decide what to do here, more container to this workspace?

                }).catch(function(errorResult){});
            },
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