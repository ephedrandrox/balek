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

    usermod -G wheel <username>

**Add wheel group to /etc/doas.conf**  

    permit persist :wheel
*persist allows password to be entered only once*

### Add packages 
***neofetch*** and ***screen*** are optional

    doas pkg_add neofetch screen git jdk node mariadb-server mongodb

### Setup Java
add /usr/local/jdk-1.8.0/bin to PATH  

    export PATH=$PATH:/usr/local/jre-1.8.0/bin
    vi ~/.profile


### Setup MySQL
create databases, startup and secure installation  
    
    mysql_install_db
    rcctl enable mysqld
    rcctl start mysqld
    rcctl check mysqld
    mysql_secure_installation

#### Create Balek Mysql Database and User:
Dump initial Balek Database with Demo User

    mysql -u root -p < ~/balek/builds/docker/mysql/initSQL/000_createDatabases.sql
Create Balek App User

    CREATE USER 'balekAppUser'@'localhost' IDENTIFIED BY balekAppPassword;
    GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES ON balek.* TO 'balekAppUser@localhost';
    FLUSH PRIVILEGES;

### Setup Mongo
####Create database directory and configure mongod
    mkdir ~/mongo_databases
    chown -R _mongodb:_mongodb ~/mongo_databases
    vi /etc/mongodb.conf

Change `dbPath` to the `mongo_databases` directory

#### Create Mongo User

    mongo admin --eval "db.createUser({user: 'root', pwd: 'rootPass', roles: ['readWrite', 'dbAdminAnyDatabase']})"

### Git and Build Diaplode

Git and build Diaplode   

     git balek  
     checkout diaplode-main  
     npm install  
     npm run buildAll  
     npm run start  


### Generate and authorize SSH Keys
For the terminal to work, we need to be able to ssh to localhost  

    ssh-keygen
    cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys
