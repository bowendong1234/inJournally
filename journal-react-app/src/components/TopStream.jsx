import React from 'react';
import './TopStream.css';

const TopStream = ({ songName, artistName, albumArt, artistArt }) => {
    return (
        <div className="song-container">
            {number + "."}
            <img src={albumArt} alt={`${songName} album art`} className="album-art" />
            <div className="song-info">
                <h2 className="song-name">{songName}</h2>
                <p className="artist-name">{artistName}</p>
            </div>
            <img src={artistArt} alt={`${artist} artist photo`} className="album-art" />
        </div>
    );
};

export default TopStream;