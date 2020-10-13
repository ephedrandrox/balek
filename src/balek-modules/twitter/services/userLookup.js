/*
    To use the twitter API you must get API Keys from twitter
    and use them to set the following environment variables
            TWITTER_CONSUMER_KEY
            TWITTER_CONSUMER_KEY_SECRET
            TWITTER_ACCESS_TOKEN
            TWITTER_ACCESS_TOKEN_SECRET
    This service uses the OAUTH 1.0 authentication as outlined
    in the twitter API development documentation
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
        'balek-modules/twitter/services/base/twitterAPICommunicator',
        'dojo/node!https',
    ],
    function (declare,
              lang,
              Stateful,
              twitterAPICommunicator,
              nodeHttps) {
        return declare("twitterUserLookupService", twitterAPICommunicator, {

            _hostname: "api.twitter.com",                       //host of request
            _port: 443,                                         //port of request
            _method: "GET",                                     //method of request
            _url: "/2/users/by",                                //path to API resource

            _requestsMax: 900,                                  //How many requests we can make in cooldown period
            _requestsMaxUsersPerRequest:100,                    //How many users we can request at a time
            _requestCooldown: 900000,                           //Amount of time before requests reset

            _twitterUsersToLookup: null,                        //Users to lookup queue array
            _twitterUserInfoDataState: null,                    //User results added to this state object
            _twitterErrorDataState: null,                       //Error results added to this state object

            _processingQueue: false,                            //true when queue is processing
            _queueResetting: false,                             //true when waiting for queue to reset due to overload
            constructor: function (args) {
                declare.safeMixin(this, args);

                this._twitterUsersToLookup = [];

                let twitterUserInfoServiceState = declare([Stateful], {
                    requestsRemaining: 0,
                    Status: "Starting",
                    Error: null
                });

                this._serviceState = new twitterUserInfoServiceState({
                    requestsRemaining: lang.clone(this._requestsMax),
                    Status: "Starting",
                    Error: null
                });

                let twitterUserInfoDataState = declare([Stateful], {
                });

                this._twitterUserInfoDataState = new twitterUserInfoDataState();

                let twitterErrorDataState = declare([Stateful], {
                });

                this._twitterErrorDataState = new twitterErrorDataState();

                console.log("twitterUserLookupService starting...");

                this.testConnection().then(lang.hitch(this, function(testResults){
                    this._serviceState.set("Status", "Ready");
                })).catch(lang.hitch(this, function(errorValue){
                    this._serviceState.set("Status", "ERROR");
                    console.log(errorValue);
                }));
            },
            getServiceState(){
                return this._serviceState;
            },
            getDataState(){
                return this._twitterUserInfoDataState;
            },
            getErrorDataState(){
                return this._twitterErrorDataState;
            },
            requestUsersInfo(usersHandle){
                //We could check that the usernames are valid twitter names here
                //This may prevent unauthorized responses
                this.addUsersToQueue(usersHandle);
            },
            getUserInfoHttpsRequestOptions: function(users){
                return {
                    hostname: this._hostname,
                    port: this._port,
                    url: this._url,
                    method: this._method,
                    requestParameters : {usernames: users.toString(),
                        "user.fields": "profile_image_url,pinned_tweet_id,public_metrics",
                        "expansions": "pinned_tweet_id",
                        "tweet.fields" : "text"
                    }
                }
            },
            addUsersToQueue: function(users)
            {
                if(Array.isArray(users))
                {
                    this._twitterUsersToLookup = this._twitterUsersToLookup.concat(users);
                    console.log("DID add to queue");

                }else
                {
                    console.log("could not add to queue");
                }
                this._serviceState.set("usersInQueue", this._twitterUsersToLookup.length);

                if(!this._processingQueue){
                    this.processQueue();
                }
            },
            processQueue: function()
            {
                if(this._processingQueue === false)
                {
                    this._processingQueue = true;
                    this._serviceState.set("processingQueue", true);
                }

                let continueOrNot = lang.hitch(this, function(){
                    if( this._twitterUsersToLookup.length > 0 && requestsRemaining > 0 )
                    {
                        this.processQueue();
                    }else
                    {
                        if(this._twitterUsersToLookup.length === 0)
                        {
                            this._processingQueue = false;
                            this._serviceState.set("processingQueue", false);
                        }
                    }
                });
                let requestsRemaining =  this._serviceState.get("requestsRemaining");
                let amountToSplice = requestsRemaining < this._requestsMaxUsersPerRequest? requestsRemaining: this._requestsMaxUsersPerRequest;
                let usersToProcess = this._twitterUsersToLookup.splice(0,amountToSplice);
                requestsRemaining = requestsRemaining - usersToProcess.length;

                this._serviceState.set("requestsRemaining", requestsRemaining  );
                this._serviceState.set("usersInQueue", this._twitterUsersToLookup.length);

                this.twitterRequest( this.getUserInfoHttpsRequestOptions(usersToProcess));

                setTimeout(lang.hitch(this, function(){
                    if(!this._queueResetting){
                        requestsRemaining =  this._serviceState.get("requestsRemaining") + usersToProcess.length ;
                        this._serviceState.set("requestsRemaining", requestsRemaining  );
                        continueOrNot();
                    }
                }), this._requestCooldown);

                continueOrNot();

            },
            resetAndAddToQueue(usernamesToRetry)
            {
                if(this._queueResetting)
                {
                    this.addUsersToQueue(usernamesToRetry);
                }else
                {
                    this._queueResetting = true;
                    this._serviceState.set("requestsRemaining", 0  );
                    this.addUsersToQueue(usernamesToRetry);

                    setTimeout(lang.hitch(this, function(){
                        this._serviceState.set("requestsRemaining", this._requestsMax  );
                       this.processQueue();
                    }), this._requestCooldown);
                }
            },
            retryRequestOneAtATime(usernamesToRetry){
                let requestsRemaining =  this._serviceState.get("requestsRemaining");

                if(requestsRemaining => usernamesToRetry.length)
                {
                    usernamesToRetry.forEach(lang.hitch(this, function(usernameToRetry){
                        this.twitterRequest( this.getUserInfoHttpsRequestOptions(usernameToRetry));

                        setTimeout(lang.hitch(this, function(){
                            requestsRemaining =  this._serviceState.get("requestsRemaining") + 1 ;
                            this._serviceState.set("requestsRemaining", requestsRemaining  );
                        }), this._requestCooldown);
                    }));
                }else
                {
                    this.addUsersToQueue(usernamesToRetry);
                    console.log("Not enough room in queue to look up names independently, adding back to queue");
                }
            },
            twitterRequest: function(requestOptions)
            {
                //instead of holding userinfoState and error state, accept these as arguments
                const httpsOptions = this.getHttpsOptions(requestOptions);

                const userRequest = nodeHttps.request(httpsOptions, lang.hitch(this, function(result){
                    console.log(`statusCode: ${result.statusCode}`)

                    if(result.statusCode === 401)
                    {
                        //unauthorized
                    }else  if(result.statusCode === 404)
                    {
                        //Url not found
                    }else  if(result.statusCode === 429)
                    {
                        //rate limit exceeded
                        let usernamesToRetry = requestOptions.requestParameters.usernames.split(",");
                        this.resetAndAddToQueue(usernamesToRetry);
                    }
                    let resultData = "";
                    result.on('data', lang.hitch(this, function(data){
                        // console.log(data.toString('utf8'));
                        resultData += data.toString('utf8');
                    }));

                    result.on('end', lang.hitch(this,function(){
                        try{
                            let resultObject = JSON.parse(resultData) ;
                            this.processTwitterResults(resultObject);
                            if(resultObject.status && resultObject.status === 401)
                            {
                                let usernamesToRetry = requestOptions.requestParameters.usernames.split(",");
                                if(usernamesToRetry.length>1){
                                    this.retryRequestOneAtATime(usernamesToRetry);
                                }else {
                                    console.log("This user is the last one left that was unauthorized!-----------", usernamesToRetry);
                                }
                            }
                        }
                        catch(error){
                            console.log(error);
                            this.processTwitterResults(error);
                            console.log((resultData));
                        }
                    }));

                }));

                userRequest.on('error', lang.hitch(this, function(error){
                    console.log(error);
                }));

                userRequest.end();
            },
            processTwitterResults: function(resultData)
            {
                if (resultData && Array.isArray(resultData.data)){
                    resultData.data.forEach(lang.hitch(this,function(twitterUserInfo){
                        this._twitterUserInfoDataState.set(twitterUserInfo.name, twitterUserInfo);
                    }));
                }

                if (resultData && Array.isArray(resultData.errors)){
                    resultData.errors.forEach(lang.hitch(this,function(twitterErrorInfo){
                        if(twitterErrorInfo.resource_type && twitterErrorInfo.resource_type === 'user' && twitterErrorInfo.value )
                        {
                            this._twitterErrorDataState.set(twitterErrorInfo.value, twitterErrorInfo);
                        }else
                        {
                            console.log("!!!!!!!!!!!!!!!!!!Need to process this error info", twitterErrorInfo);
                        }
                    }));
                }
            }
        });
    }
);


