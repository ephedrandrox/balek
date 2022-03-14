# Balek Modules
## Overview
> Modules are packages of code managed by Balek and loaded by [sessions](sessions.md)  intended to:
> * be portable packages
> * be easily built, transfered, and loaded
> * utilize Balek for full stack services
> * be maintainable as individual projects

## Introduction
Available modules in the [`src/balek-modules`](../../src/balek-modules) directory are loaded on startup.

 This directory is main point of entry when developing Balek applications. Inside a modules' directory should be all the javascript, html, css, as well as any third party modules they utilise.

Developers can extend base Module, Instance and Interface base classes when creating their custom modules. If inclined they can also copy the structure of example modules for organizing its elements.

## Composition
The three following files are needed in a subdirectory in order to be loaded as a module
* **Module.js**
  >This is loaded into the server instance [moduleManager](../../src/balek-server/moduleManager.js)
  at startup. Declares Module parameters and creates new Instances.
* **Instance.js**
  >This is loaded as a new object when requested by a session.
  Communicates with Interfaces through the session.
* **Interface.js**
  >This is requested and loaded on the client when a module
  interface is requested by a session. Communicates with Instance through the session.

## Creating Modules
Create a subdirectory in [`src/balek-modules/`](../../src/balek-modules) to contain your new module. The path inside the directory will be used to name your module. For example, the `session/login` module is located in the [`src/balek-modules/session/login`](../../src/balek-modules/session/login) folder


Templates for new modules have not been created yet. 

It is recomended to copy, rename, and refactor one of the [user](../../src/balek-modules/users) or [session](../../src/balek-modules/session) module folders until then.

## Loading Modules
Load modules through the default web interface after logging in. Or
[edit the "Main Module"](../../src/balek-server/etc/README.md) setting in [`src/balek-server/etc/config.json`](../../src/balek-server/etc/config.json) to load
your module on session startup.


## Building Modules
Modules can be built into minified layers by adding them to the `balek.profile.js` file before performing `npm run buildAll`
  
  
  