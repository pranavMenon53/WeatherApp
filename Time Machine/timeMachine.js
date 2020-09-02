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

// var rainQuotes = [
//   "Into each life some rain must fall.",
//   "Clouds come floating into my life, no longer to carry rain or usher storm, but to add color to my sunset sky.",
//   "True, the sun and the wind inspire. But rain has an edge. Who, after all, dreams of dancing in dust? Or kissing in the bright sun?",
//   "A single gentle rain makes the grass many shades greener.",
// ];
// var rainAuthor = [
//   "Henry Wadsworth Longfellow",
//   "Rabindranath Tagore",
//   "Cynthia Barnett",
//   "Henry David Thoreau",
// ];

// var clearDay = ["Ô, Sunlight! The most precious gold to be found on Earth."];
// var clearDayAuthor = ["Roman Payne"];

//
//

function isInvalid() {
  console.log(`\nCity Input = ${$("#city-input").val()}\n`);
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
  $("div#chartContainer").html("<p></p>");
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
      alert("Please Scroll down to view the results!");
    })
    .catch((err) => alert("Invalid City or connecting to the API failed"))
    .finally(() => {
      $("#loader").toggle(500);
      $("#btn1").prop("disabled", false);
    });
}

async function generateGraph() {
  $("div#chartContainer").html("<br/><br/><br/>");
  const myDataPoints = [];

  for (let i = Math.min(5, pastArray.length - 1); i >= 0; i--) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push({
      label: pastArray[i].formattedDate,
      y: [pastArray[i].temperatureLow, pastArray[i].temperatureHigh],
      name:
        pastArray[i].icon == undefined || pastArray[i].icon == "undefined"
          ? "No data availabe"
          : pastArray[i].icon,
    });
  }

  for (let i = 0; i <= Math.min(4, futureArray.length - 1); i++) {
    // { label: "Monday", y: [15, 26], name: "rainy" },
    myDataPoints.push({
      label: futureArray[i].formattedDate,
      y: [futureArray[i].temperatureLow, futureArray[i].temperatureHigh],
      name:
        futureArray[i].icon == undefined || futureArray[i].icon == "undefined"
          ? "No data availabe"
          : futureArray[i].icon,
    });
  }

  //Chart library - CanvasJS
  var chart = new CanvasJS.Chart("chartContainer", {
    title: {
      text: "Time Machine - Weather Forecast",
    },
    axisY: {
      suffix: " °C",
      maximum: 60,
      minimum: -20,
      gridThickness: 0,
    },

    toolTip: {
      shared: true,
      content:
        "{name} </br> <strong>Temperature: </strong> </br> Min: {y[0]} °C, Max: {y[1]} °C",
    },

    data: [
      {
        type: "rangeSplineArea",
        fillOpacity: 0.1,
        color: "#91AAB1",
        indexLabelFormatter: formatter,
        dataPoints: myDataPoints,
        // [
        //   { label: "Monday", y: [15, 26], name: "rainy" },
        //   { label: "Tuesday", y: [15, 27], name: "rainy" },
        //   { label: "Wednesday", y: [13, 27], name: "sunny" },
        //   { label: "Thursday", y: [14, 27], name: "sunny" },
        //   { label: "Friday", y: [15, 26], name: "cloudy" },
        //   { label: "Saturday", y: [17, 26], name: "sunny" },
        //   { label: "Sunday", y: [16, 27], name: "rainy" },
        //   { label: "Thursday", y: [14, 27], name: "sunny" },
        //   { label: "Friday", y: [15, 26], name: "cloudy" },
        //   { label: "Saturday", y: [17, 26], name: "sunny" },
        //   { label: "Sunday", y: [16, 27], name: "rainy" },
        // ],
      },
    ],
  });

  chart.render();

  function formatter(e) {
    if (e.index === 0 && e.dataPoint.x === 0) {
      return " Min " + e.dataPoint.y[e.index] + "°";
    } else if (e.index == 1 && e.dataPoint.x === 0) {
      return " Max " + e.dataPoint.y[e.index] + "°";
    } else {
      return e.dataPoint.y[e.index] + "°";
    }
  }
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

    await fetch(url, {
      method: "GET",
    })
      .then((req) => req.json())
      .then((data) => {
        console.log(`Past For day : ${i}\n`);

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
        console.log(`Future For day : ${j}\n`);
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
  console.log("\nin prepareCards\n");
  console.log(pastArray);

  console.log(futureArray);
  console.log("\n");
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
    }, ${data.curTemp}°C</h5>
    
    <span>
      <span class="dot">•</span>
        Wind ${data.windSpeed}m/s 
        <span class="dot">•</span>
        Pressure ${data.pressure}hPa
      <span class="dot">•</span>
    </span>
    
    <p class="content my-3 mx-2">
        ${data.summary}
    </p>
  </div>
</div>`;

  $("#custom-carousel")
    .trigger("add.owl.carousel", [jQuery(content)])
    .trigger("refresh.owl.carousel");
}

function preparePastCards() {
  console.log("\nin preparePastCards\n");

  console.log("Adding prev item\n");
  //caseId 1
  cardTemplate(0, 1, 1);

  console.log("Adding show item\n");
  //caseId 2
  cardTemplate(0, 0, 2);

  prepareFutureCards();

  for (let i = pastArray.length - 1; i > 2; i--) {
    console.log("Adding past item\n");
    cardTemplate(0, i, 3);
  }

  if (pastArray.length >= 3) {
    $(".last").removeClass("last");
    cardTemplate(0, 2, 4);
  }
} //prepare past cards

function prepareFutureCards() {
  console.log("\nin prepareFutureCards\n");

  for (let i = 0; i < futureArray.length - 1; i++) {
    console.log("Adding future item\n");
    cardTemplate(1, i, i == 0 ? 5 : 3);
  }

  console.log("Adding future-last item\n");
  cardTemplate(1, futureArray.length - 1, futureArray.length - 1 == 0 ? 6 : 4);
}
