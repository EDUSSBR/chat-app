const socket = io()



//elements
const $form = document.querySelector("#message-form")
const $formButton = document.querySelector("#botao-form")
const $sendLocation = document.querySelector("#send-location")
const $input = document.querySelector("#input-form")
const $messages = document.querySelector("#messages")
const $sideBar = document.querySelector(".chat__sidebar")


//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//OPTIONS
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of messages containers
    const containerHeight = $messages.scrollHeight
    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username[0].toUpperCase() + message.username.substr(1),
        message: message.message,
        time: moment(message.createdAt).format("H:mm")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


$form.addEventListener('submit', (e) => {
    e.preventDefault()
    $formButton.setAttribute("disabled", "disabled")

    const message = e.target.message.value
    socket.emit("mensagem", message, (error) => {
        $formButton.removeAttribute("disabled")
        $input.value = ""
        $input.focus()
        if (error) {
            console.log(error)
        }
        console.log('msg entregue.')
    })
})

$sendLocation.addEventListener("click", () => {

    if (!navigator.geolocation) {
        return alert("Geolocation is not suported by yur browser!")
    }
    $sendLocation.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {
        const enviarLocalizacao = {
            "latitude": `${position.coords.latitude}`,
            "longitude": `${position.coords.longitude}`
        }
        socket.emit("locationMessage", enviarLocalizacao, (resp) => {
            $sendLocation.removeAttribute("disabled")

        })
    })
})
socket.on("showLocation", (locationLink) => {
    const html = Mustache.render(locationTemplate, {
        username: locationLink.username[0].toUpperCase() + locationLink.username.substr(1),
        locationLink: locationLink.message,
        time: moment(locationLink.createdAt).format("H:mm")

    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})


socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users

    })
    document.querySelector("#sidebar").innerHTML = html
})