const {desktopCapturer, remote} = require('electron');
const {writeFile, write} = require('fs');
const { defaultApp } = require('process');
const {dialog, Menu} = remote;

const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelect = document.getElementById('selectionBtn');
videoSelect.onclick = getVideoSources;


let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];


startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};





async function getVideoSources() {
  const inputSources = await  desktopCapturer.getSources({
    types: ['window','screen']
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return{
        label: source.name,
        click: () => selectSource(source)        
      };
    })
  );

  videoOptionsMenu.popup();
};

async function selectSource(source) {
  videoSelect.innerText = source.name;

  const constraints = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }        
      }
  };

  const stream = await navigator.mediaDevices
  .getUserMedia(constraints);
  
  videoElement.srcObject = stream;
  videoElement.play();

  const options = { mimeType: 'video/webm; codecs=vp9'};
  mediaRecorder = new MediaRecorder(stream, options)
  
  mediaRecorder.ondataavailable = handleDataAvaible;
  mediaRecorder.onstop = handleStop;
  
}

function handleDataAvaible(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'    
  });
  
  const buffer = Buffer.from(await blob.arrayBuffer());

  const {filePath} = await dialog.showSaveDialog({
      buttonLabel: 'Save Video',
      defaultPath: `vid-${Date.now()}.webm`
  });
  if (filePath) {
    writeFile(filePath, buffer, () => console.log('Video save Successffuly!'));    
  }
}


