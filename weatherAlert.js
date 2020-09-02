var alerts = [];

function isInvalid() {
  // console.log(`\nCity Input = ${$("#city-input").val()}\n`);
  if ($("#city-input").val() == "") {
    alert("City is required!");
    return true;
  }

  return false;
}

async function getCoord(city) {
  // console.log("\nIn get-city coord\n");
  alerts = [];
  $("#loader").toggle(500);
  $("#btn1").prop("disabled", true);
  $(".noAlertsDiv").html("");
  await fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=metric" +
      "&appid=06c4f47c8a9fb640abee46c1840a2c23",
    { mode: "cors" }
  )
    .then((req) => req.json())
    .then(async (data) => {
      let lat = data.coord.lat;
      let lon = data.coord.lon;
      //   alert("Valid city");
      await getAlerts(lat, lon);
    })
    .then(async (data) => {
      await generateWeatherAlerts();
    })
    .catch((err) => alert("Invalid City or connecting to the API failed"))
    .finally(() => {
      $("#loader").toggle(500);
      $("#btn1").prop("disabled", false);
    });
  // generateWeatherAlerts();
  // $("#loader").toggle(500);
  // $("#btn1").prop("disabled", false);
}

async function getAlerts(lat, lon) {
  await fetch(
    `https://api.weatherbit.io/v2.0/alerts?lat=${lat}&lon=${lon}&key=89687d63b9b54cf59f64df9110b0c7df`
  )
    .then((req) => req.json())
    .then(async (data) => {
      // console.log("\nAlerts Data : ");
      // console.log("\nData : " + data);
      // console.log("\nAlerts : " + data.alerts);
      // console.log("\n");
      alerts = data.alerts;
    });
}

async function generateWeatherAlerts() {
  if (alerts.length == 0) {
    // Do something
    //   $("#accordion").append('<h3 >' + userName + "</h3></li>");
    let content = `<div class="container row noAlertsDiv">
        <img src="./Weather icon/Safe.png" width="100" height="100" alt="" />
        <h3 class="lead my-4 mx-3">No Alerts for the specified location</h3>
      </div>`;

    $(".noAlertsDiv").append(content);
    return;
  }

  for (let i = 0; i < alerts.length; i++) {
    buildCard(i);
  }
}

function buildCard(i) {
  var content = `      
        <div class="card mb-1">
            <div class="card-header bg-danger font-weight-bold" id="heading${i}">
            <h5 class="mb-0">
                <button
                class="btn btn-danger custom-button"
                data-toggle="collapse"
                data-target="#collapse${i}"
                aria-expanded="true"
                aria-controls="collapse${i}"
                >
                ${alerts[i].title}
                </button>
            </h5>
            </div>

            <div
            id="collapse${i}"
            class="collapse"
            aria-labelledby="heading${i}"
            data-parent="#accordion"
            >
            <div class="card-body border border-secondary">
                ${alerts[i].description}
            </div>
            </div>
        </div>`;

  $("#accordion").append(content);
}
