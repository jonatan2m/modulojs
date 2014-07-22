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

    core.http = (function () {

        function getXMLHttpRequest() {

            if (window.XMLHttpRequest) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                return new XMLHttpRequest();
            } else {
                // code for IE6, IE5
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        }

        var request = function (options, fn) {
            var xmlhttp = getXMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        fn(xmlhttp.responseText);
                    }
                    else if (xmlhttp.status == 400) {
                        alert('There was an error 400');
                    }
                }
                /*else {
               alert('something else other than 200 was returned')
                }*/
            }
            
            if (typeof options.data !== 'undefined' && options.data !== null && typeof options.data !== 'object') {
                options.url = options.url + '?' + options.data;
            }
            xmlhttp.open(options.method, options.url);            
            xmlhttp.send(options.data || null);
        };

        function get(options, fn) {
            if (!options.url)
                throw options.url;
            options.method = "GET";            
            if (typeof options.data === 'object')
            {
                var query = [];
                for (var key in options.data) {
                    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]));
                }
                options.data = query.join("&");
            }
            
            request(options, fn);
        }

        function post(options, fn) {
            if (!options.url)
                throw options.url;
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

    }());

    core.event = (function () {
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
        }

        return {
            subscribe: subscribe,
            publish: publish,
            unsubscribe: unsubscribe
        };
    }());

    function registerLib(id, obj) {
        libs[id] = obj;
    }

    function registerExtension(id, fn) {
        if (core.extensions[id]) console.error('there is an extension with name: "' + id + '"');
        core.extensions[id] = fn(libs);
    };

    var Sandbox = function (moduleId, element) {
        var sandbox = {};

        sandbox.element = element;

        sandbox.subscribe = function (context, channel, fn) {
            core.event.subscribe(moduleId, context, channel, fn);
        };

        sandbox.publish = function (channel, msg) {
            core.event.publish(moduleId, channel, msg);
        };

        sandbox.unsubscribe = function (context, channel) {
            core.event.unsubscribe(moduleId, context, channel);
        };

        sandbox.extensions = (function () { return core.extensions; }());

        sandbox.http = (function () {
            return {
                get: function (options, fn) {
                    core.http.get(options, fn);
                },
                post: function (options, fn) {
                    core.http.post(options, fn);
                }
            };
        }());

        return sandbox;
    };

    core.registerModule = function (id, htmlFile, constructor) {
        var moduleElement = document.getElementById(id);

        function fn(html) {
            moduleElement.innerHTML = html;
            constructor(new Sandbox(id, moduleElement));
        }
        if (typeof htmlFile !== 'function')
            core.http.get({ url: htmlFile }, fn);
        else {
            constructor = constructor || htmlFile;
            fn('');
        }
    };

    app.registerModule = core.registerModule;
    app.registerLib = registerLib;
    app.registerExtension = registerExtension;
}());
