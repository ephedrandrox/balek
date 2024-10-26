/*
   Scaptura Interface: Capture Detail View Widget

   Provides a detailed view to the selected Capture using a full scan image and capture state.

   Expects creator to provide a _interfaceKey, interfaceCommands, and domNodeToPlaceIn
   Example when creating a Capture Detail View Widget from a parent Widget:
    let  detail =    new CaptureDetailView({
                   _interfaceKey: this._interfaceKey,
                   interfaceCommands: this._interface,
                   domNodeToPlaceIn: this._detailDiv
               });
    */
define([
  //base
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/topic",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/_base/window",
  "dojo/on",
  "dojo/dom-attr",
  "dojo/dom-style",
  //UI
  "dojo/keys",
  "dijit/focus",
  "dojo/ready",
  "dojo/_base/fx",
  //Widgets
  "dijit/InlineEditBox",
  "dijit/form/TextBox",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  //HTML and CSS
  "dojo/text!balek-modules/digivigil/digiscan/resources/html/captureDetailView.html",
  "dojo/text!balek-modules/digivigil/digiscan/resources/css/captureDetailView.css",
], function (
  //base
  declare,
  lang,
  topic,
  domClass,
  domConstruct,
  win,
  on,
  domAttr,
  domStyle,
  //UI
  dojoKeys,
  dijitFocus,
  dojoReady,
  fx,
  //Widgets
  InlineEditBox,
  TextBox,
  _WidgetBase,
  _TemplatedMixin,
  //HTML and CSS
  template,
  mainCss
) {
  return declare(
    "digivigilDigiscanCaptureDetailViewInterface",
    [_WidgetBase, _TemplatedMixin],
    {
      //Passed Arguments
      _instanceKey: null, // Balek Instance Key
      domNodeToPlaceIn: null, // The domNode to place the widget into
      interfaceCommands: null, // The Digiscan Interface Commands
      //Widget Variables
      baseClass: "digivigilDigiscanCaptureDetailViewInterface",
      templateString: template,
      _mainCssString: mainCss,
      //Dom Node Handles
      _createdText: null,
      _barcodeText: null,
      _recognizedText: null,
      _noteText: null,
      _imageNode: null,
      _noteDiv: null,
      //UIState
      uiState: null,
      uiStateWatchHandle: null,
      //Current Capture ID and State
      currentCaptureID: null,
      currentCaptureState: null,
      currentCaptureStateWatchHandle: null,
      /*mixes in passed arguments
       adds mainCssString to the body
       waits for dojo to be ready then focuses on the main domNode*/
      constructor: function (args) {
        declare.safeMixin(this, args);
        domConstruct.place(
          domConstruct.toDom("<style>" + this._mainCssString + "</style>"),
          win.body()
        );
        dojoReady(
          lang.hitch(this, function () {
            dijitFocus.focus(this.domNode);
          })
        );
      },
      /*After widget is created, wait for the dom to load then place the widget
        in the domNodeToPlaceIn that was passed from the creator*/
      postCreate: function () {
        dojoReady(
          lang.hitch(this, function () {
            if (this.domNodeToPlaceIn) {
              domConstruct.place(this.domNode, this.domNodeToPlaceIn);
            }
          })
        );

        //If the interfaceCommands are passed, which they should be, then get the UI State
        if (this.interfaceCommands) {
          this.interfaceCommands
            .getUIState()
            .then(
              lang.hitch(this, function (uiState) {
                this.uiState = uiState;
                this.uiStateWatchHandle = this.uiState.watch(
                  lang.hitch(this, this.onUIStateChange)
                );
                this.updateSelectedCaptures();
              })
            )
            .catch(
              lang.hitch(this, function (Error) {
                console.warn(
                  "Error interfaceCommands getUIState() from captureGridView",
                  Error
                );
              })
            );
        }
      },
      //Called on UI State Change
      onUIStateChange: function (name, oldValue, newValue) {
        if (name === "selectedCaptures") {
          this.updateSelectedCaptures();
        }
      },
      /*get the selected captures from the UI State
        updates the currentCaptureID and sets the watcher accordingly
        Reloads View */
      updateSelectedCaptures: function () {
        if (this.uiState !== null) {
          const selectedCaptures = this.uiState.get("selectedCaptures");

          if (
            Array.isArray(selectedCaptures) &&
            selectedCaptures.length === 1
          ) {
            this.currentCaptureID = selectedCaptures[0];
            this.setCurrentCaptureWatch();
          } else {
            this.clearCurrentCapture();
          }
          this.reloadView();
        }
      },
      //Sets the currentCapture to null and stops watching the currentCaptureState
      clearCurrentCapture: function () {
        this.currentCaptureID = null;
        this.currentCaptureState = null;
        if (
          this.currentCaptureStateWatchHandle !== null &&
          typeof this.currentCaptureStateWatchHandle.unwatch === "function" &&
          typeof this.currentCaptureStateWatchHandle.remove === "function"
        ) {
          this.currentCaptureStateWatchHandle.unwatch();
          this.currentCaptureStateWatchHandle.remove();
          this.currentCaptureWatchHandle = null;
        }
      },
      //When current selected capture state changes, reload the view
      currentCaptureStateChange: function (name, oldValue, newValue) {
        if (name === "image" || name === "id") {
          this.reloadView();
        }
      },
      /*Watch the current capture state
       reload the view when the state changes  */
      setCurrentCaptureWatch: function () {
        if (this.currentCaptureStateWatchHandle !== null) {
          this.currentCaptureStateWatchHandle.unwatch();
          this.currentCaptureStateWatchHandle.remove();
          this.currentCaptureStateWatchHandle = null;
        }

        if (this.currentCaptureID) {
          this.currentCaptureState = this.interfaceCommands
            .getCaptures()
            .getCaptureByID(this.currentCaptureID);
          if (this.currentCaptureState) {
            this.currentCaptureStateWatchHandle =
              this.currentCaptureState.watch(
                lang.hitch(this, this.currentCaptureStateChange)
              );
            this.reloadView();
          }
        }
      },
      /*
      A change to the selected capture or the current capture state will trigger a reload of the view

      Uses the Digivigil Interface Commands to get the detailed image of the current capture
      Gets the created, barcode, recognizedText, and note from the current capture state

      Sets the DOM nodes to the values from the current capture state and image

      Hides the note div if the note is empty
      */
      reloadView: function () {
        if (
          this.currentCaptureState !== null &&
          typeof this.currentCaptureState.get === "function"
        ) {
          const imageBase64String = this.currentCaptureState.get("image");

          if (imageBase64String) {
            domClass.remove(this._imageNode, `${this.baseClass}NoImage`);
            domClass.add(this._imageNode, `${this.baseClass}Image`);
            this._imageNode.src = "data:image/png;base64," + imageBase64String;
          } else {
            const CaptureID = this.currentCaptureState.get("id");
            if (CaptureID) {
              this.interfaceCommands.getCaptureDetailedImage(
                this.currentCaptureID
              );
            } else {
            }
          }

          const created = this.currentCaptureState.get("created");

          const dateUtility = this.interfaceCommands.dateUtility;
          const dateString = this.currentCaptureState.get("created");
          let localizedDate = dateUtility.getLocalizedDate(dateString);

          const barcode = this.currentCaptureState.get("barcode");
          const recognizedText = this.currentCaptureState.get("recognizedText");
          const note = this.currentCaptureState.get("note");

          this._createdText.innerHTML = localizedDate;
          this._barcodeText.innerHTML = barcode;
          this._recognizedText.innerHTML = recognizedText;
          this._noteText.innerHTML = note;

          //if note is empty, hide the note div
          if (note === "") {
            domStyle.set(this._noteDiv, "display", "none");
          } else {
            domStyle.set(this._noteDiv, "display", "grid");
          }
        }
      },
      //Called from widget template
      onHideClick: function (clickEvent) {
        this.interfaceCommands.clearSelectedCaptures(function (returned) {});
      },
      // Called when being unloaded, Cleanup
      unload: function () {
        if (this.currentCaptureSetWatchHandle !== null) {
          this.currentCaptureSetWatchHandle.unwatch();
          this.currentCaptureSetWatchHandle.remove();
        }
        if (this.captureStateWatchHandle) {
          this.captureStateWatchHandle.unwatch();
          this.captureStateWatchHandle.remove();
        }
        if (this.uiStateWatchHandle) {
          this.uiStateWatchHandle.unwatch();
          this.uiStateWatchHandle.remove();
        }

        this.destroy();
      },
    }
  );
});
