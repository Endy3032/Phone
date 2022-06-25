// const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })

var countdown
var camRunning = false
const phone = document.querySelector(".phone")
const defaultTransform = "translate(-50%, -50%)"

/* Utilities */
showOverlay = (bgImage = null) => {
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 1
  overlay.style.zIndex = 1
  if (bgImage) {
    const overlayImage = document.querySelector(".overlayImg")
    overlayImage.style.backgroundImage = bgImage
    overlayImage.style.zIndex = 2
    overlayImage.style.opacity = 1
  }
  return overlay
}

(updateStatusbarTime = () => {
  const date = new Date()
  const sbTime = document.querySelector(".statusBar .time span")
  sbTime.innerText = `${date.toLocaleTimeString("en", { hour12: false, hour: "numeric", minute: "numeric" })} ${date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}`
  setInterval(updateStatusbarTime, date % (1000 * 60))
})()

showImage = (imageData, w, h, timestamp) => {
  const image = document.createElement("a")
  image.classList.add("imgViewer")
  image.style.width = `${w}px`
  image.style.height = `${h}px`
  image.style.backgroundImage = `url("${imageData}")`
  if (timestamp) image.download = `captured ${timestamp}.png`
  image.href = imageData

  const close = document.createElement("button")
  close.innerText = "×"
  close.classList.add("closeButton")
  close.onclick = () => document.querySelector(".imageModal").remove()

  const modal = document.createElement("div")
  modal.classList.add("imageModal")
  modal.appendChild(close)
  modal.appendChild(image)

  document.querySelector("body").appendChild(modal)
}

shoot = () => {
  const timestamp = (new Date).toLocaleString("default", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "2-digit" })
  const video = document.querySelector("video")
  const w = video.videoWidth
  const h = video.videoHeight

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h

  var ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, w, h)

  if (w && h) {
    const storage = JSON.parse(localStorage.getItem("images")) ?? {}
    storage[timestamp] = {
      width: w,
      height: h,
      data: canvas.toDataURL("image/png")
    }
    localStorage.setItem("images", JSON.stringify(storage))
  }

  showImage(canvas.toDataURL("image/png"), w, h, timestamp)
}

home = () => {
  document.querySelector(".camera").style.opacity = 0
  const tracks = document.querySelector("video")
  if (camRunning) {
    tracks.srcObject.getTracks().forEach(track => track.stop())
    camRunning = false
  }
  const overlayImg = document.querySelector(".overlayImg")
  overlayImg.style.backgroundImage = ""
  overlayImg.style.zIndex = 0
  overlayImg.style.opacity = 0
  const overlay = document.querySelector(".overlay")
  overlay.style.opacity = 0
  overlay.style.backgroundColor = ""
  overlay.style.zIndex = 0
  overlay.innerHTML = ""
  overlay.style.backgroundImage = "none"
  clearTimeout(countdown)
  phone.style.transform = defaultTransform
}


document.querySelectorAll(".appIcon").forEach(icon => {
  const appName = Object.values(icon.classList).filter(a => a != "appIcon")[0]
  icon.onclick = () => eval(`${appName.toLowerCase()}()`)
  icon.style.backgroundImage = `url("Resources/${appName.replace("_", " ")}.png")`
})

/* App Functions */
camera = () => {
  document.querySelector(".camera").style.opacity = 1
  const overlay = showOverlay("url('Resources/CamUI.png')", true)

  const video = document.createElement("video")
  video.autoplay = true

  const btn = document.createElement("button")
  btn.classList.add("shoot")
  btn.style.zIndex = 3
  btn.addEventListener("click", shoot)
  document.querySelector(".screen").appendChild(btn)

  overlay.appendChild(video)

  if (navigator.mediaDevices.getUserMedia)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .then(() => camRunning = true)
      .catch(err => console.log(err))
}

photos = () => {
  const overlay = showOverlay()

  const photosText = document.createElement("span")
  photosText.innerText = "Photos"
  photosText.style.fontWeight = "bold"
  photosText.style.position = "absolute"
  photosText.style.top = "5%"
  photosText.style.left = "50%"
  photosText.style.transform = "translate(-50%, -50%)"
  photosText.style.fontSize = "2rem"
  overlay.appendChild(photosText)
  
  const images = JSON.parse(localStorage.getItem("images"))
  const imageGrid = document.createElement("div")
  imageGrid.classList.add("imageGrid")
  for (key of Object.keys(images)) {
    const { data, width, height } = images[key]
    const image = document.createElement("button")
    image.style.backgroundImage = `url("${data}")`
    image.classList.add("image")
    image.onclick = () => showImage(data, width, height, key)
    imageGrid.appendChild(image)
  }
  overlay.appendChild(imageGrid)
}
calendar = () => {
  const overlay = showOverlay()
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://calendar.google.com/calendar/embed?src=wangminh06%40gmail.com&ctz=Asia%2FHo_Chi_Minh" controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}
clock = () => {
  const date = new Date()
  const timeMsg = `${date.toLocaleString("vi", { weekday: "long", month: "long", day: "numeric" })}<br>${date.toLocaleString("vi", { hour: "numeric", minute: "numeric", second: "numeric" })}`
  const overlay = showOverlay()
  overlay.style.display = "flex"
  overlay.style.alignItems = "center"
  overlay.style.justifyContent = "center"
  overlay.style.backgroundColor = "#0008"
  overlay.innerHTML = timeMsg
  countdown = setTimeout(clock, 1000 - date.getMilliseconds())
}
maps = () => {
  const overlay = showOverlay()
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1182221766608!2d106.64323191484392!3d10.802256492304005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293ba359b30b%3A0x59afbf1ebed4423b!2zVGVreSBD4buZbmcgSMOyYQ!5e0!3m2!1svi!2s!4v1656086462690!5m2!1svi!2s" controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}
youtube = () => {
  const overlay = showOverlay()
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://www.youtube.com/embed/HSsqzzuGTPo?controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}

facebook = () => showOverlay("url('Resources/FacebookUI.png')")
