import events from "events"
import express from "express"
import { createServer } from "http"
import type { Server, Socket } from "socket.io"

const app = express()
const http = createServer(app)
const io: Server = require("socket.io")(http)
const timeUpEvent = new events.EventEmitter()

const questions = [
    {
        text: "Vad är 1+1?",
        time: 20,
        answers: [
            "0",
            "1",
            "2",
            "3",
        ],
        correctAnswer: "2",
    },
    {
        text: "Vad är 2+2?",
        time: 20,
        answers: [
            "2",
            "3",
            "4",
            "5",
        ],
        correctAnswer: "4",
    },
]

/**
 * SOCKETID: ["<PLAYERNAME>", POINTS]
 * Example -- 
 * dfwaogruhdslfsdljf: ["Khushraj", 0]
 */
let userPointsMap: Record<string, [string, number]> = {}

io.on("connection", (socket: Socket) => {
    let attempt = ""

    console.log("A user connected")
    socket.emit("connected")
    socket.once("name", (name) => {
        userPointsMap[socket.id] = [name, 0]
        io.emit("name", name)
    })

    socket.once("start", async () => {
        for (const question of questions) {
            await new Promise<void>(async (resolve) => {
                const toSend: {
                    text: string
                    time: number
                    answers: string[]
                    correctAnswer?: string
                } = { ...question }

                setTimeout(() => {
                    timeUpEvent.emit("timeUp", question.correctAnswer)
                    const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
                    const top5 = sortedValues.slice(0, 5)

                    io.emit("timeUp", top5)

                    socket.once("next", () => {
                        resolve()
                    })
                }, question.time * 1000)

                delete toSend.correctAnswer
                io.emit("question", toSend)
            })
        }
        const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
        io.emit("gameover", sortedValues)
        process.exit(0)
    })

    socket.on("answer", answer => {
        attempt = answer
    })

    timeUpEvent.on("timeUp", (correctAnswer) => {
        if (attempt) {
            if (attempt === correctAnswer) {
                userPointsMap[socket.id][1]++
                socket.emit("correct")
            } else {
                socket.emit("incorrect")
            }
            attempt = ""
        } else {
            socket.emit("noAnswer")
        }
    })
})

app.use(express.static("public"))
http.listen(3000, () => {
    console.log("listening on *:3000")
})
