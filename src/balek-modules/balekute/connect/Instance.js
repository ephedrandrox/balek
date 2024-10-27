define([
  //Dojo Base
  "dojo/_base/declare",
  "dojo/_base/lang",
  //Balek Module Instances
  "balek-modules/balekute/connect/Instance/main",
  "balek-server/session/sessionsController/instanceCommands",
  //Balek Util
  "balek-modules/components/syncedCommander/Instance",
  "balek-modules/components/syncedMap/Instance",
], function (
  //Dojo Base
  declare,
  lang,
  //Balek Module Instances
  MainInstance,
  SessionsControllerInstanceCommands,
  //Balek Util
  _SyncedCommanderInstance,
  SyncedMapInstance
) {
  return declare("moduleBalekuteConnectInstance", _SyncedCommanderInstance, {
    _instanceKey: null,
    //Main Instance
    mainInstance: null,
    //state watchers
    stateWatchers: null,
    //sessions Controller Commands
    sessionsControllerCommands: null,
    //Available Invitations SyncedMap
    availableInvitations: null,
    constructor: function (args) {
      //Merge the arguments, get the sessions controller commands initialize the state watchers object
      declare.safeMixin(this, args);
      let sessionsControllerInstanceCommands =
        new SessionsControllerInstanceCommands();
      this.sessionsControllerCommands =
        sessionsControllerInstanceCommands.getCommands();
      this.stateWatchers = {};
      //set setRemoteCommander commands
      this._commands = {
        useTargetKey: lang.hitch(this, this.useTargetKey),
        acceptDeviceInfo: lang.hitch(this, this.acceptDeviceInfo),
        useInvitationKey: lang.hitch(this, this.useInvitationKey),
        createInvitationKey: lang.hitch(this, this.createInvitationKey),
        connectInvitationState: lang.hitch(this, this.connectInvitationState),
        useOwnerClaimKey: lang.hitch(this, this.useOwnerClaimKey),
        authenticateSessionForDeviceUser: lang.hitch(
          this,
          this.authenticateSessionForDeviceUser
        ),
      };
      //Create the Available Invitations SyncedMap
      this.availableInvitations = new SyncedMapInstance({
        _instanceKey: this._instanceKey,
        _commonName: "Available Invitations",
      });
      //Send the Component Key to the interface via state
      this._interfaceState.set(
        "availableInvitationsComponentKey",
        this.availableInvitations._componentKey
      );
      //Set the Component Name
      this._interfaceState.set("Component Name", "Connect");
      //creates component Key that can be used to connect to state
      this.setInterfaceCommands();
      //initialize the synced state
      this.prepareSyncedState();
      //Set the status to ready
      this._interfaceState.set("Status", "Ready");
      //Create the main instance
      this.mainInstance = new MainInstance({
        _instanceKey: this._instanceKey,
        _sessionKey: this._sessionKey,
        _userKey: this._userKey,
        _connectController: this.moduleController,
      });
      //Send the main instance keys to the interface
      this._interfaceState.set("mainInstanceKeys", {
        instanceKey: this.mainInstance._instanceKey,
        sessionKey: this.mainInstance._sessionKey,
        userKey: this.mainInstance._userKey,
        componentKey: this.mainInstance._componentKey,
      });
      //Find Owner Device or create an invitation to set one
      this.moduleController
        .loadOrCreateOwnerDeviceInvitation()
        .then(
          lang.hitch(this, function (Result) {
            if (Result) {
              if (Result.ownerClaimKey) {
                // console.log("📱 No Owner Device")
              } else if (Result.ownerPublicKey) {
                // console.log("📱 Owner Device Public Key:", Result.ownerPublicKey)
              } else {
                // console.log("unexpected Result", Result)
              }
            }
          })
        )
        .catch(function (rejectError) {
          // console.log("🎃🎃🎃", rejectError);
        });
    },
    /* #############################################################################################################
    # Remote Commands
    #############################################################################################################*/
    acceptDeviceInfo: function (invitationKey, remoteCallback) {
      //Remote command to be called from a user signed in session
      //Accepts the device info for the invitation key after device user accepts the invitation

      let userKey = this.sessionsControllerCommands.getSessionUserKey(
        this._sessionKey
      );
      if (userKey != null) {
        this._userKey = userKey;
        this.moduleController
          .userAcceptDeviceInfo({
            owner: {
              instanceKey: this._instanceKey,
              sessionKey: this._sessionKey,
              userKey: this._userKey,
            },
            invitationKey: invitationKey,
          })
          .then(
            lang.hitch(this, function (Result) {
              remoteCallback({ Result: Result });
              if (Result && Result.newKey) {
                let newInvitationKey = Result.newKey;
                console.log(
                  "Adding invitation to available list with key:",
                  newInvitationKey
                );

                let newInvitation =
                  this.moduleController.getInvitationState(newInvitationKey);
                console.log("Adding invitation:", newInvitation);

                this.availableInvitations.add(newInvitationKey, newInvitation);
              }
            })
          )
          .catch(function (rejectError) {
            remoteCallback({ error: rejectError });
          });
      } else {
        remoteCallback({ error: "Cannot create Invitation without user Key" });
      }
    },
    useTargetKey: function (targetKey, signature, deviceInfo, remoteCallback) {
      // Remote command to be called from a device to activate a target key
      // Claims a session for the device user linked to the target key
      if (
        typeof targetKey === "string" &&
        typeof signature === "string" &&
        typeof deviceInfo === "object" &&
        typeof remoteCallback === "function"
      ) {
        this.moduleController
          .useTargetKey(targetKey, signature, deviceInfo)
          .then(
            lang.hitch(this, function (Result) {
              console.log("🎯Target Key Authorized");
              remoteCallback({ Result: Result });
            })
          )
          .catch(function (rejectError) {
            remoteCallback({ error: rejectError });
          });
      } else {
        console.log(
          "❗️Unexpected Arguments! useTargetKey: function( targetKey, signature, deviceInfo, remoteCallback)‼️",
          arguments
        );
      }
    },
    useInvitationKey: function (invitationKey, deviceInfo, remoteCallback) {
      console.log("useInvitationKey", invitationKey, deviceInfo, arguments);
      // Remote command to be called from a device to identify itself
      // Using an invitation key that has been created by the owner
      if (
        typeof invitationKey === "string" &&
        typeof deviceInfo === "object" &&
        typeof remoteCallback === "function"
      ) {
        this.moduleController
          .useInvitationKey(invitationKey, deviceInfo)
          .then(
            lang.hitch(this, function (Result) {
              console.log("this.moduleController.useInvitationKey", Result);
              remoteCallback({ Result: Result });
            })
          )
          .catch(function (rejectError) {
            remoteCallback({ error: rejectError });
          });
      } else {
        console.log(
          "❗️Unexpected Arguments! useInvitationKey: function( invitationKey, hostname, publicSigningKey, remoteCallback)‼️",
          arguments
        );
      }
    },
    createInvitationKey: function (input, remoteCallback) {
      // To be called by an owner claimed session to create an invitation key
      // Which is used to set a device for a user
      let invitationHost = input;
      let userKey = this.sessionsControllerCommands.getSessionUserKey(
        this._sessionKey
      );
      // topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function (userKey) {
      if (userKey != null) {
        this._userKey = userKey;
        console.log("createInvitationKey - UserKey", userKey);

        this.moduleController
          .createInvitation({
            owner: {
              instanceKey: this._instanceKey,
              sessionKey: this._sessionKey,
              userKey: this._userKey,
            },
            host: invitationHost,
          })
          .then(
            lang.hitch(this, function (Result) {
              remoteCallback({ Result: Result });
              if (Result && Result.newKey) {
                let newInvitationKey = Result.newKey;
                console.log(
                  "Adding invitation to available list with key:",
                  newInvitationKey
                );

                let newInvitation =
                  this.moduleController.getInvitationState(newInvitationKey);
                console.log("Adding invitation:", newInvitation);

                this.availableInvitations.add(newInvitationKey, newInvitation);
              }
            })
          )
          .catch(function (rejectError) {
            remoteCallback({ error: { caught: rejectError } });
          });
      } else {
        remoteCallback({ error: "Cannot create Invitation without user Key" });
      }

      ///  }));
    },
    connectInvitationState: function (invitationKey, remoteCallback) {
      // Fetches the status of an invitation key using the key
      let invitationState =
        this.moduleController.getInvitationState(invitationKey);
      if (invitationState && typeof invitationState.watch === "function") {
        //Send state that already exists
        Object.entries(invitationState).forEach(function (entry) {
          const key = entry[0];
          const value = entry[1];
          if (typeof value !== "function") {
            remoteCallback({ name: key, newState: value });
          }
        });
        //Only allows for one watcher per invitation key
        //Interface only needs it relayed once
        if (!this.stateWatchers[invitationKey]) {
          this.stateWatchers[invitationKey] = invitationState.watch(
            lang.hitch(this, function (name, oldState, newState) {
              remoteCallback({
                name: name,
                oldState: oldState,
                newState: newState,
              });
            })
          );
        } else {
          this.stateWatchers[invitationKey].unwatch();
          this.stateWatchers[invitationKey] = invitationState.watch(
            lang.hitch(this, function (name, oldState, newState) {
              remoteCallback({
                name: name,
                oldState: oldState,
                newState: newState,
              });
            })
          );
        }
      } else {
        remoteCallback({ Error: "wrong type", type: typeof invitationState });
      }
    },
    useOwnerClaimKey: function (ownerClaimKey, deviceInfo, remoteCallback) {
      console.log("useOwnerClaimKey", ownerClaimKey, deviceInfo, arguments);
      // Remote Command to set a device as the owner device
      // Uses the owner claim key that only exists until the Balek installation is claimed.
      if (
        typeof ownerClaimKey === "string" &&
        typeof deviceInfo === "object" &&
        typeof remoteCallback === "function"
      ) {
        console.log("this.moduleController.useOwnerClaimKey");

        this.moduleController
          .useOwnerClaimKey(ownerClaimKey, deviceInfo)
          .then(
            lang.hitch(this, function (Result) {
              console.log("this.moduleController.useOwnerClaimKey", Result);
              remoteCallback({ Result: Result });
            })
          )
          .catch(function (rejectError) {
            console.log(
              "this.moduleController.useOwnerClaimKey ERROR",
              rejectError
            );

            remoteCallback({ error: rejectError });
          });
      } else {
        console.log(
          "❗️Unexpected Arguments! useAdminSetKey: function( ownerClaimKey, deviceInfo, remoteCallback)‼️",
          arguments
        );
      }
    },
    authenticateSessionForDeviceUser: function (
      timeSignedProof,
      deviceInfo,
      remoteCallback
    ) {
      if (
        typeof timeSignedProof === "object" &&
        typeof deviceInfo === "object" &&
        typeof remoteCallback === "function"
      ) {
        this.moduleController
          .authenticateSessionForDeviceUser(
            timeSignedProof,
            deviceInfo,
            this._sessionKey
          )
          .then(
            lang.hitch(this, function (Result) {
              // console.log("Connect Instance: this.moduleController.authenticateSessionForDeviceUser",Result)
              console.log(
                `📱 ${deviceInfo.hostname} authenticated with public key: \n 🔑${deviceInfo.publicSigningKey}🔑`
              );
              remoteCallback({ Result: Result });
            })
          )
          .catch(function (rejectError) {
            console.log(
              "Connect Instance Error: this.moduleController.authenticateSessionForDeviceUser",
              rejectError
            );
            console.log(`node util/database/addDevice.js \\
    UserName=Owner \\
    PublicKey="${deviceInfo.publicSigningKey
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/\n/g, "\\n") // Replace newlines with \n
      .replace(/"/g, '\\"')}" \\
            KeychainIdentifier=${deviceInfo.keychainIdentifier} \\
    Signature=${deviceInfo.signature} \\
    Name=${deviceInfo.name} \\
    OSName=${deviceInfo.osName} \\
    Hostname=${deviceInfo.hostname}`);
            remoteCallback({ Error: rejectError });
          });
      } else {
        console.log(
          "❗️Unexpected Arguments! authenticateSessionForDeviceUser: function( timeSignedProof, deviceInfo, remoteCallback)‼️",
          arguments
        );
        remoteCallback({ Error: "Unexpected Arguments" });
      }
    },
    _end: function () {
      return new Promise(
        lang.hitch(this, function (Resolve, Reject) {
          // console.log("destroying balekute connect Module Interface ");

          Resolve({ success: "Unloaded Instance" });
        })
      );
    },
  });
});
