const one = document.querySelector('.one')
const two = document.querySelector('.two')
const videoElem = document.querySelector('#video')
const usersCont = document.querySelector('.chat-users')
const cont = document.querySelector('.video-container')
let micMuted = false;
let peerId;

/* --- Socket --- */
const socket = io('wss://localhost:3000');


let peer = new Peer(undefined, {
    /* path: '/', */
    port: 443,
    secure: true
});


peer.on('open', id =>{
    peerId = id;
    console.log("opened")

    socket.emit("join-room", ROOM_ID, peerId, userIDDB)
    socket.emit('init-data', ROOM_ID, userIDDB)
})



/* --- Media Display as an admin --- */

const shareScreenBtn = document.querySelector('.screen-toggle') || null
let isLive = false;

if(shareScreenBtn != null){

    const muteMic = document.querySelector('.mute-mic')

    shareScreenBtn.addEventListener('click', e =>{

        // Turn off
        if(isLive == true){

            const tracks = document.querySelector('video').srcObject.getTracks()
            for(let i = 0; i < tracks.length; i++){
                tracks[i].stop()
            }

            document.querySelector('video').remove()
            shareScreenBtn.childNodes[1].innerHTML = "Start screen sharing"

            isLive = false;
        }
        // Turn on
        else{

            navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: false
            })
            .then( async (stream) =>{

                isLive = true;
                shareScreenBtn.childNodes[1].innerHTML = "Stop screen sharing"

                // Get audio stream
                let audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

                stream.addTrack(audioStream.getTracks()[0])


                // Mute/Unmute microphone
                muteMic.addEventListener('click', async (e) =>{

                    if(audioStream.getAudioTracks()[0].enabled == false){
                        audioStream.getAudioTracks()[0].enabled = true;
                        muteMic.classList.remove('btn-on')
                        muteMic.childNodes[1].innerHTML = "Mute Microphone"
                    }
                    else{
                        audioStream.getAudioTracks()[0].enabled = false
                        muteMic.classList.add('btn-on')
                        muteMic.childNodes[1].innerHTML = "Unmute Microphone"
                    }
                })


                // Create video element and embed it on admin's screen
                const vid = document.createElement('video')
                vid.setAttribute('autoplay', 'true');
                
                vid.srcObject = stream;
                vid.controls = true;
                vid.muted = false;
                cont.append(vid)


                socket.emit("stream-started", ROOM_ID)
                // Send the stream to others peers
                socket.on('user-connected', (userIdPeer, activeUsers) =>{

                    const conn = peer.connect(userIdPeer)
                    const call = peer.call(userIdPeer, stream, audioStream)
                })
            })
        }
    })
}


socket.on('stream-start-info', () =>{
    alert("Meeting has started, please reload the page")
})





/* --- Show Screen Sharing --- */

peer.on('call', call =>{

    call.answer()
    console.log("got call")
    
    call.on('stream', stream =>{

        console.log("got stream: ", stream)
        const vid = document.createElement('video')

        vid.autoplay = true;
        vid.muted = true;
        vid.controls = true;
        vid.srcObject = stream;

        cont.append(vid)
        
        vid.onloadedmetadata = function () {
            vid.play()

            vid.addEventListener('click', e =>{
                vid.muted = false;
            })
        }
    })
})
















/* --- Displaying connected users in chat-users --- */

