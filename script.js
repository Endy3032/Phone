var timer,
  stream,
  overlay,
  audioRecorder,
  mediaAppOpen = false;
const phone = document.querySelector(".phone");
const defaultTransform = "translate(-50%, -50%)";

addEventListener("resize", () => {
  const iframe = document.querySelector("iframe");
  if (!iframe) return;
  const style = window.getComputedStyle(
    document.querySelector(".screen"),
    null
  );
  console.log(Object.values(iframe.classList));
  if (Object.values(iframe.classList).includes("noRotate")) {
    iframe.width = style.getPropertyValue("width");
    iframe.height = style.getPropertyValue("height");
    return;
  }
  iframe.width = style.getPropertyValue("height");
  iframe.height = style.getPropertyValue("width");
});

/* Utilities */
showOverlay = (bgImage = null) => {
  overlay = document.querySelector(".overlay");
  overlay.style.opacity = 1;
  overlay.style.zIndex = 1;
  if (bgImage) {
    const overlayImage = document.querySelector(".overlayImg");
    overlayImage.style.backgroundImage = bgImage;
    overlayImage.style.zIndex = 2;
    overlayImage.style.opacity = 1;
  }
  return overlay;
};

(updateStatusbarTime = () => {
  const date = new Date();
  const sbTime = document.querySelector(".statusBar .time span");
  sbTime.innerText = `${date.toLocaleTimeString("en", {
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  })} ${date.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
  setTimeout(updateStatusbarTime, date % (1000 * 60));
})();

showImage = async (imageData, width, height, timestamp) => {
  const storage = JSON.parse(await localforage.getItem("images")) ?? {};

  const image = document.createElement("a");
  image.classList.add("imgViewer");
  image.style.width = `${width}px`;
  image.style.height = `${height}px`;
  image.style.backgroundImage = `url("${imageData}")`;
  if (timestamp) image.download = `captured ${timestamp}.png`;
  image.href = imageData;

  const close = document.createElement("button");
  close.innerText = "Quay lại";
  close.classList.add("imgViewerButton");
  close.onclick = () => {
    document.querySelector(".imageModal").remove();
    storage[timestamp] = {
      width,
      height,
      data: imageData,
    };
    localforage.setItem("images", JSON.stringify(storage));
  };

  const del = document.createElement("button");
  del.innerText = "Xóa";
  del.classList.add("imgViewerButton", "delButton");
  del.onclick = () => {
    document.querySelector(".imageModal").remove();
    delete storage[timestamp];
    localforage.setItem("images", JSON.stringify(storage)).then(() => {
      if (mediaAppOpen) {
        home();
        photos();
      }
    });
  };

  const modal = document.createElement("div");
  modal.classList.add("imageModal");
  modal.appendChild(close);
  modal.appendChild(del);
  modal.appendChild(image);

  document.querySelector("body").appendChild(modal);
};

showHeaderText = (text) => {
  const header = document.createElement("span");
  header.innerText = text;
  header.style.fontWeight = "bold";
  header.style.position = "absolute";
  header.style.top = "5%";
  header.style.left = "50%";
  header.style.transform = "translate(-50%, -50%)";
  header.style.fontSize = "2rem";
  return header;
};

shoot = () => {
  const timestamp = new Date().toLocaleString("default", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const video = document.querySelector("video");
  const w = video.videoWidth;
  const h = video.videoHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  if (w && h) showImage(canvas.toDataURL("image/png"), w, h, timestamp);
};

record = async () => {
  const audios = JSON.parse(await localforage.getItem("audios")) ?? {};
  const timestamp = new Date().toLocaleString("default", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const stopwatch = document.createElement("span");
  stopwatch.classList.add("stopwatch");
  stopwatch.innerText = "00:00:0";
  stopwatch.style.position = "absolute";
  stopwatch.style.top = "50%";
  stopwatch.style.left = "50%";
  stopwatch.style.transform = "translate(-50%, -50%)";
  stopwatch.style.fontSize = "2rem";

  const rec = document.querySelector(".record");
  rec.style.borderRadius = "25%";
  rec.style.height = "1rem";

  timer = setInterval(() => {
    var [m, s, ms] = stopwatch.innerText.split(":").map((a) => parseInt(a));
    ms++;
    if (ms >= 10) {
      s++;
      ms = 0;
    }
    if (s >= 60) {
      m++;
      s = 0;
    }
    stopwatch.innerText = `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}:${ms}`;
  }, 100);

  overlay.appendChild(stopwatch);

  navigator.mediaDevices.getUserMedia({ audio: true }).then((strm) => {
    stream = strm;
    audioRecorder = new MediaRecorder(stream);
    audioRecorder.start();

    audioRecorder.addEventListener("dataavailable", (event) => {
      let reader = new FileReader();
      reader.onloadend = async () => {
        audios[timestamp] = { data: reader.result };
        await localforage.setItem("audios", JSON.stringify(audios));
      };
      reader.readAsDataURL(event.data);
    });

    rec.onclick = async () => {
      audioRecorder.stop();
      stream.getTracks().forEach((track) => track.stop());

      const rec = document.querySelector(".record");
      rec.removeAttribute("style");
      rec.onclick = () => record();

      stopwatch.remove();
    };
  });
};

function home() {
  document.querySelector(".camera").style.opacity = 0;
  if (stream) stream.getTracks().forEach((track) => track.stop());
  const overlayImg = document.querySelector(".overlayImg");
  overlayImg.removeAttribute("style");
  overlayImg.innerHTML = "";
  overlay = document.querySelector(".overlay");
  overlay.removeAttribute("style");
  overlay.innerHTML = "";
  clearTimeout(timer);
  phone.style.transform = defaultTransform;
  mediaAppOpen = false;
}

document.querySelectorAll(".appIcon").forEach((icon) => {
  const appName = Object.values(icon.classList).filter(
    (a) => a != "appIcon"
  )[0];
  icon.onclick = () => eval(`${appName.toLowerCase().replace("_", "")}()`);
  icon.style.backgroundImage = `url("Resources/${appName.replace(
    "_",
    " "
  )}.png")`;
});

