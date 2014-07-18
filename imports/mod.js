app.registerModule("mod", "./imports/mod.html", function (sb) {    
    var count = 1;
    sb.subscribe("mod", "evL", function (msg) { sb.extensions.log.info(msg); });
            
    document.getElementById("load").onclick = function () {        
        sb.publish('evL', 'publish: ' + count);
        sb.unsubscribe("mod", "evL");
        count = 0;
    };
    document.getElementById("new").onclick = function () {
        count++;
        sb.subscribe("mod", "evL", function (msg) { sb.extensions.log.info(msg);  });        
    };
});
