# **Balek Documentation**
## Introduction
Balek aims to provide a framework for developing, building, and deploying full stack javascript applications

There are several constructs provided by the framework that Developers can extend to build their own full stack applications

#### Modules
Modules are stored in the balek-modules folder and are loaded by the main Balek instance upon startup. This folder is meant to be the main point of entry when developing Balek applications. Inside a modules' directory should be all the javascript, html, css, as well as any third party modules they utilise.

Developers can extend base Module, Instance and Interface base classes when creating their custom modules. If inclined they can also copy the structure of example modules for organizing its elements.

#### Sessions
A connection through a secure websocket to the Balek Instance starts a _Session_ that can:
* create, edit, and switch workspaces
* load _Module_ Instances
* be claimed with a users credentials

### Workspaces
Workspaces can contain and organize Interfaces

## User Guide
Found in src/balek-modules/users/guide/resources/docs
