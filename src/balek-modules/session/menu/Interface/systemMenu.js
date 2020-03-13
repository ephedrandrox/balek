define([ 'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/resources/html/systemMenu.html',
        'dojo/text!balek-modules/session/menu/resources/css/systemMenu.css'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS) {
        return declare("moduleSessionSystemMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionSystemMenu",

            _userData: {name: null},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());
            },
            _mouseEnter: function(eventObject){
                domClass.add(this._systemIconDiv, "mouseOverSessionSystemMenuSystemIcon");
            },
            _mouseLeave: function(eventObject)
            {
                domClass.remove(this._systemIconDiv, "mouseOverSessionSystemMenuSystemIcon");
            },
            _onClick: function(eventObject)
            {
                topic.publish("isModuleLoaded", "admin/system", function(moduleIsLoaded){

                    if(moduleIsLoaded)
                    {
                        moduleIsLoaded.toggleShowView();
                    }else
                    {
                        topic.publish("requestModuleLoad", "admin/system");
                    }
                });
            },
            unload: function(){
                this.destroy();
            }
        });
    });