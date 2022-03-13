# Quickstart
Run Balek on localhost using an included Docker build configuration.

You will need
- [Git installed](https://github.com/git-guides/install-git) to clone the repository.
-  [**Docker** and **docker-compose**](https://www.docker.com) to build and run Balek using these instructions.

When completed you will be able to access the [User Guide](../src/balek-modules/users/guide/resources/docs/README.md) through a web Interface
## Getting Balek
Clone the repository and submodules

    git clone --recurse-submodules https://github.com/ephedrandrox/balek.git  

> The [dojo toolkit](https://dojotoolkit.org) is included as a submodule. If the `--recurse-submodules`
> flag is omitted durring cloning, you can run `git submodule update --init --recursive` in
> the root directory to download the dojo toolkit submodules.

For other ways to get Balek go [here...](./getting.md)
## Building and Running

_Enter commands in the repository root:_

### Build:
Will take a few minutes to complete

    docker-compose -f ./builds/balek/docker-compose.yml build

### Run:
Start up the Balek containers in the background

    docker-compose -f ./builds/balek/docker-compose.yml up -d

### Stop:
Stop the Balek containers

    docker-compose -f ./builds/balek/docker-compose.yml down



## Accessing Balek

Once the containers are up and running you can access your Balek instance through [https://localhost/](https://localhost/)

To access the built/minified interface you have to request [https://localhost/release/](https://localhost/release/)
