# Balek Documentation  
###Modules
####Overview
Currently the three following files are need in a subdirectory of balek-modules/  
 * Module.js
    >This is loaded as an object in the server moduleManager when modules are loaded at startup. Passes messages which are routed through the moduleManager between the Instance Object running on the server and the Interface Object on the client.
* Instance.js
    >This is loaded as an object in `moduleManager.js` on the server when requested by a session. Can send and receive messages to and from the Interface.
* Interface.js
    >This is loaded as an object in the `moduleManager.js` on the client when requested by a session. Can send and receive messages to and from the Instance.

Two new Objects are planned for development 
 * Component
    >Loaded only on the client. Either as part of an Interface or on their own. An example is the loadBackground topic/function in `uiManager.js` on the client. Essentially these should be views that are updated by state changes. If they contain input objects then they should communicate only with an object passed to them at creation.
 * Constituent 
    >Loaded on the server and client. Either as part of an Instance/Module or on their own. An example would be a data store on the client with a database backend. These should provide a state object when created that can be watched, and a way to get/set/sync data with callback communication between client and server objects.
####Developing Modules

   The plan is to make modules something that can be development in their own repository, for now we can just modify a copy of balek.
   
   Create a subdirectory in src/balek-modules/ and the three files Module.js, Instance.js, and Interface.js. Or copy a current module into a new directory and edit from there.

   Edit the "Main Module" setting ins `src/balek-server/etc/config.json` to load your module.
   
   Then npm run start and visit https://localhost:8080/
   
####Building Modules
   You can copy/edit the docker build directory in `builds/digivigilGuestbook/` and the commands in the `package.json` for "buildDigivigilGuestbookDockerRelease" and "startDigivigilGuestbookDockerRelease" to build and start a docker compose for a module you make. You must also edit the `balek.profile.js` if you want to utilize the release build.  
   