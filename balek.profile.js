var profile = (function () {


    //#####################################################################
    //todo work on the build and release system
    //#####################################################################
    return {

        basePath: "./",
        releaseDir: "./release",
        releaseName: "balek",
        action: "release",

        optimizeOptions: {
            languageIn: "ECMASCRIPT6",
            languageOut: "ECMASCRIPT5"
        },

        layerOptimize: "closure",
        optimize: "closure",
        mini: true,
        stripConsole: "all",
        selectorEngine: "lite",

        defaultConfig: {
            hasCache: {
                "dojo-built": 1,
                "dojo-loader": 1,
                "dom": 1,
                "host-browser": 1,
                "config-selectorEngine": "lite"
            },
            async: 1
        },

        staticHasFeatures: {
            "config-deferredInstrumentation": 0,
            "config-dojo-loader-catches": 0,
            "config-tlmSiblingOfDojo": 0,
            "dojo-amd-factory-scan": 0,
            "dojo-combo-api": 0,
            "dojo-config-api": 1,
            "dojo-config-require": 0,
            "dojo-debug-messages": 0,
            "dojo-dom-ready-api": 1,
            "dojo-firebug": 0,
            "dojo-guarantee-console": 1,
            "dojo-has-api": 1,
            "dojo-inject-api": 1,
            "dojo-loader": 1,
            "dojo-log-api": 0,
            "dojo-modulePaths": 0,
            "dojo-moduleUrl": 0,
            "dojo-publish-privates": 0,
            "dojo-requirejs-api": 0,
            "dojo-sniff": 1,
            "dojo-sync-loader": 0,
            "dojo-test-sniff": 0,
            "dojo-timeout-api": 0,
            "dojo-trace-api": 0,
            "dojo-undef-api": 0,
            "dojo-v1x-i18n-Api": 1,
            "dom": 1,
            "host-browser": 1,
            "extend-dojo": 1
        },


        packages: [{
            name: "dojo",
            location: "./lib/dojo-release-src/dojo"
        }, {
            name: "dijit",
            location: "./lib/dojo-release-src/dijit"
        }, {
            name: "dojox",
            location: "./lib/dojo-release-src/dojox"
        }, {
            name: "balek",
            location: "./src/balek"
        }, {
            name: "balek-modules",
            location: "./src/balek-modules",
            resourceTags: {
                copyOnly: function(filename, mid){

                    let balekNodeModules = /^balek-modules\/node_modules\//,
                        codeMirror = /codemirror\/addon\/lint\/|codemirror\/addon\/merge\/|codemirror\/src\/|rollup\.config\.js/;


                    return codeMirror.test(mid) || codeMirror.test(filename) || balekNodeModules.test(mid);
                }

                //todo
                /*
                amd: function(filename, mid){
                   let  balekNodeModuleLibraries = /^balek-modules\/lib\//;
                   let balekModule = /^balek-modules\/|$.js/;
                   let javascriptFile =  /$.js/;
                    return !balekNodeModuleLibraries.test(mid) && balekModule.test(mid) && javascriptFile.test(filename);
                }
                */
            }
        }, {
            name: "balek-client",
            location: "./src/balek-client"
        }
        ],

        layers: {
            "dojo/dojo": {
                include: ["dojo/dojo", "dojo/i18n", "dojo/domReady",
                    "balek-client/Interface"],
                customBase: true,
                boot: true
            },
            "balek-modules/session/login/Interface": {
                include: [  "balek-modules/session/login/Interface"]
            },
            "balek-modules/session/menu/Interface": {
                include: [  "balek-modules/session/menu/Interface",]
            },
            "balek-modules/users/info/Interface": {
                include: [  "balek-modules/users/info/Interface"]
            },
            "balek-modules/ui/backgrounds/flowerOfLife": {
                include: [  "balek-modules/ui/backgrounds/flowerOfLife",
                            "dojox/gfx/svg",
                            "dojox/gfx/shape",
                            "dojox/gfx/path"]
            },
            "balek-modules/admin/users/Interface": {
                include: [  "balek-modules/admin/users/Interface"]
            },
            "balek-modules/admin/system/Interface": {
                include: [  "balek-modules/admin/system/Interface"]
            },
            "balek-modules/digivigil-www/guestbook/Interface": {
                include: [  "balek-modules/digivigil-www/guestbook/Interface"]
            },
            "balek-modules/diaplode/login/Interface": {
                include: [  "balek-modules/diaplode/login/Interface"]
            },
            "balek-modules/diaplode/navigator/Interface": {
                include: [  "balek-modules/diaplode/navigator/Interface"]
            },
            "balek-modules/diaplode/commander/Interface": {
                    include: [  "balek-modules/diaplode/commander/Interface"]
            },
            "balek-modules/diaplode/commander/Interface/terminal": {
                include: [  "balek-modules/diaplode/commander/Interface/terminal"],
                exclude:[ 'balek-modules/lib/xterm/lib/xterm',
                    'balek-modules/lib/xterm-addon-fit/lib/xterm-addon-fit']
            },
            "balek-modules/diaplode/commander/Interface/console": {
                include: [  "balek-modules/diaplode/commander/Interface/console"],
                exclude:[ 'balek-modules/lib/xterm/lib/xterm',
                    'balek-modules/lib/xterm-addon-fit/lib/xterm-addon-fit']
            }

        }
    };
})();