app.registerExtension('pubsub', function (libs) {
    var channels = {};
    var count = 0;
    var debug = false;
    var subscribe = function (channel, fn) {

        if (typeof fn !== 'function') {
            console.error("To subscribe the channel " + channel + ", you must pass a function");           
            return false;
        }

        if (!channels[channel]) {
            if (debug)
                console.debug("The channel " + channel + " is creating...");
            channels[channel] = {};            
        }
        var token = "id_" + (++count);

        if (debug)
            console.debug("The channel " + channel + " has a new subscriber. Action to be executed: " + fn.name);
        channels[channel][token] = fn;

        return token;       
    };
    var publish = function (channel, msg) {
        if (typeof channels[channel] !== 'undefined') {
            var sub = channels[channel];
            for (var token in sub){
                if (debug)
                    console.debug("The channel " + channel + " is sending message...", msg);         
                sub[token](msg);
            }
        }else{
            if (debug)
                console.error("The channel " + channel + " is undefined. The message don't send:" , msg);
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
        unsubscribe: unsubscribe,
        debug: debug
    };
});