define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "balek-modules/Instance",
  "balek-modules/base/state/syncedInstance",
  "balek-modules/base/command/remote",
], function (declare, lang, baseInstance, stateSyncer, remoteCommander) {
  return declare(
    "moduleBaseSyncedStreamInstance",
    [baseInstance, stateSyncer, remoteCommander],
    {
      _instanceKey: null,
      _sessionKey: null,

      outputArray: null,

      constructor: function (args) {
        declare.safeMixin(this, args);

        console.log("moduleBaseSyncedStreamInstance starting...");
        this.outputArray = [];

        this._commands = {
          preloadChunks: lang.hitch(this, this.preloadChunksForInterface),
        };
        this.setInterfaceCommands();
        this.prepareSyncedState();

        this._interfaceState.set("Module", "moduleBaseSyncedStreamInstance");
      },
      appendOutput: function (outputToAppend) {
        let newLength = this.outputArray.push(outputToAppend);
        this.sendOutputChunk(newLength - 1);
      },
      preloadChunksForInterface: function (preloadDepth, returnCallback) {
        let maxLength = this.outputArray.length;

        let preloadStart = maxLength - 1 - preloadDepth;
        let preloadEnd = maxLength - 1;

        preloadStart = preloadStart < 0 ? 0 : preloadStart;

        let outputToReturn = {};
        for (let i = preloadStart; i <= preloadEnd; i++) {
          outputToReturn[i] = this.outputArray[i];
        }
        returnCallback({
          streamSize: this.outputArray.length,
          preloadChunks: outputToReturn,
        });
      },
      sendOutputChunk: function (position = null) {
        if (position === null) {
        } else if (this.outputArray[position] !== undefined) {
          this._interfaceState.set("streamChunk", {
            streamSize: this.outputArray.length,
            position: position,
            data: this.outputArray[position],
          });
        }
      },
    }
  );
});
