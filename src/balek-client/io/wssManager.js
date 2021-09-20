define([ 	'dojo/_base/declare',
			"dojo/on",
			'dojo/_base/lang',
			'dojo/topic'],
		 function (declare,
				   on,
				   lang,
				   topic) {
			
			return declare(null, {
				_mainSocket: null,
								
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

					try{
						let JSONString = JSON.stringify(balekProtocolMessage);

						//todo create and check if passes isBalekProtocolMessage test

						if(this._mainSocket!== null && this._mainSocket.readyState === this._mainSocket.OPEN)
						{
							this._mainSocket.send( JSONString)

						}else
						{
							alert("Could not send balekProtocolMessage - Connection Closed -  reload to reconnect");
							console.log("Could not send balekProtocolMessage - Connection Closed -  reload to reconnect", balekProtocolMessage);
						}
					}catch(error){
						alert("Could not send balekProtocolMessage - check console");
						console.log("Could not send balekProtocolMessage error try catch", error);
					}

				},
				dataReceived: function(event)
				{
					let dataReceived = "";
					try{
						dataReceived = JSON.parse(event.data);

						if(dataReceived.balekProtocolMessage != null)
						{
							topic.publish("balekProtocolMessageReceived", dataReceived.balekProtocolMessage);
						}
						else
						{
							console.log("Data does not contain a balekProtocolMessage");
						}
					}	
					catch (Err){
						console.log("dataReceived not formatted correctly" + JSON.stringify(dataReceived));
						console.log(Err);
					}
				},
				connectionClosed: function(event)
				{
					console.log("connectionClosed");
					//todo create system status state that would be set here
					//todo Modules could watch this state as needed
					alert("Connection Closed - reload manually");
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
