define(['dojo/_base/declare',
        'dojo/topic',
        'balek-modules/components/login/Interface/login',],
    function (declare, topic, _LoginComponent ) {
        return declare("moduleSessionLoginInterface", _LoginComponent, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
            },
            postCreate(){
                topic.publish("displayAsDialog", this);
            },
            _onLoginSuccess(){
                topic.publish("requestModuleLoad", "session/menu");
                topic.publish("loadBackground", "flowerOfLife");
                this.unload();
            },
            unload() {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });