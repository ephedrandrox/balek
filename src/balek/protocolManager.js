define([ 	'dojo/_base/declare', 
			'dojo/_base/lang',

		],
		 function (declare, lang) {
		
		return declare("balekProtocolManager", null, {

			constructor: function(args){
				declare.safeMixin(this, args);

			},
			wrapObject: function(objectToWrap)
			{
				return { balekProtocolMessage : objectToWrap};
			}
		
		
		});
});