app.registerExtension('pubsub', function (libs) {
    var channels = {};
    var subscribe = function (moduleId, channel, fn) {
        if (!channels[channel]) {
            channels[channel] = [];            
            channels[channel].push({ module: moduleId, callback: fn });
        }
        else {
            var hasItem = channels[channel].some(function (element, index, array) {
                return element.module == moduleId;
            });
            if (!hasItem)
                channels[channel].push({ module: moduleId, callback: fn });
        }
    };
    var publish = function (channel, msg) {
        if (typeof channels[channel] !== 'undefined' && typeof channels[channel] !== 'undefined') {
            var sub = channels[channel];
            for (var i = 0; i < sub.length; i++)
                sub[i].callback(msg);
        }
    };
    var unsubscribe = function (moduleId, channel) {
        var sub = channels[channel];
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