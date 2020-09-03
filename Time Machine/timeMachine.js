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
  // console.log(`\nCity Input = ${$("#city-input").val()}\n`);
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

  $("div#chart").html("");

  if (isInvalid()) return;

  getweather($("#city-input").val());
});

function emptyCarousel() {
  var length = $(".item").length;
  for (var i = 0; i < length; i++) {
    $("#custom-carousel")
      .trigger("remove.owl.carousel", [i])
      .trigger("refresh.owl.carousel");
  }
}

function getweather(city) {
  console.log("\nIn get-weather\n");
  futureArray = [];
  pastArray = [];

  $("#loader").toggle(500);
  $("#btn1").prop("disabled", true);
  emptyCarousel();

  fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=metric" +
      "&appid=06c4f47c8a9fb640abee46c1840a2c23",
    { mode: "cors" }
  )
    .then((req) => req.json())
    .then(async (data) => {
      await getPast(data.coord.lat, data.coord.lon);
      await getFuture(data.coord.lat, data.coord.lon);
    })
    .then(async (data) => {
      await prepareCards();
    })
    .then(async () => {
      await generateGraph();
      console.log("\nDisplay carousel\n");
    })
    .then(() => {
      $("#GraphContainer").show(500);
      alert("Please Scroll down to view the results!");
    })
    .catch((err) => alert("Invalid City or connecting to the API failed"))
    .finally(() => {
      $("#loader").toggle(1000);
      $("#btn1").prop("disabled", false);
    });
}

