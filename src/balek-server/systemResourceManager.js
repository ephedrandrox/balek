define(['dojo/_base/declare', 'dojo/_base/lang',
        "dojo/node!os"],
    function (declare, lang, nodeOS) {
        return declare("systemResourceManager", null, {

            _systemData: {},

            constructor: function (args) {

                console.log("Initializing System Resource Manager...");

            },
            _start: function () {

                console.log("Starting System Resource Manager...");

            },
            reloadData: function () {
                this._systemData.architecture = nodeOS.arch();
                this._systemData.cpus = nodeOS.cpus();
                this._systemData.memory = {};
                this._systemData.memory.total = nodeOS.totalmem();
                this._systemData.memory.free = nodeOS.freemem();
                this._systemData.homeDirectory = nodeOS.homedir();
                this._systemData.hostname = nodeOS.hostname();
                this._systemData.loadAverage = nodeOS.loadavg();
                this._systemData.networkInterfaces = nodeOS.networkInterfaces();
                this._systemData.platform = nodeOS.platform();
                this._systemData.release = nodeOS.release();
                this._systemData.type = nodeOS.type();
                this._systemData.uptime = nodeOS.uptime();
            },
            getSystemData: function () {
                this.reloadData();
                return this._systemData;
            }
        });
    });
