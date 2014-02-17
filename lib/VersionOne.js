(function () {

    var request = require('request');
    var mockScopes = require('../data/scopes.json');
    var mockBacklogs = require('../data/backlogs.json');
    var mockStatuses = require('../data/statuses.json');

    module.exports = {

        VersionOne: VersionOne = (function () {
            var statusMap = {};

            function VersionOne(hostname, instance, username, password, port, protocol, mockData) {
                this.hostname = hostname != null ? hostname : 'localhost';
                this.instance = instance != null ? instance : 'VersionOne.Web';
                this.username = username != null ? username : 'admin';
                this.password = password != null ? password : 'admin';
                this.port = port != null ? port : 80;
                this.protocol = protocol != null ? protocol : 'http';
                this.auth = "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");
                this.mockData = mockData;

                this.getStatuses({
                    success: function(body) {
                        if (body) {
                            var results = JSON.parse(body);
                            for (var i = 0; i < results.Assets.length; i++) {
                                statusMap[results.Assets[i].Attributes.Name.value] = results.Assets[i].id;
                            }
                        }
                    },
                    failure: function() {
                        console.log('Could not get statuses');
                    }
                });

                return this;
            };

            /**
             * Get a list of scopes that have an EndDate later than today
             */
            VersionOne.prototype.getScopes = function (query) {
                if (this.mockData) {
                    query.success(JSON.stringify(mockScopes, null, 4));
                } else {
                    var today = new Date(),
                        todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    request({
                        method: 'GET',
                        //proxy: 'http://localhost:8888',
                        uri: this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                            this.instance + "/rest-1.v1/Data/Scope?where=EndDate>'" + todayStr + "'|EndDate=''&accept=text/json",
                        headers: {
                            "Authorization": this.auth
                        }
                    }, function (error, response, body) {
                        if (error) {
                            query.failure(response, body);
                        } else {
                            query.success(body, response);
                        }
                    });
                }
            };

            VersionOne.prototype.query = function (query) {
                if (this.mockData) {
                    query.success(JSON.stringify(mockBacklogs, null, 4));
                } else {
                    request({
                        method: 'GET',
                        proxy: 'http://localhost:8888',
                        uri: this.buildUrl(query),
                        headers: {
                            "Authorization": this.auth
                        }
                    }, function (error, response, body) {
                        if (error) {
                            query.failure(response, body);
                        } else {
                            query.success(body, response);
                        }
                    });
                }
            };

            VersionOne.prototype.getHistory = function (query) {
                request({
                    method: 'GET',
                    proxy: 'http://localhost:8888',
                    uri: 'http://corpusweb760.corp.emc.com/VersionOne/rest-1.v1/Hist/Story/' + query.storyId + '?sel=Name,ChangeDate,Status,Scope&accept=text/json',
                    headers: {
                        "Authorization": this.auth
                    }
                }, function (error, response, body) {
                    if (error) {
                        query.failure(response, body);
                    } else {
                        query.success(body, response);
                    }
                });
            };

            VersionOne.prototype.update = function (backlogId, estimate, status, callback) {
                if (this.mockData) {
                    console.log('UPDATE: ' + backlogId + ' ' + estimate + ' ' + status);
                } else {
                    request({
                        method: 'POST',
                        //proxy: 'http://localhost:8888',
                        uri: this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                            this.instance + '/rest-1.v1/Data/Story/' + backlogId + '?accept=text/json',
                        headers: {
                            "Authorization": this.auth,
                            "Content-Type": "application/xml"
                        },
                        body: '<Asset><Attribute name="Estimate" act="set">' + estimate + '</Attribute><Attribute name="Status" act="set">' + statusMap[status] + '</Attribute></Asset>'
                    }, callback);
                }
            };

            /**
             * Update the status of a backlog.
             *
             * TODO: Perhaps merge this with the update method.
             *
             * @param backlogId
             * @param status
             * @param callback
             */
            VersionOne.prototype.updateStatus = function (backlogId, status, callback) {
                if (this.mockData) {
                    console.log('UPDATE: ' + backlogId + ' ' + status);
                    callback(true);
                } else {
                    request({
                        method: 'POST',
                        //proxy: 'http://localhost:8888',
                        uri: this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                            this.instance + '/rest-1.v1/Data/Story/' + backlogId + '?accept=text/json',
                        headers: {
                            "Authorization": this.auth,
                            "Content-Type": "application/xml"
                        },
                        body: '<Asset><Attribute name="Status" act="set">' + statusMap[status] + '</Attribute></Asset>'
                    }, callback);
                }
            };

            /**
             *
             */
            VersionOne.prototype.getStatuses = function (query) {

                if (this.mockData) {
                    query.success(JSON.stringify(mockStatuses, null, 4));
                } else {
                    console.log('GETTING');
                    request({
                        method: 'GET',
                        proxy: 'http://localhost:8888',
                        uri: this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                            this.instance + "/rest-1.v1/Data/StoryStatus?&accept=text/json",
                        headers: {
                            "Authorization": this.auth
                        }
                    }, function (error, response, body) {
                        if (error) {
                            query.failure(response, body);
                        } else {
                            query.success(body, response);
                        }
                    });
                }
            };

            VersionOne.prototype.buildUrl = function (query) {
                var url = this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                    this.instance + '/rest-1.v1/Data/' + query.from + '?' + this.buildSelectClause(query.select) + '&' + this.buildWhereClause(query.where) + '&accept=text/json';
                return url;
            };

            /**
             * Build a from clause parameter from the query.where object
             */
            VersionOne.prototype.buildWhereClause = function (where) {
                var whereStr = 'where=', prop;

                for (prop in where) {
                    if (where.hasOwnProperty(prop)) {
                        whereStr += prop + '=\'' + where[prop] + '\';';
                    }
                }

                //remove the last character (;)
                if ('' !== whereStr) {
                    whereStr = whereStr.substring(0, whereStr.length - 1);
                }
                return whereStr;
            };

            /**
             *
             */
            VersionOne.prototype.buildSelectClause = function (select) {
                var selectStr = 'sel=', i;

                if (!select) {
                    return "";
                }
                for (i = 0; i < select.length; i++) {
                    selectStr += select[i] + ',';
                }

                //remove the last character (;)
                if ('sel=' !== selectStr) {
                    selectStr = selectStr.substring(0, selectStr.length - 1);
                } else {
					selectStr = '';
				}
                return selectStr;
            };

            /**
             *
             */
            VersionOne.prototype.buildBacklogUrl = function (assetId) {
                return this.protocol + '://' + this.hostname + ':' + this.port + '/' +
                    this.instance + '/story.mvc/Summary?oidToken=' + assetId;
            };


            return VersionOne;
        })()
    };
}());