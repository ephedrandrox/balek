define([ 	'dojo/_base/declare',
    ],
    function (declare) {
        return declare("balekWorkspaceManagerWorkspace", null, {
            constructor: function(args){
                declare.safeMixin(this, args);
            }
        });
    });