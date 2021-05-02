const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
const { generateMessage } = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//setting up public directory
const port = process.env.PORT
const publicDirName = path.join(__dirname, "../public")
app.use(express.static(publicDirName))

io.on('connection', (socket) => {
    console.log("New webSocket connection!!!")


    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit("message", generateMessage("Seja bem-vindo ao chat!"))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} entrou na sala..`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })



    socket.on('mensagem', (mensagem, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, mensagem))
        callback()

    })

    socket.on('disconnect', () => {
        
        const user = removeUser(socket.id)
        if(user){
        io.to(user.room).emit("message", generateMessage(`${user.username} saiu desta sala.`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        }
    })
    socket.on('locationMessage', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("showLocation", generateMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback(generateMessage("Location Shared!"))
    })
})
server.listen(port, () => { console.log(`Server listening to port: ${port}`) })