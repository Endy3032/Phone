field = document.querySelector(".field-text")
eq = document.querySelector(".field-eq")
history = {}
index = -1
isViewingHistory = false
zero = (elem) => elem.innerText = "0"
clear = (elem) => elem.innerText = ""

getHist = (elem) => {
  if (index == -1) return
  isViewingHistory = true
  switch (elem.innerText) {
    case "↑": {
      eq.innerText = Object.keys(history)[index]
      field.innerText = Object.values(history)[index]
      if (index != 0) index--
      break
    }

    case "↓": {
      if (index != Object.keys(history).length - 1) index++
      eq.innerText = Object.keys(history)[index]
      field.innerText = Object.values(history)[index]
      break
    }
  }
}

onClick = (elem) => {
  button = elem.target.innerText
  if (isViewingHistory) {
    console.log("calc")
    isViewingHistory = false
    if (button == "=") zero(field)
    else clear(field)
    clear(eq)
    return
  }
  if (button == "C") return zero(field)

  if (button == "⌫") {
    field.innerText = field.innerText.slice(0, -1)
    if (field.innerText.length == 0) zero(field)
    return
  }

  if (button == "=") {
    if (field.innerText == "0") {
      clear(eq)
      zero(field)
      return
    }
    equation = field.innerText
    result = eval(equation)
    history[equation] = result
    eq.innerText = `${equation} = ${result}`
    field.innerText = zero(field)
    index = Object.keys(history).length - 1
    console.log(index)
    return
  }

  if (field.innerText == "0") clear(field)
  field.innerText += button
}

var keyDiv = document.querySelector(".keys")
const keys = [["C", "%", "⌫"], ["7", "8", "9", "+"], ["4", "5", "6", "-"], ["1", "2", "3", "*"], ["0", ".", "=", "/"]]

keys.forEach(keyRow => {
  const row = document.createElement("div")
  row.className = "row flex justify-end"
  keyRow.forEach(key => {
    const btn = document.createElement("button")
    btn.innerText = key
    btn.className = "rounded-full w-[20%] mr-[4%] mt-[5%] aspect-square bg-[#2E3440] font-mono text-2xl"
    btn.addEventListener("click", onClick)
    row.appendChild(btn)
  })
  keyDiv.appendChild(row)
})