// const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })
// console.log(data)
function time() {
  const date = new Date();
  var timeMsg = `Bây giờ là ${date.getHours()} , ${date.getMinutes()} , ${date.getSeconds()}`;
  document.getElementById("screen").innerText = timeMsg;
  var countdown = setInterval(time, 1000);
}
function youtube(){
    document.getElementById("screen").innerHTML = `<iframe src="https://youtube.com/embed/oxbqvhiJktc&ab"></iframe>`
}
