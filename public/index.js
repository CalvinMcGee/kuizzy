const socket = io()

let loader = document.createElement("div")
loader.classList.add("loader")

socket.on("question", (question) => {
    swal({
        title: question.text,
        buttons: {
            1: {
                text: question.answers[0],
                value: 1,
            },
            2: {
                text: question.answers[1],
                value: 2,
            },
            3: {
                text: question.answers[2],
                value: 3,
            },
            4: {
                text: question.answers[3],
                value: 4,
            },
        },
        closeOnClickOutside: false,
        closeOnEsc: false,
    }).then(answer => {
        socket.emit("answer", question.answers[answer - 1]) // We subtract 1 because arrays start at 0 and not 1
        swal({
            title: "Väntar på andra",
            buttons: false,
            content: loader,
            closeOnClickOutside: false,
            closeOnEsc: false,
        })
    })
})

socket.on("connected", async _ => {
    const name = await swal("Ditt namn:", {
        content: "input",
        button: "Gå med",
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
    socket.emit("name", name)
    swal({
        title: "Väntar på värd",
        buttons: false,
        content: loader,
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
})

socket.on("correct", async _ => {
    swal({
        title: "Rätt!",
        text: "Fortsätt så :)",
        icon: "success",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
})

socket.on("incorrect", async _ => {
    swal({
        title: "Fel!",
        text: "Bättre lycka nästa gång :(",
        icon: "error",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
})

socket.on("noAnswer", async _ => {
    swal({
        title: "Tiden är ute!",
        text: "Du måste svara snabbare",
        icon: "error",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
})

socket.on("gameover", async (leaderboard) => {
    let leaderboardDisplay = document.createElement("ul")
    for (player of leaderboard) {
        leaderboardDisplay.innerHTML += `<li>${player[0]}: ${player[1]}</li>`
    }
    swal({
        title: "Spelet slut!",
        icon: "info",
        content: leaderboardDisplay,
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
    })
})
