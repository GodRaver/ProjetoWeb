const fileInput = document.getElementById('file-input');
const songsList = [];
const latDiv = document.querySelector('.lat');
const songsListElement = document.querySelector('.songs-list');
const audioPlayer = new Audio();
const playPauseBtn = document.getElementById('playButton');
const stopBtn = document.getElementById('stop-btn');

fileInput.addEventListener('change', (event) => 
{
    const selectedFiles = event.target.files;
    for(let i = 0; i < selectedFiles.length; i++) 
    {
        songsList.push(selectedFiles[i]);
    }
    renderSongsList();
});

function renderSongsList() 
{
  songsListElement.innerHTML = '';
  for (let i = 0; i < songsList.length; i++) 
  {
    const liElement = document.createElement('li');
    liElement.textContent = songsList[i].name;
    liElement.addEventListener('click', function () 
    {
      playSong(songsList[i]);
      highlightCurrentSong(this);
    });
    songsListElement.appendChild(liElement);
  }
}
function highlightCurrentSong(currentSongElement) 
{
  const playingSong = document.querySelector('.playing');
  if (playingSong) {
    playingSong.classList.remove('playing');
  }
  currentSongElement.classList.add('playing');
}

function playSong(song) 
{
  audioPlayer.src = URL.createObjectURL(song);
  audioPlayer.play();
  document.getElementById("playIcon").style.display = "none";
  document.getElementById("pauseIcon").style.display = "inline";
  connectAudioSourceToAnalyzer(audioPlayer);
  waveSurfer.load(URL.createObjectURL(song));
}

function connectAudioSourceToAnalyzer(audioSource) 
{
  const source = audioContext.createMediaElementSource(audioSource);
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);
}

playPauseBtn.addEventListener('click', () => 
{
  if (audioPlayer.paused) 
  {
    audioPlayer.play();
    document.getElementById("playIcon").style.display = "none";
    document.getElementById("pauseIcon").style.display = "inline";
  } 
  else 
  {
    audioPlayer.pause();
    document.getElementById("playIcon").style.display = "inline";
    document.getElementById("pauseIcon").style.display = "none";
  }
});

stopBtn.addEventListener('click', () => 
{
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.src = '';
  waveSurfer.empty();
  document.getElementById("playIcon").style.display = "inline";
  document.getElementById("pauseIcon").style.display = "none";
});


latDiv.addEventListener('click', (event) => 
{
  const liElement = event.target.closest('li');
  if (liElement) 
  {
      const songIndex = Array.prototype.indexOf.call(songsListElement.children, liElement);
      playSong(songsList[songIndex]);
      highlightCurrentSong(liElement);
  }
});

//Piano Functions
const simplePianoKeysContainer = document.querySelector(".simple-piano-keys");
const simpleWhiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
const simpleBlackKeys = ["C#", "D#", "", "F#", "G#", "A#", ""];

function createSimplePianoKeys() 
{
  for (let i = 0; i < simpleWhiteKeys.length; i++) 
  {
    const simpleWhiteKey = document.createElement("div");
    simpleWhiteKey.classList.add("simple-piano-key");
    simpleWhiteKey.setAttribute("data-note", simpleWhiteKeys[i]);
    simplePianoKeysContainer.appendChild(simpleWhiteKey);

    if (simpleBlackKeys[i] !== "") 
    {
      const simpleBlackKey = document.createElement("div");
      simpleBlackKey.classList.add("simple-piano-key", "black");
      simpleBlackKey.setAttribute("data-note", simpleBlackKeys[i]);
      simpleWhiteKey.appendChild(simpleBlackKey);
    }
  }
}

window.addEventListener('pointerdown', (event) => 
{
  if (event.target.classList.contains('simple-piano-key')) 
  {
    playNote(event);
  }
});

window.addEventListener('pointerup', (event) => 
{
  if (event.target.classList.contains('simple-piano-key')) 
  {
    stopNote(event);
  }
});


const noteFrequencies = 
{
  "C": 260,
  "C#": 290,
  "D": 315,
  "D#": 330,
  "E": 345,
  "F": 370,
  "F#": 400,
  "G": 413,
  "G#": 419,
  "A": 430,
  "A#": 465,
  "B": 499
};

let noteOscillator;

function playNote(event) {
  const note = event.target.dataset.note;
  const frequency = noteFrequencies[note];
  
  noteOscillator = audioContext.createOscillator();
  noteOscillator.type = 'sine';
  noteOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  noteOscillator.connect(audioContext.destination);
  noteOscillator.start();
}

function stopNote() 
{
  if (noteOscillator) 
  {
    noteOscillator.stop();
    noteOscillator.disconnect();
  }
}


createSimplePianoKeys();

const equDiv = document.querySelector('.equ');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

canvas.width = equDiv.clientWidth;
canvas.height = equDiv.clientHeight;

canvasCtx.fillStyle = 'rgb(188, 23, 8)';
canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyzer = audioContext.createAnalyser();

function draw() 
{
  const bufferLength = analyzer.frequencyBinCount;
  const audioData = new Uint8Array(bufferLength);
  analyzer.getByteFrequencyData(audioData);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / bufferLength*2;
  for (let i = 0; i < bufferLength; i++) 
  {
    const barHeight = audioData[i];
    const x = i * barWidth;
    const y = canvas.height - barHeight;
    canvasCtx.fillStyle = 'rgb(50, 200, 50)';
    canvasCtx.fillRect(x, y, barWidth, barHeight);
  }

  requestAnimationFrame(draw);
}

draw();


//Wave in the middlewavediv

audioPlayer.addEventListener('canplaythrough', () => 
{
  loadWaveSurferAudioFile(audioPlayer.src);
});

// WaveSurfer
const waveSurfer = WaveSurfer.create(
{
  container: '.middlewave',
  waveColor: 'violet',
  progressColor: 'blue'
});

function loadWaveSurferAudioFile(src) {
  fetch(src)
      .then(response => response.blob())
      .then(blob => 
      {
          waveSurfer.loadBlob(blob);
      });
}
//Prog bar

audioPlayer.addEventListener('timeupdate', () => 
{
  waveSurfer.seekTo(audioPlayer.currentTime / audioPlayer.duration);
});

audioPlayer.addEventListener('pause', () => 
{
  waveSurfer.empty();
});

audioPlayer.addEventListener('ended', () => 
{
  waveSurfer.empty();
});

//Timer

const timerElement = document.getElementById('timer');

function updateTime() 
{
  const currentTime = audioPlayer.currentTime;
  const duration = audioPlayer.duration;

  const audioDuration = isNaN(duration) ? 0 : duration;

  timerElement.textContent = `${formatTime(currentTime)} / ${formatTime(audioDuration)}`;

  updateProgressBar(currentTime, audioDuration);
}

function updateProgressBar(currentTime, duration) 
{
  const progress = (currentTime / duration) * 100;

  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${progress}%`;
}

audioPlayer.addEventListener('timeupdate', updateTime);

function formatTime(time) 
{
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutes}:${formattedSeconds}`;
}