define([ 	'dojo/_base/declare',
			"dojo/on",
			'dojo/_base/lang',
			'dojo/topic'],
		 function (declare,
				   on,
				   lang,
				   topic) {
			
			return declare(null, {
				_mainWebSocket: null,
								
				constructor: function(args){
					
					 declare.safeMixin(this, args);
					//todo do something when websocket closes

				},
				socketOpened: function(event)
				{
					topic.subscribe("sendServerMessage", lang.hitch(this, this.sendMessage));
				},
				sendMessage: function(balekProtocolMessage)
				{
					let JSONString = JSON.stringify(balekProtocolMessage);
					this._mainSocket.send( JSONString)
				},
				dataReceived: function(event)
				{
					let dataRecieved = "";
					try{
						dataRecieved = JSON.parse(event.data);

						if(dataRecieved.balekProtocolMessage != null)
						{
							topic.publish("balekProtocolMessageReceived", dataRecieved.balekProtocolMessage);
						}
						else
						{
							console.log("Data does not contain a balekProtocolMessage");
						}
					}	
					catch (Err){
						console.log("dataRecieved not formated correctly" + JSON.stringify(dataRecieved));
						console.log(Err);
					}
				},
				connectionClosed: function(event)
				{
					console.log("connectionClosed");
					console.log(event);
				},
				connectMainSocket: function(address)
				{
					this._mainSocketAddess = address;
					this._mainSocket = new WebSocket(address, 'balek-protocol');

					on(this._mainSocket, "open", lang.hitch(this, "socketOpened"));
					on(this._mainSocket,"message", lang.hitch(this, "dataReceived"));
					on(this._mainSocket, "close", lang.hitch(this, "connectionClosed"));
					on(this._mainSocket, "error", lang.hitch(this, "error"));
				},
				error: function(error)
				{
					console.log(error);
				}
			});
		}
);
