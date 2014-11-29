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
    };

    var Sandbox = function (moduleId, element) {
        var sandbox = {};

        sandbox.element = element;

        sandbox.subscribe = function (channel, fn) {
            return core.extensions["pubsub"].subscribe(channel, fn);
        };

        sandbox.publish = function (channel, msg) {
            core.extensions["pubsub"].publish(channel, msg);
        };

        sandbox.unsubscribe = function (token) {
            return core.extensions["pubsub"].unsubscribe(token);
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
            core.extensions["http"].get(htmlFile, fn);
        else {
            constructor = constructor || htmlFile;
            fn('');
        }
    };

    app.registerModule = core.registerModule;
    app.registerLib = registerLib;
    app.registerExtension = registerExtension;
}());
