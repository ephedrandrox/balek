define(['dojo/_base/declare',
        'dojo/topic',
        'dojo/dom-class',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/admin/users/resources/html/userListItem.html',
    ],
    function (declare, topic, domClass, _WidgetBase, _TemplatedMixin, template) {
        return declare("moduleAdminUsersInterfaceUserManagementInterfaceUserListItem", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "userManagementWidgetUserListItem",

            _userNameNode: null,
            _userImageNode: null,

            _userManagementInterface: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
            },
            _onClickUserListItem: function (eventObject) {
                this._userManagementInterface.editUser(this._userData);
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