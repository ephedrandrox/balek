define([ 'dojo/_base/declare', "dojo/on", 'dojo/_base/lang', 'balek-client/io/wssManager'],
		 function (declare, on, lang, wssManager) {
			
			return declare("ioManager", null, {

				_wssManager: null,
				
				constructor: function(args){
					declare.safeMixin(this, args);
					this._wssManager = new wssManager();
				}


			});
		}
);
