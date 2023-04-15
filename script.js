const fileInput = document.getElementById('file-input');
const songsList = [];
const latDiv = document.querySelector('.lat');
const songsListElement = document.querySelector('.songs-list');
const audioPlayer = new Audio();
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');

fileInput.addEventListener('change', (event) => {
    const selectedFiles = event.target.files;
    for(let i = 0; i < selectedFiles.length; i++) {
        songsList.push(selectedFiles[i]);
    }
    renderSongsList();
});

function renderSongsList() {
    songsListElement.innerHTML = '';
    for(let i = 0; i < songsList.length; i++) {
        const liElement = document.createElement('li');
        liElement.textContent = songsList[i].name;
        liElement.addEventListener('click', () => {
            audioPlayer.src = URL.createObjectURL(songsList[i]);
            audioPlayer.play();
        });
        songsListElement.appendChild(liElement);
    }
}

playPauseBtn.addEventListener('click', () => {
    if(audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
    }
});

stopBtn.addEventListener('click', () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
});

latDiv.addEventListener('click', (event) => {
    if(event.target.nodeName === 'LI') {
        const songIndex = Array.prototype.indexOf.call(songsListElement.children, event.target);
        audioPlayer.src = URL.createObjectURL(songsList[songIndex]);
        audioPlayer.play();
        playPauseBtn.textContent = 'Pause';
    }
});