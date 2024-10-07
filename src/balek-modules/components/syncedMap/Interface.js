define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/aspect",
  "balek-modules/Interface",
  "balek-modules/base/state/syncedInterface",
  "balek-modules/base/command/remote",
], function (
  declare,
  lang,
  aspect,
  baseInterface,
  stateSyncer,
  remoteCommander
) {
  return declare(
    "moduleBaseSyncedMapInterface",
    [baseInterface, stateSyncer, remoteCommander],
    {
      _instanceKey: null,
      _objects: null,
      _stateWatchers: null,
      /*###################################################################################################
        ##### Internal Functions
        ###################################################################################################*/
      constructor: function (args) {
        declare.safeMixin(this, args);

        this._stateWatchers = [];
        this._objects = {};

        if (!this._componentKey) {
          this.sendInstanceCallbackMessage(
            {
              request: "Component Key",
            },
            lang.hitch(this, function (requestResults) {
              this._componentKey = requestResults.componentKey;
              this.askToConnectInterface();
            })
          );
        } else {
          this.askToConnectInterface();
        }
      },
      onInterfaceStateChange: function (name, oldState, newState) {
        if (name !== "componentKey" && name !== "Module") {
          //Got a mapped Item from unreserved name
          this._objects[name.toString()] = newState;
          this.onStateMapUpdate(name.toString(), oldState, newState);
        }
      },
      onStateMapUpdate: function (name, oldState, newState) {
        // placeholder that is called to trigger other watchers
      },
      /*###################################################################################################
        ##### Public Functions
        ###################################################################################################*/
      setStateWatcher: function (stateWatcher) {
        //This function is used to set a watcher on the state of the syncedMap
        //returns a handle that can be used to remove the watcher
        //to use the handle to remove the watcher use aspect.remove(handle)
        //or handle.remove()

        //Send current state to the new watcher
        for (objectIndex in this._objects) {
          stateWatcher(objectIndex, undefined, this._objects[objectIndex]);
        }
        let stateWatcherHandle = aspect.after(
          this,
          "onStateMapUpdate",
          stateWatcher,
          true
        );
        return stateWatcherHandle;
      },
      forEach: function (forEachFunction) {
        //This function is used to iterate over the objects in the syncedMap
        //The forEachFunction is called for each object in the syncedMap
        // passing in the key and the object
        if (typeof forEachFunction === "function") {
          for (objectIndex in this._objects) {
            if (
              this._objects[objectIndex] !== null &&
              objectIndex !== "_attrPairNames" &&
              objectIndex !== "declaredClass"
            ) {
              forEachFunction(objectIndex, this._objects[objectIndex]);
            }
          }
        }
      },
      get: function (key) {
        //This function is used to get an object from the syncedMap
        //If no key is passed in it will return the entire syncedMap object
        if (key) {
          return this._objects[key.toString()];
        } else {
          return this._objects;
        }
      },
    }
  );
});
