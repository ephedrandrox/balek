//todo make this manager and load it in interface, make
// use it to place components in workspaces

define([ 	'dojo/_base/declare',
        'dojo/dom-construct'
    ],
    function (	declare, domConstruct)
    {

        return declare("layoutManager", null, {

            constructor: function(args){
                declare.safeMixin(this, args);
            },
            reset: function()
            {

            }
        });
    }
);