function generateTempGraph() {
  // console.log("generateTempGraph");
  $("div#chart").html("");
  let myHighData = [];
  let myLowData = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    myLowData.push(pastArray[i].temperatureLow);
    myHighData.push(pastArray[i].temperatureHigh);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    myLowData.push(futureArray[i].temperatureLow);
    myHighData.push(futureArray[i].temperatureHigh);
    myCategories.push(futureArray[i].formattedDate);
  }

  var options = {
    series: [
      {
        name: "High ",
        data: myHighData,
      },
      {
        name: "Low ",
        data: myLowData,
      },
    ],
    chart: {
      height: 350,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#77B6EA", "#545454"],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "High & Low Temperature",
      align: "left",
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    markers: {
      size: 1,
    },
    xaxis: {
      categories: myCategories,
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Temperature",
      },
      min: -20,
      max: 60,
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generateDewPointGraph() {
  // console.log("generateDewPointGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].dewPoint);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].dewPoint);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "DewPoint",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 0,
      max: 35,
      title: {
        text: "Degrees Celsius",
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generateHumidityGraph() {
  // console.log("generateHumidityGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].humidity);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].humidity);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "Humidity",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 0,
      max: 1,
      title: {
        text: "Grams per cubic meter",
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generatePrecipProbabilityGraph() {
  // console.log("generatePrecipProbabilityGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].precipProbability);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].precipProbability);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "PrecipProbability",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 0,
      max: 1,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generatePressureGraph() {
  // console.log("generatePressureGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].pressure);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].pressure);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "Pressure",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 500,
      max: 1500,
      title: {
        text: "Hectopascals",
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generateWindSpeedGraph() {
  // console.log("generateWindSpeedGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].windSpeed);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].windSpeed);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "Wind Speed",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 0,
      max: 15,
      title: {
        text: "Meters per second",
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generateWindGustGraph() {
  // console.log("generateWindGustGraph");
  $("div#chart").html("");
  let myDataPoints = [];
  let myCategories = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(pastArray[i].windGust);
    myCategories.push(pastArray[i].formattedDate);
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push(futureArray[i].windGust);
    myCategories.push(futureArray[i].formattedDate);
  }

  let options = {
    series: [
      {
        name: "Reading",
        data: myDataPoints,
        // [
        //   0.4,
        //   0.3,
        // ],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },
    xaxis: {
      type: "string",
      categories: myCategories,
      // [
      //   "1/11/2000",
      //   "2/11/2000",
      // ],
    },
    title: {
      text: "Wind Gust",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
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
        stops: [0, 100, 100, 100],
      },
    },
    markers: {
      size: 4,
      colors: ["#FFA41B"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    yaxis: {
      min: 0,
      max: 15,
      title: {
        text: "Meters per second",
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

function generateGraph() {
  generateTempGraph();
  // generateDewPointGraph();
  // generateHumidityGraph();
  // generatePrecipProbabilityGraph();
  // generatePressureGraph();
  // generateWindSpeedGraph();
  // generateWindGustGraph();
}

function getDataModelFromJson(dataObj) {
  let dataModel = {};
  dataModel.summary =
    dataObj.summary == undefined || dataObj.summary == "undefined"
      ? "No data avaliable"
      : dataObj.summary;

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

async function getPast(lat, long) {
  // console.log("\nIn get-Past\n");
  var d = Date.now();
  d = Math.ceil(d / 1000);

  daysPast =
    $("#past-days").val() == undefined
      ? undefined
      : Number($("#past-days").val());

  if (daysPast == undefined || daysPast <= 0) daysPast = 1;
  pastArray = [];

  for (let i = 0; i < daysPast + 1; i++) pastArray.push(0);

  for (let i = 0; i < daysPast + 1; i++) {
    var url = `https://api.darksky.net/forecast/efa23a424fb3430666fc38529e81f02d/${lat},${long},${
      d - i * 86400
    }?units=si`;

    // console.log("Get past, day " + i + ", url : \n" + url + "\n");

    await fetch(url, {
      method: "GET",
    })
      .then((req) => req.json())
      .then((data) => {
        // console.log(`Past For day : ${i}\n`);
        // console.log(data.daily.data[0]);
        // console.log("\n");
        let dataObj = data.daily.data[0];
        let dataModel = {};
        let curDate = new Date();

        curDate.setDate(curDate.getDate() - i);
        let ye = new Intl.DateTimeFormat("en", {
          year: "numeric",
        }).format(curDate);
        let mo = new Intl.DateTimeFormat("en", {
          month: "short",
        }).format(curDate);
        let da = new Intl.DateTimeFormat("en", {
          day: "2-digit",
        }).format(curDate);

        dataModel = getDataModelFromJson(dataObj);
        dataModel.time = d - i * 86400;
        dataModel.date = curDate;
        dataModel.formattedDate = `${
          weekday[curDate.getDay()]
        }, ${da} ${mo} ${ye}`;
        dataModel.curTemp = data.currently.temperature;

        pastArray[i] = dataModel;
      })
      .catch((err) => {
        console.log(`past failed failed For day : ${i}\n`);
        console.log(err);
        throw new Error("Past Failed");
      });
  }
}

async function getFuture(lat, long) {
  // let date = new Date();
  var d = Date.now();
  d = Math.ceil(d / 1000);

  daysFuture =
    $("#future-days").val() == undefined
      ? undefined
      : Number($("#future-days").val());

  if (daysFuture == undefined || daysFuture <= 0) daysFuture = 1;
  futureArray = [];

  for (let j = 0; j < daysFuture; j++) futureArray.push(0);

  // console.log(`\ndaysFuture : ${daysFuture}\n`);

  for (let j = 0; j < daysFuture; j++) {
    var url = `https://api.darksky.net/forecast/efa23a424fb3430666fc38529e81f02d/${lat},${long},${
      d + (j + 1) * 86400
    }?units=si`;

    await fetch(url, {
      method: "GET",
    })
      .then((req) => req.json())
      .then((data) => {
        // console.log(`Future For day : ${j}\n`);
        // console.log(data.daily.data[0]);
        // console.log("\n");
        let dataObj = data.daily.data[0];
        let hourlyData = data.hourly;
        let dataModel = {};
        let curDate = new Date();

        dataModel = getDataModelFromJson(dataObj);
        curDate.setDate(curDate.getDate() + (j + 1));
        let ye = new Intl.DateTimeFormat("en", {
          year: "numeric",
        }).format(curDate);
        let mo = new Intl.DateTimeFormat("en", {
          month: "short",
        }).format(curDate);
        let da = new Intl.DateTimeFormat("en", {
          day: "2-digit",
        }).format(curDate);

        dataModel.time = d + (j + 1) * 86400;
        dataModel.icon = hourlyData.icon;
        dataModel.date = curDate;
        dataModel.formattedDate = `${
          weekday[curDate.getDay()]
        }, ${da} ${mo} ${ye}`;
        dataModel.curTemp = data.currently.temperature;

        futureArray[j] = dataModel;

        // console.log("\n\n");
      })
      .catch((err) => {
        console.log(`future failed failed For day : ${i}\n`);
        console.log(err);
        throw new Error("Future Failed");
      });
  }
}

function prepareCards() {
  // console.log("\nin prepareCards\n");
  // console.log(pastArray);
  // console.log(futureArray);
  // console.log("\n");
  preparePastCards();
  // await prepareFutureCards();
}

function cardTemplate(arrayType, ind, caseId) {
  //ArrayType = 0 -> past Array
  //ArrayType = 1 -> future Array

  let data = arrayType == 1 ? futureArray[ind] : pastArray[ind];

  let str = "";

  //Case Id is used to add properties to the cards.
  //These properties are used by the owl carousel
  if (caseId == 1) str = " first prev";
  else if (caseId == 2) str = " show";
  else if (caseId == 3) str = " ";
  else if (caseId == 4) str = " last";
  else if (caseId == 5) str = " next";
  else if (caseId == 6) str = " next last ";

  let content = `<div class="item ${str}">
  <div class="card py-3 px-4">
    <div class="row justify-content-center">
      <img
        src="../Weather icon/${data.icon}.png"
        class="img-fluid weather-icon mb-4 mt-3"
      />
    </div>

    <h5 class="content my-3 mx-2">
        ${data.formattedDate}
    </h5>
    
    <h5>${
      data.icon === undefined || data.icon === "undefined"
        ? "No data avaliable"
        : data.icon
    }, ${data.curTemp}°C
    </h5>
    
    <span>
        Wind ${data.windSpeed}m/s 
        <span class="dot">•</span>
        Pressure ${data.pressure}hPa
    </span>
    
    <p class="content my-3 mx-auto">
        ${data.summary}
    </p>
  </div>
</div>`;

  $("#custom-carousel")
    .trigger("add.owl.carousel", [jQuery(content)])
    .trigger("refresh.owl.carousel");
}

function preparePastCards() {
  // console.log("\nin preparePastCards\n");

  // console.log("Adding prev item\n");
  //caseId 1
  cardTemplate(0, 1, 1);

  // console.log("Adding show item\n");
  //caseId 2
  cardTemplate(0, 0, 2);

  prepareFutureCards();

  for (let i = pastArray.length - 1; i > 2; i--) {
    // console.log("Adding past item\n");
    cardTemplate(0, i, 3);
  }

  if (pastArray.length >= 3) {
    $(".last").removeClass("last");
    cardTemplate(0, 2, 4);
  }
} //prepare past cards

function prepareFutureCards() {
  // console.log("\nin prepareFutureCards\n");

  for (let i = 0; i < futureArray.length - 1; i++) {
    // console.log("Adding future item\n");
    cardTemplate(1, i, i == 0 ? 5 : 3);
  }

  // console.log("Adding future-last item\n");
  cardTemplate(1, futureArray.length - 1, futureArray.length - 1 == 0 ? 6 : 4);
}
