define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/topic',
        "dojo/node!path", "dojo/node!fs"],
    function (declare, lang, topic,
              pathNodeObject, fsNodeObject) {
        return declare("fileManager", null, {

            constructor: function (args) {

                console.log("Initializing file Manager..#########################################.");

                topic.subscribe("returnAllDirectoriesInPath", lang.hitch(this, this.returnAllDirectoriesInPath));
                topic.subscribe("returnAllFilesInPath", lang.hitch(this, this.returnAllFilesInPath));
                topic.subscribe("returnFileTree", lang.hitch(this, this.returnFileTree));
                topic.subscribe("returnFile", lang.hitch(this, this.returnFile));

            },
            returnFileSync: function (filePath, encoding) {

                console.log(filePath);
                fileData = fsNodeObject.readFileSync(filePath, encoding);
                return fileData;

            },
            returnFile: function (filePath, encoding, callback) {
                fsNodeObject.readFile(filePath, encoding, callback);
            },
            returnFileTree: function (filePath, returnCallback) {
                let fileTreeObject = {};
                fsNodeObject.readdir(filePath, lang.hitch(this, function (error, filesInDir) {
                    if (error) {
                        returnCallback(error, null)
                    } else if (filesInDir.length > 0) {

                        let numberOfFilesInDir = filesInDir.length;
                        let numberOfFilesChecked = 0;
                        filesInDir.forEach(lang.hitch(this, function (fileToCheck) {
                            fsNodeObject.stat(filePath + fileToCheck, lang.hitch(this, function (error, fileStats) {
                                if (error) {
                                    returnCallback(error, null);
                                } else {

                                    if (fileStats.isDirectory()) {
                                        this.returnFileTree(filePath + fileToCheck + "/", lang.hitch(this, function (error, fileToCheckTreeArray) {

                                            numberOfFilesChecked++;
                                            fileTreeObject[fileToCheck] = {
                                                __fileStats__: fileStats,
                                                __filePath__: filePath + fileToCheck, ...fileToCheckTreeArray
                                            };
                                            if (numberOfFilesChecked === numberOfFilesInDir) {
                                                returnCallback(null, fileTreeObject);
                                            }
                                        }));
                                    } else {
                                        numberOfFilesChecked++;
                                        fileTreeObject[fileToCheck] = {
                                            __fileStats__: fileStats,
                                            __filePath__: filePath + fileToCheck
                                        };
                                    }

                                    if (numberOfFilesChecked === numberOfFilesInDir) {
                                        returnCallback(null, fileTreeObject);
                                    }
                                }
                            }));
                        }));
                    } else {
                        returnCallback(null, null);
                    }
                }));
            },
            returnAllDirectoriesInPath: function (filePath, returnCallback) {
                fsNodeObject.readdir(filePath, function (error, filesInDir) {
                    if (error) {
                        returnCallback(error, null)
                    } else if (filesInDir.length > 0) {
                        let numberOfFilesInDir = filesInDir.length;
                        let numberOfFilesChecked = 0;
                        let directoriesInPath = [];
                        filesInDir.forEach(function (fileToCheck) {
                            fsNodeObject.stat(filePath + fileToCheck, function (error, fileStats) {
                                if (error) {
                                    returnCallback(error, null);
                                } else {
                                    if (fileStats.isDirectory()) {
                                        directoriesInPath.push(fileToCheck);
                                    }
                                    numberOfFilesChecked++;
                                    if (numberOfFilesChecked === numberOfFilesInDir) {
                                        returnCallback(null, directoriesInPath);
                                    }
                                }

                            });

                        });
                    } else {
                        returnCallback(null, null);
                    }
                });

            },
            returnAllFilesInPath: function (filePath, returnCallback) {
                //returnCallback error, Files
                fsNodeObject.readdir(filePath, function (error, filesInDir) {
                    if (error) {
                        returnCallback(error, null)
                    } else if (filesInDir.length > 0) {
                        returnCallback(null, filesInDir);
                    } else {
                        returnCallback(null, null);
                    }
                });

            }
        });
    });
