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

### Developing Modules

   A goal is for modules to be something that can be developed as independant projects, 
   using Balek in a manner similar to webpack. For now, we can just modify a copy of Balek 
   and build our Modules in the `src/balek-modules` folder.  
   
   Create a subdirectory in src/balek-modules/ and the three files _Module.js_, _Instance.js_, 
   and _Interface.js_. Or copy an available module and edit it.

### Loading Modules
   Load modules through the default interface after logging in. Or 
   edit the "Main Module" setting in `src/balek-server/etc/config.json` to load 
   your module on session startup.
   
   
### Building Modules
   Modules can be built into minified layers by adding them to the `balek.profile.js` file before performing `npm run buildAll`
  
  
  