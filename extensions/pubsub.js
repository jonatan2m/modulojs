app.registerExtension('pubsub', function (libs) {
    var channels = {};
    var count = 0;
    var subscribe = function (channel, fn) {

        if (typeof fn !== 'function') {
            return false;
        }

        if (!channels[channel]) {
            channels[channel] = {};            
        }
        var token = "id_" + (++count);

        channels[channel][token] = fn;

        return token;       
    };
    var publish = function (channel, msg) {
        if (typeof channels[channel] !== 'undefined') {
            var sub = channels[channel];
            for (var token in sub)
                sub[token](msg);
        }
    };
    var unsubscribe = function (token) {
        var result = false;
        for (var c in channels)
        {
            if (channels.hasOwnProperty(c))
            {
                var channel = channels[c];
                if (channel[token]) {
                    delete channel[token];
                    result = true;
                    break;
                }
            }
        }
        return result;
    };
    return {
        subscribe: subscribe,
        publish: publish,
        unsubscribe: unsubscribe
    };
});