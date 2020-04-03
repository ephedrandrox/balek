define(['dojo/_base/declare', 'dojo/_base/lang', "dojo/topic", "dojo/node!fs"],
    function (declare, lang, topic, fsNodeObject) {
        return declare("configManager", null, {

            _configFile: null,
            _configObject: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("Initializing Config Manager...");

                this._configFile = fsNodeObject.readFileSync("./src/balek-server/etc/config.json", "utf8");

                this._configObject = JSON.parse(this._configFile);

                console.log("Config File Loaded, Server Port set to:" + this._configObject["Network Settings"]["Server Port"]);


                topic.subscribe("getMainModuleSettingsWithCallback", lang.hitch(this, this.getMainModuleSettingsWithCallback));

                topic.subscribe("getHttpsSettingsWithCallback", lang.hitch(this, this.getHttpsSettingsWithCallback));
                topic.subscribe("getMySQLSettingsWithCallback", lang.hitch(this, this.getMySQLSettingsWithCallback));
                topic.subscribe("getMongoSettingsWithCallback", lang.hitch(this, this.getMongoSettingsWithCallback));

            },
            _start: function () {
                console.log("Starting Config Manager...\n");
            },
            getMainModuleSettingsWithCallback: function (mainModuleCallback) {
                mainModuleCallback(this._configObject["Session Settings"]["Main Module"]);
            },
            getMySQLSettingsWithCallback: function (mysqlCallback) {
                console.log("configmysqlSettings");
                mysqlCallback(this._configObject["Database Settings"]["MySQL Database Connection"]);
            },
            getMongoSettingsWithCallback: function (mongoCallback) {
                console.log("configMongoSettings");
                mongoCallback(this._configObject["Database Settings"]["Mongo Database Connection"]);
            },
            getHttpsSettingsWithCallback: function (httpsCallback) {

                const httpsOptions = {
                    key: fsNodeObject.readFileSync("src/balek-server/etc/cert/key.pem").toString(),
                    cert: fsNodeObject.readFileSync("src/balek-server/etc/cert/cert.pem").toString()
                };

                httpsConfig = {
                    httpsOptions: httpsOptions,
                    address: this._configObject["Network Settings"]["Server Address"],
                    port: this._configObject["Network Settings"]["Server Port"],
                    mimiTypes: {
                        "txt": 'text/text',
                        "html": 'text/html',
                        "css": "text/css",
                        "js": 'application/javascript',
                        "ico": 'image/x-icon',
                        "png": 'image/png',
                        "svg": 'image/svg+xml'
                    }
                };
                
                httpsCallback(httpsConfig);
            }
        });
    });
