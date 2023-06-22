# Quickstart
Run Digiscan on a host using the included Docker build configuration.

You will need
- [Git installed](https://github.com/git-guides/install-git) to clone the repository.
-  [**Docker** and **docker-compose**](https://www.docker.com) to build and run Balek using these instructions.

When completed you will be able to access the [User Guide](../src/balek-modules/users/guide/resources/docs/README.md) through a web Interface
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

### Step 1: Build
Build the Docker Containers needed for the DigiScan Instance
Will take a few minutes to complete

    docker-compose -f ./builds/digiscan/docker-compose.yml build

This will create 4 containers: 
 - nginx container for routing
 - mysql container for Balek framework user services
 - mongodb container for Digiscan Captures
 - nodejs container to run Instance


### Step 2: Configure
For the DigiScan iOS app to connect to the DigiScan instance, it must trust the certificates provided.  
A straightforward way to achieve this is to have an internet facing host with a fully qualified domain name. You can then use certbot to request trusted certificates from [Let's Encrypt](https://www.letsencrypt.org/)  


Once you have yourdomain.whatever, you can request certificates from [Let's Encrypt](https://www.letsencrypt.org/) and set the configuration for the domain name using the following command:


    sh configureFor.sh yourdomain.whatever

This will:
 - Run a certbot Docker container 
 - Creates ~/certs and ~/certsvar directories
 - Request the domain certificate by opening port 80 (http)
 - Uses sudo to copy the domain certificate and private key to the configuration directory
 - Changes the certificate and key ownership to user
 - Updates the config.json file for the given hostname

You may have to provide admin credentials for the certificate copy and or an email to the certbot.  
If all goes well, ./builds/digiscan/

### Step 3: Run
Start up the containers and run a Digiscan Instance

    docker-compose -f ./builds/digiscan/docker-compose.yml up -d

### Stopping:
Stop Digiscan and its containers

    docker-compose -f ./builds/digiscan/docker-compose.yml down



## Accessing Balek

### Claim Instance
 **Get Owner Claim Key**

    docker-compose logs digiscan

To present a QR code in the terminal that can be scanned from the iOS App.

Once the device has taken ownership of the Digiscan Instance, it can be used to log in through a web browser.