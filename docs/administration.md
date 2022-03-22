# Diaplode Administration Guide

## Installation
Installation is done on a local or remote host through a terminal. Docker is the prefered method of deployment. On hosts that require more configuration or are unable to utilize Docker, Diaplode can be run directly through Node or Npm. This method requires installation and configuration of database and ssh services. You will also need Java if you use the Dojo build utility to combine, optimize and minify the client code.

A custom installation is out of the scope of this guide at this time.

On a host with Docker installed, clone the Balek Repository and submodules:
    
    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git

Then checkout the diaplode-main branch  

    cd balek
    git checkout diaplode-main

### Build the Docker containers
    
    docker-compose -f ./builds/diaplode/docker-compose.yml build
This will build containers for Diaplode, MariaDB, MongoDB, and OpenSSH.

You can now run Diaplode and it's required services by 
### Run the containers with:

    docker-compose -f ./builds/diaplode/docker-compose.yml up -d

##User Administration

And


Custom Builds: See the Building Guide