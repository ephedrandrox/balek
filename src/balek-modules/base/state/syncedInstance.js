/*
Synced Instance:
This is a base class that is used to create a synced state object between an instance and an interface.

It can be extended by a module instance to create a synced state object that can be shared with an interface.

The synced state object can be used to share state between the instance and the interface.

*/

define(["dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful"], function (
  declare,
  lang,
  Stateful
) {
  return declare("moduleBaseStateTransmitter", null, {
    _interfaceState: null,
    _componentStates: {},
    _componentStateInterfaceCallbacks: {},
    _componentStateWatchHandles: {},
    _components: {},
    _componentKey: null,
    /*############################################################################################################
    ############################################################################################################
    Object Construction, Deconstruction and Utility Functions
   */
    constructor: function (args) {
      declare.safeMixin(this, args);
      // console.log("🙀🙀moduleBaseStateTransmitter constructor");
      this._componentStates = {};
      this._componentStateInterfaceCallbacks = {};
      this._componentStateWatchHandles = {};

      let interfaceState = declare([Stateful], {});

      this._interfaceState = new interfaceState({});

      this._interfaceStateWatchHandle = this._interfaceState.watch(
        lang.hitch(this, this.onInterfaceStateChange)
      );
    },

    _end: function () {
      return new Promise(
        lang.hitch(this, function (Resolve, Reject) {
          for (const key in this._componentStateWatchHandles) {
            this._componentStateWatchHandles[key].unwatch();
            this._componentStateWatchHandles[key].remove();
          }
          this._interfaceStateWatchHandle.unwatch();
          this._interfaceStateWatchHandle.remove();
          Resolve({ success: "Unloaded Instance" });
        })
      );
    },
    getUniqueComponentKey: function () {
      let crypto = require("dojo/node!crypto");
      do {
        let id = "CK" + crypto.randomBytes(20).toString("hex");
        if (typeof this._components[id] == "undefined")
          this._components[id] = "Waiting for Object";
        return id;
      } while (true);
    },

    onInterfaceStateChange: function (name, oldState, newState) {
      //overwrite in Interface
      if (this._stateChangeInterfaceCallback) {
        if (newState === undefined) {
          newState = null;
        }
        let interfaceStateObject = { [String(name)]: newState };
        this._stateChangeInterfaceCallback({
          interfaceState: JSON.stringify(interfaceStateObject),
        });
      }
    },
    /*############################################################################################################
   ############################################################################################################
   Extending Module Functions
    */
    //called by extended module instance to initialize the component key and place it in the interface state
    prepareSyncedState: function () {
      if (!this._componentKey) {
        this._componentKey = this.getUniqueComponentKey();
      }
      this._components[this._componentKey] = this;
      this._interfaceState.set("componentKey", this._componentKey);
    },
    /*############################################################################################################
    ############################################################################################################
    Receiving From Interface
     */
    //called by base module instance which can be extended with this module
    receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
      if (moduleMessage.instanceKey == this._instanceKey) {
        if (moduleMessage.messageData) {
          if (moduleMessage.messageData.request) {
            if (moduleMessage.messageData.request === "Component Key") {
              messageCallback({ componentKey: this._componentKey });
            }
            if (
              moduleMessage.messageData.request === "Remote Command" &&
              moduleMessage.messageData.remoteCommanderKey &&
              moduleMessage.messageData.remoteCommand !== undefined &&
              this.routeCommand &&
              typeof this.routeCommand === "function"
            ) {
              this.routeCommand(
                this._instanceKey,
                moduleMessage.messageData.remoteCommanderKey,
                moduleMessage.messageData.remoteCommand,
                messageCallback,
                moduleMessage.messageData.remoteCommandArguments
              );
            }
            if (
              moduleMessage.messageData.request === "State Connect" &&
              moduleMessage.messageData.componentKey
            ) {
              this.connectInterface(
                this._instanceKey,
                moduleMessage.messageData.componentKey,
                messageCallback
              );
            }
            if (
              moduleMessage.messageData.request === "Component State Connect" &&
              moduleMessage.messageData.componentKey
            ) {
              this.connectComponentInterface(
                this._instanceKey,
                moduleMessage.messageData.componentKey,
                moduleMessage.messageData.stateName,
                messageCallback
              );
            }
            if (
              moduleMessage.messageData.request === "Component State Update" &&
              moduleMessage.messageData.componentKey
            ) {
              this.updateComponentInterface(
                this._instanceKey,
                moduleMessage.messageData.componentKey,
                moduleMessage.messageData.stateName,
                moduleMessage.messageData.update
              );
            }
            if (
              moduleMessage.messageData.request === "Component State Default" &&
              moduleMessage.messageData.componentKey
            ) {
              this.updateComponentStateDefaultValue(
                this._instanceKey,
                moduleMessage.messageData.componentKey,
                moduleMessage.messageData.stateName,
                moduleMessage.messageData.default
              );
            }
          }
        }
      } else {
        console.log(
          "received Module message with incorrect instanceKey",
          moduleMessage.instanceKey,
          this._instanceKey
        );
      }
    },
    //called by receiveMessage when sent a state connect from the interface
    connectInterface: function (instanceKey, componentKey, interfaceCallback) {
      //Called By the instance Component when main state connect is received from Interface
      //Checks that the componentKey and interfaceKey matches the component
      //Connects the interfaceCallback to the component State
      if (
        this._components[componentKey] &&
        this._components[componentKey]._instanceKey === instanceKey
      ) {
        this._components[componentKey].setNewInterfaceCallback(
          interfaceCallback
        );
      } else {
        console.log(
          "THe component does not match",
          instanceKey,
          componentKey,
          this._components
        );
      }
    },
    //used in connectInterface to set the main interface callback
    setNewInterfaceCallback: function (newInterfaceCallback) {
      this._stateChangeInterfaceCallback = newInterfaceCallback;
      this._stateChangeInterfaceCallback({
        interfaceState: JSON.stringify(this._interfaceState),
      });
    },
    //used in receiveMessage when sent a component state connect from the interface
    connectComponentInterface: function (
      instanceKey,
      componentKey,
      stateName,
      interfaceCallback
    ) {
      //Called By the instance Component when a named state connect is received from Interface
      //Checks that the componentKey and interfaceKey matches the component
      //Connects the interfaceCallback to the named component State
      if (
        this._components[componentKey] &&
        this._components[componentKey]._instanceKey === instanceKey
      ) {
        this._components[componentKey].setNewComponentInterfaceCallback(
          stateName,
          interfaceCallback
        );
      } else {
        console.log("THe component does not match");
      }
    },
    //used in connectComponentInterface to set the named component interface callback
    setNewComponentInterfaceCallback: function (
      stateName,
      newInterfaceCallback
    ) {
      //if there is no component state, then make one
      if (this._componentStates[stateName] === undefined) {
        let componentState = declare([Stateful], {});
        this._componentStates[stateName] = new componentState({});

        this._componentStates[stateName].set("stateName", stateName);

        this._componentStateWatchHandles[stateName] = this._componentStates[
          stateName
        ].watch(
          lang.hitch(
            this,
            this._componentStateChangeInterfaceCallback,
            stateName
          )
        );
      }
      //Set the Callback that will be used in the _componentStateChangeInterfaceCallback
      this._componentStateInterfaceCallbacks[stateName] = newInterfaceCallback;
      newInterfaceCallback({
        componentState: JSON.stringify(this._componentStates[stateName]),
      });
    },
    //used in setNewComponentInterfaceCallback to send the new state to the interface
    _componentStateChangeInterfaceCallback: function (
      stateName,
      name,
      oldState,
      newState
    ) {
      // Called when a component state changes
      let interfaceCallback = this._componentStateInterfaceCallbacks[stateName];
      //Ensure the interfaceCallback is a function
      //and use it to send the new state to the interface
      if (interfaceCallback && typeof interfaceCallback === "function") {
        let interfaceStateObject = { [String(name)]: newState };
        interfaceCallback({
          componentState: JSON.stringify(interfaceStateObject),
        });
      }
    },
    //used in receiveMessage when sent a component state update from the interface
    updateComponentInterface: function (
      instanceKey,
      componentKey,
      stateName,
      stateUpdate
    ) {
      if (this._components[componentKey]) {
        let component = this._components[componentKey];
        if (component._componentStates[stateName] !== undefined) {
          component._componentStates[stateName].set(
            stateUpdate.name,
            stateUpdate.state
          );
        }
      }
    },
    //used in receiveMessage when sent a component state default value from the interface
    updateComponentStateDefaultValue: function (
      instanceKey,
      componentKey,
      stateName,
      stateUpdate
    ) {
      if (this._components[componentKey]) {
        let component = this._components[componentKey];
        if (component._componentStates[stateName] !== undefined) {
          if (
            component._componentStates[stateName].get(stateUpdate.name) ===
            undefined
          ) {
            component._componentStates[stateName].set(
              stateUpdate.name,
              stateUpdate.state
            );
          }
        } else {
          let componentState = declare([Stateful], {});
          component._componentStates[stateName] = new componentState({});
          component._componentStates[stateName].set(
            stateUpdate.name,
            stateUpdate.state
          );
        }
      }
    },
  });
});
