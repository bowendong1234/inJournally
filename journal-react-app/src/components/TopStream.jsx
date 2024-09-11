import React from 'react';
import './TopStream.css';

const TopStreamComponent = ({ songName, artistName, albumArt, topArtist, artistArt }) => {
    return (
        <div className="top-stream-container">
            1.
            <img src={albumArt} alt={`${songName} album art`} className="top-stream-album-art" />
            <div className="top-stream-song-info">
                <h2 className="top-stream-song-name">{songName}</h2>
                <p className="top-stream-artist-name">{artistName}</p>
            </div>
            <img src={artistArt} alt={`${artistName} artist photo`} className="top-stream-album-art" />
            <div className="top-stream-song-info">
                <h2 className="top-stream-song-name">{topArtist}</h2>
                <p className="top-stream-artist-name">Most Streamed Artist Today</p>
            </div>
        </div>
    );
};

export default TopStreamComponent;