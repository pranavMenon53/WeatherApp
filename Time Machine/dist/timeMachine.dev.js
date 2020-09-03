"use strict";

var futureArray = [];
var pastArray = [];
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

function isInvalid() {
  console.log("\nCity Input = ".concat($("#city-input").val(), "\n"));

  if ($("#city-input").val() == "") {
    alert("City is required!");
    return true;
  }

  if ($("#past-days").val() == undefined) {
    alert("Past days is required!");
    return true;
  }

  if (Number($("#past-days").val()) <= 0) {
    alert("Past days should be greather than zero!");
    return true;
  }

  if (Number($("#past-days").val()) >= 31) {
    alert("Past days should be less than 31!");
    return true;
  }

  if ($("#future-days").val() == undefined) {
    alert("Future days is required!");
    return true;
  }

  if (Number($("#future-days").val()) <= 0) {
    alert("Future days should be greather than zero!");
    return true;
  }

  if (Number($("#future-days").val()) >= 31) {
    alert("Future days should be less than 31!");
    return true;
  }

  return false;
}

document.getElementById("btn1").addEventListener("click", function () {
  $("#GraphContainer").hide(500);
  $("div#tempChart").html("<p></p>");
  $("div#dewPointChart").html("<p></p>");
  $("div#humidityChart").html("<p></p>");
  $("div#precipProbabilityChart").html("<p></p>");
  $("div#pressureChart").html("<p></p>");
  $("div#windSpeedGraph").html("<p></p>");
  $("div#windGustGraph").html("<p></p>");
  if (isInvalid()) return;
  getweather($("#city-input").val());
});

function emptyCarousel() {
  var length = $(".item").length;

  for (var i = 0; i < length; i++) {
    $("#custom-carousel").trigger("remove.owl.carousel", [i]).trigger("refresh.owl.carousel");
  }
}

function getweather(city) {
  console.log("\nIn get-weather\n");
  futureArray = [];
  pastArray = [];
  $("#loader").toggle(500);
  $("#btn1").prop("disabled", true);
  emptyCarousel();
  fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric" + "&appid=06c4f47c8a9fb640abee46c1840a2c23", {
    mode: "cors"
  }).then(function (req) {
    return req.json();
  }).then(function _callee(data) {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(getPast(data.coord.lat, data.coord.lon));

          case 2:
            _context.next = 4;
            return regeneratorRuntime.awrap(getFuture(data.coord.lat, data.coord.lon));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  }).then(function _callee2(data) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(prepareCards());

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    });
  }).then(function _callee3() {
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(generateGraph());

          case 2:
            console.log("\nDisplay carousel\n");

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    });
  }).then(function () {
    $("#GraphContainer").show(500);
    alert("Please Scroll down to view the results!");
  })["catch"](function (err) {
    return alert("Invalid City or connecting to the API failed");
  })["finally"](function () {
    $("#loader").toggle(1000);
    $("#btn1").prop("disabled", false);
  });
}

