FROM node:11

WORKDIR /balek
COPY ./ /balek

RUN npm install

RUN npm --prefix ./src/balek-modules install ./src/balek-modules
RUN npm --prefix ./src/balek-modules run build

RUN apt-get update
RUN apt-get install -y default-jre openssh-client

RUN npm run build
RUN npm --prefix ./src/balek-modules run buildRelease

#RUN mkdir
#RUN ssh-keygen -q -t rsa -N '' -f /id_rsa
#RUN mkdir ~/.ssh
#RUN cp /id_rsa.pub ~/.ssh/authorized_keys

# Run loadServer.js when the container launches

CMD ["node", "loadServer.js"]




EXPOSE 8080
