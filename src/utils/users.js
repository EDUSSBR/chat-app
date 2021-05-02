const users = [];

//Adduser  removeUser Getuser getUsersinRoom

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return ({ error: `Você precisa de um apelido e uma sala para participar do chat.` })
    }
    //check for existing user
    const existingUser = users.find((user) => {
        return (user.room === room) && (user.username === username)
    })
    //validate username
    if (existingUser) {
        return { error: "Este apelido está em uso, escolha outro!" }
    }
    //Store user
    username = username[0].toUpperCase() + username.substr(1)
    room = room[0].toUpperCase()+ room.substr(1)
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    return users[index]
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    room = room[0].toUpperCase()+ room.substr(1)
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}