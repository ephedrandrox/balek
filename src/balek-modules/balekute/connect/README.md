# Balekute Connect Module
This module is responsible for authenticating with Devices

You can create Invitation and Target keys with the Connect module. An owner claim key is also created by the module to claim an installation.

## Target Key
A target key is used to authenticate a Balek session using a device.
### Target Key Lifecycle
1. A target key is created by the Connect module for an unclaimed session
2. A device signs its user in with the target key

## Invitation Key
An invitation key is used to set a device to a user's Balek account.
### Invitation Key Lifecycle
1. An invitation key is created by an admin user singed into a session
2. The user sends the invitation key to the device
3. The device sends its configuration to accept the invitation key
4. The user accepts or denies the device's configuration

## Owner Claim Key
An owner claim key is used to claim an installation.
### Owner Claim Key Lifecycle
1. An owner claim key is created by the Connect module on startup if an owner device is not set.
2. The admin gets the owner claim key from the terminal
3. The admin sends the owner claim key to the device
4. The device sends its configuration to accept the owner claim key
5. The owner claim key is deactivated
6. The connect module sets the device as the owner device 