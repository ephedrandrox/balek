#!/bin/bash

# Check if hostname argument is provided
if [ -z "$1" ]; then
    echo "Error: Hostname argument missing."
    echo "Usage: ./configureFor.sh <hostname>"
    exit 1
fi

# Set the hostname argument
hostname="$1"

# Run Certbot command
docker run -p 80:80 -it --rm --name certbot \
    -v "$HOME/certs:/etc/letsencrypt" \
    -v "$HOME/certsvar:/var/lib/letsencrypt" \
    certbot/certbot certonly --standalone --preferred-challenges http -d "$hostname"

# Check if Certbot command succeeded
if [ "$?" -ne 0 ]; then
    echo "Certbot command failed."
    exit 1
fi

# Copy certificates
sudo cp -L "$HOME/certs/live/$hostname/cert.pem" ./builds/digiscan/config/balek/cert/cert.pem
sudo cp -L "$HOME/certs/live/$hostname/privkey.pem" ./builds/digiscan/config/balek/cert/key.pem

# Change ownership to current user
sudo chown "$(whoami)" ./builds/digiscan/config/balek/cert.pem
sudo chown "$(whoami)" ./builds/digiscan/config/balek/key.pem

echo "Certificates copied successfully."

# Replace "nonamehost" in config.json with the given hostname
sed -i "s/nonamehost/$hostname/g" ./builds/digiscan/config/balek/config.json

echo "Hostname replaced in config.json."