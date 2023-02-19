import React from 'react';
import './VideoPlayer.css';

class VideoPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playing: false,
			muted: false,
			volume: 0.5,
			played: 0,
			loaded: 0,
			duration: 0,
			playbackRate: 1.0
		};
		this.localVideoRef = React.createRef();
		this.remoteVideoRef = React.createRef();
	}

	hangUpCall = () => {
		this.props.hangUpCallback();
	}

	componentDidMount() {
		this.addTracks();
	}

	componentDidUpdate() {
		this.addTracks();
	}

	addTracks = () => {
		if (this.props.localStream) {
			this.localVideoRef.current.srcObject = this.props.localStream;
		}
		if (this.props.remoteStream) {
			this.remoteVideoRef.current.srcObject = this.props.remoteStream;
		}
	}

	render() {
		return (
			<div className='video-popup'>
				<div className='flexChild' id="camera-container">
					<div className="camera-box">
						<video id="received_video" autoPlay ref={this.remoteVideoRef}></video>
						<video id="local_video" autoPlay muted ref={this.localVideoRef}></video>
						<button id='hangup-button' onClick={this.hangUpCall}>Hang Up</button>
					</div>
				</div>
			</div>
		)
	}
}

export default VideoPlayer;