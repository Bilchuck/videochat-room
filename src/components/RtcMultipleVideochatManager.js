const REMOTE_SERVER = "192.168.0.101"
const WS_SERVER = "ws:" + REMOTE_SERVER + ":1337";
const HTTP_SERVER = "192.168.0.101:1338"


class RtcMultipleVideochatManager {
    constructor() {
        this.pc = null;
        this.stream = null;
    }
    // webSockets
    onMessage(message) {
        const data = JSON.parse(message.data);
        switch (data.type) {
            case "login": 
                if (data.success) {
                    if (this.loggedCallback) {
                        this.loggedCallback();
                    }
                }
                break;
            case "offer": 
                this.pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                this.createAnswer(data.from)
                break;
            case "answer": 
                this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                break;
            case "candidate": 
                const candidate = new RTCIceCandidate({sdpMLineIndex: data.candidate.label, candidate: data.candidate.candidate});
                this.pc.addIceCandidate(candidate);
                break;
        }
    }
    sendMessage(type, message) {
        if (this.connection) {
            this.connection.send(JSON.stringify({...message, type}));
        }
    }
    // init
    initConnection() {
        this.pc = new RTCPeerConnection({ 
            "iceServers": [{ "urls": "stun:stun2.1.google.com:19302" }] 
        });
        if (this.stream) {
            this.pc.addStream(this.stream);
        }
        this.pc.onicecandidate = this.gotIceCandidate.bind(this);
        this.pc.onaddstream = this.gotRemoteStream.bind(this);
        this.pc.ontrack = this.gotRemoteStream.bind(this);

        this.connection = new WebSocket(WS_SERVER);
        this.connection.onmessage= this.onMessage.bind(this);
    }
    // RTC 
    createOffer(name) {
        this.partnerName = name;
        this.pc.createOffer(
            desc => {
                this.pc.setLocalDescription(desc);
                this.sendMessage("offer", {offer: desc, partnerName: name});
            }, 
            function(error) { console.log(error) }, 
            { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
        );
    }
    createAnswer(partnerName) {
        this.partnerName = partnerName;
        this.pc.createAnswer(
            desc => {
                this.pc.setLocalDescription(desc);
                this.sendMessage("answer", {answer: desc, partnerName});
            },
            function(error) { console.log(error) }, 
            { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
        );
    }
    gotIceCandidate(event){
        if (event.candidate) {
          this.sendMessage("candidate",{
            candidate: {
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            },
            partnerName: this.partnerName,
          });
        }
    }
    gotRemoteStream(event){
        if (this.gotRemoteSTreamCallback && event.stream) {
            this.gotRemoteSTreamCallback(event.stream);
        }
    }
    // public
    setLocalStream(stream) {
        this.stream = stream;
        this.initConnection();
    }
    onGotRemoteStream(fn) {
        this.gotRemoteSTreamCallback = fn;
    }
    callToPartner(name) {
        this.createOffer(name);
    }
    onLogged(fn) {
        this.loggedCallback = fn;
    }
    login(name) {
        this.localName = name;
        this.sendMessage("login", {
            name,
        });
    }
}

export default RtcMultipleVideochatManager;