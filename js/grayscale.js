/*!
 * Start Bootstrap - Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery to collapse the navbar on scroll
function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}

$(window).scroll(collapseNavbar);
$(document).ready(collapseNavbar);

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        console.log("When am I scrolling");
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $(".navbar-collapse").collapse('hide');
});


var grps;
var atts;
require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/arcgis/utils",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/parser",
        "dojo/_base/lang",
        "Plotly/plotly-latest.min",
        "moment/moment",
        "dojo/domReady!"
    ],
    function(
        Map,
        FeatureLayer,
        QueryTask,
        Query,
        arcgisutils,
        dom,domConstruct,
        on,parser,lang,plt,moment
    ) {

        parser.parse();
        var ageGrpby;


        //format
        String.format = function() {
            // The string containing the format items (e.g. "{0}")
            // will and always has to be the first argument.
            var theString = arguments[0];

            // start with the second argument (i = 1)
            for (var i = 1; i < arguments.length; i++) {
                // "gm" = RegEx options for Global search (more than one instance)
                // and for Multiline search
                var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                theString = theString.replace(regEx, arguments[i]);
            }

            return theString;
        };

        /*var map = new Map("map", {
            basemap: "gray",
            center:[-79.792369,41.765298],
            zoom: 6
        });*/

        var _1mmap = new Map("courseMap", {
            basemap: "satellite",
            center:[-70.939625,42.860688],
            zoom: 16
        });

        var _halfmmap = new Map("halfcourseMap", {
            basemap: "satellite",
            center:[-70.939625,42.860688],
            zoom: 16
        });

        //Query to get the attributes
        var q = new Query();
        q.where = "1=1";
        q.outFields = ["*"];

        var qt = new QueryTask("https://services7.arcgis.com/Gk8wYdLBgQPxqVZU/arcgis/rest/services/LandSharkResults/FeatureServer/0");

        qt.on("complete",processData);

        qt.execute(q);


        var fLayer = new FeatureLayer("https://services7.arcgis.com/Gk8wYdLBgQPxqVZU/arcgis/rest/services/LandSharkResults/FeatureServer/0",{
            outFields:["*"],
            id:'swim'
        });

        //map.addLayer(fLayer);
        arcgisutils.createMap("a56c8aa0b35442d49b2ecb89ffb834e7","map");

        //atts = [];
        //on(dom.byId("btnC"), "click", function()
        var prpgrnRange = plt.d3.interpolateRgb('#40004b', '#00441b');

        var clrs;
        plt.d3.json("colorbrewer.json",function(clr){
            console.log(clr)
            clrs = clr;
        });
        processes = false;

        //fLayer.on("graphic-draw",function(grt)
        function processData(qRes)
        {
            /*
                if (atts.length < 133) {

                    atts.push(grt.graphic.attributes)
                }
                if (atts.length == 133) {
                    console.log(atts.length)*/


                    var dt = moment('It is 2012-05-25', 'YYYY-MM-DD');
                    console.log(dt)

/*
                    fLyr = map.getLayer('swim');
                    console.log(fLyr);

                    grps = fLyr.graphics*/
                    /* grps.forEach(function (g) {
                     atts.push(g.attributes)
                     })*/
                    atts = _.pluck(qRes.featureSet.features,"attributes")


                    var eventgrpby = _.groupBy(atts, 'Event')

                    //Charts for the Half mile

                    var _halfmdivGrp = _.groupBy(eventgrpby["Half"], 'Div')
                    console.log(_halfmdivGrp);

                    //Get the top times and Competitors
                    var halfTime = _.chain(eventgrpby.Half).flatten(true).pluck("Time").sortBy().value();
                    var halfTopTime = halfTime[0]


                    domConstruct.place(lang.replace("<tr><td>#Swimmers</td><td>{text}</td></tr><tr><td>Top Time</td><td>{tTime}</td></tr>", {
                        text: halfTime.length.toString(),
                        tTime: halfTopTime
                    }), dom.byId("tBod"));


                    var res = [];
                    var labels = [];
                    var boxPlotColor = {};
                    _.each(_halfmdivGrp, function (elem, ind, list) {
                        //var obj = {}
                        //obj[ind] = elem.length;
                        //res.push(obj)
                        //var darray = [ind,elem.length]


                        labels.push(ind)
                        res.push(elem.length);
                        var clrNum = (Math.random() * 4)
                        boxPlotColor[ind] = prpgrnRange(clrNum);
                    })

                    //clrs["PRGn"][res.length]
                    var data = [{
                        values: res,
                        labels: labels,
                        type: "pie",
                        marker: {
                            colors: clrs["Paired"][res.length]
                        }
                    }];

                    var layout = {
                        height: 400,
                        width: 500,
                        paper_bgcolor: "darkgray",
                        plot_bgcolor: "darkgray"
                    };

                    //Map the colors to a lookup
                    lookup = _.object(labels, data[0].marker.colors)


                    plt.newPlot("_HalfPieChart", data, layout, {displayModeBar: false});


                    //Boxplots

                    barHalfMDataChart = []

                    _.each(_halfmdivGrp, function (e, i, l) {
                        barHalfMData = {}
                        var tData = []
                        var ts = _.pluck(_halfmdivGrp[i], 'Time')

                        d1 = moment(ts[0], "mm:ss:SS")

                        _.each(ts, function (vals) {

                            d2 = moment(vals, "mm:ss:SS")
                            tmDiff = d2.diff(d1, "minutes")
                            tData.push(tmDiff);

                        })

                        barHalfMData["x"] = tData;
                        barHalfMData["type"] = "box";
                        barHalfMData["name"] = i;
                        barHalfMData["boxpoints"] = "all";
                        barHalfMData["marker"] = {color: lookup[i]};//{"outliercolor": clrs["PRGn"][e.length][4].toString()};
                        barHalfMDataChart.push(barHalfMData);
                    });


                    plt.newPlot("_HalfBoxPlot", barHalfMDataChart, {
                        paper_bgcolor: "darkgray",
                        plot_bgcolor: "darkgray"
                    });//, layout);

                    //end charts for the half

                    //Charts for the 1 mile

                    var _1mdivGrp = _.groupBy(eventgrpby["Mile"], 'Div')
                    console.log(_1mdivGrp);


                    //Get the top times and Competitors
                    var mileTime = _.chain(eventgrpby.Mile).flatten(true).pluck("Time").sortBy().value();
                    var mileTopTime = mileTime[0]


                    domConstruct.place(lang.replace("<tr><td>#Swimmers</td><td>{text}</td></tr><tr><td>Top Time</td><td>{tTime}</td></tr>", {
                        text: mileTime.length.toString(),
                        tTime: mileTopTime
                    }), dom.byId("tMileBod"));


                    var res = [];
                    var labels = [];
                    _.each(_1mdivGrp, function (elem, ind, list) {
                        //var obj = {}
                        //obj[ind] = elem.length;
                        //res.push(obj)
                        //var darray = [ind,elem.length]


                        labels.push(ind)
                        res.push(elem.length);
                    })


                    var data = [{
                        values: res,
                        labels: labels,
                        type: 'pie',
                        marker: {
                            colors: clrs["Paired"][res.length]
                        }
                    }];

                    var layout = {
                        height: 400,
                        width: 500,
                        paper_bgcolor: "darkgray",
                        plot_bgcolor: "darkgray"
                    };

                    //Map the colors to a lookup
                    lookup = _.object(labels, data[0].marker.colors)
                    plt.newPlot('_1MPieChart', data, layout, {displayModeBar: false});


                    //Boxplots

                    bar1MDataChart = []

                    _.each(_1mdivGrp, function (e, i, l) {
                        bar1MData = {}
                        var tData = []
                        var ts = _.pluck(_1mdivGrp[i], 'Time')

                        d1 = moment(ts[0], "mm:ss:SS")

                        _.each(ts, function (vals) {

                            d2 = moment(vals, "mm:ss:SS")
                            tmDiff = d2.diff(d1, "minutes")
                            tData.push(tmDiff)

                        })

                        bar1MData["x"] = tData;
                        bar1MData["type"] = 'box';
                        bar1MData["name"] = i;
                        bar1MData["boxpoints"] = 'all';
                        bar1MData["marker"] = {color: lookup[i]};
                        bar1MDataChart.push(bar1MData);
                    });


                    plt.newPlot('_1MBoxPlot', bar1MDataChart, {
                        paper_bgcolor: "darkgray",
                        plot_bgcolor: "darkgray"
                    })//, layout);

                    //end 1 mile charts

                    //Charts for the 2 mile

                    var _2mdivGrp = _.groupBy(eventgrpby["2Mile"], 'Div')


                    //Get the top times and Competitors
                    var twomileTime = _.chain(eventgrpby["2Mile"]).flatten(true).pluck("Time").sortBy().value();
                    var twomileModTime = []
                    twomileTime.forEach(function (t) {
                        if (t.charAt(0) == "1") {
                            twomileModTime.push(moment(t.replace(t, t + ":00"), "h:mm:ss:SS"))
                        }
                        else if (t.charAt(0) != "1") {
                            twomileModTime.push(moment("00:" + t, "h:mm:ss:SS"))
                        }
                    })


                    var twomileTopTime = moment.min(twomileModTime)


                    domConstruct.place(lang.replace("<tr><td>#Swimmers</td><td>{text}</td></tr><tr><td>Top Time</td><td>{tTime}</td></tr>", {
                        text: twomileModTime.length.toString(),
                        tTime: twomileTopTime._i
                    }), dom.byId("tTwoMileBod"));


                    var _2mres = [];
                    var _2mlabels = [];
                    _.each(_2mdivGrp, function (elem, ind, list) {
                        //var obj = {}
                        //obj[ind] = elem.length;
                        //res.push(obj)
                        //var darray = [ind,elem.length]


                        _2mlabels.push(ind)
                        _2mres.push(elem.length);
                    })


                    var _2data = [{
                        values: _2mres,
                        labels: _2mlabels,
                        type: 'pie',
                        marker: {
                            colors: clrs["Paired"][res.length]
                        }
                    }];

                    var _2layout = {
                        height: 400,
                        width: 500,
                        paper_bgcolor: "darkgray",
                        plot_bgcolor: "darkgray"
                    };
                    var lookup = _.object(labels, data[0].marker.colors)
                    plt.newPlot('_2MPieChart', _2data, _2layout, {displayModeBar: false});


                    //Boxplots

                    bar2MDataChart = []

                    _.each(_2mdivGrp, function (e, i, l) {
                        bar2MData = {}
                        var _2tData = []
                        var _2mts = _.pluck(_2mdivGrp[i], 'Time')

                        _2md1 = moment(_2mts[0], "mm:ss:SS")

                        _.each(_2mts, function (_2mvals) {

                            if (_2mvals.charAt(0) == 1) {
                                _2md2 = moment(_2mvals, "h:mm:ss")
                            }
                            else {
                                var n_2mvals = "0:" + _2mvals
                                _2md2 = moment(n_2mvals, "h:mm:ss:SS")
                            }


                            _2mtmDiff = _2md2.diff(_2md1, "minutes")
                            _2tData.push(_2mtmDiff)

                        })

                        bar2MData["x"] = _2tData;
                        bar2MData["type"] = 'box';
                        bar2MData["name"] = i;
                        bar2MData["boxpoints"] = 'all';
                        bar2MData["marker"] = {color: lookup[i]};
                        bar2MDataChart.push(bar2MData);
                    });


                    plt.newPlot('_2MBoxPlot', bar2MDataChart, {paper_bgcolor: "darkgray", plot_bgcolor: "darkgray"})//, layout);

                    //end 2 mile charts


               //end of else

        };




        /* fLayer.on("load",function(l){
         console.log(l.layer.graphics);



         })*/

        //atts2 = []
        /*fLayer.on("graphic-draw",function(grt){

         if(atts2.length < 133) {

         atts2.push(grt.graphic.attributes)
         if (atts2.length ==133){
         console.log(atts2.length)
         }

         }})*/

    });






