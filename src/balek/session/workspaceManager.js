define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
    ],
    function (declare, lang) {
        return declare( "balekWorkspaceManager", null, {
            _workspaces: null,
            constructor: function(args){
                declare.safeMixin(this, args);
            }
        });
    });