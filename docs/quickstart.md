# Quickstart
Run Digiscan on a host using the included Docker build configuration.

You will need a host with
- [Git installed](https://github.com/git-guides/install-git) to clone the repository.
-  [**Docker** and **docker-compose**](https://www.docker.com) to build and run Digiscan using these instructions.
- Fully qualified domain name
- Incoming ports 80 (*http*) and 443 (*https*) open.


## Getting Digiscan
Digiscan is currently available as a branch of the Balek repository
### Step 1: Get the Balek repository for **Building** and **Running**
Clone the Balek repository and submodules

    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git  

> The [dojo toolkit](https://dojotoolkit.org) is included as a submodule. If the `--recurse-submodules`
> flag is omitted durring cloning, you can run `git submodule update --init --recursive` in
> the root directory to download the dojo toolkit submodules.
### Step 2: Checkout the DigiScan branch

switch to the digiscan branch of the repository before **Building** and **Running**

    git checkout digiscan



## Building and Running

_Enter commands in a terminal at the repository root:_

### Build
Build the Docker Containers needed for the DigiScan Instance
Will take a few minutes to complete

    docker-compose -f ./builds/digiscan/docker-compose.yml build

This will create 4 containers: 
 - nginx container for routing
 - mysql container for Balek framework user services
 - mongodb container for Digiscan Captures
 - nodejs container to run Instance

The nodejs container also builds the minified version of the web interface and can take some time/resources. Once complete, you are ready to configure.

### Configure
In order for Digiscan to communicate over HTTPS and establish a connection using secure websockets, it is necessary for the host to provide SSL Certificates. Creating your own certificates and configuring your devices to trust them is an option, but the procedure is outside the scope of this document. Having an internet facing host with a fully qualified domain name, we can use certbot to request trusted certificates from [Let's Encrypt](https://www.letsencrypt.org/)  


To set the configuration for *yourdomain.whatever.net* use the following command:

    sh configureFor.sh yourdomain.whatever.net

This will:
 - Run a certbot Docker container 
 - Create ~/certs and ~/certsvar directories
 - Request the domain certificate by opening port 80 (http)
 - Use sudo to copy the domain certificate and private key to the configuration directory
 - Change the certificate and key ownership to terminal user
 - Updates the config.json file for the given hostname

You may have to provide some input (sudo password, domain info and email).  
If all goes well you are ready to start the containers.

### Run
Start up the containers and run a Digiscan Instance:

    docker-compose -f ./builds/digiscan/docker-compose.yml up -d

This will bring up the containers in the background.


### Status:
To see the current status of the containers:

    docker-compose -f builds/digiscan/docker-compose.yml ps


### Stopping:
Stop Digiscan and its containers:

    docker-compose -f ./builds/digiscan/docker-compose.yml down


## Accessing Digiscan

The host must be claimed by a device to access the Digiscan Web Interface.

### Claim Instance
 A new owner claim key is generated each time the containers are ran until a device claims ownership of the host.  

 **Get Owner Claim Key**  
To present a QR code in the terminal that can be scanned from the iOS App.  

    docker-compose -f builds/digiscan/docker-compose.yml exec -T digiscan npm run showAdminDeviceInvitation



Once a device has taken ownership of the Digiscan Instance, it can be used to log in through a web browser and the above command will show an ECDSA P256 public signing key for the owning device.

### Load Interface  
To load the interface in a web browser, navigate to your host using the https protocol. A QR code should appear that can be scanned by the owning device to log in.


