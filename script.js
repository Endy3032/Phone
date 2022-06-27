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

showHeaderText = (text) => {
  const header = document.createElement("span")
  header.innerText = text
  header.style.fontWeight = "bold"
  header.style.position = "absolute"
  header.style.top = "5%"
  header.style.left = "50%"
  header.style.transform = "translate(-50%, -50%)"
  header.style.fontSize = "2rem"
  return header
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

debounce = (cb, delay) => {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => cb(...args), delay)
  }
}

updateNote = debounce(text => localStorage.setItem("notes", text), 500)

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

  const photosText = showHeaderText("Photos")
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
  overlay.innerHTML = `<iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23616161&ctz=Asia%2FHo_Chi_Minh&showNav=0&showTitle=0&showPrint=0&showCalendars=0&showTz=0&src=Zmdqb3I4cm5wdjlzM3Z0ZzdrcWJpaGV2OG9AZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23F09300" style="border-width:0" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" frameborder="0" scrolling="no"></iframe>`
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

weather = async () => {
  const { data } = await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: "3d35407e30c24f8eb3d102228212307", q: "Ho Chi Minh City,Vietnam", days: 1, aqi: "yes" } })
  const { location } = data

  const aqiRatings = [["Tốt", "Vừa", "Không tốt lắm", "Không tốt", "Tệ", "Độc hại"], ["Thấp", "Vừa", "Cao", "Rất cao"]]

  const icon = `https:${data.current.condition.icon}`
  const temp = data.current.temp_c
  const feelsLike = data.current.feelslike_c
  const minMax = [data.forecast.forecastday[0].day.mintemp_c, data.forecast.forecastday[0].day.maxtemp_c]
  const pressure = data.current.pressure_mb
  const humidity = data.current.humidity
  const clouds = data.current.cloud
  const wind = data.current.wind_kph
  const gust = data.current.gust_kph
  const visibility = data.current.vis_km
  const sunrise = data.forecase.forecastday[0].astro.sunrise
  const sunset = data.forecase.forecastday[0].astro.sunset
  const uv = data.current.uv
  const moonrise = data.forecase.forecastday[0].astro.moonrise
  const moonset = data.forecase.forecastday[0].astro.moonset
  const moonPhase = data.forecase.forecastday[0].astro.moon_phase
  const moonIllumination = data.forecase.forecastday[0].astro.moon_illumination
  const usEPA = aqiRatings[0][data.current.air_quality["us-epa-index"] - 1]
  const ukDefra = aqiRatings[1][Math.ceil(data.current.air_quality["gb-defra-index"] / 3) - 1]
  const co = data.current.air_quality.co.toFixed(1)
  const o3 = data.current.air_quality.o3.toFixed(1)
  const no2 = data.current.air_quality.no2.toFixed(1)
  const so2 = data.current.air_quality.so2.toFixed(1)
  const pm25 = data.current.air_quality.pm2_5.toFixed(1)
  const pm10 = data.current.air_quality.pm10.toFixed(1)
}

maps = () => {
  const overlay = showOverlay()
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1182221766608!2d106.64323191484392!3d10.802256492304005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293ba359b30b%3A0x59afbf1ebed4423b!2zVGVreSBD4buZbmcgSMOyYQ!5e0!3m2!1svi!2s!4v1656086462690!5m2!1svi!2s" controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}

notes = () => {
  const overlay = showOverlay()
  const noteBox = document.createElement("textarea")
  noteBox.value = localStorage.getItem("notes") ?? ""
  noteBox.classList.add("noteBox")
  noteBox.addEventListener("input", e => updateNote(e.target.value))
  
  const photosText = showHeaderText("Notes")
  overlay.appendChild(noteBox)
  overlay.appendChild(photosText)
}

contacts = () => {
  const overlay = showOverlay();
  const calling = document.createElement("div")
  calling.classList.add("calling")

  const numberField = document.createElement("div")
  numberField.classList.add("result")

  const numberGrid = document.createElement("div")
  numberGrid.classList.add("number", "d-grid")

  for (num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) {
    const numButton = document.createElement("button")
    numButton.classList.add("btn")
    numButton.value = num.toString()
    numButton.innerText = num.toString()
    numButton.onclick = () => numberField.innerText += numButton.value
    numberGrid.appendChild(numButton)
  }
  const callButton = document.createElement("button")
  callButton.classList.add("enter")
  callButton.onclick = () => call()
  callButton.innerText = "Call"

  calling.appendChild(numberField)
  calling.appendChild(numberGrid)
  calling.appendChild(callButton)
  overlay.appendChild(calling)
}

function call(){
  var phnumber = document.querySelector(".result").innerText
  console.log(phnumber);
}

facebook = () => showOverlay("url('Resources/FacebookUI.png')")

youtube = () => {
  const overlay = showOverlay()
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`
  const style = window.getComputedStyle(document.querySelector(".screen"), null)
  overlay.innerHTML = `<iframe src="https://www.youtube.com/embed/jh9BwyJB51A?controls=0&start=0&autoplay=1" allow="autoplay" width="${style.getPropertyValue("height")}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`
}

safari = () => {
  const overlay = showOverlay()
  const searchBar = document.createElement("textarea")
  searchBar.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      const { value } = event.target
      location.assign(/^https{0,1}:\/\//.test(value) ? `//${value.replace(/^https{0,1}:\/\//, "")}` : `//google.com/search?q=${value}`)
    }
  })

  const header = showHeaderText("Search")
  overlay.appendChild(header)
  overlay.appendChild(searchBar)
}