/*
Synced Instance:
This is a base class that is used to create a synced state object between an instance and an interface.


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

    constructor: function (args) {
      declare.safeMixin(this, args);
      console.log("🙀🙀moduleBaseStateTransmitter constructor");
      this._componentStates = {};
      this._componentStateInterfaceCallbacks = {};
      this._componentStateWatchHandles = {};

      let interfaceState = declare([Stateful], {});

      this._interfaceState = new interfaceState({});

      this._interfaceStateWatchHandle = this._interfaceState.watch(
        lang.hitch(this, this.onInterfaceStateChange)
      );
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
    // askToConnectInterface: function () {
    //   this.sendInstanceCallbackMessage(
    //     {
    //       request: "State Connect",
    //       componentKey: this._componentKey,
    //     },
    //     lang.hitch(this, this._InstanceStateChangeCallback)
    //   );
    // },
    // askToConnectComponent: function (stateName) {
    //   this.sendInstanceCallbackMessage(
    //     {
    //       request: "Component State Connect",
    //       stateName: stateName,
    //       componentKey: this._componentKey,
    //     },
    //     lang.hitch(this, this._ComponentStateChangeCallback, stateName)
    //   );
    // },
    // _ComponentStateChangeCallback: function (stateName, stateChangeUpdate) {
    //   let componentState = JSON.parse(stateChangeUpdate.componentState);
    //
    //   /* for (const [key, value] of Object.entries(componentState)) {
    //                 this._componentStates[stateName].set(key, value);
    //             }
    //             */
    //   for (const key in componentState) {
    //     this._componentStates[stateName].set(key, componentState[key]);
    //   }
    // },
    getComponentKey: function () {
      return this._componentKey;
    },
    // getComponentState: function (stateName) {
    //   return new Promise(
    //     lang.hitch(this, function (Resolve, Reject) {
    //       if (stateName) {
    //         if (this._componentStates[stateName] !== undefined) {
    //           Resolve(this._componentStates[stateName]);
    //         } else {
    //           let componentState = declare([Stateful], {});
    //           this._componentStates[stateName] = new componentState({});
    //           Resolve(this._componentStates[stateName]);
    //           this.askToConnectComponent(stateName);
    //         }
    //       } else {
    //         Resolve(this._interfaceState);
    //       }
    //     })
    //   );
    // },
    prepareSyncedState: function () {
      if (!this._componentKey) {
        this._componentKey = this.getUniqueComponentKey();
      }
      this._components[this._componentKey] = this;
      this._interfaceState.set("componentKey", this._componentKey);
    },
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
    setNewInterfaceCallback: function (newInterfaceCallback) {
      this._stateChangeInterfaceCallback = newInterfaceCallback;
      this._stateChangeInterfaceCallback({
        interfaceState: JSON.stringify(this._interfaceState),
      });
    },
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
    // _InstanceStateChangeCallback(stateChangeUpdate) {
    //   if (stateChangeUpdate.interfaceState) {
    //     let interfaceState = JSON.parse(stateChangeUpdate.interfaceState);
    //
    //     for (const name in interfaceState) {
    //       this._interfaceState.set(name, interfaceState[name]);
    //     }
    //   }
    // },

    _componentStateSet: function (stateName, objectName, object) {
      this.sendInstanceMessage({
        request: "Component State Update",
        stateName: stateName,
        componentKey: this._componentKey,
        update: { name: objectName, state: object },
      });
    },
    _componentDefaultStateSet: function (stateName, objectName, object) {
      this.sendInstanceMessage({
        request: "Component State Default",
        stateName: stateName,
        componentKey: this._componentKey,
        default: { name: objectName, state: object },
      });
    },
    updateComponentInterface: function (
      instanceKey,
      componentKey,
      stateName,
      stateUpdate
    ) {
      //this is hwere I should be starting
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
    updateComponentStateDefaultValue: function (
      instanceKey,
      componentKey,
      stateName,
      stateUpdate
    ) {
      //this is hwere I should be starting
      // console.log(stateUpdate.name, stateUpdate.state);

      if (this._components[componentKey]) {
        let component = this._components[componentKey];
        if (component._componentStates[stateName] !== undefined) {
          if (
            component._componentStates[stateName].get(stateUpdate.name) ===
            undefined
          ) {
            //console.log(stateUpdate.name, stateUpdate.state);
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

    _end: function () {
      return new Promise(
        lang.hitch(this, function (Resolve, Reject) {
          // console.log("destroying Interface State Watch handles");
          //todo _componentStateWatchHandles get rid of all of these
          /*   for (const [key, value] of Object.entries(this._componentStateWatchHandles)) {
                        this._componentStateWatchHandles[key].unwatch();
                        this._componentStateWatchHandles[key].remove();
                    }
*/
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
    unload: function () {
      console.log("destroying Interface State Watch handles");
      //_componentStateWatchHandles get rid of all of these
      for (const key in this._componentStateWatchHandles) {
        this._componentStateWatchHandles[key].unwatch();
        this._componentStateWatchHandles[key].remove();
      }

      this._interfaceStateWatchHandle.unwatch();
      this._interfaceStateWatchHandle.remove();
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
    getComponentInterface(componentKey) {
      return this._components[componentKey];
    },
  });
});
