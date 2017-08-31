import React from 'react';
import '../components/musicListItem.less';
import MusicListItem from '../components/musicListItem'

// let MusicList = React.createClass({

// });
// ES6语法

class MusicList extends React.Component{
	render(){
		let listEle = null;
		listEle = this.props.musicList.map((item) => {
			return (
				<MusicListItem 
					focus={item === this.props.currentMusicItem}
					key={item.id}
					musicItem={item}
				>
					{item.title}
				</MusicListItem>
			);
		});
		return (
			<ul className="list-wrap">
				{ listEle }
			</ul>
		)
	}
	
	
}



export default MusicList;