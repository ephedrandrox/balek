define([ 'dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance',
        'balek-modules/Interface'],
    function (declare,
              lang,
              moduleInstance

    ){

        return declare("BalekServerModule",null, {
            _displayName: "Base Module",
            _iconPath: "balek-modules/resources/images/unknown.svg",
            _allowedGroups: null,
            _allowedSessions: null,
            constructor: function(){
            },
            allowedGroups: function()
            {
                return this._allowedGroups;
            },
            allowedSessions: function()
            {
                return this._allowedSessions;
            },
            _start: function(){

            },
            _end: function(){

            },
            _error: function(error){
                console.log(error);
            },
            newInstance: function()
            {
                return new moduleInstance();
            }

    });
    });
