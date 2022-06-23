// const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })
// console.log(data)
var countdown

showOverlay = (bgImage = null) => {
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 1
  overlay.style.zIndex = 99
  if (bgImage) overlay.style.backgroundImage = bgImage
  return overlay
}

time = () => {
  const date = new Date();
  const timeMsg = `Bây giờ là ${date.toLocaleString("vi", { hour: "numeric", minute: "numeric", second: "numeric" })}`;
  const overlay = showOverlay()
  overlay.innerText = timeMsg
  countdown = setTimeout(time, 1000 - date.getMilliseconds());
}

cam = () => {
  document.querySelector(".camera").style.opacity = 1
  showOverlay("url(Resources/camera.png)")
}

youtube = () => {
  const overlay = showOverlay()
  overlay.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/HSsqzzuGTPo?controls=0&amp;start=5&autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
}

updateStatusbarTime = () => {
  const date = new Date()
  const sbTime = document.querySelector(".status_bar .time span")
  sbTime.innerText = `${date.toLocaleTimeString("en", { hour12: false, hour: "numeric", minute: "numeric" })} ${date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}`
  setInterval(updateStatusbarTime, date % (1000 * 60))
}
updateStatusbarTime()

home = () => {
  document.querySelector(".camera").style.opacity = 0
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 0
  overlay.style.zIndex = 0
  overlay.innerHTML = ""
  overlay.style.backgroundImage = "none"
  clearTimeout(countdown)
}
