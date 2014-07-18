var app = app || {};

(function () {    

    var core = {};
    var libs = {};
    core.extensions = {};
    
    core.http = (function (){
        var xmlhttp;

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        var request = function(method, url, fn){
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 ) {
                    if(xmlhttp.status == 200){                        
                        fn(xmlhttp.responseText);
                    }
                    else if(xmlhttp.status == 400) {
                        alert('There was an error 400');
                    }
                }
                /*else {
               alert('something else other than 200 was returned')
                }*/
            }

            xmlhttp.open(method, url, true);
            xmlhttp.send();
        };

        function get(url, fn){
            request("GET", url, fn);
        }

        function post(url, fn){
            request("POST", url, fn);
        }

        return {
            get: get,
            post : post
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
            var sub = channels[channel][context];
            for (var i = 0; i < sub.length; i++)
                sub[i].callback(msg);
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

        return sandbox;
    };

    core.registerModule = function (id, htmlFile, constructor) {
        var moduleElement = Object.create(HTMLElement.prototype);
        moduleElement.createdCallback = function () {
                       
            (function (element){    
                function fn(html){
                    element.innerHTML = html ;
                    constructor(new Sandbox(id, element));
                }

                core.http.get(htmlFile, fn);
            }(this));
            //if (!element.destroy)
            //    throw "'destroy' do modulo '" + id + "'� obrigat�rio";
        };
        moduleElement.attachedCallback = function () { };
        moduleElement.detachedCallback = function () { };
        moduleElement.attributeChangedCallback = function () { };
        document.registerElement('module-' + id, { prototype: moduleElement });
    };
    
    app.registerModule = core.registerModule;
    app.registerLib = registerLib;
    app.registerExtension = registerExtension;
}());