function generateTempGraph() {
  $("div#tempChart").html("<p></p>");
  var myHighData = [];
  var myLowData = [];
  var myCategories = [];

  for (var _i = Math.min(5, pastArray.length - 1); _i >= 0; _i--) {
    myLowData.push(pastArray[_i].temperatureLow);
    myHighData.push(pastArray[_i].temperatureHigh);
    myCategories.push(pastArray[_i].formattedDate);
  }

  for (var _i2 = 0; _i2 <= Math.min(4, futureArray.length - 1); _i2++) {
    myLowData.push(futureArray[_i2].temperatureLow);
    myHighData.push(futureArray[_i2].temperatureHigh);
    myCategories.push(futureArray[_i2].formattedDate);
  }

  var options = {
    series: [{
      name: "High ",
      data: myHighData
    }, {
      name: "Low ",
      data: myLowData
    }],
    chart: {
      height: 350,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      toolbar: {
        show: false
      }
    },
    colors: ["#77B6EA", "#545454"],
    dataLabels: {
      enabled: true
    },
    stroke: {
      curve: "smooth"
    },
    title: {
      text: "High & Low Temperature",
      align: "left"
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"],
        // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    markers: {
      size: 1
    },
    xaxis: {
      categories: myCategories,
      title: {
        text: "Date"
      }
    },
    yaxis: {
      title: {
        text: "Temperature"
      },
      min: -20,
      max: 60
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
  };
  var chart = new ApexCharts(document.querySelector("#tempChart"), options);
  chart.render();
}

function generateDewPointGraph() {
  $("div#dewPointChart").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i3 = Math.min(5, pastArray.length - 1); _i3 >= 0; _i3--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i3].dewPoint);
    myCategories.push(pastArray[_i3].formattedDate);
  }

  for (var _i4 = 0; _i4 <= Math.min(4, futureArray.length - 1); _i4++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i4].dewPoint);
    myCategories.push(futureArray[_i4].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "DewPoint",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 0,
      max: 35,
      title: {
        text: "Degrees Celsius"
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#dewPointChart"), options);
  chart.render();
}

function generateHumidityGraph() {
  $("div#humidityChart").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i5 = Math.min(5, pastArray.length - 1); _i5 >= 0; _i5--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i5].humidity);
    myCategories.push(pastArray[_i5].formattedDate);
  }

  for (var _i6 = 0; _i6 <= Math.min(4, futureArray.length - 1); _i6++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i6].humidity);
    myCategories.push(futureArray[_i6].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "Humidity",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 0,
      max: 1,
      title: {
        text: "Grams per cubic meter"
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#humidityChart"), options);
  chart.render();
}

function generatePrecipProbabilityGraph() {
  $("div#precipProbabilityChart").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i7 = Math.min(5, pastArray.length - 1); _i7 >= 0; _i7--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i7].precipProbability);
    myCategories.push(pastArray[_i7].formattedDate);
  }

  for (var _i8 = 0; _i8 <= Math.min(4, futureArray.length - 1); _i8++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i8].precipProbability);
    myCategories.push(futureArray[_i8].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "PrecipProbability",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 0,
      max: 1
    }
  };
  var chart = new ApexCharts(document.querySelector("#precipProbabilityChart"), options);
  chart.render();
}

