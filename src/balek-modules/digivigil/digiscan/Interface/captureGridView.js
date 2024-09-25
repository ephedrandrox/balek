/*
   Scaptura Interface: Capture Grid View Widget

    Provides a Single Capture View to be used in a grid view

    Expects creator to provide a _interfaceKey, interfaceCommands, and captureID

    Example when creating a Capture Grid View Widget from a parent Widget:
    let  captureView =   new captureGridView({
                        _interfaceKey: this._interfaceKey,
                        interfaceCommands: this._interface,
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
  //Dojo Widgets
  "dijit/InlineEditBox",
  "dijit/form/TextBox",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  //HTML and CSS
  "dojo/text!balek-modules/digivigil/digiscan/resources/html/captureGridView.html",
  "dojo/text!balek-modules/digivigil/digiscan/resources/css/captureGridView.css",
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
    "digivigilDigiscanCaptureGridViewInterface",
    [_WidgetBase, _TemplatedMixin],
    {
      //Passed Arguments
      _instanceKey: null,
      interfaceCommands: null,
      captureID: null,
      //Widget Variables
      baseClass: "digivigilDigiscanCaptureGridViewInterface",
      templateString: template,
      _mainCssString: mainCss,
      //Dom Node Handles
      _barcodeDiv: null,
      _noteDiv: null,
      _createdText: null,
      _barcodeText: null,
      _recognizedText: null,
      _noteText: null,
      _imageNode: null,
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
      /* Mixes in and checks for Passed Arguments
        Uses passed capture ID to retrieve and watch capture state
        Reloads View From State on initialization and on each state change

        Places css and then
        Waits for DOM to be ready to focus the widget
   */
      constructor: function (args) {
        declare.safeMixin(this, args);
        //Watch state and reload view
        if (this.captureID && this.interfaceCommands) {
          this.captureState = this.interfaceCommands
            .getCaptures()
            .getCaptureByID(this.captureID);
          this.captureStateWatchHandle = this.captureState.watch(
            lang.hitch(this, this.onCaptureStateChange)
          );
          this.reloadViewFromState();
        }
        //place Css and focus widget
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
       list and capture status on that list. loads capture state and preview image.
       Toggles add/remove from capture set button based on capture set state  */
      reloadViewFromState: function () {
        //Needs Capture State and UI State
        if (this.captureState !== null && this.uiState !== null) {
          const dateString = this.captureState.get("created");
          const date = new Date(dateString);
          let localizedDate = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
          if (localizedDate.toString() == "Invalid Date")
            localizedDate += ":" + dateString;
          //todo fix this Invalid date sometimes occuring
          console.log("DATE:", localizedDate, dateString);
          this._createdText.innerHTML = localizedDate;
          //Get and set Barcode
          let barcode = this.captureState.get("barcode");
          if (barcode && barcode !== "") {
            domStyle.set(this._barcodeDiv, "display", "block");
            this._barcodeText.innerHTML = barcode;
          } else {
            domStyle.set(this._barcodeDiv, "display", "none");
          }
          this._recognizedText.innerHTML =
            this.captureState.get("recognizedText");
          //Get and set note
          let note = this.captureState.get("note");
          if (note && note !== "") {
            domStyle.set(this._noteDiv, "display", "block");
            this._noteText.innerHTML = note;
          } else {
            domStyle.set(this._noteDiv, "display", "none");
          }
          //Get and set Image preview
          const imageBase64String = this.captureState.get("imagePreview");
          if (imageBase64String) {
            domClass.remove(this._imageNode, `${this.baseClass}NoImage`);
            domClass.add(this._imageNode, `${this.baseClass}Image`);

            this._imageNode.src = "data:image/png;base64," + imageBase64String;
          }
          //get the selected Capture Set
          const selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          const captureSet = this.interfaceCommands
            .getCaptureSetsController()
            .getCaptureSetByID(selectedCaptureSetID);
          //Toggle add/remove from capture set button based on current capture set status
          if (captureSet) {
            let captureInSet = captureSet.get(this.captureID);
            //if capture is in set
            if (captureInSet === true) {
              //Set Class and show correct set/unset toggle button
              domClass.remove(this.domNode, `${this.baseClass}CaptureNotInSet`);
              domStyle.set(this.interestedButton, "display", "none");
              domStyle.set(this.uninterestedButton, "display", "inline-block");
            } else {
              //Set Class and show correct set/unset toggle button
              domClass.add(this.domNode, `${this.baseClass}CaptureNotInSet`);
              domStyle.set(this.interestedButton, "display", "inline-block");
              domStyle.set(this.uninterestedButton, "display", "none");
            }
          }
        }
      },
      /*When the user clicks the capture preview select the capture
      If shift key is pressed, unselect Capture*/
      onImageClick: function (clickEvent) {
        if (clickEvent.shiftKey) {
          this.interfaceCommands.clearSelectedCaptures(
            lang.hitch(this, function (commandResult) {
              console.log("returned", commandResult);
            })
          );
        } else {
          this.interfaceCommands.selectCapture(
            this.captureID,
            lang.hitch(this, function (commandResult) {
              console.log("returned", commandResult);
            })
          );
        }
      },
      //Sets the capture to the current selected capture set
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
      //Removes the capture to from the current selected capture set
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
