FROM node:11

WORKDIR /balek
COPY ./ /balek

RUN npm install

RUN npm --prefix ./src/balek-modules install ./src/balek-modules
RUN npm --prefix ./src/balek-modules run build

RUN apt-get update
RUN apt-get install -y default-jre

RUN npm run build

# Run loadServer.js when the container launches
CMD ["node", "loadServer.js"]

EXPOSE 8080