socket.on('user-connected', (userIdPeer, userIDDB, activeUsers) =>{

    console.log("user", userIdPeer)
    console.log("actives", activeUsers)


    while(usersCont.firstChild){
        usersCont.removeChild(usersCont.firstChild)
    }

    activeUsers.forEach(user =>{

        const div = document.createElement('div')
        div.setAttribute('class','chat-user')
        div.setAttribute('data-userId',user)
    
        div.innerHTML = 
        `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.9542 14.9104C22.8447 13.5105 24.0758 11.2448 24.0758 8.6923C24.0758 4.45076 20.6773 1 16.5 1C12.3227 1 8.92423 4.45076 8.92423 8.6923C8.92423 11.2448 10.1553 13.5105 12.0458 14.9104C7.34626 16.7365 4 21.3631 4 26.7692C4 29.1021 5.86916 31 8.16667 31H24.8333C27.1308 31 29 29.1021 29 26.7692C29 21.3631 25.6537 16.7365 20.9542 14.9104ZM11.197 8.6923C11.197 5.72324 13.5759 3.30771 16.5 3.30771C19.4241 3.30771 21.803 5.72324 21.803 8.6923C21.803 11.6614 19.4241 14.077 16.5 14.077C13.5759 14.077 11.197 11.6614 11.197 8.6923ZM24.8333 28.6923H8.16667C7.12236 28.6923 6.27275 27.8296 6.27275 26.7692C6.27275 21.043 10.8606 16.3846 16.5001 16.3846C22.1395 16.3846 26.7274 21.043 26.7274 26.7692C26.7273 27.8296 25.8777 28.6923 24.8333 28.6923Z" fill="#EFF2F7"/>
            </svg>
        `
    
        usersCont.append(div)
    })
})

socket.on('user-disconnected', (userIDDB) =>{

    const cont = document.querySelector(`[data-userId='${userIDDB}']`)
    cont.remove()
})




/* --- Live Chat --- */

const chat = document.querySelector('.chat-main')
const chatInp = document.querySelector('.inp')
const chatBtn = document.querySelector('.chat-btn')

chat.scrollTop = chat.scrollHeight;

chatBtn.addEventListener('click', e =>{

    if(chatInp.value.length > 0)
        socket.emit("new-msg", ROOM_ID, chatInp.value, nick)
})

socket.on('add-msg', (msg, nick, color) =>{
    
    const div = document.createElement('div')
    div.setAttribute('class','message')

    if(nick.length > 15)
        nick = nick.slice(0,15) + "..."

    div.innerHTML = 
    `
    <div class="message">
        <div class="nick" style="color:#${color};" title=${nick}> ${nick} </div>
        <div class="space">:</div>
        <div class="msg"> ${msg} </div>
    </div>
    `

    chat.append(div)
    chat.scrollTop = chat.scrollHeight;
    chatInp.value = ''
})










/* --- Settings toggle --- */
const settingsCont = document.querySelector('.settings-cont') || null
const settingsContent = document.querySelector('.settings-content')
const addMaterial = document.querySelector('.add-material') || null
const addMatInp = document.querySelector('.add-mat-file') || null
const addMatBtn = document.querySelector('.add-file-btn') || null
const muteMic = document.querySelector('.mute-mic')
const screenToggle = document.querySelector('.screen-toggle')
const goBack = document.querySelector('.go-back')

if(settingsCont != null){
    
    settingsCont.addEventListener('click', e =>{

        if(e.target.classList.contains('c')){
            console.log("AA")
            settingsContent.classList.toggle('off')
        }
    })

    addMaterial.addEventListener('click', e =>{

        console.log("fuck")
        addMatInp.classList.toggle('display-hidden')
        addMatBtn.classList.toggle('display-hidden')
        muteMic.classList.add('display-hidden')
        screenToggle.classList.add('display-hidden')
        addMaterial.classList.add('display-hidden')
        goBack.classList.remove('display-hidden')

        addMatBtn.addEventListener('click', e =>{

            if(addMatInp.files.length == 0){
                console.log("NIE")
                return
            }
            
            const fd = new FormData()
            fd.append("addmaterial", addMatInp.files[0])
            
            console.log(fd)
            fetch(`/addMaterial?id=${ROOM_ID}`,{
                method: "POST",
                body: fd
            })

            settingsContent.classList.toggle('off')
        })
    })

    goBack.addEventListener('click', e =>{
        addMatInp.classList.add('display-hidden')
        addMatBtn.classList.add('display-hidden')
        muteMic.classList.remove('display-hidden')
        screenToggle.classList.remove('display-hidden')
        addMaterial.classList.remove('display-hidden')
        goBack.classList.add('display-hidden')
    })
}