(function() {
	
	var request = require('request');
	
	module.exports = {
			
	   VersionOne: VersionOne = (function() {
	      function VersionOne(hostname, instance, username, password, port, protocol) {
	         this.hostname = hostname != null ? hostname : 'localhost';
	         this.instance = instance != null ? instance : 'VersionOne.Web';
	         this.username = username != null ? username : 'admin';
	         this.password = password != null ? password : 'admin';
	         this.port = port != null ? port : 80;
	         this.protocol = protocol != null ? protocol : 'http';
	         this.auth = "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");
	         return this;
	      };
	
	      VersionOne.prototype.query = function(query) {
	         request({
	            method: 'GET',
	           // proxy: 'http://localhost:8888',
	    		   uri: this.buildUrl(query),
	    		   headers : {
	    			   "Authorization" : this.auth
	    	   	}
	    	   }, function (error, response, body) {
	    		   if (error) {
	    		   	
	    			   query.failure(response, body);
	    			   
	    		   } else {
				   
					   query.success(body, response);	
					   
	    		   }		   
	         });
	      };
	      
	      VersionOne.prototype.buildUrl = function(query) {
	    	   var url = this.protocol + '://' + this.hostname + ':' + this.port + '/' + 
	    	             this.instance + '/rest-1.v1/Data/' + query.from + '?' + this.buildSelectClause(query.select) + '&' + this.buildWhereClause(query.where) + '&accept=text/json';
	    	   return url;
	      };
	      
	      /**
	       * Build a from clause parameter from the query.where object
	       */
	      VersionOne.prototype.buildWhereClause = function(where) {
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
	      VersionOne.prototype.buildSelectClause = function(select) {
	      	var selectStr = 'sel=', i;
	      	
	      	if (!select) {
	      		return "";
	      	}
	      	for (i = 0; i < select.length; i++) {
	      		selectStr += select[i] + ',';
	      	}
	      	
	      	//remove the last character (;)
	         if ('' !== selectStr) {
	         	selectStr = selectStr.substring(0, selectStr.length - 1);
	         }
	         return selectStr;
	      };
		  
		  /**
	       * 
	       */
	      VersionOne.prototype.buildBacklogUrl = function(assetId) {
	      	return this.protocol + '://' + this.hostname + ':' + this.port + '/' + 
	    	             this.instance + '/story.mvc/Summary?oidToken=' + assetId;
	      };
	      
	      
	      return VersionOne;
	   })()
	};
}());