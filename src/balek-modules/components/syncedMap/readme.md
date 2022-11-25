# Synced Map

## Instance Usage
Create a new Synced Map Instance

    NewInstance = new SyncedMapInstance({_instanceKey: this._instanceKey});

### Add an object:

    NewInstance.add(name, newState)

### Remove an Object

    NewInstance.remove(name)

### Relay a State
Where Stateful is dojo/Stateful

    NewInstance.relayState(Stateful)

### Connecting An Interface
Share the Component Key with the Interface

    this._interfaceState.set("newInstanceComponentKey", NewInstance._componentKey);



## Interface
Import `'balek-modules/components/syncedMap/Instance` as `SyncedMapInterface`

This example will use syncedMapState to store the new Interface  
Set Interface property to null:  
    
    syncedMapState : null

create Interface methods

    getSyncedMapState: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.syncedMapState == null){
                        this.syncedMapStateResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.syncedMapState)
                    }
                }))
            },

    resolveSyncedMapStateResolveRequests: function(){
        for( const ResolveKey in this.syncedMapStateResolveRequests)
        {
            Resolve(this.syncedMapState)
        }
    }

When the component key is received from the Instance
    
    newInterface = new SyncedMapInterface({ _instanceKey: this._instanceKey, 
                                            _componentKey: newState.toString()});
    this.resolveSyncedMapStateResolveRequests()
