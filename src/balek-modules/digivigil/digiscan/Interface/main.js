/*

   Scaptura Interface: Main Interface Widget

    Provides the main Interface widget for Scaptura

    The main widget is also a _SyncedCommanderInterface and _BalekWorkspaceContainerContainable

    Expects creator to provide a _interfaceKey, _sessionKey, _componentKey, and _interface


Example of creating a main interface widget from the Interface
 this._mainInterface = new MainInterface({
              _instanceKey: newState.instanceKey,
              _sessionKey: newState.sessionKey,
              _componentKey: newState.componentKey,
              _interface: this,
            });
 */

define([
  //base
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/_base/window",
  "dojo/_base/fx",
  "dojo/on",
  "dojo/dom-attr",
  //UI
  "dojo/keys",
  "dijit/focus",
  "dojo/ready",
  //Dojo Widgets
  "dijit/InlineEditBox",
  "dijit/form/TextBox",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  //Balek Util
  "balek-modules/ui/util/styler",
  //Scaptura Widgets
  "balek-modules/digivigil/digiscan/Interface/captureDetailView",
  "balek-modules/digivigil/digiscan/Interface/captureGridView",
  "balek-modules/digivigil/digiscan/Interface/listControl",
  "balek-modules/digivigil/digiscan/Interface/capturesTableView",
  //Widget Template
  "dojo/text!balek-modules/digivigil/digiscan/resources/html/main.html",
  "dojo/text!balek-modules/digivigil/digiscan/resources/css/main.css",
  //Balek Modules
  "balek-modules/components/syncedCommander/Interface",
  "balek-client/session/workspace/container/containable",
], function (
  declare,
  lang,
  domStyle,
  domConstruct,
  win,
  fx,
  on,
  domAttr,
  //UI
  dojoKeys,
  dijitFocus,
  dojoReady,
  //Dojo Widgets
  InlineEditBox,
  TextBox,
  _WidgetBase,
  _TemplatedMixin,
  //Balek Util
  styler,
  //Scaptura Widgets
  CaptureDetailView,
  captureGridView,
  listControl,
  TableView,
  //Widget Template
  template,
  mainCss,
  //Balek Modules
  _SyncedCommanderInterface,
  _BalekWorkspaceContainerContainable
) {
  return declare(
    "scapturaMainInterface",
    [
      _WidgetBase,
      _TemplatedMixin,
      _SyncedCommanderInterface,
      _BalekWorkspaceContainerContainable,
    ],
    {
      //##########################################################################################################
      //Widget Variables Section
      //##########################################################################################################
      //Passed arguments
      _instanceKey: null,
      _interface: null,
      _sessionKey: null,
      _componentKey: null,
      //widget template
      baseClass: "digivigilDigiscanMainInterface",
      templateString: template,
      _mainCssString: mainCss,
      //DomNode Handles
      _previewDiv: null,
      _tableDiv: null,
      _detailDiv: null,
      _noSelectionDiv: null,
      _statusDiv: null,
      _listControlContainer: null,
      //Child Widgets
      listControl: null,
      MainTable: null,
      Detail: null,
      //UI State
      uiState: null,
      uiStateWatchHandle: null,
      //Capture Sets State
      captureSets: null,
      captureSetsWatchHandle: null,
      currentCaptureSetWatchHandle: null,
      lastCaptureSetIDWatched: null,
      //Array of Capture Grid Views
      CaptureViews: null,
      shared: {},
      //##########################################################################################################
      //Startup Functions Section
      //##########################################################################################################
      constructor: function (args) {
        /*
         * Constructor
         * @param {Object} args
         * @param {string} args._instanceKey
         * @param {string} args._sessionKey
         * @param {string} args._componentKey
         * @param {Object} args._interface
         * Mixes in the passed arguments, creates storage objects and places the widget css into the body
         */
        this._interface = {};
        this.CaptureViews = {};

        declare.safeMixin(this, args);

        if (this.shared.styler === undefined) {
          this.shared.styler = new styler({});
        }
        this.shared.styler.addStyle(this.baseClass, this._mainCssString);
      },
      postCreate: function () {
        /*
         * Post Create
         * Initializes the containable, creates the detail view, main table view, and list control widgets
         * Gets the UI State and Capture Sets from the interface
         * Watches the UI State and Capture Sets for changes
         * Refreshes the views
         */
        // Creates the workspace container for the widget
        this.initializeContainable();
        //Create the Capture Detail View Widget
        this.Detail = new CaptureDetailView({
          _interfaceKey: this._interfaceKey,
          interfaceCommands: this._interface,
          domNodeToPlaceIn: this._detailDiv,
        });
        //Create the Main Table Widget
        if (this.MainTable == null) {
          this.MainTable = TableView({
            _interfaceKey: this._interfaceKey,
            interfaceCommands: this._interface,
            mainInterface: this,
          });
          domConstruct.place(this.MainTable.domNode, this._tableDiv, "only");
        }

        //Create List Control Widget
        if (this.listControl == null) {
          //Create list control Widget
          this.listControl = listControl({
            interfaceCommands: this._interface,
            mainInterface: this,
          });
          // insert it into container
          domConstruct.place(
            this.listControl.domNode,
            this._listControlContainer,
            "only"
          );
        }

        //Get UI State from the interface
        this._interface
          .getUIState()
          .then(
            lang.hitch(this, function (uiState) {
              this.uiState = uiState;
              this.uiStateWatchHandle = this.uiState.watch(
                lang.hitch(this, this.onUIStateChange)
              );
              this.refreshViews();
            })
          )
          .catch(
            lang.hitch(this, function (Error) {
              console.error(
                "Error this._interface.getAvailableEntries()",
                Error
              );
            })
          );

        //Get Users Capture Sets List from interface
        this._interface
          .getCaptureSets()
          .then(
            lang.hitch(this, function (captureSets) {
              this.captureSets = captureSets;
              this.captureSetsWatchHandle = this.captureSets.watch(
                lang.hitch(this, this.onCaptureSetsChange)
              );
              this.refreshViews();
            })
          )
          .catch(
            lang.hitch(this, function (Error) {
              console.error("Error this._interface.getCaptureSets()", Error);
            })
          );
      },
      startupContainable: function () {
        //called after containable is started
        //keep stub for future use
      },
      //##########################################################################################################
      //Event Functions Section
      //##########################################################################################################
      onUIStateChange: function (name, oldState, newState) {
        //if active view, selected capture set or show hidden captures changed
        if (
          name === "ActiveView" ||
          name === "selectedCaptureSet" ||
          name === "showHiddenCaptures" ||
          name === "selectedCaptures"
        ) {
          this.refreshViews();
          this.setCurrentCaptureSetWatcher();
        }
        //If just status text Changes then update the div
        if (name === "UIStatusText" || name === "showHelpfulHints") {
          this.updateStatusTextView();
        }
      },
      onCaptureSetsChange: function (captureSetID, oldName, newName) {
        //When the selected capture sets capture list changes
        this.refreshViews();
      },
      setCurrentCaptureSetWatcher: function () {
        //refresh the view when the selected capture set changes
        //but first remove the previous watch event

        //if the uiState is not null and the selected capture set is not null
        //and the last capture set watched is not the same as the selected capture set
        //then remove the previous watch event and create a new one
        if (this.uiState !== null) {
          const selectedCaptureSetID = this.uiState.get("selectedCaptureSet");
          if (
            selectedCaptureSetID &&
            this.lastCaptureSetIDWatched !== selectedCaptureSetID
          ) {
            this.lastCaptureSetIDWatched = selectedCaptureSetID;
            if (this.currentCaptureSetWatchHandle !== null) {
              this.currentCaptureSetWatchHandle.unwatch();
              this.currentCaptureSetWatchHandle.remove();
            }
            //if the selected capture set is not null
            //
            const captureSet = this._interface
              .getCaptureSetsController()
              .getCaptureSetByID(selectedCaptureSetID);
            this.currentCaptureSetWatchHandle = captureSet.watch(
              lang.hitch(this, function (name, oldValue, newValue) {
                if (newValue === true) {
                  // if the received value is true then place the capture view in the preview div
                  // and refresh the main table
                  let captureView = this.getCaptureView(name);
                  dojoReady(
                    lang.hitch(this, function () {
                      if (!this._previewDiv.contains(captureView.domNode))
                        domConstruct.place(
                          captureView.domNode,
                          this._previewDiv
                        );
                    })
                  );
                  if (this.MainTable !== null) {
                    this.MainTable.refreshUI();
                  }
                } else if (newValue === false) {
                  //if the received value is false then remove the capture view from the preview div
                  //and refresh the main table
                  let captureView = this.getCaptureView(name);
                  dojoReady(
                    lang.hitch(this, function () {
                      if (this._previewDiv.contains(captureView.domNode))
                        domConstruct.destroy(captureView.domNode);
                    })
                  );
                  if (this.MainTable !== null) {
                    this.MainTable.refreshUI();
                  }
                } else if (name === "filterSettings") {
                  //if the received value is not a boolean and it's name is filterSettings
                  // then we want to use them to filter the captures
                  // console.log(
                  //   "👽currentCaptureSetWatchHandle filter settings",
                  //   name,
                  //   oldValue,
                  //   newValue
                  // );
                } else {
                  //if the received value is not a boolean and it's name is not filterSettings
                  //then we should issue a warning cause that is unexpected
                  console.warn(
                    "main captureSet.watch unexpected value",
                    name,
                    oldValue,
                    newValue
                  );
                }
              })
            );
          }
        }
      },
      //##########################################################################################################
      //Widget UI Event Functions Section
      //##########################################################################################################
      _onKeyUp: function (keyUpEvent) {
        //stops escape key from propagating
        //Can be used to add more key commands
        switch (keyUpEvent.keyCode) {
          case dojoKeys.ESCAPE:
            keyUpEvent.preventDefault();
            break;
        }
      },
      _onSaveOver: function (eventObject) {
        this.updateStatusText("🔆 Click to Save Captures");
      },
      _onCopyOver: function (eventObject) {
        this.updateStatusText("🔆 Click to Copy Captures to Clipboard 📋");
      },

      _onAboutClicked: function (eventObject) {
        if (eventObject.altKey) {
          this._interface.hideSettings();
        } else {
          this._interface.showSettings();
        }
      },
      _onAboutOver: function () {
        this.updateStatusText("🔆 Show Control Panel");
      },
      _onMouseOutResetStatusText: function () {
        this.updateStatusText("");
      },
      _onSaveClicked: function (eventObject) {
        let tabbedString = this.getTabSeperatedEntries();
        this.createTabbedDataDownload(tabbedString);
      },
      _onCopyClicked: function (eventObject) {
        let tabbedString = this.getTabSeperatedEntries();
        this.copyToClipboard(tabbedString);
      },
      updateStatusText: function (newText) {
        if (this.uiState !== null && typeof newText === "string") {
          this.uiState.set("UIStatusText", newText);
        }
      },
      //##########################################################################################################
      //Interface Commands Functions Section
      //##########################################################################################################
      makeTableViewDivActive: function () {
        const previewDiv = this._previewDiv;
        const tableDiv = this._tableDiv;
        this.switchViews(previewDiv, tableDiv);
        this._interface.setUIActiveView("tableDiv");
      },
      makePreviewDivActive: function () {
        const previewDiv = this._previewDiv;
        const tableDiv = this._tableDiv;
        this.switchViews(tableDiv, previewDiv);
        this._interface.setUIActiveView("previewDiv");
      },
      //##########################################################################################################
      //UI Update Functions Section
      //##########################################################################################################
      refreshViews: function () {
        /*
         * Refreshes the views based on the UI State
         */
        if (this.uiState != null) {
          //Create references to the divs
          const previewDiv = this._previewDiv;
          const tableDiv = this._tableDiv;
          const noSelectionDiv = this._noSelectionDiv;
          //get the active view, selected captures, and selected capture set from the UI State
          const activeView = this.uiState.get("ActiveView");
          const selectedCaptures = this.uiState.get("selectedCaptures");
          let selectedCaptureSet = this.uiState.get("selectedCaptureSet");
          //If there is a selected capture set and it is in the capture sets list
          //Then show the preview and table div
          //Otherwise hide them and show the no selection div
          if (
            selectedCaptureSet &&
            this.captureSets &&
            this.captureSets[selectedCaptureSet]
          ) {
            domStyle.set(previewDiv, "visibility", "inherit");
            domStyle.set(tableDiv, "visibility", "inherit");
            domStyle.set(noSelectionDiv, "display", "none");
          } else {
            domStyle.set(previewDiv, "visibility", "hidden");
            domStyle.set(tableDiv, "visibility", "hidden");
            domStyle.set(noSelectionDiv, "display", "inline-block");
          }

          //if there are selected captures and the active view is the preview div
          //then show the detail div otherwise hide it
          if (
            Array.isArray(selectedCaptures) &&
            selectedCaptures.length > 0 &&
            activeView === "previewDiv"
          ) {
            domStyle.set(this._detailDiv, "max-height", "50vh");
            domStyle.set(this._detailDiv, "visibility", "inherit");
          } else {
            domStyle.set(this._detailDiv, "max-height", "0");
            domStyle.set(this._detailDiv, "visibility", "hidden");
          }

          //Show and refresh the active View
          if (activeView === "previewDiv") {
            this.switchViews(tableDiv, previewDiv);
            this.updatePreviewViews();
          } else if (activeView === "tableDiv") {
            this.switchViews(previewDiv, tableDiv);
            if (this.MainTable !== null) {
              this.MainTable.refreshUI();
            }
          }
        }
      },
      updateStatusTextView: function () {
        if (this.uiState != null) {
          const showHelpfulHints = this.uiState.get("showHelpfulHints");
          const UIStatusText = this.uiState.get("UIStatusText");
          if (
            UIStatusText === "" ||
            UIStatusText === undefined ||
            showHelpfulHints === false ||
            showHelpfulHints === undefined
          ) {
            domStyle.set(this._statusDiv, "display", "none");
          } else {
            domStyle.set(this._statusDiv, "display", "block");
            this._statusDiv.innerHTML = UIStatusText;
          }
        }
      },
      updatePreviewViews: function () {
        // console.log("👽updatePreviewViews");
        domConstruct.empty(this._previewDiv);
        this.forEachSelectedCapture(
          lang.hitch(this, function (captureID) {
            // console.log("👽updatePreviewViews captureID", captureID);
            let captureView = this.getCaptureView(captureID);

            dojoReady(
              lang.hitch(this, function () {
                domConstruct.place(captureView.domNode, this._previewDiv);
              })
            );
          })
        );
      },

      getCaptureView: function (id) {
        if (!this.CaptureViews[id]) {
          this.CaptureViews[id] = new captureGridView({
            _interfaceKey: this._interfaceKey,
            interfaceCommands: this._interface,
            mainInterface: this,
            captureID: id,
          });
        }
        return this.CaptureViews[id];
      },

      switchViews: function (fadeOutNode, fadeInNode) {
        // Use the fade animation from the dojo/fx module
        const fadeOutAnimation = fx.fadeOut({
          node: fadeOutNode,
          duration: 100,
          onEnd: function () {
            domStyle.set(fadeOutNode, "opacity", 0);
            domStyle.set(fadeOutNode, "visibility", "hidden");
          },
        });
        const fadeInAnimation = fx.fadeIn({
          node: fadeInNode,
          duration: 100,
          onBegin: function () {
            domStyle.set(fadeInNode, "opacity", 0);

            domStyle.set(fadeInNode, "visibility", "inherit");
          },
        });

        // Start the fade animation
        fadeOutAnimation.play();
        fadeInAnimation.play();
      },
      //##########################################################################################################
      //Export and Data Functions Section
      //##########################################################################################################
      getTabSeperatedEntries: function () {
        //todo move this to interface controller
        let csvContent = "Barcode,Note,Date,RecognizedText\n";
        this.forEachSelectedCapture(
          lang.hitch(this, function (captureID) {
            if (captureID) {
              let capture = this._interface
                .getCaptures()
                .getCaptureByID(captureID);
              if (capture && typeof capture.get === "function") {
                const barcode = capture.get("barcode");
                const note = capture.get("note");
                const dateString = capture.get("created");
                const recognizedText = capture.get("recognizedText");
                if (typeof recognizedText === "string") {
                  //todo allow for user to choose delimiter and newline replacement
                  const encodedNote = note
                    .replace(/"/g, '""')
                    .replace(/\r?\n/g, "\n");
                  const encodedRecognizedText = recognizedText
                    .replace(/"/g, '""')
                    .replace(/\r?\n/g, "|");
                  csvContent +=
                    barcode +
                    ',"' +
                    encodedNote +
                    '",' +
                    dateString +
                    ',"' +
                    encodedRecognizedText +
                    '"\n';
                }
              }
            }
          })
        );
        //return tabbedString
        return csvContent;
      },
      forEachSelectedCapture: function (doThis) {
        //todo move this to interface controller
        //and change entries to captures

        if (
          typeof doThis === "function" &&
          this.uiState !== null &&
          this.captureSets !== null &&
          this._interface.availableCaptures !== null &&
          this._interface._Captures !== null
        ) {
          const Captures = this._interface._Captures;
          const selectedCaptureSetID = this.uiState.get("selectedCaptureSet");

          const captureSet = this._interface
            .getCaptureSetsController()
            .getCaptureSetByID(selectedCaptureSetID);
          const showHiddenCaptures = this.uiState.get("showHiddenCaptures");

          if (captureSet) {
            let capturesArray = Object.keys(captureSet).filter(
              (key) =>
                !(
                  key.includes("_watchCallbacks") ||
                  key.includes("filterSettings")
                )
            );

            capturesArray.forEach((key) => {
              let keyInCaptureSet = captureSet.get(key);
              if (
                keyInCaptureSet &&
                keyInCaptureSet === true &&
                Captures.isCaptureSyncing(key)
              ) {
                doThis(key);
              } else {
                // console.log("👽isCaptureSyncing", key);
              }
            });
          }
        }
      },
      createTabbedDataDownload: function (tabbedData) {
        let element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(tabbedData)
        );
        element.setAttribute("download", "Digivigil Data.csv");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      },
      copyToClipboard: function (textToCopy) {
        let node = domConstruct.create("div");
        node.innerHTML = "<pre>" + textToCopy + "</pre>";
        domStyle.set(node, "display", "float");
        domConstruct.place(node, win.body());

        if (window.getSelection) {
          if (window.getSelection().empty) {
            // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {
          // IE?
          document.selection.empty();
        }
        if (window.getSelection) {
          var range = document.createRange();
          range.selectNode(node);
          window.getSelection().addRange(range);
          let text = window.getSelection().toString();
          console.log("Pasted content: ", text);
          document.execCommand("copy");
          alert("Tags Tabbed and copied to clipboard");
        } else {
          alert("Could not copy text!");
        }
        domConstruct.destroy(node);
      },
      copyTextToClipboard: function (textToCopy) {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);

        // Select the text inside the textarea
        textArea.select();

        try {
          // Use the Clipboard API to copy the text to the clipboard
          navigator.clipboard.writeText(textToCopy).then(
            () => {
              console.log("Text copied to clipboard!");
            },
            (err) => {
              console.error("Unable to copy text:", err);
            }
          );
        } catch (err) {
          console.error("Clipboard writeText method not available:", err);
        }

        // Clean up: Remove the temporary textarea from the DOM
        document.body.removeChild(textArea);
      },
      //##########################################################################################################
      //Widget Deconstruction Section
      //##########################################################################################################
      unload: function () {
        if (this.uiStateWatchHandle && this.uiStateWatchHandle.unwatch) {
          this.uiStateWatchHandle.unwatch();
        }

        if (
          this.captureSetsWatchHandle &&
          this.captureSetsWatchHandle.unwatch
        ) {
          this.captureSetsWatchHandle.unwatch();
        }

        if (this.currentCaptureSetWatchHandle !== null) {
          this.currentCaptureSetWatchHandle.unwatch();
          this.currentCaptureSetWatchHandle.remove();
        }

        for (const captureView in this.CaptureViews) {
          this.CaptureViews[captureView].unload();
        }
      },
    }
  );
});
