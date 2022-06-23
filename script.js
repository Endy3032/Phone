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
  const date = new Date()
  const timeMsg = `Bây giờ là ${date.toLocaleString("vi", { hour: "numeric", minute: "numeric", second: "numeric" })}`
  const overlay = showOverlay()
  overlay.innerText = timeMsg
  countdown = setTimeout(time, 1000 - date.getMilliseconds())
}

capture = (video) => {
  const w = video.videoWidth
  const h = video.videoHeight
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  canvas.style.width = w
  canvas.style.height = h
  canvas.onclick = () => {
    var newTab = window.open()
    newTab.document.body.style.backgroundColor = "#000"
    newTab.document.body.style.display = "flex"
    newTab.document.body.style.justifyContent = "center"
    newTab.document.body.style.alignItems = "center"
    newTab.document.body.innerHTML = `<img src="${canvas.toDataURL("image/png")}">`
  }
  var ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, w, h)
  return canvas
}

shoot = () => {
  const video = document.querySelector("video")
  const canvas = capture(video)

  const close = document.createElement("button")
  close.classList.add("closeButton")
  close.innerText = "×"
  close.onclick = () => document.querySelector(".image_modal").remove()

  const modal = document.createElement("div")
  modal.classList.add("image_modal")
  modal.appendChild(close)
  modal.appendChild(canvas)

  document.querySelector("body").appendChild(modal)
}

cam = () => {
  document.querySelector(".camera").style.opacity = 1
  const overlay = showOverlay("url(Resources/camera.png)")

  const video = document.createElement("video")
  video.autoplay = true

  const btn = document.createElement("button")
  btn.classList.add("shoot")
  btn.addEventListener("click", shoot)

  overlay.appendChild(video)
  overlay.appendChild(btn)

  if (navigator.mediaDevices.getUserMedia)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .catch(err => console.log(err))
}

youtube = () => {
  const overlay = showOverlay()
  overlay.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/HSsqzzuGTPo?controls=0&ampstart=5&autoplay=1" allow="autoplay encrypted-media picture-in-picture" allowfullscreen></iframe>`
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
  const tracks = document.querySelector("video")
  if (tracks) tracks.srcObject.getTracks().forEach(track => track.stop())
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 0
  overlay.style.zIndex = 0
  overlay.innerHTML = ""
  overlay.style.backgroundImage = "none"
  clearTimeout(countdown)
}
