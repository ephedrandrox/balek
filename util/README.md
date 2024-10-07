#  Utilities for Deployment, Reporting, and Testing

A collection of bash and javascript utilities to help with the deployment, reporting, and testing. All examples meant to be initiated from the root of the repository.  

## 📁 Certificates
Contains bash scripts to create and manage SSL certificates for the Docker Containers
### 📄 get.sh
Uses Certbot to request certificates from Let's Encrypt and places them in the `./certs` directory for the Docker Containers. 
```bash
./util/certificates/get.sh
```

## 📁 Production
Contains bash scripts to build, run, and reset the production environment docker containers.

### 📄 build.sh
Builds the Docker Containers needed for the Production Environment.
```bash
./util/production/build.sh
```
### 📄 start.sh
Starts the Production Environment Docker Containers. Checks and builds images if necessary.
```bash
./util/production/start.sh
```
### 📄 stop.sh
Stops the Production Environment Docker Containers.
```bash
./util/production/stop.sh
```

### 📄 reset.sh
Resets the Production Environment Owner device, reintializes the database, and rebuilds the Docker Containers. Leaves the config.json and ssl certificates in container configuration directory.

```bash
./util/production/reset.sh
```

