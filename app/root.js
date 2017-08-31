import React from 'react';
import Header from './components/header';
import Player from './page/player';
import { MUSIC_LIST } from './config/musiclist';
import MusicList from './page/musiclist'
import { Router, IndexRoute, Link, Route, hashHistory } from 'react-router'
import Pubsub from 'pubsub-js'
import { randomRange } from './page/until';

let App = React.createClass({
	getInitialState(){
		return {
			musicList: MUSIC_LIST,
			currentMusicItem: MUSIC_LIST[0],
			repeatType: 'cycle'
		}
	},
	playMusic(musicItem){
		$('#player').jPlayer('setMedia',{
			mp3: musicItem.file
		}).jPlayer('play');

		this.setState({
			currentMusicItem: musicItem
		});
	},

	playNext(type = 'next'){
		let index = this.findMusicIndex(this.state.currentMusicItem);
		let newIndex = null;
		let musicListLength = this.state.musicList.length;
		if(type === 'next'){
			newIndex = (index + 1) % musicListLength;
		}else{
			newIndex = (index - 1 + musicListLength) % musicListLength;
		}	
		this.playMusic(this.state.musicList[newIndex]);
	},
	findMusicIndex(musicItem){
		return this.state.musicList.indexOf(musicItem)
	},
	componentDidMount(){
		$('#player').jPlayer({			
			supplied:'mp3',
			vmode:'window'
		});
		this.playMusic(this.state.currentMusicItem);
		$('#player').bind($.jPlayer.event.ended,(e) => {
			this.playNext();
		})
		Pubsub.subscribe('DELETE_MUSIC',(msg, musicItem) => {
			this.setState({
				musicList: this.state.musicList.filter(item => {
					return item !== musicItem;
				})
			});
			if(this.state.currentMusicItem === musicItem){
				this.playNext('next');
			}
		});
		//循环播放
		$("#player").bind($.jPlayer.event.ended, (e) => {
			this.playWhenEnd();
		});
		//播放
		Pubsub.subscribe('PLAY_MUSIC',(msg, musicItem) => {
			this.playMusic(musicItem);
		});
		//上一首
		Pubsub.subscribe('PLAY_PRE',(msg, musicItem) => {
			this.playNext('pre');
		});
		//下一首
		Pubsub.subscribe('PLAY_NEXT',(msg, musicItem) => {
			this.playNext('next');
		});
		
		let repeatList = [
			'cycle',
			'once',
			'random'
		];
		PubSub.subscribe('CHANAGE_REPEAT', () => {
			let index = repeatList.indexOf(this.state.repeatType);
			index = (index + 1) % repeatList.length;
			this.setState({
				repeatType: repeatList[index]
			});
		});
		
	},
	componentWillUnMount(){
		Pubsub.unsubscribe('PLAY_MUSIC');
		Pubsub.unsubscribe('DELETE_MUSIC');
		Pubsub.unsubscribe('PLAY_PRE');
		Pubsub.unsubscribe('PLAY_NEXT');
		PubSub.unsubscribe('CHANAGE_REPEAT');
		$('#player').unbind($.jPlayer.event.ended);

	},
	playWhenEnd() {
		let index = this.findMusicIndex(this.state.cuerrentMusicItem);
		let newIndex = null;
		if (this.state.repeatType === 'random') {
			// let index = this.findMusicIndex(this.state.currentMusicItem);
			let randomIndex = randomRange(0, this.state.musicList.length - 1);
			while(randomIndex === index) {
				randomIndex = randomRange(0, this.state.musicList.length - 1);
			}
			this.playMusic(this.state.musicList[randomIndex]);
		} else if (this.state.repeatType === 'once') {
			newIndex = index;
		} else {
			newIndex = (index + 1) % musicListLength;
		}
	},
	render(){
		return (
			<div>
				<Header />
				{React.cloneElement(this.props.children,this.state)}
				<MusicList 
					musicList={this.state.musicList} 
					currentMusicItem={this.state.currentMusicItem}
				></MusicList>			
			</div>
		);
	}
});

let Root = React.createClass({
	render(){
		return(
			<Router history={hashHistory}>
				<Route path="/" component={App}>
					<IndexRoute component={Player}></IndexRoute>
					{/*<Route path="/list" component={MusicList}></Route>*/}
				</Route>
			</Router>
		)
	}


});

export default Root;
