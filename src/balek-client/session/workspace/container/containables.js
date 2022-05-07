define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',


    ],
    function (declare, lang, topic, Stateful  ) {

        return declare( "balekClientWorkspaceManagerContainerManagerContainables",null, {
            _containers: null,
            _sessionKey: null,


            _shared: {},

            constructor: function (args) {


                declare.safeMixin(this, args);

                   if(this._shared.containableInterfacesStates === undefined)
                   {
                       this._shared.containableInterfacesStates = {};
                   }

                if(this._shared._containableInterfacesState === undefined)
                {
                    let containableInterfacesState = declare([Stateful], {

                    });
                    this._shared._containableInterfacesState = new containableInterfacesState({

                    });
                }





                console.log("Initializing Balek Workspace Manager Container Manager Containables Client...");



            },
            getContainableInterfaceState: function(componentKey){
            //    console.log("getContainableInterfaceState", componentKey);
                if(this._shared.containableInterfacesStates[String(componentKey)] === undefined)
                {

                    this._shared.containableInterfacesStates[String(componentKey)] = this.createContainableState(componentKey);
                }

                return this._shared.containableInterfacesStates[String(componentKey)];
            },
            createContainableState: function(componentKey)
            {
                let containableInterfaceState = declare([Stateful], {

                });

              return  new containableInterfaceState({
                    componentKey: componentKey
                });
            }
            ,
            initializeContainable: function(containableInterface){
                if(containableInterface._instanceKey && containableInterface._componentKey)
                {
                    let componentContainable = this._shared._containableInterfacesState.get(String(containableInterface._componentKey));
                    if(componentContainable === undefined)
                    {
                     //   console.log("getContainableInterfaceState", containableInterface._componentKey);

                        let containableInterfaceState = this.getContainableInterfaceState(containableInterface._componentKey);
                        containableInterfaceState.set("interfaceObject",containableInterface );
                        containableInterfaceState.set("interfaceKey",containableInterface._instanceKey );

                        this._shared._containableInterfacesState.set(String(containableInterface._componentKey), containableInterface);
                       // console.log( this._shared._containableInterfacesState, this._shared.containableInterfacesStates);
                    }else {
                        console.log("already a containable for this component");
                    }

                }else
                {
                    console.log("not enough keys in object to become containable", this._instanceKey, this._componentKey);
                }
            }

        });
    });