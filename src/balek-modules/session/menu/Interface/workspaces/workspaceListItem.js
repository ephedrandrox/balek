define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',

        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/focus",
        "dojo/keys",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/html/workspaceListItem.html',
        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/css/workspaceListItem.css'

    ],
    function (declare,
              lang,
              topic,
              domClass,
              domConstruct,
              win,
              on,
              domAttr,
              InlineEditBox,
              TextBox,
              dijitFocus,
              dojoKeys,
              _WidgetBase,
              _TemplatedMixin,
              template,
              templateCSS) {
        return declare("moduleSessionWorkspacesInterfaceWorkspaceListItem", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _workspaceKey: null,
            _workspaceName: "",
            workspaceManagerCommands: null,

            _workspaceState: null,
            _workspaceStateWatchHandle: null,

            _workspaceManagerState: null,
            _workspaceManagerStateWatchHandle: null,


            templateString: template,
            baseClass: "workspaceListItem",

            constructor: function (args) {
                this._workspaceState = {};
                declare.safeMixin(this, args);

                this._workspaceManagerState = this.workspaceManagerCommands.getWorkspaceManagerState();
                this._workspaceState = this.workspaceManagerCommands.getWorkspaceState(this._workspaceKey);

                this._workspaceName = this._workspaceState.get("name");
                this._activeWorkspace =  this._workspaceManagerState.get("activeWorkspace");

                console.log(this._workspaceState,  this._workspaceName );
                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            _onActivateWorkspaceButtonClick: function () {
             //   topic.publish("changeActiveWorkspace", this._workspaceKey, lang.hitch(this, function requestCallback(requestReply) {
                //    this._workspaceState.set("activeWorkspace", requestReply.workspaceKey);
             //   }));
                this.workspaceManagerCommands.changeActiveWorkspace(this._workspaceKey, function(requestResult){
                    console.log(requestResult);
                });
            },
            onWorkspaceStateChange: function(name, oldState, newState){
                console.log(name, oldState, newState);
                if(String(name) === "name"){
                    this._workspaceName = newState
                    this.refreshView();
                }
            },
            onWorkspaceManagerStateChange: function(name, oldState, newState){
                console.log(name, oldState, newState);

                if(String(name) === "activeWorkspace"){
                    this._activeWorkspace = newState;
                    this.refreshView();

                }
            },
            postCreate: function () {

                this._workspaceStateWatchHandle = this._workspaceState.watch(lang.hitch(this, this.onWorkspaceStateChange));


                this._workspaceManagerStateWatchHandle = this._workspaceManagerState.watch(lang.hitch(this, this.onWorkspaceManagerStateChange));

                this._workspaceInlineEditBox = new InlineEditBox({
                    editor: TextBox,
                    autoSave: true
                }, this._workspaceNameField);

                this._workspaceInlineEditBoxKeyUpHandle = on(this._workspaceInlineEditBox.domNode, "keyup", lang.hitch(this, this._onNameKeyUp));
                this.editBoxFocusWatchHandle = dijitFocus.watch(this._workspaceInlineEditBox,
                    lang.hitch(this, this.onNameEditBlur));

                // this._workspaceInlineEditBox.onBlur = lang.hitch(this, this.onNameEditBlur);
                //todo figure out why this is working as expected, in the meantime, using enter key up to trigger workspace name change
                this._workspaceInlineEditBox.startup();
                this.refreshView();
            },
            refreshView: function (args) {
                declare.safeMixin(this, args);
                this._workspaceInlineEditBox.value = this._workspaceName;
                this._workspaceNameField.innerHTML = this._workspaceName;
                if (this._workspaceKey === this._activeWorkspace) {
                    domClass.add(this.domNode, "activeWorkspace");
                } else {
                    domClass.remove(this.domNode, "activeWorkspace");
                }
            },
            _onNameKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        console.log("enter has been pressed");
                        keyUpEvent.preventDefault();
                        this.requestWorkspaceNameChange();
                        break;
                    case dojoKeys.ESCAPE:
                        console.log("escape has been pressed");
                        break;
                }
            },
            onNameEditBlur: function (name, oldValue, newValue) {

                if (oldValue !== newValue) {
                    this.requestWorkspaceNameChange();
                } else {
                    //alert("focus changed but no change");
                }
            },
            requestWorkspaceNameChange: function () {
                //changeWorkspaceName is offered by the workspaceManager on the client
                //it sends a request to change the name and triggers the callback when
                //message reply is received.
               /* topic.publish("changeWorkspaceName", this._workspaceKey, this._workspaceInlineEditBox.value,
                    lang.hitch(this, function requestCallback(requestReply) {
                        let workspaces = this._workspaceState.get("workspaces");
                        workspaces[this._workspaceKey]._workspaceName = requestReply.workspaceName;
                        this._workspaceState.set("workspaces", workspaces);
                    }));
                    */

                this.workspaceManagerCommands.changeWorkspaceName(this._workspaceKey, this._workspaceInlineEditBox.value,
                    lang.hitch(this, function requestCallback(requestReply) {
                       console.log(requestReply);
                    }));
            },
            unload: function () {
                this._workspaceStateWatchHandle.unwatch();
                this._workspaceManagerStateWatchHandle.unwatch();
                this._workspaceInlineEditBoxKeyUpHandle.remove();
                this.editBoxFocusWatchHandle.remove();
            }
        });
    });