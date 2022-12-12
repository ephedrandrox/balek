define(['dojo/_base/declare',
        'dojo/topic',
        'balek-modules/components/login/Interface',],
    function (declare, topic, _LoginComponent ) {
        return declare("moduleSessionLoginInterface", _LoginComponent, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
            },
            _onLoginSuccess(){
                topic.publish("requestModuleLoad", "session/menu");
                topic.publish("loadBackground", "flowerOfLife");
                this.unload();
            },
            _onClickSendLoginButton(clickEvent){
                if(clickEvent.altKey){
                    topic.publish("requestModuleLoad", "balekute/connect");
                }else {
                    this.inherited(arguments);
                }

            },
            unload() {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });