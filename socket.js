let io

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
              origin: "https://wherechat.herokuapp.com",
              methods: ["GET", "POST"]
            }
        })
        return io
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket.io not initialized!')
        }
        return io
    }
}