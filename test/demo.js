/**
 * @date 2026-03-14
 */

(function() {

    console.log("UIStats", UIStats);

    var myStats = {
        time : "time",
        PI: Math.PI
    }
    var uiStats = new UIStats( myStats );
    myStats = uiStats.proxy;
    uiStats.add( 'time' ).precision( 3 );
    uiStats.add( 'PI' ).precision(3).suffic(" ;)");

})();