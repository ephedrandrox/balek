## Building Your Own Applications Using Balek
You can add your own [modules](./modules.md) and [build](../builds/README.md) configurations to Balek. 


Modules live in  [`src/balek-modules/`](../../src/balek-modules) and build configurations are in [`builds/`](../../builds)

### SSL certificates
You can place your own ssl certificates in the [`builds/balek/conf/cert`](../../builds/balek/conf/cert) directory and restart your containers to use them.
### General Configuration
Modify [`builds/balek/conf/config.json`](../../builds/balek/conf/config.json) and restart containers.  
See the [`src/balek-server/etc/README.md`](../../src/balek-server/etc/README.md) for more info.

