#  Utilities for Deployment, Reporting, and Testing

A collection of bash and javascript utilities to help with the deployment, reporting, and testing. All examples meant to be initiated from the root of the repository.  

## 📁 Certificates
Contains bash scripts to create and manage SSL certificates for the Docker Containers
### 📄 Fetch Certificates
Uses Certbot to request certificates from Let's Encrypt and places them in the `./certs` directory for the Docker Containers. 
```bash
./util/certificates/get.sh
```

## 📁 Production
Contains bash scripts to build, run, and reset the production environment docker containers.

### Building and Running  
  
#### 📄 Build
Builds the Docker Containers needed for the Production Environment.
```bash
./util/production/build.sh
```
#### 📄 Start
Starts the Production Environment Docker Containers. Checks and builds images if necessary.
```bash
./util/production/start.sh
```
#### 📄 Stop
Stops the Production Environment Docker Containers.
```bash
./util/production/stop.sh
```

#### 📄 Reset
Resets the Production Environment Owner device, reintializes the database, and rebuilds the Docker Containers. Leaves the config.json and ssl certificates in container configuration directory.

```bash
./util/production/reset.sh
```
### Status and Reporting
#### 📄 Container Status
Shows the status of the Production Environment Docker Containers.
```bash
./util/production/status.sh
```

#### 📄 Database Contents Status
Shows the status of the MySQL and MongoDB databases in the Production Environment.
```bash
./util/production/showDatabaseStatus.sh
``` 
#### 📄 Add Device
Adds a new device to the Production Environment. 
```bash
./util/production/addDevice.sh UserName=Owner \
    PublicKey="-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzjqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Vd6T/tgZw2vWVQ3NpZX\nE5yFgdDKF9K5Q09jFZDv0SBYQGmxfBCLHSczN+weAvOSkhU71EPUOQK5I8OYpt==\n-----END PUBLIC KEY-----" \
    KeychainIdentifier=com.digivigil.balekute.device.devicehost.local \
    Signature=OISEOI2345W98785B2RHESSSWUQNJDKJS \
    Name=iPhone \
    OSName=iOS \
    Hostname=devicehost.local
```