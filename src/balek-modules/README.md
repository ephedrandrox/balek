# Balek Modules
### Overview
Available modules in the `src/balek-modules` directory are loaded on startup.  

The three following files are needed in a subdirectory in order to be loaded as a module  
 * **Module.js**
    >This is loaded into the server instance [moduleManager](../../src/balek-server/moduleManager.js) 
    at startup. Declares Module parameters and creates new Instances.
 * **Instance.js**
    >This is loaded as a new object when requested by a session. 
    Communicates with Interfaces through the session.
 * **Interface.js**
    >This is requested and loaded on the client when a module 
    interface is requested by a session. Communicates with Instance through the session.
