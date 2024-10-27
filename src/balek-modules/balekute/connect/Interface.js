/*
 * Balek Connect Interface
 * Keeps a syncedMap of available invitations
 * Creates an Invitation Interface for each available invitation
 * Creates a Main Interface
 * Adds the Main Interface to a static workspace container
 *
 */

define([
  //Dojo Base
  "dojo/_base/declare",
  "dojo/_base/lang",
  //Balek Module Interfaces
  "balek-modules/balekute/connect/Interface/main",
  "balek-modules/balekute/connect/Interface/invitation",
  //Balek Workspace Interface
  "balek-client/session/workspace/workspaceManagerInterfaceCommands",
  "balek-modules/components/syncedCommander/Interface",
  "balek-modules/components/syncedMap/Interface",
], function (
  //Dojo Base
  declare,
  lang,
  //Balek Module Interfaces
  MainInterface,
  InvitationInterface,
  //Balek Workspace Interface
  balekWorkspaceManagerInterfaceCommands,
  _SyncedCommanderInterface,
  SyncedMapInterface
) {
  return declare("moduleBalekuteConnectInterface", _SyncedCommanderInterface, {
    _instanceKey: null,
    _mainInterface: null,
    //Workspace Manager Commands
    workspaceManagerCommands: null,
    //Available Invitations SyncedMap
    availableInvitations: null,
    availableInvitationsWatchHandle: null,
    //Invitations and their Interfaces
    invitationInterfaces: null,
    invitations: null,

    constructor: function (args) {
      // Create the invitationInterfaces and invitations objects
      this.invitationInterfaces = {};
      this.invitations = {};
      //Merge the arguments and get the workspace commands
      declare.safeMixin(this, args);
      let workspaceManagerInterfaceCommands =
        new balekWorkspaceManagerInterfaceCommands();
      this.workspaceManagerCommands =
        workspaceManagerInterfaceCommands.getCommands();
    },
    onInterfaceStateChange: function (name, oldState, newState) {
      //this has to be here so remoteCommander works
      this.inherited(arguments);

      if (name === "Status" && newState === "Ready") {
        //we could do something based on status here
      } else if (name === "availableInvitationsComponentKey") {
        //Got Component Key for availableInvitations
        //Set up the availableInvitations SyncedMap
        if (
          this.availableInvitations === null &&
          newState !== null &&
          newState !== undefined &&
          typeof newState.toString === "function"
        ) {
          this.availableInvitations = new SyncedMapInterface({
            _instanceKey: this._instanceKey,
            _componentKey: newState.toString(),
          });
          this.availableInvitationsWatchHandle =
            this.availableInvitations.setStateWatcher(
              lang.hitch(this, this.onAvailableInvitationsStateChange)
            );
        }
      } else if (name === "mainInstanceKeys") {
        //Got the mainInstanceKeys
        //Create the Main Interface
        if (this._mainInterface === null) {
          this._mainInterface = new MainInterface({
            _instanceKey: newState.instanceKey,
            _sessionKey: newState.sessionKey,
            _componentKey: newState.componentKey,
            _interface: this,
          });
          // add the mainInterface to a static workspace container
          this._mainInterface
            .getContainerKeys()
            .then(
              lang.hitch(this, function (containerKeys) {
                //         console.log(containerKeys, typeof containerKeys );
                if (
                  Array.isArray(containerKeys) &&
                  containerKeys.length === 0
                ) {
                  let workspaceContainerWidgetPath =
                    "balek-client/session/workspace/container/widgets/static/staticContainerWidget";
                  let activeWorkspaceKey = this.workspaceManagerCommands
                    .getActiveWorkspace()
                    .getWorkspaceKey();
                  this.workspaceManagerCommands
                    .addToWorkspaceContainer(
                      this._mainInterface,
                      workspaceContainerWidgetPath
                    )
                    .then(
                      lang.hitch(this, function (workspaceContainerKey) {
                        this.workspaceManagerCommands
                          .addContainerToWorkspace(
                            workspaceContainerKey,
                            activeWorkspaceKey
                          )
                          .then(
                            lang.hitch(
                              this,
                              function (addContainerToWorkspaceResponse) {
                                // console.log("Container added to workspace", addContainerToWorkspaceResponse);
                              }
                            )
                          )
                          .catch(
                            lang.hitch(this, function (error) {
                              //  console.log("Error adding container to workspace", error);
                            })
                          );
                      })
                    )
                    .catch(lang.hitch(this, function (error) {}));
                }
              })
            )
            .catch(
              lang.hitch(this, function (error) {
                console.log(error);
              })
            );
        }
      }
    },
    onAvailableInvitationsStateChange: function (name, oldState, newState) {
      if (!this.invitations[name.toString()] && newState !== undefined) {
        let newInvitation = new InvitationInterface({
          invitationKey: name.toString(),
          connectInterface: this,
        });
        this.invitations[name.toString()] = newInvitation;
        if (this._mainInterface) {
          //Todo: add the new invitation to the main interface
          //this._mainInterface.onNewInvitation(newInvitation);
        }
      }
    },
    unload: function () {},
  });
});
