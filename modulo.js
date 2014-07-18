var app = app || {};

(function () {    

    var core = {};
    var libs = {};
    core.extensions = {};
    
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
    var modules = {};
        
    function loadLibs() {
        var args = [].slice.call(arguments, 0);                
        args.forEach(function (lib, index, array) {
            if (window[lib]) {
                libs[lib] = window[lib];
                delete window[lib];
            }
            else {
                console.error('The lib "' + lib + '" not found');
            }
        });
    }    
    
    function registerExtension(id, fn) {
        if (core.extensions[id]) console.error('there is an extension with name: "' + id + '"');
        core.extensions[id] = fn(libs);
    };

    var Sandbox = function (element) {
        var sandbox = {};

        sandbox.subscribe = function (context, channel, fn) {
            core.event.subscribe(element.id, context, channel, fn);
        };

        sandbox.publish = function (channel, msg) {
            core.event.publish(element.id, channel, msg);
        };

        sandbox.unsubscribe = function (context, channel) {
            core.event.unsubscribe(element.id, context, channel);
        };

        sandbox.extensions = (function () { return core.extensions; }());

        return sandbox;
    };
    core.register = function (moduleId, constructor) {
        if (!modules[moduleId]) {
            modules[moduleId] = new constructor(new Sandbox(moduleId, core));
        }
    };

    /*core.registerModule = function (id, constructor) {
        var moduleElement = Object.create(HTMLElement.prototype);
        moduleElement.createdCallback = function () {
            var element = this;
            constructor(new Sandbox(element));
            //if (!element.destroy)
            //    throw "'destroy' do modulo '" + id + "'� obrigat�rio";
        };
        moduleElement.attachedCallback = function () { };
        moduleElement.detachedCallback = function () { };
        moduleElement.attributeChangedCallback = function () { };
        document.registerElement('module-' + id, { prototype: moduleElement });
    };*/



    
    app.register = core.register;
    app.loadLibs = loadLibs;
    app.registerExtension = registerExtension;
}());
