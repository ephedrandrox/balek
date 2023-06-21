FROM node

WORKDIR /balek
COPY ./ /balek

RUN npm install

#RUN npm --prefix ./src/balek-modules install ./src/balek-modules
#RUN npm --prefix ./src/balek-modules run build

RUN apt-get update
RUN apt-get install -y default-jre openssh-client neofetch

#Next two lines for windows docker hosts, otherwise not needed
RUN apt-get install -y dos2unix
RUN find /balek -type f -print0 | xargs -0 -n 1 -P 4 dos2unix

RUN npm run buildAll
#RUN npm --prefix ./src/balek-modules run buildRelease

#RUN mkdir
#RUN ssh-keygen -q -t rsa -N '' -f /id_rsa
#RUN mkdir ~/.ssh
#RUN cp /id_rsa.pub ~/.ssh/authorized_keys

# Run loadServer.js when the container launches

CMD ["node", "loadServer.js"]




EXPOSE 8080