debounce = (cb, delay) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
};

updateNote = debounce((text) => localforage.setItem("notes", text), 500);

/* App Functions */
camera = () => {
  if (!navigator.mediaDevices.getUserMedia) return;

  document.querySelector(".camera").style.opacity = 1;
  overlay = showOverlay("url('Resources/CamUI.png')", true);

  const video = document.createElement("video");
  video.autoplay = true;

  const btn = document.createElement("button");
  btn.classList.add("shoot");
  btn.style.zIndex = 3;
  btn.addEventListener("click", shoot);
  document.querySelector(".screen").appendChild(btn);

  overlay.appendChild(video);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((strm) => {
      stream = strm;
      video.srcObject = stream;
    })
    .catch((err) => console.log(err));
};

photos = async () => {
  mediaAppOpen = true;
  overlay = showOverlay();

  const photosText = showHeaderText("Ảnh");
  overlay.appendChild(photosText);

  const images = JSON.parse(await localforage.getItem("images")) ?? {};
  const imageGrid = document.createElement("div");
  imageGrid.classList.add("imageGrid");
  for (key of Object.keys(images)) {
    const { data, width, height } = images[key];
    const image = document.createElement("button");
    image.style.backgroundImage = `url("${data}")`;
    image.classList.add("image");
    image.onclick = () => showImage(data, width, height, key);
    imageGrid.appendChild(image);
  }
  overlay.appendChild(imageGrid);
};

calendar = () => {
  overlay = showOverlay();
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`;
  const style = window.getComputedStyle(
    document.querySelector(".screen"),
    null
  );
  overlay.innerHTML = `<iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23616161&ctz=Asia%2FHo_Chi_Minh&showNav=0&showTitle=0&showPrint=0&showCalendars=0&showTz=0&src=Zmdqb3I4cm5wdjlzM3Z0ZzdrcWJpaGV2OG9AZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23F09300" style="border-width:0" width="${style.getPropertyValue(
    "height"
  )}" height="${style.getPropertyValue(
    "width"
  )}" frameborder="0" scrolling="no"></iframe>`;
};

clock = () => {
  const date = new Date();
  const timeMsg = `${date.toLocaleString("vi", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })}<br>${date.toLocaleString("vi", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  })}`;
  overlay = showOverlay();
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.backgroundColor = "#0008";
  overlay.innerHTML = timeMsg;
  timer = setTimeout(clock, 1000 - date.getMilliseconds());
};

