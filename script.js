// const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })
// console.log(data)
var countdown
const phone = document.querySelector(".phone")
const defaultTransform = "translate(-50%, -50%)"

/* Utilities */
showOverlay = (bgImage = null) => {
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 1
  overlay.style.zIndex = 1
  if (bgImage) {
    const overlayImage = document.querySelector(".overlay-img")
    overlayImage.style.backgroundImage = bgImage
    overlayImage.style.zIndex = 2
    overlayImage.style.opacity = 1
  }
  return overlay
}

(updateStatusbarTime = () => {
  const date = new Date()
  const sbTime = document.querySelector(".status_bar .time span")
  sbTime.innerText = `${date.toLocaleTimeString("en", { hour12: false, hour: "numeric", minute: "numeric" })} ${date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}`
  setInterval(updateStatusbarTime, date % (1000 * 60))
})()

shoot = () => {
  const video = document.querySelector("video")
  const w = video.videoWidth
  const h = video.videoHeight

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h

  var ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, w, h)

  const image = document.createElement("a")
  image.classList.add("imgViewer")
  image.style.width = `${w}px`
  image.style.height = `${h}px`
  image.style.backgroundImage = `url("${canvas.toDataURL("image/png")}")`
  image.download = `captured ${(new Date).toLocaleString("en")}.png`
  image.href = canvas.toDataURL("image/png")

  const close = document.createElement("button")
  close.innerText = "×"
  close.classList.add("closeButton")
  close.onclick = () => document.querySelector(".image_modal").remove()

  const modal = document.createElement("div")
  modal.classList.add("image_modal")
  modal.appendChild(close)
  modal.appendChild(image)

  document.querySelector("body").appendChild(modal)
}

home = () => {
  document.querySelector(".camera").style.opacity = 0
  const tracks = document.querySelector("video")
  if (tracks) tracks.srcObject.getTracks().forEach(track => track.stop())
  const overlayImg = document.querySelector(".overlay-img")
  overlayImg.style.backgroundImage = ""
  overlayImg.style.zIndex = 0
  overlayImg.style.opacity = 0
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 0
  overlay.style.zIndex = 0
  overlay.innerHTML = ""
  overlay.style.backgroundImage = "none"
  clearTimeout(countdown)
  phone.style.transform = defaultTransform
}

document.querySelectorAll(".app_icon").forEach(icon => {
  const appName = Object.values(icon.classList).filter(a => a != "app_icon")[0]
  icon.onclick = () => eval(`${appName.toLowerCase()}()`)
  icon.style.backgroundImage = `url("Resources/${appName.replace("_", " ")}.png")`
})

/* App Functions */
clock = () => {
  const date = new Date()
  const timeMsg = `Bây giờ là ${date.toLocaleString("vi", { hour: "numeric", minute: "numeric", second: "numeric" })}`
  const overlay = showOverlay()
  overlay.innerText = timeMsg
  countdown = setTimeout(clock, 1000 - date.getMilliseconds())
}

camera = () => {
  document.querySelector(".camera").style.opacity = 1
  const overlay = showOverlay("url('Resources/CamUI.png')")

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
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://www.youtube.com/embed/HSsqzzuGTPo?controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}

facebook = () => showOverlay("url('Resources/FacebookUI.png')")
