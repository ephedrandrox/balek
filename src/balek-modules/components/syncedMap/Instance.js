define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "balek-modules/Instance",
  "balek-modules/base/state/syncedInstance",
  "balek-modules/base/command/remote",
], function (declare, lang, baseInstance, stateSyncer, remoteCommander) {
  return declare(
    "moduleBaseSyncedMapInstance",
    [baseInstance, stateSyncer, remoteCommander],
    {
      _instanceKey: null,
      _sessionKey: null,

      _commonName: "SyncedMap",

      _relayStateWatchHandle: null,
      constructor: function (args) {
        declare.safeMixin(this, args);
        console.log(
          `🧑‍🎤 - ${this._commonName} moduleBaseSyncedMapInstance starting...`
        );
        this.prepareSyncedState();
        this._interfaceState.set("Module", "moduleBaseSyncedMapInstance");
      },
      add: function (key, value) {
        this._interfaceState.set(key.toString(), value);
      },
      remove: function (key) {
        this._interfaceState.set(key.toString(), undefined);
      },
      getState: function () {
        return this._interfaceState;
      },
      relayState: function (state) {
        for (const key in state) {
          let value = state[key];
          if (
            typeof value !== "function" &&
            key != "_attrPairNames" &&
            key != "declaredClass"
          ) {
            //   console.log("adding objects from  State", key, value)
            this.add(key, value);
          }
        }
        this._relayStateWatchHandle = state.watch(
          lang.hitch(this, this.onRelayStateChange)
        );
      },
      onRelayStateChange: function (name, oldState, newState) {
        if (newState === undefined) {
          this.remove(name);
          // console.log("remove",name, oldState, newState)
        } else {
          this.add(name, newState);
        }
      },
      forEach: function (doThis) {
        console.log("forEach");

        if (typeof doThis === "function") {
          for (const key in this._interfaceState) {
            let value = this._interfaceState.get(key);
            console.log("forEach", value, typeof value);

            if (
              typeof value === "object" &&
              key !== "_attrPairNames" &&
              key !== "componentKey" &&
              key !== "Module"
            ) {
              console.log("SyncedMap Instance foreach doing", key, value);
              doThis(key, value);
            }
          }
        }
      },
    }
  );
});
