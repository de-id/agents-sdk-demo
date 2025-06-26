// CSS import
import './style.css'

// 1. Import the Agents SDK library
import { createAgentManager, StreamType } from '@d-id/client-sdk';

// 2. Paste the 'data-client-key' in the 'auth.clientKey' variable
// (The client-key can be fetched via the Agent embed in D-ID Studio or via the API - Create Client Key Endpoint )
let auth = { type: 'key', clientKey: "" };

// 3. Paste the `data-agent-id' in the 'agentId' variable
let agentId = ""

// Variables declaration
let streamVideoElement = document.querySelector("#streamVideoElement")
let idleVideoElement = document.querySelector("#idleVideoElement")
let textArea = document.querySelector("#textArea")
let speechButton = document.querySelector("#speechButton");
let answers = document.querySelector("#answers")
let connectionLabel = document.querySelector("#connectionLabel")
let reconnectButton = document.querySelector("#reconnectButton")
let actionButton = document.querySelector("#actionButton");
let videoWrapper = document.querySelector("#video-wrapper");
let srcObject;
let streamType;

// 4. Define the SDK callbacks functions here
const callbacks = {

    // Link the HTML Video element with the WebRTC Stream Object (Video & Audio tracks)
    onSrcObjectReady(value) {
        console.log("SrcObject Ready")
        streamVideoElement.srcObject = value
        srcObject = value
        return srcObject
    },

    // Connection States callback method
    onConnectionStateChange(state) {
        console.log("Connection State: ", state)

        if (state == "connecting") {
            connectionLabel.innerHTML = "Connecting.."
            document.querySelector("#container").style.display = "flex"
            document.querySelector("#hidden").style.display = "none"

            // Displaying the Agent's name in the pages' header
            document.querySelector("#previewName").innerHTML = agentManager.agent.preview_name

            // Setting the video elements' sources and display
            idleVideoElement.src = agentManager.agent.presenter.idle_video
            idleVideoElement.play()
            videoWrapper.style.filter = "blur(5px)"
            streamVideoElement.style.opacity = 0;
            idleVideoElement.style.opacity = 1;

            // Setting video background image to avoid "flickering" for the legacy streaming architecture
            videoWrapper.style.backgroundImage = `url(${agentManager.agent.presenter.thumbnail})`
            // For photo-based avatars, set the following: `url(${agentManager.agent.presenter.source_url})`
            // For Premium+ avatars, set the following: `url(${agentManager.agent.presenter.thumbnail})`
            // Alternativley, save the first frame of the Idle video locally and set it as background image.
        }

        else if (state == "connected") {
            // Setting the 'Tab' key to switch between the modes and 'Enter' Key to Send a message
            textArea.addEventListener('keypress', (event) => { if (event.key === "Enter") { event.preventDefault(); handleAction() } })
            document.addEventListener('keydown', (event) => { if (event.key === 'Tab') { event.preventDefault(); switchModes() } })
            actionButton.removeAttribute("disabled")
            speechButton.removeAttribute("disabled")
            answers.innerHTML += `<div class='agentMessage'>${agentManager.agent.greetings[0]}</div><br>`
            if (streamType !== StreamType.Fluent) {
                connectionLabel.innerHTML = "Connected"
                videoWrapper.style.filter = "blur(0px)"
            } else {

            }
        }

        else if (state == "disconnected" || state == "closed") {
            textArea.removeEventListener('keypress', (event) => { if (event.key === "Enter") { event.preventDefault(); handleAction() } })
            document.removeEventListener('keydown', (event) => { if (event.key === 'Tab') { event.preventDefault(); switchModes() } })
            document.querySelector("#hidden_h2").innerHTML = `${agentManager.agent.preview_name} Disconnected`
            document.querySelector("#hidden").style.display = "flex"
            document.querySelector("#container").style.display = "none"
            actionButton.setAttribute("disabled", true)
            speechButton.setAttribute("disabled", true)
            document.getElementById("video-wrapper").style.filter = "blur(5px)"
            connectionLabel.innerHTML = ""
        }
    },

    onVideoStateChange(state) {
        console.log("Video State: ", state)
        // NEW ARCHITECURE (Fluent: Single Video for both Idle and Streaming)
        if (streamType == StreamType.Fluent) {
            if (state == "START") {
                videoWrapper.style.filter = "blur(0px)"
                connectionLabel.innerHTML = "Connected"
                streamVideoElement.style.opacity = 1;
                idleVideoElement.style.opacity = 0;
            }
        }
        // OLD ARCHITECURE (Legacy: Switching between the idle and streamed videos elements)
        else {
            if (state == "START") {
                streamVideoElement.muted = false
                streamVideoElement.srcObject = srcObject
                idleVideoElement.style.opacity = 0;
                streamVideoElement.style.opacity = 1;
            }
            else {
                streamVideoElement.muted = true
                idleVideoElement.style.opacity = 1;
                streamVideoElement.style.opacity = 0;
            }
        }
    },

    // New messages callback method
    onNewMessage(messages, type) {

        // Show only the last message from the entire 'messages' array
        let lastIndex = messages.length - 1
        let msg = messages[lastIndex]

        // Show Rating buttons only for the Agent's (assistant) full answers
        if (msg && msg.role == "assistant" && messages.length != 1) {
            if (type == "answer") {
                answers.innerHTML += `<div class='agentMessage'> ${msg.content} <div class="ratingButtons"> <button id='${msg.id}_plus' title='agentManager.rate() -> Rate this answer (+)'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
                <path fill="currentcolor" d="m11.986 7.1-.41-.071.41.07Zm-.392 2.266-.41-.07.41.07Zm-7.406 2.34-.415.036.415-.036Zm-.452-5.218.416-.036-.416.036Zm4.372-3.257.411.067-.41-.067ZM7.74 5.478l.411.067-.41-.067Zm-3.685.229-.272-.316.272.316Zm.799-.69.272.317-.272-.316Zm1.323-2.03-.404-.104.404.105ZM6.44 1.97l.403.105-.403-.105Zm.93-.492-.128.397.128-.397Zm.08.026.128-.397-.128.397ZM5.812 3.921l.368.196-.368-.196Zm2.246-1.787-.403.105.403-.105ZM6.82 1.515l-.18-.375.18.375Zm-4.28 10.743-.414.036.415-.036ZM2 6.016l.415-.036a.417.417 0 0 0-.832.036H2Zm9.576 1.013-.392 2.266.82.142.393-2.266-.821-.142Zm-3.884 5.107H5.109v.833h2.583v-.833Zm-3.09-.465-.45-5.219-.83.072.45 5.218.83-.071Zm6.582-2.376c-.282 1.629-1.75 2.84-3.492 2.84v.834c2.125 0 3.958-1.483 4.313-3.532l-.821-.142ZM7.697 3.164 7.33 5.41l.822.134.368-2.247-.822-.134Zm-3.37 2.858.799-.688-.544-.632-.8.689.545.631Zm2.253-2.93.264-1.018-.806-.21-.265 1.02.807.209Zm.663-1.218.081.026.255-.794-.08-.026-.256.794ZM6.18 4.117c.173-.325.308-.668.4-1.024l-.807-.21a3.821 3.821 0 0 1-.328.841l.735.393ZM7.324 1.9c.17.054.291.186.33.34l.807-.21a1.325 1.325 0 0 0-.882-.924l-.255.794Zm-.48.174A.286.286 0 0 1 7 1.89l-.362-.75a1.119 1.119 0 0 0-.6.725l.806.209ZM7 1.89a.331.331 0 0 1 .243-.016l.255-.794a1.164 1.164 0 0 0-.86.06L7 1.89Zm1.196 4.543h2.879v-.834H8.196v.834Zm-5.241 5.79-.54-6.243-.83.072.54 6.242.83-.071Zm-.538.059V6.016h-.834v6.266h.834Zm-.292.012a.146.146 0 0 1 .145-.158v.833c.404 0 .72-.345.685-.746l-.83.071Zm6.394-8.996c.07-.422.05-.854-.058-1.268l-.806.21c.078.301.093.616.042.924l.822.134Zm-3.41 8.838a.509.509 0 0 1-.506-.465l-.83.071c.06.694.64 1.227 1.336 1.227v-.833Zm.017-6.802c.378-.326.785-.713 1.054-1.217l-.735-.393c-.193.36-.5.665-.863.978l.544.632Zm7.27 1.837a1.342 1.342 0 0 0-1.321-1.572v.834c.315 0 .555.284.5.596l.822.142ZM2.27 12.136c.082 0 .147.066.147.146h-.834c0 .379.307.687.687.687v-.833ZM7.33 5.41a.88.88 0 0 0 .867 1.022v-.834a.046.046 0 0 1-.045-.054l-.822-.134ZM4.152 6.452a.51.51 0 0 1 .175-.43l-.544-.631a1.343 1.343 0 0 0-.462 1.133l.83-.072Z"/>
                </svg></button> <button id='${msg.id}_minus' title='agentManager.rate() -> Rate this answer (-)'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" style="rotate: 180deg;">
                <path fill="currentcolor" d="m11.986 7.1-.41-.071.41.07Zm-.392 2.266-.41-.07.41.07Zm-7.406 2.34-.415.036.415-.036Zm-.452-5.218.416-.036-.416.036Zm4.372-3.257.411.067-.41-.067ZM7.74 5.478l.411.067-.41-.067Zm-3.685.229-.272-.316.272.316Zm.799-.69.272.317-.272-.316Zm1.323-2.03-.404-.104.404.105ZM6.44 1.97l.403.105-.403-.105Zm.93-.492-.128.397.128-.397Zm.08.026.128-.397-.128.397ZM5.812 3.921l.368.196-.368-.196Zm2.246-1.787-.403.105.403-.105ZM6.82 1.515l-.18-.375.18.375Zm-4.28 10.743-.414.036.415-.036ZM2 6.016l.415-.036a.417.417 0 0 0-.832.036H2Zm9.576 1.013-.392 2.266.82.142.393-2.266-.821-.142Zm-3.884 5.107H5.109v.833h2.583v-.833Zm-3.09-.465-.45-5.219-.83.072.45 5.218.83-.071Zm6.582-2.376c-.282 1.629-1.75 2.84-3.492 2.84v.834c2.125 0 3.958-1.483 4.313-3.532l-.821-.142ZM7.697 3.164 7.33 5.41l.822.134.368-2.247-.822-.134Zm-3.37 2.858.799-.688-.544-.632-.8.689.545.631Zm2.253-2.93.264-1.018-.806-.21-.265 1.02.807.209Zm.663-1.218.081.026.255-.794-.08-.026-.256.794ZM6.18 4.117c.173-.325.308-.668.4-1.024l-.807-.21a3.821 3.821 0 0 1-.328.841l.735.393ZM7.324 1.9c.17.054.291.186.33.34l.807-.21a1.325 1.325 0 0 0-.882-.924l-.255.794Zm-.48.174A.286.286 0 0 1 7 1.89l-.362-.75a1.119 1.119 0 0 0-.6.725l.806.209ZM7 1.89a.331.331 0 0 1 .243-.016l.255-.794a1.164 1.164 0 0 0-.86.06L7 1.89Zm1.196 4.543h2.879v-.834H8.196v.834Zm-5.241 5.79-.54-6.243-.83.072.54 6.242.83-.071Zm-.538.059V6.016h-.834v6.266h.834Zm-.292.012a.146.146 0 0 1 .145-.158v.833c.404 0 .72-.345.685-.746l-.83.071Zm6.394-8.996c.07-.422.05-.854-.058-1.268l-.806.21c.078.301.093.616.042.924l.822.134Zm-3.41 8.838a.509.509 0 0 1-.506-.465l-.83.071c.06.694.64 1.227 1.336 1.227v-.833Zm.017-6.802c.378-.326.785-.713 1.054-1.217l-.735-.393c-.193.36-.5.665-.863.978l.544.632Zm7.27 1.837a1.342 1.342 0 0 0-1.321-1.572v.834c.315 0 .555.284.5.596l.822.142ZM2.27 12.136c.082 0 .147.066.147.146h-.834c0 .379.307.687.687.687v-.833ZM7.33 5.41a.88.88 0 0 0 .867 1.022v-.834a.046.046 0 0 1-.045-.054l-.822-.134ZM4.152 6.452a.51.51 0 0 1 .175-.43l-.544-.631a1.343 1.343 0 0 0-.462 1.133l.83-.072Z"/>
                </svg></button></div>
                </div><br> `
                console.log(`New Message:\n[${msg.role}] ${msg.content}`)
                connectionLabel.innerHTML = "Online"
                document.getElementById(`${msg.id}_plus`).addEventListener('click', () => rate(msg.id, 1))
                document.getElementById(`${msg.id}_minus`).addEventListener('click', () => rate(msg.id, -1))
            }

            // User Messages
        } else if (!!msg) {
            answers.innerHTML += `<div class="userMessage">${msg.content} </div><br>`
            console.log(`New Message:\n[${msg.role}] ${msg.content}`)
        }

        // Auto-scroll to the last message 
        answers.scrollTo({
            top: answers.scrollHeight + 50,
            behavior: 'smooth'
        });

    },

    // New callback to show the Talking/Idle states with the Fluent stream type
    onAgentActivityStateChange(state) {
        console.log("Agent Activity State: ", state)
    },

    // Error handling
    onError(error, errorData) {
        connectionLabel.innerHTML = `<span style="color:red">Something went wrong :(</span>`
        console.log("Error:", error, "Error Data:", errorData)
    }

}

