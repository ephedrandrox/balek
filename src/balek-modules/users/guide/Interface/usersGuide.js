define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/users/guide/resources/html/usersGuide.html',
        'dojo/text!balek-modules/users/guide/resources/css/usersGuide.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("moduleUsersGuideInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            templateString: template,
            baseClass: "usersGuide",

            _MainDocDiv: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },


            postCreate(){
                console.log("init postCreate")
                this.initializeContainable();
                const docIndex = 'balek-modules/users/guide/resources/docs/html/README.html';
                require([`dojo/text!${docIndex}`], lang.hitch(this,function(docToDisplay){
                    this.replaceDocHTML(docToDisplay)
                }));


            },
            startupContainable: function(){
                //called after containable is started
                console.log("startupContainable main User Info interface containable");
            },
            replaceDocHTML(docToDisplay)
            {
                this._MainDocDiv.innerHTML = docToDisplay
            },
            unload: function () {

            }
        });
    });