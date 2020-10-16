define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom',
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/ready",
        'dojo/_base/fx',
        //Dijit widget includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/twitter/contacts/resources/html/contactsListItem.html',
        'dojo/text!balek-modules/twitter/contacts/resources/css/contactsListItem.css',
        //Balek Interface Includes
        'balek-modules/Interface',
    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
              dom,
              domConstruct,
              win,
              dojoReady,
              fx,
              //Dijit widget includes
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              //Balek Interface Includes
              _baseInterface) {
        return declare("moduleTwitterContactsInterfaceContactsListItem", [_WidgetBase, _TemplatedMixin, _baseInterface], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "twitterContactsInterfaceContactsListItem",

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                if(this._twitterData.public_metrics === undefined || this._twitterData.public_metrics.followers_count === undefined)
                {
                    lang.setObject('public_metrics.followers_count', "unknown", this._twitterData);
                }

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                domConstruct.place(this.domNode, this._ContactsListDomNode);
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            //No Event Functions in the Contacts List Yet

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################

            //No UI Functions in the Contacts List Yet

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });