// const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })
// console.log(data)
var countdown
time = () => {
  const date = new Date();
  const timeMsg = `Bây giờ là ${date.toLocaleString("vi", { hour: "numeric", minute: "numeric", second: "numeric" })}`;
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 1
  overlay.style.zIndex = 99
  overlay.innerText = timeMsg
  countdown = setTimeout(time, 1000 - date.getMilliseconds());
}

youtube = () => {
  document.getElementById("screen").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/HSsqzzuGTPo?controls=0&amp;start=5&autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
}

updateStatusbarTime = () => {
  const date = new Date()
  const sbTime = document.querySelector(".status_bar .time span")
  sbTime.innerText = `${date.toLocaleTimeString("en", { hour12: false, hour: "numeric", minute: "numeric" })} ${date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}`
  setInterval(updateStatusbarTime, date % (1000 * 60))
}
updateStatusbarTime()

home = () => {
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 0
  overlay.style.zIndex = 0
  overlay.innerHTML = ""
  clearTimeout(countdown)
}
