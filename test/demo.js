/**
 * @date 2026-03-14
 */

(function () {
  window.addEventListener("load", function () {
    console.log("UIStats", UIStats);

    var myStats = {
      time: "time",
      iteration: 0,
      PI: Math.PI
    };
    var uiStats = new UIStats(myStats);
    uiStats.add("time").precision(3);
    uiStats.add("iteration");
    uiStats.add("PI").precision(3).suffix(" ;)");
    myStats = uiStats.proxy;

    var updateTime = function () {
      myStats.time = Date.now();
      myStats.iteration++;
      myStats.PI = Math.PI;
    };

    window.setInterval(updateTime, 1000);
  });
})();
