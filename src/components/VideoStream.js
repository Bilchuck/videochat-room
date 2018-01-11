import React, { Component } from "react";
import styled from 'styled-components';

const Wrapper = styled.div`
    display: block;
    width: 200px;
    height: 100px;
    backgroung: #000;
`;
class VideoStreamComponent extends Component{
    constructor(props) {
        super(props);
        this.videoEL;
    }
    componentWillReceiveProps(props) {
        if (props.stream) {
            this.videoEL.srcObject = props.stream;
            this.videoEL.play();
        }
        if (this.props.onLoadedMetadata) {
            this.videoEL.addEventListener('loadedmetadata', d => this.props.onLoadedMetadata(d));
        }
    }
    render() {
        return (
            <Wrapper> 
                <video 
                    style={{display:'block', width: '100%'}}
                    ref={el => this.videoEL = el} 
                    muted={"muted" in this.props && this.props.muted !== false}
                    >
                </video>
            </Wrapper>
        );
    }
}

export default VideoStreamComponent;