/* Balek Module Component Synced Commander
This extends the Base Module Instance with the Synced State and Remote Command Base Modules

When a module is created with this instance, it will have the ability to sync its state with the interface
and allow the interface to use remote commands.

See the Base Module Instance, Synced State, and Remote Command Base Modules for more information.
*/

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
        this.prepareSyncedState();
      },
    }
  );
});