function generatePressureGraph() {
  $("div#pressureChart").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i9 = Math.min(5, pastArray.length - 1); _i9 >= 0; _i9--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i9].pressure);
    myCategories.push(pastArray[_i9].formattedDate);
  }

  for (var _i10 = 0; _i10 <= Math.min(4, futureArray.length - 1); _i10++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i10].pressure);
    myCategories.push(futureArray[_i10].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "Pressure",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 500,
      max: 1500,
      title: {
        text: "Hectopascals"
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#pressureChart"), options);
  chart.render();
}

function generateWindSpeedGraph() {
  $("div#windSpeedGraph").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i11 = Math.min(5, pastArray.length - 1); _i11 >= 0; _i11--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i11].windSpeed);
    myCategories.push(pastArray[_i11].formattedDate);
  }

  for (var _i12 = 0; _i12 <= Math.min(4, futureArray.length - 1); _i12++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i12].windSpeed);
    myCategories.push(futureArray[_i12].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "Wind Speed",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 0,
      max: 15,
      title: {
        text: "Meters per second"
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#windSpeedGraph"), options);
  chart.render();
}

function generateWindGustGraph() {
  $("div#windGustGraph").html("<p></p>");
  var myDataPoints = [];
  var myCategories = [];

  for (var _i13 = Math.min(5, pastArray.length - 1); _i13 >= 0; _i13--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[_i13].windGust);
    myCategories.push(pastArray[_i13].formattedDate);
  }

  for (var _i14 = 0; _i14 <= Math.min(4, futureArray.length - 1); _i14++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[_i14].windGust);
    myCategories.push(futureArray[_i14].formattedDate);
  }

  var options = {
    series: [{
      name: "Reading",
      data: myDataPoints // [
      //   0.4,
      //   0.3,
      // ],

    }],
    chart: {
      height: 350,
      type: "line"
    },
    stroke: {
      width: 7,
      curve: "smooth"
    },
    xaxis: {
      type: "string",
      categories: myCategories // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],

    },
    title: {
      text: "Wind Gust",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666"
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#FDD835"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    yaxis: {
      min: 0,
      max: 15,
      title: {
        text: "Meters per second"
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#windGustGraph"), options);
  chart.render();
}

function generateGraph() {
  generateTempGraph();
  generateDewPointGraph();
  generateHumidityGraph();
  generatePrecipProbabilityGraph();
  generatePressureGraph();
  generateWindSpeedGraph();
  generateWindGustGraph();
}

function getDataModelFromJson(dataObj) {
  var dataModel = {};
  dataModel.summary = dataObj.summary == undefined || dataObj.summary == "undefined" ? "No data avaliable" : dataObj.summary;
  dataModel.icon = dataObj.icon;
  dataModel.temperatureLow = dataObj.temperatureLow;
  dataModel.temperatureHigh = dataObj.temperatureHigh;
  dataModel.pressure = dataObj.pressure;
  dataModel.humidity = dataObj.humidity;
  dataModel.windSpeed = dataObj.windSpeed;
  dataModel.windGust = dataObj.windGust;
  dataModel.dewPoint = dataObj.dewPoint;
  dataModel.precipProbability = dataObj.precipProbability;
  return dataModel;
}

function getPast(lat, _long) {
  var d, _i15, _loop, _i16, url;

  return regeneratorRuntime.async(function getPast$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // console.log("\nIn get-Past\n");
          d = Date.now();
          d = Math.ceil(d / 1000);
          daysPast = $("#past-days").val() == undefined ? undefined : Number($("#past-days").val());
          if (daysPast == undefined || daysPast <= 0) daysPast = 1;
          pastArray = [];

          for (_i15 = 0; _i15 < daysPast + 1; _i15++) {
            pastArray.push(0);
          }

          _loop = function _loop(_i16) {
            return regeneratorRuntime.async(function _loop$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    url = "https://api.darksky.net/forecast/efa23a424fb3430666fc38529e81f02d/".concat(lat, ",").concat(_long, ",").concat(d - _i16 * 86400, "?units=si"); // console.log("Get past, day " + i + ", url : \n" + url + "\n");

                    _context4.next = 3;
                    return regeneratorRuntime.awrap(fetch(url, {
                      method: "GET"
                    }).then(function (req) {
                      return req.json();
                    }).then(function (data) {
                      console.log("Past For day : ".concat(_i16, "\n"));
                      console.log(data.daily.data[0]);
                      console.log("\n");
                      var dataObj = data.daily.data[0];
                      var dataModel = {};
                      var curDate = new Date();
                      curDate.setDate(curDate.getDate() - _i16);
                      var ye = new Intl.DateTimeFormat("en", {
                        year: "numeric"
                      }).format(curDate);
                      var mo = new Intl.DateTimeFormat("en", {
                        month: "short"
                      }).format(curDate);
                      var da = new Intl.DateTimeFormat("en", {
                        day: "2-digit"
                      }).format(curDate);
                      dataModel = getDataModelFromJson(dataObj);
                      dataModel.time = d - _i16 * 86400;
                      dataModel.date = curDate;
                      dataModel.formattedDate = "".concat(weekday[curDate.getDay()], ", ").concat(da, " ").concat(mo, " ").concat(ye);
                      dataModel.curTemp = data.currently.temperature;
                      pastArray[_i16] = dataModel;
                    })["catch"](function (err) {
                      console.log("past failed failed For day : ".concat(_i16, "\n"));
                      console.log(err);
                      throw new Error("Past Failed");
                    }));

                  case 3:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          };

          _i16 = 0;

        case 8:
          if (!(_i16 < daysPast + 1)) {
            _context5.next = 14;
            break;
          }

          _context5.next = 11;
          return regeneratorRuntime.awrap(_loop(_i16));

        case 11:
          _i16++;
          _context5.next = 8;
          break;

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function getFuture(lat, _long2) {
  var d, j, _loop2, _j, url;

  return regeneratorRuntime.async(function getFuture$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // let date = new Date();
          d = Date.now();
          d = Math.ceil(d / 1000);
          daysFuture = $("#future-days").val() == undefined ? undefined : Number($("#future-days").val());
          if (daysFuture == undefined || daysFuture <= 0) daysFuture = 1;
          futureArray = [];

          for (j = 0; j < daysFuture; j++) {
            futureArray.push(0);
          } // console.log(`\ndaysFuture : ${daysFuture}\n`);


          _loop2 = function _loop2(_j) {
            return regeneratorRuntime.async(function _loop2$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    url = "https://api.darksky.net/forecast/efa23a424fb3430666fc38529e81f02d/".concat(lat, ",").concat(_long2, ",").concat(d + (_j + 1) * 86400, "?units=si");
                    _context6.next = 3;
                    return regeneratorRuntime.awrap(fetch(url, {
                      method: "GET"
                    }).then(function (req) {
                      return req.json();
                    }).then(function (data) {
                      console.log("Future For day : ".concat(_j, "\n"));
                      console.log(data.daily.data[0]);
                      console.log("\n");
                      var dataObj = data.daily.data[0];
                      var hourlyData = data.hourly;
                      var dataModel = {};
                      var curDate = new Date();
                      dataModel = getDataModelFromJson(dataObj);
                      curDate.setDate(curDate.getDate() + (_j + 1));
                      var ye = new Intl.DateTimeFormat("en", {
                        year: "numeric"
                      }).format(curDate);
                      var mo = new Intl.DateTimeFormat("en", {
                        month: "short"
                      }).format(curDate);
                      var da = new Intl.DateTimeFormat("en", {
                        day: "2-digit"
                      }).format(curDate);
                      dataModel.time = d + (_j + 1) * 86400;
                      dataModel.icon = hourlyData.icon;
                      dataModel.date = curDate;
                      dataModel.formattedDate = "".concat(weekday[curDate.getDay()], ", ").concat(da, " ").concat(mo, " ").concat(ye);
                      dataModel.curTemp = data.currently.temperature;
                      futureArray[_j] = dataModel; // console.log("\n\n");
                    })["catch"](function (err) {
                      console.log("future failed failed For day : ".concat(i, "\n"));
                      console.log(err);
                      throw new Error("Future Failed");
                    }));

                  case 3:
                  case "end":
                    return _context6.stop();
                }
              }
            });
          };

          _j = 0;

        case 8:
          if (!(_j < daysFuture)) {
            _context7.next = 14;
            break;
          }

          _context7.next = 11;
          return regeneratorRuntime.awrap(_loop2(_j));

        case 11:
          _j++;
          _context7.next = 8;
          break;

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  });
}

function prepareCards() {
  // console.log("\nin prepareCards\n");
  // console.log(pastArray);
  // console.log(futureArray);
  // console.log("\n");
  preparePastCards(); // await prepareFutureCards();
}

function cardTemplate(arrayType, ind, caseId) {
  //ArrayType = 0 -> past Array
  //ArrayType = 1 -> future Array
  var data = arrayType == 1 ? futureArray[ind] : pastArray[ind];
  var str = ""; //Case Id is used to add properties to the cards.
  //These properties are used by the owl carousel

  if (caseId == 1) str = " first prev";else if (caseId == 2) str = " show";else if (caseId == 3) str = " ";else if (caseId == 4) str = " last";else if (caseId == 5) str = " next";else if (caseId == 6) str = " next last ";
  var content = "<div class=\"item ".concat(str, "\">\n  <div class=\"card py-3 px-4\">\n    <div class=\"row justify-content-center\">\n      <img\n        src=\"../Weather icon/").concat(data.icon, ".png\"\n        class=\"img-fluid weather-icon mb-4 mt-3\"\n      />\n    </div>\n\n    <h5 class=\"content my-3 mx-2\">\n        ").concat(data.formattedDate, "\n    </h5>\n    \n    <h5>").concat(data.icon === undefined || data.icon === "undefined" ? "No data avaliable" : data.icon, ", ").concat(data.curTemp, "\xB0C</h5>\n    \n    <span>\n      <span class=\"dot\">\u2022</span>\n        Wind ").concat(data.windSpeed, "m/s \n        <span class=\"dot\">\u2022</span>\n        Pressure ").concat(data.pressure, "hPa\n      <span class=\"dot\">\u2022</span>\n    </span>\n    \n    <p class=\"content my-3 mx-2\">\n        ").concat(data.summary, "\n    </p>\n  </div>\n</div>");
  $("#custom-carousel").trigger("add.owl.carousel", [jQuery(content)]).trigger("refresh.owl.carousel");
}

function preparePastCards() {
  // console.log("\nin preparePastCards\n");
  // console.log("Adding prev item\n");
  //caseId 1
  cardTemplate(0, 1, 1); // console.log("Adding show item\n");
  //caseId 2

  cardTemplate(0, 0, 2);
  prepareFutureCards();

  for (var _i17 = pastArray.length - 1; _i17 > 2; _i17--) {
    // console.log("Adding past item\n");
    cardTemplate(0, _i17, 3);
  }

  if (pastArray.length >= 3) {
    $(".last").removeClass("last");
    cardTemplate(0, 2, 4);
  }
} //prepare past cards


function prepareFutureCards() {
  // console.log("\nin prepareFutureCards\n");
  for (var _i18 = 0; _i18 < futureArray.length - 1; _i18++) {
    // console.log("Adding future item\n");
    cardTemplate(1, _i18, _i18 == 0 ? 5 : 3);
  } // console.log("Adding future-last item\n");


  cardTemplate(1, futureArray.length - 1, futureArray.length - 1 == 0 ? 6 : 4);
}