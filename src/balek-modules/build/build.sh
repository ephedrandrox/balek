#!/bin/sh
#Builds the libraries
pwd

npm install

mkdir -p lib

# todo remove package.json from balek-modules
# todo build these libs
#Xterm -

#copy Main
cp -Rf node_modules/xterm lib/

cp -Rf node_modules/xterm-addon-fit lib/


#Codemirror
cp -Rf node_modules/codemirror lib/


#Quill

mkdir -p lib/quill
mkdir -p lib/quill/dist


npm install --prefix build/quill/
npm run build --prefix build/quill/
#copy main javascript library
cp  build/quill/dist/quill.js lib/quill/dist/quill.js
cp  build/quill/dist/quill.core.css lib/quill/dist/quill.core.css
cp  build/quill/dist/quill.snow.css lib/quill/dist/quill.snow.css



