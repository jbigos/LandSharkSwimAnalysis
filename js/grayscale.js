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

require(["esri/map","esri/layers/FeatureLayer",
"esri/renderers/HeatmapRenderer","moment/moment","Plotly/plotly-latest.min",
 "dojo/domReady!"], function(Map,FeatureLayer,HeatmapRenderer,moment,plt) {
  var map = new Map("map", {
    center: [-71.046, 42.42],
    zoom: 8,
    basemap: "gray"
  });

    var heatmapRenderer = new HeatmapRenderer({
    colors: ["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"]})

    var lUrl = "http://services7.arcgis.com/k1gt6XMqKCsvSvjs/arcgis/rest/services/LandSharkResults/FeatureServer/0"
    var resLayer = new FeatureLayer(lUrl,{
        outFields:["*"],
        id:'swim'

    })
    resLayer.setRenderer(heatmapRenderer);
    map.addLayer(resLayer);


    atts = [];

    var grps = resLayer.graphics;
    grps.forEach(function(g){
        atts.push(g.attributes)
    })

    //Break the event data into the different waves
    var eventgrpby = _.groupBy(atts,'Event');

    //Charts for 1 mile
    var _1mdivGrp = _.groupBy(eventgrpby["Mile"],'Div');

    var res = [];
    var labels = [];
    _.each(_1mdivGrp,function(elem,ind,list){
        labels.push(ind);
        res.push(elem.length);
    })

    var data = [
        {
            values:res,
            labels:labels,
            type:'pie'
        }
    ];

    var layout = {
        height: 400,
        width:500
    };

    plt.newPlot('_1MPieChart',data,layout,{displayModeBar:false});




});
