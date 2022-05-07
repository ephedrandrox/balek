define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, lang, baseInterface, stateSyncer ,remoteCommander ) {
        return declare("moduleBaseSyncedStreamInterface", [baseInterface, stateSyncer ,remoteCommander ],{
            _instanceKey: null,


            _streamPosition: 0,
            _streamStartPosition: 0,
            _streamLength: 0,
            _preloadSize: 100,

            outputCallback: null,
            _chunks: null,



            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleBaseSyncedStreamInterface started");


                this._chunks = {};

                if(this._componentKey){
                    this.askToConnectInterface();
                }


            },
            onInterfaceStateChange: function (name, oldState, newState) {
               if (name === "interfaceRemoteCommands") {
                    this.linkRemoteCommands(newState);
                    if(this.onRemoteCommandsInitiated){
                        this.onRemoteCommandsInitiated();
                    }
                }
                //We Also Check for interfaceRemoteCommandKey so we can send commands
                if (name === "interfaceRemoteCommandKey") {
                    // console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;
                }
               if (name === "streamChunk") {

                   if ( newState.streamSize !== undefined)
                    {
                        this._streamLength = newState.streamSize;
                    }

                    if ( newState.position !== undefined && newState.data)
                    {
                        this._chunks[newState.position] = newState.data;

                        if(this.outputCallback !== null)
                        {
                                this.continueStreaming();
                        }

                    }

                }

            },
            isStreamReady: function(){
                if(this._remoteCommandsReceived =true)
                {
                    return true;
                }else
                {
                    return false;
                }
            },
            onRemoteCommandsInitiated: function(){
                //todo create function to check if xterm is ready to start
                this._remoteCommandsReceived =true;

                if(this.outputCallback !== null){
                  this.beginStreaming();
                }
            },
            beginStreaming: function( outputCallback= null){
                if ( outputCallback !== null)
                {
                    this.outputCallback = outputCallback;
                }else{
                    return;
                }

                if ( this.outputCallback !== null && this._instanceCommands && this._instanceCommands.preloadChunks )
                {
                    this._streamPosition = 0;
                    this._streamStartPosition = 0;

                    if (this._streamLength > 0)
                    {
                        if (this._streamLength > this._preloadSize)
                        {
                            this._streamStartPosition = this._streamLength - this._preloadSize;
                            this._streamPosition = this._streamStartPosition;
                        }
                    }

                    this._instanceCommands.preloadChunks(this._preloadSize).then(lang.hitch(this, function(firstLoad){
                        if(firstLoad.streamSize && firstLoad.streamSize !== this._streamLength )
                        {
                            this._streamLength =  firstLoad.streamSize;
                            if(firstLoad.streamSize > this._preloadSize)
                            {
                                this._streamStartPosition =  firstLoad.streamSize - this._preloadSize;
                                this._streamPosition = this._streamStartPosition;
                            }
                        }

                        if(firstLoad.preloadChunks){
                            for(const chunkPosition in firstLoad.preloadChunks)
                            {
                                this._chunks[chunkPosition] = firstLoad.preloadChunks[chunkPosition];
                            }
                        }

                        this.continueStreaming();

                    })).catch(function(errorResult){
                        console.log(errorResult);
                    });

                }
            },
            continueStreaming: function(){
                if ( this.outputCallback !== null) {
                    if(!(this._streamPosition > this._streamLength || this._chunks[this._streamPosition] === undefined) )
                    {
                        this.outputCallback(this._chunks[this._streamPosition]);
                        this._streamPosition++;
                        this.continueStreaming();
                    }
                }
            }
        });
    }
);



