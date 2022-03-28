# Setting up Diaplode on OpenBSD
### Links:

* [Install Docker on Open BSD](https://medium.com/@dave_voutila/docker-on-openbsd-6-1-current-c620513b8110) 
* [Install MariaDB on OpenBSD](https://www.vultr.com/docs/how-to-install-mariadb-on-openbsd-7/) 
* [MongoDB on OpenBSD](http://jurgend.ddns.net/posts/post-8/)
    
## Steps Taken:

### openBSD Install
- [Get OpenBSD](https://www.openbsd.org/faq/faq4.html#Download)  
- [OpenBSD FAQ](https://www.openbsd.org/faq/index.html)  

### Setup Admin User
**add user to wheel**  
`usermod -G wheel <username`    

**Add wheel group to /etc/doas.conf**  
`permit persist :wheel`  
*persist allows password to be entered only once*

### Add packages
     doas pkg_add screen  
     doas  
     doas pkg_add git  
     doas pkg_add jdk  
     doas pkg_add jre  
     add /usr/local/jdk-11/bin to PATH  
     doas pkg_add node  
     doas pkg_add mariadb-server  

### Create Balek Mysql Database and User:
    mysql -u root -p < 000_createDatabases.sql
    CREATE USER balekAppUser@localhost IDENTIFIED BY balekAppPassword;
    GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES ON balek.* TO balekAppUser@localhost;
    FLUSH PRIVILEGES;

### Create Mongo User

`mongo admin --eval "db.createUser({user: root, pwd: rootPass, roles: [readWrite, dbAdminAnyDatabase]})"`

### Git and Build Diaplode

     Git and build Diaplode   
     git balek  
     checkout diaplode-main  
     npm install  
     npm run buildAll  
     npm run start  


Created Diaplode user for ssh