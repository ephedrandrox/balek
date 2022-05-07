# Diaplode Administration Guide

## Installation
Installation is done on a local or remote host through a terminal. Docker is the prefered method of deployment. On hosts that require more configuration or are unable to utilize Docker, Diaplode can be run directly through Node or Npm. This method requires installation and configuration of database and ssh services. You will also need Java if you use the Dojo build utility to combine, optimize and minify the client code.

A custom installation is out of the scope of this guide at this time.

## Git, Build, and Run
On a host with Git and Docker installed, clone the Balek Repository and submodules:
    
    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git

### Checkout the diaplode-main branch  

    cd balek
    git checkout diaplode-main

### Build the Docker containers
    
    docker-compose -f ./builds/diaplode/docker-compose.yml build
This will build containers for Diaplode, MariaDB, MongoDB, and OpenSSH.

### Run the containers with:

    docker-compose -f ./builds/diaplode/docker-compose.yml up -d

## Configure

### Certificates
To be continued ...
#### OpenSSH...
#### Web Server...

