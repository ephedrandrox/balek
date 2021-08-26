
New Objects are planned for development
* Component
  >Loaded only on the client. Either as part of an Interface or on their own. An example is the loadBackground topic/function in `uiManager.js` on the client. Essentially these should be views that are updated by state changes. If they contain input objects then they should communicate only with an object passed to them at creation.
* Constituent
  >Loaded on the server and client. Either as part of an Instance/Module or on their own. An example would be a data store on the client with a database backend. These should provide a state object when created that can be watched, and a way to get/set/sync data with callback communication between client and server objects.
  >
##Notes

>  You can copy/edit the docker build directory in `builds/digivigilGuestbook/` and the commands in the `package.json` for "buildDigivigilGuestbookDockerRelease" and "startDigivigilGuestbookDockerRelease" to build and start a docker compose for a module you make. You must also edit the `balek.profile.js` if you want to utilize the release build.  
   