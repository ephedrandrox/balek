// The module to "bootstrap"
var loadModule = "balek-server/server";

dojoConfig = {
    baseUrl: "",
    async: 1,
    hasCache: {
        "host-node": 1, // Ensure we "force" the loader into NodeJS mode
        "dom": 0 // Ensure that none of the code assumes we have a DOM
    },
    packages: [{
        name: "dojo",
        location: "lib/dojo-release-src/dojo"
    },
        {
            name: "balek",
            location: "src/balek"
        },
        {
            name: "balek-server",
            location: "src/balek-server"
        },
        {
            name: "balek-modules",
            location: "src/balek-modules"
        },
        {
            name: "balek-client",
            location: "src/balek-client"
        }],
    deps: [ loadModule ] // And array of modules to load on "boot"
};

// Now load the Dojo loader
require("./lib/dojo-release-src/dojo/dojo.js");