app.registerModule("mod", "./imports/mod.html", function (sb) {
    var mod = {};
    var count = 1;
    mod.tokenEvl = sb.subscribe("evL", function (msg) { sb.extensions.log.info(msg); });
            
    document.getElementById("load").onclick = function () {        
        sb.publish('evL', 'publish: ' + count);
        sb.unsubscribe(mod.tokenEvl);
        count = 0;
    };
    document.getElementById("new").onclick = function () {
        count++;
        sb.subscribe("evL", function (msg) { sb.extensions.log.info(msg);  });        
    };
});
