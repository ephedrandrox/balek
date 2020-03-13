define([ 	'dojo/_base/declare',
        'dojo/_base/lang',

    ],
    function (declare, lang) {

        return declare("balekSessionManager", null, {
            constructor: function(args){
                declare.safeMixin(this, args);
            }
        });
    });