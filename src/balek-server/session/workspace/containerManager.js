define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',
        'balek-server/session/workspace/container/container',
    ],
    function (declare, lang, topic, crypto, balekWorkspaceContainer  ) {

        return declare( "balekServerWorkspaceManagerContainerManager",null, {
            _containers: null,



            constructor: function (args) {


                declare.safeMixin(this, args);

                console.log("Initializing Balek Workspace Manager Container Manager server...");
                this._activeWorkspace = null;
                this._containers = {};

            },
            getUniqueContainerKey: function()
            {
                do{
                    var id = "WC"+ crypto.randomBytes(20).toString('hex');
                    if(typeof this._containers[id]== "undefined") return id;
                }while(true);

            },
            getContainer: function(containerKey)
            {
                //debugger;
                if(this._containers[String(containerKey)] === undefined)
                {
                  //  debugger;

                    this._containers[String(containerKey)] = {}


                }else if(this._containers[String(containerKey)]){
                  //  debugger;

                }
                return this._containers[String(containerKey)]
            },
            newContainer: function(instanceKey, componentKey, containerWidgetPath=null){
                let newContainerKey = this.getUniqueContainerKey();

                this._containers[newContainerKey] = new balekWorkspaceContainer({_instanceKey: instanceKey,
                                                        _componentKey: componentKey,
                                                        _containerKey: newContainerKey,
                                                        _containerWidgetPath: containerWidgetPath,
                                                        containerManager: this}  );

             //   debugger;

                return newContainerKey;

                //todo this creates the container which finds its way to the
            },
            connectWorkspaceContainerInterface: function(connectWorkspaceContainerInterfaceMessage, messageReplyCallback) {

                if(connectWorkspaceContainerInterfaceMessage.containerKey)
                {
                    if(this._containers[connectWorkspaceContainerInterfaceMessage.containerKey])
                    {
                    //    console.log(this._containers,this._containers[connectWorkspaceContainerInterfaceMessage.containerKey], connectWorkspaceContainerInterfaceMessage);
                        this._containers[connectWorkspaceContainerInterfaceMessage.containerKey].connectWorkspaceContainerInterface(messageReplyCallback);
                    }else
                    {
                        messageReplyCallback({error: "Server Session Workspace: not a valid container key when connecting Workspace Container State" + connectWorkspaceContainerInterfaceMessage.containerKey,
                            containerKey: connectWorkspaceContainerInterfaceMessage.containerKey});

                    }
                }else
                {
                    messageReplyCallback({error: "connectWorkspaceInterface Message did not contain a workspace Key"});
                }

            },
            receiveWorkspaceContainerInterfaceMessage: function(workspaceContainerInterfaceMessage, messageReplyCallback)
            {

                if(workspaceContainerInterfaceMessage.containerKey && this._containers[String(workspaceContainerInterfaceMessage.containerKey)] !== undefined)
                {
                    this._containers[String(workspaceContainerInterfaceMessage.containerKey)].receiveWorkspaceContainerInterfaceMessage(workspaceContainerInterfaceMessage, messageReplyCallback);
                }
            }

        });
    });