app.registerExtension('http', function (libs) {

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
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
                return query.join("&");
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
                    if (xmlhttp.status == 200) {
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
            if (options.method == 'POST')
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(options.data || null);
        };

        function get(url, fn) {
            var options = {};
            if (typeof url === 'object')
                options = url;
            else
                options.url = url;

            options.data = getParams(options.data);
            if (typeof options.data !== 'undefined' && options.data !== null && typeof options.data !== 'object') {
                options.url = options.url + '?' + options.data;
            }
            options.method = "GET";            
            request(options, fn);
        }

        function post(url, fn) {
            var options = {};
            if (typeof url === 'object')
                options = url;
            else
                options.url = url;

            options.data = getParams(options.data);
            options.method = "POST";
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
            post: post            
        };
});