define([ 	'dojo/_base/declare',
    ],
    function (declare, lang) {

        return declare("balekSessionManagerSession", null, {
            _sessionStatus: 0,
            constructor: function(args){
                declare.safeMixin(this, args);
            }
        });
    });