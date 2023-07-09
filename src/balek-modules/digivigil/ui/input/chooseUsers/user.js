define(['dojo/_base/declare',
        'dojo/topic',
        'dojo/dom-class',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/ui/input/chooseUsers/resources/html/user.html',
    ],
    function (declare, topic, domClass, _WidgetBase, _TemplatedMixin, template) {
        return declare("diaplodeUIChooseUsersUser", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeUIChooseUsersUser",

            _userNameNode: null,
            _userImageNode: null,

            inputReplyCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
            },
            _onClickUser: function (eventObject) {
                this.inputReplyCallback(this._userData.userKey)
            },
            _mouseEnter: function (eventObject) {
                domClass.add(this.domNode, "mouseOverUserListItem");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this.domNode, "mouseOverUserListItem");
            },
            updateData: function (userData) {
                this._userData = userData;
                this._userImageNode.src = this._userData.icon;
                this._userNameNode.innerHTML = this._userData.name;
            }
        });
    });