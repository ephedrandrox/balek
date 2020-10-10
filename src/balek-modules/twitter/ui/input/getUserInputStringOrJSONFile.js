define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/keys",
        'dojo/_base/fx',
        //Dijit widget includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/twitter/ui/input/getUserInputStringOrJSONFile/resources/html/getUserInputStringOrJSONFile.html',
        'dojo/text!balek-modules/twitter/ui/input/getUserInputStringOrJSONFile/resources/css/getUserInputStringOrJSONFile.css',
    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
              domConstruct,
              win,
              dojoKeys,
              fx,
              //Dijit widget includes
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss) {

        return declare("twitterUIInputGetUserInput", [_WidgetBase, _TemplatedMixin], {

            templateString: template,                   //html template used to create widget
            _mainCssString: mainCss,                    //css for html that is added to body
            baseClass: "twitterUIInputGetUserInput",    //base class namespace and css class

            stringQuestion: null,                       //set by initializer
            fileQuestion: null,                         //set by initializer
            inputReplyCallback: null,                   //set by initializer

            _userInputValue: null,                      //Attached in HTML Template
            _userInputFile: null,                       //Attached in HTML Template
            _userInputFileDisplay: null,                //Attached in HTML Template

            _userInputJSON: null,                       //Set when file input changed

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);
                //place the style tag for this widget
                //we should attach id and check that we don't add more then one
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                //after node is made, display as dialog
                topic.publish("displayAsDialog", this);
                //fade in to show node
                this.introAnimation();
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onUserInputFileChange: function(fileChangeEvent)
            {
                //called when inout file is changed
                //set in html template for this widget
                if(FileReader)
                {  //check for FileReader object in browser
                    //get file from event and check MIME type
                    let file = fileChangeEvent.target.files[0];
                    if (file.type.match('application/json')) {
                        let reader = new FileReader();
                        //create reader and onload event
                        reader.onload = lang.hitch(this, function (onLoadEvent) {
                           let userFileInputReadResult = onLoadEvent.target.result;
                           //onload try to parse JSON
                           try{
                               //set JSON object
                               this._userInputJSON = JSON.parse(userFileInputReadResult);
                               //Display file in template _userInputFileDisplay node
                               this._userInputFileDisplay.innerHTML = userFileInputReadResult;
                           }catch(e){
                               //log and alert failure
                               console.log(e);
                               alert("Could not load JSON");
                               this._userInputFileDisplay.innerHTML = "No Usable File Contents";
                           }
                        });
                        // Read in the JSON file
                        reader.readAsText(file, "UTF8");
                    } else {
                        //Alert user if file is not correct MIME type
                        alert("File not JSON");
                    }
                }else
                {  //Alert user if no FileReader object in browser
                    alert("Get a browser that supports FileReader");
                }
            },
            _onKeyUp: function (keyUpEvent) {
                //on template keyup event
                //stop normal function of enter and escape on key up
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;
                }
            },
            _onKeyDown: function (keyUpEvent) {
                //on template keyup event
                //stop normal function of enter and escape on key down
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        //submit input if enter pressed
                        keyUpEvent.preventDefault();
                        this.submitInput();
                        break;
                    case dojoKeys.ESCAPE:
                        //unload widget if escape is pressed
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;
                }
            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            introAnimation: function(){
                //fade in input widget node over 600ms
                fx.animateProperty({
                    node:this.domNode,
                    duration:600,
                    properties: {
                        opacity: {end: 1},

                    }
                }).play();
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            submitInput(){
                //if there is a JSON object, send that
                if(this._userInputJSON)
                {
                    this.inputReplyCallback(this._userInputJSON);
                }else
                {
                    //otherwise send the user input value
                    this.inputReplyCallback(this._userInputValue.value);
                }

            },
            unload: function () {
                //destroy the widget
                this.destroy();
            }
        });
    });