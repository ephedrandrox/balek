/*
 * balek-modules/ui/util/styler.js
 * This module is a utility module for adding styles to the page by key
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom-construct",
  "dojo/_base/window",
], function (declare, lang, domConstruct, win) {
  return declare("balekModulesUIUtilStyler", [], {
    addedCss: {},

    constructor: function (args) {
      declare.safeMixin(this, args);
      console.log("balekModulesUIUtilStyler constructor");
    },
    /**
     * Add a style to the page
     * @param {string} styleKey - The key to store the style under
     * @param {string} styleString - The css string to add
     */
    addStyle: function (styleKey, styleString) {
      if (this.addedCss[styleKey] === undefined) {
        console.log("Adding Style: " + styleKey);
        this.addedCss[styleKey] = domConstruct.toDom(
          "<style>" + styleString + "</style>"
        );
        domConstruct.place(this.addedCss[styleKey], win.body());
      }
    },
  });
});
