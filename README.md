# **Balek**
A module based web application framework for building and deploying Javascript web applications.
  
Currently in early development stage


####To set up for development you will need:  

 * Node.js
 * NPM
 * Docker
 * Docker Compose

####Get Balek:  

    `git clone --recurse-submodules git@github.com:ephedrandrox/balek.git`  

The dojo toolkit is included as a submodule. If you forget the `--recurse-submodules` flag then you can run `git submodules init` in the repo directory to download the dojo toolkit.

####Enter the repository directory and install modules  
`cd balek`  
`npm install`


####Set Up Databases
 * mysql  
    `cd data/mysql`  
    `npm run build`  
    You can then start/stop/restart the mysql server using  
    `npm start`  
    `npm stop`  
    `npm restart`  
    You will want to start this before starting Balek
 * mongodb  
     `cd data/mongo`  
     `npm run build`  
      You can then start/stop/restart the mongo server using  
      `npm start`  
      `npm stop`  
      `npm restart`  
    You will want to start this before starting Balek  

    Default database user information found in `balek/data/mysql/docker-compose.yml` and `balek/data/mongo/docker-compose.yml`  
    
    To use a different database, configure Balek by editing `src/balek-server/etc/config.json`
    
####Start Balek  
From the root directory of the repo run  
`npm start`  

This should start a server on localhost at port 8080 that can be accessed only through https://  
`https://localhost:8080/`  

To stop `ctrl+c` process.

####Build Balek
`npm run build`  

This builds the interface using dojo build tools and Google Composure to reduce size and increase load time. Built interface can be accessed in through  
`https://localhost:8080/release/`  


####Deploying using docker
 `git clone --recurse-submodules git@github.com:ephedrandrox/balek.git`
 `cd balek`  
 `npm install`  
 `docker-compose -f builds/balek/docker-compose.yml build`
 `docker-compose -f builds/balek/docker-compose.yml up -d`
 
 You could place your ssl certificates in `balek/builds/balek/conf/cert/` and or configure `balek/builds/balek/conf/config.json` before building.
 
 To access the built/minified interface you have to request the /release/ directory. ie `https://localhost:8080/release/`  
 The release build will be improved in the future and this wont be the case.


####Building Your Own Applications Using Balek 
You can add your own modules to Balek and then deploy with a build configuration. Modules live in  `src/balek-modules/` and build configurations are in `builds/`  In future versions the build configuration and module will be added as a single submodule.

You could start by copying the `src/balek-modules/digivigil-www/guestbook/` and `builds/digivigilGuestbook/` directories.
