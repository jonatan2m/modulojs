app.registerModule("moduloA", "./imports/moduloA.html", function (sb) {   

	document.getElementById("btnModuloA").onclick = function () {        
        sb.publish('evL', 'publish: evL');
    };
});