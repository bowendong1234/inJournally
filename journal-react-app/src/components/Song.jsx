import React from 'react';
import './Song.css';

const Song = ({ songName, artistName, albumArt, number }) => {
    return (
        <div className="song-container">
            {number + "."}
            <img src={albumArt} alt={`${songName} album art`} className="album-art" />
            <div className="song-info">
                <h2 className="song-name">{songName}</h2>
                <p className="artist-name">{artistName}</p>
            </div>
        </div>
    );
};

export default Song;
