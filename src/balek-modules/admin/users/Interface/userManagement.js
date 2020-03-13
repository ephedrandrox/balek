define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        "dojo/aspect",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/admin/users/resources/html/userManagement.html',
        'dojo/text!balek-modules/admin/users/resources/css/userManagement.css',
        'balek-modules/admin/users/Interface/userListItem',
        'balek-modules/admin/users/Interface/userEdit',

    ],
    function (declare, lang, topic, domConstruct, win, aspect, _WidgetBase, _TemplatedMixin, template, cssFile, userListItem, userEdit) {
        return declare("moduleAdminUsersInterfaceUserManagementInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            _cssString: cssFile,
            baseClass: "userManagementWidget",

            _userListItems: {},
            userListDiv: null,
            _userEditWidget: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._userListItems = {};

                domConstruct.place(domConstruct.toDom("<style>" + this._cssString + "</style>"), win.body());

            },
            _onClickAddUser: function (clickEvent) {
                let userData = {id: "new", name: this.newUserField.value, icon: ""};
                this.editUser(userData);
            },
            updateUserData: function (userData) {
                this._userData = userData;

                for (user in userData) {

                    if (this._userListItems[user]) {
                        this._userListItems[user].updateData(userData[user]);
                    } else {

                        let userListItemOBJECT = new userListItem({
                            _userManagementInterface: this,
                            _instanceKey: this._instanceKey,
                            _userData: userData[user]
                        });
                        this._userListItems[user] = userListItemOBJECT;
                        domConstruct.place(userListItemOBJECT.domNode, this.userListDiv);
                    }
                }
            },
            editUser: function (userData) {
                this._userEditWidget = new userEdit({
                    _userManagementInterface: this,
                    _instanceKey: this._instanceKey,
                    _userData: userData
                });

                aspect.after(this._userEditWidget, "destroy", lang.hitch(this, function () {
                    this._userEditWidget = null
                }));

                topic.publish("displayAsDialog", this._userEditWidget);

                this._userEditWidget.setFocus();
            }
        });
    }
);



