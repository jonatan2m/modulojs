app.registerExtension('pubsub', function (libs) {
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
});