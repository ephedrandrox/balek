# Balek Builds

* Stored in the [`builds`](../builds) directory
* Configuration point for building custom containers
* Mount points for running containers


Custom build configurations can be stored in subdirectories.

Build configurations consist of a combination of Docker and Balek configuration files

The main branch of Balek contains a couple builds that can be referenced as examples

 ## Included Build Directories
 ### Balek:
[`builds/balek`](../builds/balek)  
This is the main balek build with a user workspace that can be used for testing modules.

 ### Guestbook
[`builds/guestbook`](../builds/guestbook)  
This is a single module build guestbook example that does not require log in to function.

### Diaplode
[`builds/diaplode`](../builds/diaplode)  
This is a build of the Diaplode workspace, including an OpenSSH and custom modules it is more advanced and useful than the main Balek build.

### Docker
[`builds/docker`](../builds/docker)  
This contains the file configuration for the Docker containers that are references by the docker-compose.yml files of the other builds