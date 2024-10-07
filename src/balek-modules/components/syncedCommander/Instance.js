define([
  "dojo/_base/declare",
  "balek-modules/Instance",
  "balek-modules/base/state/syncedInstance",
  "balek-modules/base/command/remote",
], function (declare, baseInstance, stateSyncer, remoteCommander) {
  return declare(
    "moduleBaseSyncedCommanderInstance",
    [baseInstance, stateSyncer, remoteCommander],
    {
      _instanceKey: null,
      _sessionKey: null,

      constructor: function (args) {
        declare.safeMixin(this, args);

        // console.log("moduleBaseSyncedCommanderInstance starting...");

        this.prepareSyncedState();
      },
    }
  );
});
