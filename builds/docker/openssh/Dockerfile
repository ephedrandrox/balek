FROM node:18-alpine AS node
FROM lscr.io/linuxserver/openssh-server:latest

RUN apk update
RUN apk add openssh-client

#RUN cd /config
#RUN ssh-keygen -q -t rsa -N '' -f /config/id_rsa
#RUN mkdir /config/.ssh
#RUN cp /config/id_rsa.pub /config/.ssh/authorized_keys
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin