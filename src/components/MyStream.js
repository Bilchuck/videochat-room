import React, { Component } from "react";
import { Button, Text, FormGroup } from "@blueprintjs/core";
import styled from 'styled-components';
import VideoStream from "./VideoStream";
import RtcMultipleVideochatManager from "./RtcMultipleVideochatManager";

const LOGIN_TYPE = "login";

const VideoStreamWrapper = styled.div`
    width: 200px;
    height: 200px;
    display: inline-block;
    margin-right: 20px;
`;
class MyStreamComponent extends Component {
    constructor() {
        super();
        this.localStream = null;
        this.partnerStream = null;

        this.rtcConnection = new RtcMultipleVideochatManager();

        this.rtcConnection.onGotRemoteStream(stream => {
            this.partnerStream = stream;
            this.forceUpdate();
        });
        this.rtcConnection.onLogged(() => {
            this.logged = true;
            this.forceUpdate();
        });
        this.getLocalStream().then(stream => {
            this.localStream = stream;
            this.rtcConnection.setLocalStream(stream);
            this.forceUpdate();
        }).catch(e => {
            alert(e);
        });
    }

    loginHandler() {
        this.rtcConnection.login(this.userLoginEl.value);
    }

    getLocalStream() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
    }

    startCall() {
        this.rtcConnection.callToPartner(this.partnerLoginEl.value);
    }

    render() {
        return (
            <div>
                <div>
                    <VideoStreamWrapper>
                        <VideoStream stream={this.localStream} muted>
                        </VideoStream>
                    </VideoStreamWrapper>
                    <VideoStreamWrapper>
                        <VideoStream stream={this.partnerStream}>
                        </VideoStream>
                    </VideoStreamWrapper>
                </div>
                <FormGroup label="Your login" labelFor="userLogin" disabled={this.logged}>
                    <input type="text" className="pt-input" id="userLogin" ref={el => this.userLoginEl = el}/>
                    <Button text="Login" onClick={this.loginHandler.bind(this)} disabled={this.logged}/>
                </FormGroup>
                <FormGroup label="Partner login" labelFor="partnerLogn" disabled={!this.logged}>
                    <input type="text" className="pt-input" id="partnerLogn" ref={el => this.partnerLoginEl = el}/>
                    <Button text="Call" onClick={this.startCall.bind(this)} disabled={!this.logged}/>
                </FormGroup>
            </div>
        )
    }
}

export default MyStreamComponent;