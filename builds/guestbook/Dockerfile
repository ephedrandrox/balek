FROM node:11

WORKDIR /balek
COPY ./ /balek

RUN npm install

RUN apt-get update
RUN apt-get install -y default-jre

#Next two lines for windows docker hosts, otherwise not needed
RUN apt-get install -y dos2unix
RUN find /balek -type f -print0 | xargs -0 -n 1 -P 4 dos2unix


RUN npm run build

# Run loadServer.js when the container launches
CMD ["node", "loadServer.js"]

EXPOSE 8080