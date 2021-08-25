# **Balek**
A module based web application framework for building and deploying Javascript web applications.
  
Currently in early development stage

This repository has several branches intended to become seperate repositories when development matures


You will need [**Docker** and **docker-compose**](https://www.docker.com) to build and run Balek

## Getting Balek

    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git  

 > The [dojo toolkit](https://dojotoolkit.org) is included as a submodule. If the `--recurse-submodules` flag is omitted durring cloning, you can run `git submodule update --init --recursive` in the root directory to download the dojo toolkit.

## Building and Running Balek

In the repository root:

### Build:

    docker-compose -f ./builds/balek/docker-compose.yml build
This will take a few minutes
### Run:

    docker-compose -f ./builds/balek/docker-compose.yml up -d
This will start up the Balek containers in the background
### Stop:

    docker-compose -f ./builds/balek/docker-compose.yml down
This will stop the Balek containers


## Accessing Balek  

Once the containers are up and running you can access your Balek instance through [https://localhost/](https://localhost/)

To access the built/minified interface you have to request the [/release/](https://localhost/release/) directory.  
The release build will be improved in the future and this wont be the case.



## Modifying Balek
### SSL certificates
You can place your own ssl certificates in the `builds/balek/conf/cert` directory and restart your containers to use them.
### General Configuration
Modify `balek/builds/balek/conf/config.json` and restart containers.


### Building Your Own Applications Using Balek 
You can add your own modules and build configurations to Balek. Modules live in  `src/balek-modules/` and build configurations are in `builds/`  
 > Examples will become available in a seperate branch  
 > Documentation will be created as interest inspires and time allows 
