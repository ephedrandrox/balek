#Diaplode Development Guide
This guide is intended to assist in setting up Diaplode locally for _development_, _debugging_ and _building_. It is expected you are capable of commanding a terminal and setting up the following software on your workstation.


###Workstation Requirements:  
- [**Node** and **NPM**](https://nodejs.org/)  
- **Java** - (For dojo build utility - could be installed as docker container)  
- [**Docker** and **docker-compose**](https://www.docker.com) -(For Mysql, Mongo and OpenSSH)  
- [**Git**](https://git-scm.com)

## Setting up repository:

[Diaplode](https://github.com/ephedrandrox/balek/tree/diaplode-main) utilizes the [Balek](https://github.com/ephedrandrox/balek) framework which relies on the dojo toolkit for development and building. At this time Diaplode is a branch of the Balek repository available on github. This will likely change as development continues towards a release version. At which time Diaplode will occupy its own repository with updated documentation.

###Clone Repository: 
Open a terminal and clone the balek repository into a directory labeled diaplode by entering:  

    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git diaplode

###Checkout diaplode-main branch:  
Enter the cloned repository and check out the diaplode-main branch with:  

    cd balek  
    git checkout diaplode-main  
If you miss this step, you will be stuck with a base Balek system when you start the instance.  
###Install NPM requirements:  
In the root of the diaplode folder, use npm to install our third party modules like mongodb and websocket.  
    
    npm install

##Setting up services:

Diaplode uses MySQL database for user authentication and Mongo database for storing content. We can build the database server containers we need for development using a script in our [package.json](../package.json)  

While still in the repository root:

###To Build:
    
    npm run buildDevelopmentServices
###To Run:
    
    npm run startDevelopmentServices
###To Stop:

    npm run stopDevelopmentServices

##Starting Diaplode:

Once the database containers are ready you can start Diaplode with the following command:
    
    npm start

Once it starts successfully, you can direct your browser to [https://localhost:8080/](https://localhost:8080/) and log in with:  
**Username** (_top input_) : Demo  
**Password** (*bottom inpu*t) : demoPassword

##Debugging Diaplode:

Start debugging Diaplode with node:  
    
    node --inspect=9229 loadServer.js

Then visit [chrome://inspect](chrome://inspect) in a Chromium-based browser.  
Or connect to the inspector with whatever debugger you prefer.  
For more information, see the [node documentation](https://nodejs.org/en/docs/guides/debugging-getting-started/).

##Building Diaplode:
You can build your new code and changes using the _buildAll_ script in our [package.json](../package.json). 
    
    npm run buildAll

After building, the built content can be accessed by visiting [https://localhost:8080/release/](https://localhost:8080/release/)  

You are now ready to start contributing to the source!

