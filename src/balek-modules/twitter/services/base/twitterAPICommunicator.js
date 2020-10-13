/*
    To use the twitter API you must get API Keys from twitter
    and use them to set the following environment variables
            TWITTER_CONSUMER_KEY
            TWITTER_CONSUMER_KEY_SECRET
            TWITTER_ACCESS_TOKEN
            TWITTER_ACCESS_TOKEN_SECRET
    This service uses the OAUTH 1.0 authentication as outlined
    in the twitter API development documentation

    This is the base class that is used to extend Balek Twitter
    API services. It main purpose is to create the OAUTH
    authentication header for twitter API services.
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/node!https',
        'dojo/node!crypto',
    ],
    function (declare,
              lang,
              nodeHttps,
              nodeCrypto) {
        return declare("twitterAPICommunicatorService", null, {

            _oauthConsumerKey: null,
            _oauthConsumerSecret: null,
            _oauthAccessToken: null,
            _oauthAccessTokenSecret: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._oauthConsumerKey = process.env.TWITTER_CONSUMER_KEY;
                this._oauthConsumerSecret = process.env.TWITTER_CONSUMER_KEY_SECRET;
                this._oauthAccessToken= process.env.TWITTER_ACCESS_TOKEN;
                this._oauthAccessTokenSecret= process.env.TWITTER_ACCESS_TOKEN_SECRET;

                console.log("twitterAPICommunicatorService starting...");
            },
            testConnection: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {


                    const requestOptions = {
                        hostname: "api.twitter.com",
                        port: "443",
                        url: "/1.1/account/verify_credentials.json",
                        method: "GET",
                        requestParameters : {"include_entities": "false",
                        "skip_status": "true"}
                    }

                    const httpsOptions = this.getHttpsOptions(requestOptions);

                    const testRequest = nodeHttps.request(httpsOptions, lang.hitch(this, function(result){
                        if(result.statusCode === 401)
                        { //unauthorized
                            Reject({error: "Not authorized, check creditials"});
                        }else  if(result.statusCode === 404)
                        {//Url not found
                            Reject({error: "Address not found, check path and host"});
                        }
                        let resultData = "";
                        result.on('data', lang.hitch(this, function(data){
                            // console.log(data.toString('utf8'));
                            resultData += data.toString('utf8');
                        }));

                        result.on('end', lang.hitch(this,function(){
                            try{
                                let resultObject = JSON.parse(resultData) ;
                                Resolve(resultObject);
                            }
                            catch(error){
                                Reject(error);
                            }
                        }));
                    }));

                    testRequest.on('error', lang.hitch(this, function(error){
                        console.log(error);
                        debugger;
                        Reject(error);
                    }));

                    testRequest.end();

                }));

                },

            getHttpsOptions: function(requestOptions)
            {

                let urlOptions = requestOptions.requestParameters;
                let requestPath = "https://"+requestOptions.hostname+requestOptions.url;
                let path = requestOptions.url;
                let urlKeyValuesArray = [];

                let urlOptionsPrecedingToken = "?";
                for(const urlOption in urlOptions)
                {
                    path += urlOptionsPrecedingToken + urlOption +"="+ urlOptions[urlOption];
                    urlOptionsPrecedingToken = "&";

                    urlKeyValuesArray.push({key: urlOption, value: urlOptions[urlOption]})

                }

                let authorizationHeader = this.getOauthHeader(urlKeyValuesArray, requestPath);

                const optionsToReturn = {
                    hostname: requestOptions.hostname,
                    port: requestOptions.port,
                    path: path,
                    method: requestOptions.method,
                    headers: { 'Authorization' : authorizationHeader },
                }

                return optionsToReturn;

            },
            getOauthHeader: function(urlKeyValuesArray, requestPath ){

                let oAuthNonce = nodeCrypto.randomBytes(32).toString('base64').replace(/[\W_]+/g,"A");
                let oAuthSignatureMethod = "HMAC-SHA1";
                let oAuthTimestamp = Math.floor(Date.now()/1000);
                let oAuthVersion = "1.0";


                let oauthKeyValuesArray =[
                    {key: 'oauth_consumer_key', value : this._oauthConsumerKey},
                    {key: 'oauth_nonce', value : oAuthNonce},
                    {key: 'oauth_signature_method', value : oAuthSignatureMethod},
                    {key: 'oauth_timestamp', value : oAuthTimestamp},
                    {key: 'oauth_token', value : this._oauthAccessToken},
                    {key: 'oauth_version', value : oAuthVersion},
                ];

                let oAuthSignature = this.getOauthSignature(urlKeyValuesArray.concat(oauthKeyValuesArray), requestPath);

                oauthKeyValuesArray.push({key: 'oauth_signature', value : oAuthSignature});

                oauthKeyValuesArray.sort(this.compareKeyValues);

                let authorizationHeader = "OAuth ";
                oauthKeyValuesArray.forEach(function(keyValue){
                    authorizationHeader += encodeURIComponent(keyValue.key)+"=\"" + encodeURIComponent(keyValue.value) + "\", ";
                });


                authorizationHeader = authorizationHeader.slice(0,-2);
                    return authorizationHeader;
            },
            getOauthSignature: function(keyValues,requestPath )
            {
                let parameterString = "";

                keyValues.sort(this.compareKeyValues);

                keyValues.forEach((item) =>{
                    parameterString += encodeURIComponent(item.key) + "=" + encodeURIComponent(item.value) +"&";
                });

                parameterString = parameterString.slice(0,-1);

                let signatureString = "GET&"+encodeURIComponent(requestPath) + "&"+encodeURIComponent(parameterString) ;
                let signingKey = encodeURIComponent(this._oauthConsumerSecret)+"&"+encodeURIComponent(this._oauthAccessTokenSecret);

                let signatureHash = nodeCrypto.createHmac('sha1',signingKey).update(signatureString).digest('base64');
                return signatureHash;
            },
            compareKeyValues: function( a, b ) {
                if ( a.key < b.key ){
                    return -1;
                }
                if ( a.key > b.key ){
                    return 1;
                }
                return 0;
            }
        });
    }
);