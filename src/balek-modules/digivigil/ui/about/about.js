define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/topic",
  "dojo/Stateful",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/_base/window",
  "dojo/on",
  "dojo/dom-attr",
  "dojo/dom-style",
  "dojo/keys",
  "dijit/focus",
  "dojo/ready",
  "dojo/_base/fx",

  //Balek Util
  "balek-modules/ui/util/styler",

  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",

  "dojo/text!balek-modules/digivigil/ui/about/resources/html/about.html",
  "dojo/text!balek-modules/digivigil/ui/about/resources/css/about.css",
], function (
  declare,
  lang,
  topic,
  Stateful,
  domClass,
  domConstruct,
  win,
  on,
  domAttr,
  domStyle,
  dojoKeys,
  dijitFocus,
  dojoReady,
  fx,
  //Balek Util
  styler,
  _WidgetBase,
  _TemplatedMixin,
  template,
  mainCss
) {
  return declare("scapturaUIAbout", [_WidgetBase, _TemplatedMixin], {
    _instanceKey: null,
    _menuKey: null,
    templateString: template,
    baseClass: "scapturaUIAbout",

    _mainCssString: mainCss,
    mainInterface: null,
    interfaceCommands: null,
    shared: {},

    //##########################################################################################################
    //Startup Functions Section
    //##########################################################################################################

    constructor: function (args) {
      declare.safeMixin(this, args);

      if (this.shared.styler === undefined) {
        this.shared.styler = new styler({});
      }
      this.shared.styler.addStyle(this.baseClass, this._mainCssString);
    },
    postCreate: function () {
      topic.publish("displayAsDialog", this);
    },
    _onFocus: function () {
      // this.userInputValue.focus();
    },
    _onKeyUp: function (keyUpEvent) {
      switch (keyUpEvent.keyCode) {
        case dojoKeys.ENTER:
          keyUpEvent.preventDefault();

          break;
        case dojoKeys.ESCAPE:
          keyUpEvent.preventDefault();
          keyUpEvent.stopPropagation();

          this.unload();
          break;
      }
    },
    _onKeyDown: function (keyUpEvent) {
      switch (keyUpEvent.keyCode) {
        case dojoKeys.ENTER:
          keyUpEvent.preventDefault();
          this.inputReplyCallback(this.userInputValue.value);
          break;
        case dojoKeys.ESCAPE:
          keyUpEvent.preventDefault();
          keyUpEvent.stopPropagation();
          this.unload();
          break;
      }
    },
    _onRemoveClicked: function (eventObject) {
      this.interfaceCommands.removeAllCaptures();
    },
    _onCloseClicked: function (eventObject) {
      this.unload();
    },

    //##########################################################################################################
    //UI Functions Section
    //##########################################################################################################

    //##########################################################################################################
    //Interface Functions Section
    //##########################################################################################################

    unload: function () {
      this.destroy();
    },
  });
});
