//##########################################################################################################
//Interface User Manager
//##########################################################################################################


define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful",
        "balek-client/session/sessionController/interfaceCommands",

    ],
    function (declare, lang, topic, Stateful, InterfaceCommands) {

        return declare("sessionController", null, {


            _interfaceCommands: null,

            constructor: function (args) {

                declare.safeMixin(this, args);


                this._interfaceCommands = new InterfaceCommands();
                this._interfaceCommands.setCommand("getSessionUserKey", lang.hitch(this, this.getSessionUserKey))


            },
            getSessionUserKey(){
                return this._session.getUserKey()
            }
        });
    });