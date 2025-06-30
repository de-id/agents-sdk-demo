var recognizing;

if (navigator.userAgent.includes("Firefox")) {
  recognition = new SpeechRecognition()
} else {
  recognition = new webkitSpeechRecognition()
}
// Set the language recognition here
recognition.lang = "en_US"

recognition.continuous = true;
reset();
recognition.onend = reset;

recognition.onresult = function (event) {
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      textArea.value += event.results[i][0].transcript;
    }
  }
}

function reset() {
  recognizing = false;
  speechButton.style.color = ""
  speechButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" view-box="0 0 24 24" fill="none">
    <path stroke="currentcolor" stroke-width="1.5" d="M7 8a5 5 0 0 1 10 0v3a5 5 0 0 1-10 0V8Z"/>
    <path stroke="currentcolor" stroke-linecap="round" stroke-width="1.5" d="M11 8h2M10 11h4M20 10v1a8 8 0 1 1-16 0v-1M12 19v3"/>
</svg>`;
  actionButton.removeAttribute("disabled")
}

function toggleStartStop() {
  recognition.lang = recognition.lang
  if (recognizing) {
    textArea.focus()
    recognition.stop();
    reset();
  } else {
    textArea.value = ""
    recognition.start();
    recognizing = true;
    speechButton.style.color = "red"
    speechButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentcolor" xmlns="http://www.w3.org/2000/svg">
<path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="#090604" stroke-width="1.5"/>
</svg>`
    actionButton.setAttribute("disabled", true)
  }
}
