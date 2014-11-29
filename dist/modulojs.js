var app = app || {};

(function () {
    /* Hacks
    IE7 and IE8 
    */
    if (!Array.prototype.some) {
        Array.prototype.some = (function () {
            return function (fn) {
                var result = false;
                for (var i = 0; i < this.length; i++) {
                    if (fn(this[i], i, this)) {
                        result = true;
                        break;
                    }
                }
                return result;
            };
        }());
    }

    var core = {};
    var libs = {};
    core.extensions = {};

   
    function registerLib(id, obj) {
        libs[id] = obj;
    }

    function registerExtension(id, fn) {
        if (core.extensions[id]) console.error('there is an extension with name: "' + id + '"');
        core.extensions[id] = fn(libs);
    }

    var Sandbox = function (moduleId, element) {
        var sandbox = {};

        sandbox.element = element;

        sandbox.subscribe = function (channel, fn) {
            return core.extensions.pubsub.subscribe(channel, fn);
        };

        sandbox.publish = function (channel, msg) {
            core.extensions.pubsub.publish(channel, msg);
        };

        sandbox.unsubscribe = function (token) {
            return core.extensions.pubsub.unsubscribe(token);
        };

        sandbox.extensions = (function () { return core.extensions; }());
        
        return sandbox;
    };

    core.registerModule = function (id, htmlFile, constructor) {
        var moduleElement = document.getElementById(id);

        function fn(html) {
              if(moduleElement)
                moduleElement.innerHTML = html;
            constructor(new Sandbox(id, moduleElement));
        }
        if (typeof htmlFile !== 'function')
            core.extensions.http.get(htmlFile, fn);
        else {
            constructor = constructor || htmlFile;
            fn('');
        }
    };

    app.registerModule = core.registerModule;
    app.registerLib = registerLib;
    app.registerExtension = registerExtension;
}());
;app.registerExtension('http', function (libs) {

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
            };
            
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
});;app.registerExtension('pubsub', function (libs) {
    var channels = {};
    var subscribe = function (moduleId, context, channel, fn) {
        if (!channels[channel]) {
            channels[channel] = {};
            channels[channel][context] = [];
            channels[channel][context].push({ module: moduleId, callback: fn });
        }
        else {
            var hasItem = channels[channel][context].some(function (element, index, array) {
                return element.module == moduleId;
            });
            if (!hasItem)
                channels[channel][context].push({ module: moduleId, callback: fn });
        }
    };
    var publish = function (context, channel, msg) {
        if (typeof channels[channel] !== 'undefined' && typeof channels[channel][context] !== 'undefined') {
            var sub = channels[channel][context];
            for (var i = 0; i < sub.length; i++)
                sub[i].callback(msg);
        }
    };
    var unsubscribe = function (moduleId, context, channel) {
        var sub = channels[channel][context];
        sub.some(function (element, index, array) {
            if (element.module == moduleId) {
                array.splice(index, 1);
                return true;
            }
            return false;
        });
    };
    return {
        subscribe: subscribe,
        publish: publish,
        unsubscribe: unsubscribe
    };
});