// 5. Define the Stream options object
let streamOptions = { compatibilityMode: "on", streamWarmup: false, fluent: false }

// - - - - - - - - - - - - Local functions to utilize the Agent's SDK methods: - - - - - - - - - - - - - //

// agentManager.speak() -> Streams the provided text/audio
function speak() {
    let val = textArea.value
    // 'Speak' supports a minimum of 3 characters
    if (val !== "" && val.length > 2) {
        let speak = agentManager.speak(
            {
                type: "text",
                input: val,
            }
        )
        console.log(`Speak: "${val}"`)
        textArea.value = ""
    }
}

// agentManager.chat() -> Streams the D-ID's LLM and Knowledge (RAG) Response
function chat() {
    let val = textArea.value
    if (val !== "") {
        let chat = agentManager.chat(val)
        console.log(`Chat: ("${val}")`)
        connectionLabel.innerHTML = "Thinking.."
        textArea.value = ""
    }
}

// agentManager.rate() -> Rating the Agent's answers - for future Agents Analytics and Insights feature
function rate(messageID, score) {
    let rate = agentManager.rate(messageID, score)
    console.log(`Message ID: ${messageID} Rated:${score}\n`, "Result", rate)
}

// agentManager.reconnect() -> Reconnect the Agent to a new WebRTC session
function reconnect() {
    let reconnect = agentManager.reconnect()
    console.log("Reconnect")
}

