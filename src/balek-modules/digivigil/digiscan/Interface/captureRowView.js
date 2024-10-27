/*
   Scaptura Interface: Capture Row View Widget

    Provides a Single Capture View to be used in a row view

    Expects creator to provide a _interfaceKey, interfaceCommands, mainInterface and captureID

    Example when creating a Capture Grid View Widget from a parent Widget:
    let  captureView =  new CaptureRowView({
        _interfaceKey: this._interfaceKey,
        interfaceCommands: this.interfaceCommands,
        mainInterface: this.mainInterface,
        captureID: id
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
  //Balek Util
  "balek-modules/ui/util/styler",
  //Dojo Widgets
  "dijit/InlineEditBox",
  "dijit/form/TextBox",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  //HTML and CSS
  "dojo/text!balek-modules/digivigil/digiscan/resources/html/captureRowView.html",
  "dojo/text!balek-modules/digivigil/digiscan/resources/css/captureRowView.css",
], function (
  //Base
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
  //Balek Util
  styler,
  //Dojo Widgets
  InlineEditBox,
  TextBox,
  _WidgetBase,
  _TemplatedMixin,
  //HTML and CSS
  template,
  mainCss
) {
  return declare(
    "digivigilDigiscanCaptureRowViewInterface",
    [_WidgetBase, _TemplatedMixin],
    {
      //Passed Arguments
      _instanceKey: null,
      interfaceCommands: null,
      mainInterface: null,
      captureID: null,
      //Widget Variables
      baseClass: "digivigilDigiscanCaptureRowViewInterface",
      templateString: template,
      _mainCssString: mainCss,
      //Dom Node Handles
      _barcodeDiv: null,
      _noteDiv: null,
      _createdText: null,
      _barcodeText: null,
      _recognizedText: null,
      _noteText: null,
      interestedButton: null,
      uninterestedButton: null,
      //Capture State
      captureState: null,
      captureStateWatchHandle: null,
      //UI State
      uiState: null,
      uiStateWatchHandle: null,
      //State of current selected Capture Set
      currentCaptureSetWatchHandle: null,
      shared: {},

      /* Mixes in and checks for Passed Arguments
             Uses passed capture ID to retrieve and watch capture state
             Reloads View From State on initialization and on each state change

             Places css and then
             Waits for DOM to be ready to focus the widget
        */
      constructor: function (args) {
        declare.safeMixin(this, args);
        if (this.shared.styler === undefined) {
          this.shared.styler = new styler({});
        }
        if (this.captureID && this.interfaceCommands) {
          this.captureState = this.interfaceCommands
            .getCaptures()
            .getCaptureByID(this.captureID);
          this.captureStateWatchHandle = this.captureState.watch(
            lang.hitch(this, this.onCaptureStateChange)
          );
          this.reloadViewFromState();
        }

        this.shared.styler.addStyle(this.baseClass, this._mainCssString);
        dojoReady(
          lang.hitch(this, function () {
            dijitFocus.focus(this.domNode);
          })
        );
      },
      /*After Widget node is created use the passed interfaceCommands to get and watch the UI state
      Also gets and sets the Current Capture List state from UIState*/
      postCreate: function () {
        this.interfaceCommands
          .getUIState()
          .then(
            lang.hitch(this, function (uiState) {
              this.uiState = uiState;
              this.uiStateWatchHandle = this.uiState.watch(
                lang.hitch(this, this.onUIStateChange)
              );
              this.setCurrentCaptureListWatcher();
              this.reloadViewFromState();
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
      },
      //unsets current and sets up new capture list watcher
      setCurrentCaptureListWatcher: function () {
        //if a handle has been set, shut it down
        if (this.currentCaptureSetWatchHandle !== null) {
          this.currentCaptureSetWatchHandle.unwatch();
          this.currentCaptureSetWatchHandle.remove();
        }
        //Check that we can get the current selected capture Set ID
        if (this.uiState !== null) {
          const selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          if (selectedCaptureSetID) {
            const captureSet = this.interfaceCommands
              .getCaptureSetsController()
              .getCaptureSetByID(selectedCaptureSetID);
            if (captureSet) {
              this.currentCaptureSetWatchHandle = captureSet.watch(
                lang.hitch(this, function (name, oldValue, newValue) {
                  this.reloadViewFromState();
                })
              );
            }
          }
        }
      },
      //Called on capture state change
      onCaptureStateChange: function (name, oldValue, newValue) {
        this.reloadViewFromState();
      },
      /*Called when UIState changes - if selectedCaptureSet changes then update and always
      reload the view From State*/
      onUIStateChange: function (name, oldValue, newValue) {
        if ("selectedCaptureSet") {
          this.setCurrentCaptureListWatcher();
        }
        this.reloadViewFromState();
      },
      //When the capture state changes, reload the view from state
      onCaptureSetsChange: function (name, oldValue, newValue) {
        this.reloadViewFromState();
      },
      /*Reloads the view data from state, uses the UIstate to check current selected capture
     list and capture status on that list. loads capture state.
     Toggles add/remove from capture set button based on capture set state  */
      reloadViewFromState: function () {
        //Needs Capture State and UI State
        if (this.captureState !== null && this.uiState !== null) {
          const dateUtility = this.interfaceCommands.dateUtility;
          const dateString = this.captureState.get("created");
          let localizedDate = dateUtility.getLocalizedDate(dateString);

          //Set data by node handles
          this._createdText.innerHTML = localizedDate;

          let barcode = this.captureState.get("barcode");
          this._barcodeText.innerHTML = barcode;

          let recognizedText = this.captureState.get("recognizedText");
          this._recognizedText.innerHTML = recognizedText;

          let note = this.captureState.get("note");
          this._noteText.innerHTML = note;

          //get the selected Capture Set
          const selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          const captureSet = this.interfaceCommands
            .getCaptureSetsController()
            .getCaptureSetByID(selectedCaptureSetID);

          if (captureSet) {
            let captureInSet = captureSet.get(this.captureID);
            //Set Class and show correct set/unset toggle button
            //Based on if capture is in set
            if (captureInSet === true) {
              domClass.remove(this.domNode, `${this.baseClass}CaptureNotInSet`);
              domStyle.set(this.interestedButton, "display", "none");
              domStyle.set(this.uninterestedButton, "display", "inline-block");
            } else {
              domClass.add(this.domNode, `${this.baseClass}CaptureNotInSet`);
              domStyle.set(this.interestedButton, "display", "inline-block");
              domStyle.set(this.uninterestedButton, "display", "none");
            }
          }
        }
      },
      /*################################################################
       # UI Helpers and Events
       # */
      /*Sets the mainInterface status text for UI Help */
      setStatusText: function (newStatusText) {
        if (
          this.mainInterface !== null &&
          typeof this.mainInterface.updateStatusText === "function"
        ) {
          this.mainInterface.updateStatusText(newStatusText);
        }
      },
      /*When the user clicks the copy code button*/
      onCopyCodeClick: function (clickEvent) {
        if (this.captureState !== null) {
          this.mainInterface.copyTextToClipboard(
            this.captureState.get("barcode")
          );
        } else {
          alert("Try again.");
        }
      },
      /*When the user mouses over the uninterested button*/
      onUninterestedOver() {
        this.setStatusText("🔆 Hide this Capture in Set");
        domAttr.set(
          this.uninterestedButton,
          "src",
          "balek-modules/digivigil/digiscan/resources/images/eraseFill.svg"
        );
      },
      /*When the user mouses out of the uninterested button*/
      onUninterestedOut() {
        this.setStatusText("");
        domAttr.set(
          this.uninterestedButton,
          "src",
          "balek-modules/digivigil/digiscan/resources/images/erase.svg"
        );
      },
      /*When the user mouses over the copy code button*/
      onCopyCodeOver: function (overEvent) {
        this.setStatusText("🔆 Copy Code to Clipboard 📋");
      },
      /* General on Mouse out to reset any status text */
      _onMouseOutResetStatusText: function (overEvent) {
        this.setStatusText("");
      },
      /*Sets the capture to the current selected capture set*/
      onInterestedClick: function (clickEvent) {
        //Called from HTML Click to unset capture from set
        if (this.uiState !== null) {
          let selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          if (selectedCaptureSetID) {
            //Send Command to add capture from capture set
            this.interfaceCommands.addCaptureToSet(
              selectedCaptureSetID,
              this.captureID,
              lang.hitch(this, function (commandResult) {})
            );
            //Update State before it is updated from Instance
            const captureSet = this.interfaceCommands
              .getCaptureSetsController()
              .getCaptureSetByID(selectedCaptureSetID);
            if (captureSet) {
              captureSet.set(this.captureID, true);
            }
          }
        }
      },
      /*Removes the capture to from the current selected capture set*/
      onUninterestedClick: function (clickEvent) {
        //Called from HTML Click to set capture to set
        if (this.uiState !== null) {
          let selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          if (selectedCaptureSetID) {
            //Send Command to remove capture from capture set
            this.interfaceCommands.removeCaptureFromSet(
              selectedCaptureSetID,
              this.captureID,
              lang.hitch(this, function (commandResult) {})
            );
            //Update State before it is updated from Instance
            const captureSet = this.interfaceCommands
              .getCaptureSetsController()
              .getCaptureSetByID(selectedCaptureSetID);
            if (captureSet) {
              captureSet.set(this.captureID, false);
            }
          }
        }
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