weather = async () => {
  const { data } = await axios.get(
    encodeURI("https://api.weatherapi.com/v1/forecast.json"),
    {
      params: {
        key: "3d35407e30c24f8eb3d102228212307",
        q: "Ho Chi Minh City,Vietnam",
        days: 1,
        aqi: "yes",
      },
    }
  );

  const icon = data.current.condition.icon;
  const temp = data.current.temp_c;
  const feelsLike = data.current.feelslike_c;
  const [min, max] = [
    data.forecast.forecastday[0].day.mintemp_c,
    data.forecast.forecastday[0].day.maxtemp_c,
  ];
  const pressure = data.current.pressure_mb;
  const humidity = data.current.humidity;
  const clouds = data.current.cloud;
  const wind = data.current.wind_kph;
  const visibility = data.current.vis_km;
  const sunrise = data.forecast.forecastday[0].astro.sunrise;
  const sunset = data.forecast.forecastday[0].astro.sunset;
  const uv = data.current.uv;
  const moonrise = data.forecast.forecastday[0].astro.moonrise;
  const moonset = data.forecast.forecastday[0].astro.moonset;
  const co = data.current.air_quality.co.toFixed(1);
  const o3 = data.current.air_quality.o3.toFixed(1);
  const no2 = data.current.air_quality.no2.toFixed(1);
  const so2 = data.current.air_quality.so2.toFixed(1);
  const pm25 = data.current.air_quality.pm2_5.toFixed(1);
  const pm10 = data.current.air_quality.pm10.toFixed(1);

  const overlay = showOverlay();
  overlay.innerHTML = `
  <p style="margin-top: 3rem; margin-bottom: -2rem; font-size: 1.5rem;"><strong>${temp}°C (như ${feelsLike}°C) </strong><img src="${icon}" /></p>
  <span style="font-size: 1rem">Thấp: ${min}°C | Cao: ${max}°C</span>
  <br>
  <h4 style="margin-top: 2rem">Thời tiết</h4>
  <table style="font-size: 1rem; width: 100%">
    <tr>
      <th>Áp suất</th>
      <td>${pressure}hPa</td>
      <th>Mặt trời</th>
      </tr>
      <tr>
      <th>Độ ẩm</th>
      <td>${humidity}%</td>
      <th>Mọc</th>
      <td>${sunrise}</td>
      </tr>
      <tr>
      <th>Mây</th>
      <td>${clouds}%</td>
      <th>Lặn</th>
      <td>${sunset}</td>
      </tr>
      <tr>
      <th>Gió</th>
      <td>${wind}m/s</td>
      <th>Mặt trăng</th>
      </tr>
      <tr>
      <th>Tầm nhìn</th>
      <td>${visibility}km</td>
      <th>Mọc</th>
      <td>${moonrise}</td>
      </tr>
      <tr>
      <th>UV</th>
      <td>${uv}</td>
      <th>Lặn</th>
      <td>${moonset}</td>
    </tr>
  </table>
  <h4 style="margin-top: 2rem">Chất lượng không khí</h4>
  <table style="font-size: 1rem; width: 100%">
    <tr>
      <th>CO</th>
      <th>O₃</th>
      <th>NO₂</th>
      <th>SO₂</th>
      <th>PM 2.5</th>
      <th>PM 10</th>
    </tr>
    <tr>
      <td>${co}</td>
      <td>${o3}</td>
      <td>${no2}</td>
      <td>${so2}</td>
      <td>${pm25}</td>
      <td>${pm10}</td>
    </tr>
  </table>
  `
    .replaceAll("AM", "Sáng")
    .replaceAll(/(\d\d:\d\d )(PM)/g, (match) => match.replace("PM", "Tối"));
};

calculator = () => {
  overlay = showOverlay();
  const style = window.getComputedStyle(
    document.querySelector(".screen"),
    null
  );
  overlay.innerHTML = `<iframe class="noRotate" src="./Resources/calc.html" style="border-width:0" width="${style.getPropertyValue(
    "width"
  )}" height="${style.getPropertyValue(
    "height"
  )}" frameborder="0" scrolling="no"></iframe>`;
};

maps = () => {
  overlay = showOverlay();
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`;
  const style = window.getComputedStyle(
    document.querySelector(".screen"),
    null
  );
  overlay.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1182221766608!2d106.64323191484392!3d10.802256492304005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293ba359b30b%3A0x59afbf1ebed4423b!2zVGVreSBD4buZbmcgSMOyYQ!5e0!3m2!1svi!2s!4v1656086462690!5m2!1svi!2s" controls=0&start=5&autoplay=1" allow="autoplay" width="${style.getPropertyValue(
    "height"
  )}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`;
};