// agentManager.disconnect() -> Terminates the current Agent's WebRTC session 
// (NOT IMPLEMENTED IN THIS DEMO)
function disconnect() {
    let disconnect = agentManager.disconnect()
    console.log("Disconnect")
}

// - - - - - - - - - - - - Utility Functions - - - - - - - - - - - - //

// Agent ID and Client Key check
if (agentId == "" || auth.clientKey == "") {
    connectionLabel.innerHTML = `<span style='color:red; font-weight:bold'> Missing agentID and auth.clientKey variables</span>`
    console.error("Missing agentID and auth.clientKey variables")
    console.log(`Missing agentID and auth.clientKey variables:\n\nFetch the data-client-key and the data-agent-id as explained on the Agents SDK Overview Page:\nhttps://docs.d-id.com/reference/agents-sdk-overview\n\nPaste these into their respective variables at the top of the main.js file and save.`)
}

// Chat/Speak Selection Logic
function switchModes() {
    const options = document.querySelectorAll('#buttons input[name="option"]');
    const checkedIndex = Array.from(options).findIndex(opt => opt.checked);
    const nextIndex = (checkedIndex + 1) % options.length;
    options[nextIndex].checked = true;
}
function handleAction() {
    const selectedOption = document.querySelector('input[name="option"]:checked').value;
    if (selectedOption === 'chat') {
        chat();
    } else if (selectedOption === 'speak') {
        speak();
    }
}

// Event Listeners for Agent's built-in methods
actionButton.addEventListener('click', handleAction);
speechButton.addEventListener('click', () => toggleStartStop())
reconnectButton.addEventListener('click', () => reconnect())

// Focus on text area and disabling the buttons when the page is loaded
window.addEventListener('load', () => {
    textArea.focus()
    actionButton.setAttribute("disabled", true)
    speechButton.setAttribute("disabled", true)
})

// - - - - - - - - - - - - *** Finally *** - - - - - - - - - - - - //

// 6. Create the 'agentManager' instance with the values created in previous steps
let agentManager = await createAgentManager(agentId, { auth, callbacks, streamOptions });
console.log("Create Agent Manager: ", agentManager)

console.log("Connecting to Agent ID: ", agentId)
await agentManager.connect()

// Check for the Stream type (Legacy/Fluent)
streamType = agentManager.getStreamType()
console.log("Stream Type:", streamType)

// Happy Coding! 