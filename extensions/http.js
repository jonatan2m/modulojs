app.registerExtension('http', function (libs) {

    var processData = false;

        function getXMLHttpRequest() {

            if (window.XMLHttpRequest) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                return new XMLHttpRequest();
            } else {
                // code for IE6, IE5
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        }

        function getParams(data) {            
            if (typeof data === 'object') {
                var query = [];
                for (var key in data) {
                    if (Object.prototype.toString.call(data[key]) == '[object Array]') {
                        var items = data[key];
                        processData = true;
                        for (var index in items) {
                            query.push(encodeURIComponent(key+ "[]") + '=' + encodeURIComponent(items[index]));
                        }                        
                    }else
                        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }                
                data = query.join("&");
            } 
            return data;            
        }


        //aplicar filtro
        function converter(response) {

            function _json(data) {
                return JSON.parse(data);
            }

            try {
                return _json(response);
            } catch (e) {
                return response;
            }
        }
        var request = function (options, fn) {
            var xmlhttp = getXMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if ((xmlhttp.status == 200) || xmlhttp.status == 204) {
                        var response = typeof xmlhttp.responseText === "string" ? xmlhttp.responseText : undefined;
                        fn(converter(response));
                    }
                    else if (xmlhttp.status == 400) {
                        alert('There was an error 400');
                    }
                }
                /*else {
               alert('something else other than 200 was returned')
                }*/
            }
            
            xmlhttp.open(options.method, options.url);
            if (options.method == 'POST' || options.method == 'PUT' || processData) {                
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                xmlhttp.setRequestHeader("Accept", "*/*");
            }
            xmlhttp.send(processData && options.data || null);
        };

        function get(url, fn) {
            processData = false;
            var options = {};
            if (typeof url === 'object')
                options = url;
            else
                options.url = url;

            options.data = getParams(options.data);
            if (options.data !== null) {
                options.url = options.url + '?' + options.data;
            }
            options.method = "GET";            
            request(options, fn);
        }

        function post(url, fn) {
            processData = true;
            var options = {};
            if (typeof url === 'object')
                options = url;
            else
                options.url = url;

            options.data = getParams(options.data);
            options.method = "POST";
            request(options, fn);
        }

        function put(url, fn) {
            processData = true;
            var options = {};
            if (typeof url === 'object')
                options = url;
            else
                options.url = url;

            options.data = getParams(options.data);
            options.method = "PUT";
            request(options, fn);
        }
        
        /*Obsolete*/
        function getHTML(url, fn) {
            /*
            https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/HTML_in_XMLHttpRequest#Browser_compatibility
            */
            var xmlhttp = getXMLHttpRequest();
            xmlhttp.open("GET", url, true);
            xmlhttp.onload = function () { fn(this.responseText); };
            xmlhttp.send(null);
        }

        return {
            get: get,
            post: post,
            put: put
        };
});