notes = async () => {
  overlay = showOverlay();
  const noteBox = document.createElement("textarea");
  noteBox.value = (await localforage.getItem("notes")) ?? "";
  noteBox.classList.add("noteBox");
  noteBox.addEventListener("input", (e) => updateNote(e.target.value));

  const header = showHeaderText("Ghi Chú");
  overlay.appendChild(noteBox);
  overlay.appendChild(header);
};

voicememos = () => {
  if (!navigator.mediaDevices.getUserMedia) return;

  overlay = showOverlay();

  const header = showHeaderText("Ghi Âm");
  overlay.appendChild(header);

  const btn = document.createElement("button");
  btn.onclick = () => record();
  btn.classList.add("record");
  overlay.appendChild(btn);
};

contacts = () => {
  overlay = showOverlay();
  const calling = document.createElement("div");
  calling.classList.add("calling");

  const numberField = document.createElement("div");
  numberField.classList.add("result");

  const numberGrid = document.createElement("div");
  numberGrid.classList.add("number", "d-grid");

  for (num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) {
    const numButton = document.createElement("button");
    numButton.classList.add("btn");
    numButton.value = num.toString();
    numButton.innerText = num.toString();
    numButton.onclick = () => (numberField.innerText += numButton.value);
    numberGrid.appendChild(numButton);
  }
  const callButton = document.createElement("button");
  callButton.classList.add("enter");
  callButton.onclick = () => call();
  callButton.innerText = "Gọi";

  calling.appendChild(numberField);
  calling.appendChild(numberGrid);
  calling.appendChild(callButton);
  overlay.appendChild(calling);
};

call = () => {
  var phnumber = document.querySelector(".result").innerText;
  // phnumber
  overlay = showOverlay();
  overlay.innerHTML = `    <div class="callScreen position-absolute top-50 start-50 translate-middle">
      <div class="callName">
        ${phnumber}
      </div>
      <div id="timer_id" class="callTime">
      </div>
      <div class="callEnd">
        <button onclick="projects.stop('timer_id')">Kết Thúc</button>
      </div>`;
};

music = async () => {
  mediaAppOpen = true;
  overlay = showOverlay();

  const header = showHeaderText("Nhạc");
  overlay.appendChild(header);

  const player = document.createElement("audio");
  player.setAttribute("controls", "true");
  player.classList.add("audioPlayer");

  const audios = JSON.parse(await localforage.getItem("audios")) ?? {};
  const audioList = document.createElement("div");
  audioList.classList.add("audioList");
  for (key of Object.keys(audios)) {
    const { data } = audios[key];
    const play = document.createElement("button");
    play.innerText = key;
    play.onclick = () => (player.src = data);
    audioList.appendChild(play);
  }
  overlay.appendChild(audioList);
  overlay.appendChild(player);
};

safari = () => {
  overlay = showOverlay();
  const searchBar = document.createElement("textarea");
  searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const { value } = event.target;
      location.assign(
        /^https{0,1}:\/\//.test(value)
          ? `//${value.replace(/^https{0,1}:\/\//, "")}`
          : `//google.com/search?q=${value}`
      );
    }
  });

  const header = showHeaderText("Tìm Kiếm");
  overlay.appendChild(header);
  overlay.appendChild(searchBar);
};

facebook = () => showOverlay("url('Resources/FacebookUI.png')");

youtube = () => {
  overlay = showOverlay();
  phone.style.transform = `${defaultTransform} rotate(-90deg) scale(150%)`;
  const style = window.getComputedStyle(
    document.querySelector(".screen"),
    null
  );
  overlay.innerHTML = `<iframe src="https://www.youtube.com/embed/jh9BwyJB51A?controls=0&start=0&autoplay=1" allow="autoplay" width="${style.getPropertyValue(
    "height"
  )}" height="${style.getPropertyValue("width")}" allowfullscreen></iframe>`;
};

settings = () => {
  overlay = showOverlay();
  overlay.style.padding = "50% 0";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "space-around";
  overlay.innerHTML = `
  <button onclick="localforage.removeItem('notes')">Xóa Ghi Chú</button>
  <button onclick="localforage.removeItem('images')">Xóa Hình Ảnh</button>
  <button onclick="localforage.removeItem('audios')">Xóa Ghi Âm</button>`;
};
