//
// TODO:
//
const app = function () {
	const page = {};

  const RECORD_SYMBOL = '⏺️';  
  const PLAY_SYMBOL = '▶️';
  const PAUSE_SYMBOL = '⏸️';
  const STOP_SYMBOL = '⏹️';
	
	const settings = {
    streamavailable: false,
    mediarecorder: [],
    audiochunks: [],
    mp3blobs: [],
    recordcontrols: [],
    audiocontrols: [],
    playcontrols: [],
    recordbuttonstyling: {
      'start': {buttontext: RECORD_SYMBOL, buttonclass: 'start-recording', hovertext: 'start recording'},
      'stop': {buttontext: STOP_SYMBOL, buttonclass: 'stop-recording', hovertext: 'stop recording'},
      'redo': {buttontext: RECORD_SYMBOL, buttonclass: 'redo-recording', hovertext: 'redo recording'}
    },
    playbuttonstyling: {
      'play': {buttontext: PLAY_SYMBOL, buttonclass: 'play-audio', hovertext: 'play recording'},
      'pause': {buttontext: PAUSE_SYMBOL, buttonclass: 'pause-audio', hovertext: 'pause recording'}
    },
    recordinginprogress: -1
  };
  
  const config = {  // this should be made from query params
    title: "Title of query/response package",
    readme: "This comment should describe the package",
    downloadfilename: "arp_package000",
    items: [
      { textprompt: "text prompt #1", audioprompt: null },
      { textprompt: "text prompt #2", audioprompt: null },
      { textprompt: "text prompt #3", audioprompt: null }
    ]
  }
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init (navmode) {
    page.header = document.getElementById('header');       
    page.notice = document.getElementById('notice');       
		page.body = document.getElementsByTagName('body')[0];
    page.contents = document.getElementById('contents');
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		
    } else {
			_setNotice('');
      _configureAudio();
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = true;

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------  
  function _renderPage() {
    if (settings.streamavailable) {
      page.contents.appendChild(_renderTitle(config.title));
      page.contents.appendChild(_renderItems(config.items));  
      page.contents.appendChild(_createPackageControl());
    }
  }
  
  function _renderTitle(title) {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('arp-title');
    elemContainer.innerHTML = title;
    
    return elemContainer;
  }

  function _renderItems(items) {
    var elemContainer = document.createElement('div');

    for (var i = 0; i < items.length; i++) {
        elemContainer.appendChild(_createItem(i, items[i]));
    }
    
    return elemContainer;
  }
  
  function _createItem(index, item) {
    var elemContainer = document.createElement('div');
    elemContainer.classList.add('item-container');
    
    var elemPrompt = document.createElement('div');
    elemPrompt.classList.add('item-prompt');
    elemPrompt.innerHTML = item.textprompt;
    elemContainer.appendChild(elemPrompt);
    
    var elemResponse = document.createElement('div');
    elemResponse.classList.add('item-response');
    var elemButton = document.createElement('button');
    elemButton.id = _numberElementId('btnRecording', index);
    elemButton.classList.add('record-control');
    elemButton.onclick = e => _recordButtonHandler(e.target);
    settings.recordcontrols.push(elemButton);
    _setRecordButtonStyling(elemButton, 'start');
    elemResponse.appendChild(elemButton);
    
    var elemAudio = document.createElement('audio');
    elemAudio.id = _numberElementId('recordedAudio', index);
    elemAudio.classList.add('audio-control');
    elemAudio.innerHTML = 'HTML 5 audio control not supported by this browser';
    elemAudio.style.display = 'none';
    elemAudio.onended = e => _audioEndedHandler(e.target);
    settings.audiocontrols.push(elemAudio);
    elemResponse.appendChild(elemAudio);
    
    var elemPlay = document.createElement('button');
    elemPlay.id = _numberElementId('btnPlay', index);
    elemPlay.classList.add('play-control');
    elemPlay.onclick = e => _playButtonHandler(e.target);
    settings.playcontrols.push(elemPlay);
    _setPlayButtonStyling(elemPlay, 'play');
    elemResponse.appendChild(elemPlay);
    elemContainer.appendChild(elemResponse);
        
    return elemContainer;
  }
  
  function _createPackageControl() {
    var elemContainer = document.createElement('div');
    
    var elemButton = document.createElement('button');
    elemButton.class = 'package-control';
    elemButton.disabled = true;
    elemButton.innerHTML = 'download';
    elemButton.onclick = e => _packageButtonHandler(e.target);
    
    page.packagebutton = elemButton;
    elemContainer.appendChild(elemButton);
    
    return elemContainer;
  }

  function _setRecordButtonStyling(elemTarget, stageName) {
    var recordButtons = settings.recordcontrols;
    for (var i = 0; i < recordButtons.length; i++) {
      var elemButton = recordButtons[i];
      var elemNumber = _getElementNumber(elemButton);
      if( settings.recordinginprogress >= 0) {
        elemButton.disabled = (elemNumber != settings.recordinginprogress);
      } else {
        elemButton.disabled = false;
      }
    }
    
    var buttonText = settings.recordbuttonstyling[stageName].buttontext;
    var buttonClass = settings.recordbuttonstyling[stageName].buttonclass;
    var buttonHoverText = settings.recordbuttonstyling[stageName].hovertext;
    
    for (var prop in settings.recordbuttonstyling) {
      var className = settings.recordbuttonstyling[prop].buttonclass;
      if (elemTarget.classList.contains(className)) elemTarget.classList.remove(className);
    }
    elemTarget.innerHTML = buttonText;
    elemTarget.classList.add(buttonClass);
    elemTarget.title = buttonHoverText;
  }
    
  function _setPlayButtonStyling(elemTarget, stageName) {
    var playButtons = settings.playcontrols;
    for (var i = 0; i < playButtons.length; i++) {
      var elemButton = playButtons[i];
      var elemNumber = _getElementNumber(elemButton);
      if (settings.mp3blobs[i] == null) {
        elemButton.style.display = 'none';
      } else {
        elemButton.style.display = 'inline-block';
      }
    }
    
    var buttonText = settings.playbuttonstyling[stageName].buttontext;
    var buttonClass = settings.playbuttonstyling[stageName].buttonclass;
    var buttonHoverText = settings.playbuttonstyling[stageName].hovertext;
    
    for (var prop in settings.playbuttonstyling) {
      var className = settings.playbuttonstyling[prop].buttonclass;
      if (elemTarget.classList.contains(className)) elemTarget.classList.remove(className);
    }
    elemTarget.innerHTML = buttonText;
    elemTarget.classList.add(buttonClass);
    elemTarget.title = buttonHoverText;
  }
  
  function _enablePlayButtons(enable) {
    for (var i = 0; i < settings.playcontrols.length; i++) {
      settings.playcontrols[i].disabled = !enable;
    }
  }

  function _setPackageButtonEnable() {
    var enable = (settings.recordinginprogress < 0);
    
    for (var i = 0; i < settings.mp3blobs.length && enable; i++) {
      enable = (settings.mp3blobs[i] != null);
    }
    page.packagebutton.disabled = !enable;
  }

	//-----------------------------------------------------------------------------
	// audio setup and management
	//-----------------------------------------------------------------------------  
  function _configureAudio() {
    navigator.mediaDevices.getUserMedia({audio:true})
    .then((stream) => _configureAudioControls(stream))
    .catch((err) => _audioConfigureError(err))
    .then(() =>  _renderPage());
  }
  
  function _configureAudioControls(stream) {
    settings.streamavailable = true;
    
    for (var i = 0; i < config.items.length; i++) {
      var thisRecorder = new MediaRecorder(stream);
      var thisChunks = [];
      settings.mediarecorder.push(thisRecorder);
      settings.audiochunks.push(thisChunks);
      settings.mp3blobs.push(null);
      thisRecorder.ondataavailable = (function(e) {
        var j = i;
        return function(e) {_finishRecording(e, j);}
      })();
    }
  }
  
  function _audioConfigureError(err) {
    settings.streamavailable = false;
    _reportError('getUserMedia', err);
  }

  function _startRecording(elemTarget) {
    try {
      var elemNumber = _getElementNumber(elemTarget);
      settings.recordinginprogress = elemNumber;
      _setRecordButtonStyling(elemTarget, 'stop')
      _enablePlayButtons(false);
      _setPackageButtonEnable();
      settings.audiochunks[elemNumber] = [];
      settings.mediarecorder[elemNumber].start();
      
    } catch(err) {
      _reportError('_startRecording', err);
    }  
  }

  function _stopRecording(elemTarget) {
    try {
      var elemNumber = _getElementNumber(elemTarget);
      settings.recordinginprogress = -1;
      _setRecordButtonStyling(elemTarget, 'redo')
      settings.mediarecorder[elemNumber].stop();

    } catch(err) {
      _reportError('_stopRecording', err);
    }
  }

  function _redoRecording(elemTarget) {
    var prompt = 'There is already a recording for this item.\nClick "OK" if you would like to make a new one';
    if (confirm(prompt)) _startRecording(elemTarget);
  }

  function _finishRecording(e, index) {
    try {
      var elemAudio = document.getElementById(_numberElementId('recordedAudio', index));
      var thisRecorder = settings.mediarecorder[index];
      var thisChunks = settings.audiochunks[index];
      thisChunks.push(e.data);

      if (thisRecorder.state == "inactive"){
        let blob = new Blob(thisChunks,{type:'audio/mpeg-3'});
        elemAudio.src = URL.createObjectURL(blob);
        elemAudio.controls=true;
        elemAudio.autoplay=false;
        settings.mp3blobs[index] = blob;
        _setPackageButtonEnable();
        _enablePlayButtons(true);
        _setPlayButtonStyling(settings.playcontrols[index], 'play');
      }
    } catch(err) {
      _reportError('_finishRecording', err);
    }
  }

  function _playRecording(elemTarget) {  
    var elemNumber = _getElementNumber(elemTarget);
    var mp3blob = settings.mp3blobs[elemNumber];
    
    if (mp3blob != null) {
      var elemAudio = settings.audiocontrols[elemNumber];
      var stage, nextStage;
      if (elemTarget.classList.contains(settings.playbuttonstyling.play.buttonclass)) {
        stage = 'play';
        nextStage = 'pause';
      } else {
        stage = 'pause';
        nextStage = 'play';
      }

      if (stage == 'play') {
        elemAudio.play();
      } else {
        elemAudio.pause();
      }
      _setPlayButtonStyling(elemTarget, nextStage);
    }
  }
  
  function _audioEnded(elemTarget) {
    var elemNumber = _getElementNumber(elemTarget);
    var elemPlayButton = settings.playcontrols[elemNumber];
    _setPlayButtonStyling(elemPlayButton, 'play');    
  }
  
	//------------------------------------------------------------------
	// package and download recordings
	//------------------------------------------------------------------
  function _packageAudioRecordings() {
    var zip = new JSZip();
    
    zip.file('README.txt', config.readme + '\n');  // text must end in \n
    
    for (var i = 0; i < settings.mp3blobs.length; i++) {
      var blob = settings.mp3blobs[i];
      var blobname = _numberElementId('response', (i+1)) + '.mp3';
      zip.file(blobname, blob);
    }

    zip.generateAsync({type:"blob"})
    .then(function(content) {
      saveAs(content, config.downloadfilename + ".zip");
    });
  }
  
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
  function _recordButtonHandler(elemTarget) {
    var classes = elemTarget.classList;
    
    if (classes.contains(settings.recordbuttonstyling['start'].buttonclass)) {
      _startRecording(elemTarget);
    } else if (classes.contains(settings.recordbuttonstyling['stop'].buttonclass)) {
      _stopRecording(elemTarget);
    } else if (classes.contains(settings.recordbuttonstyling['redo'].buttonclass)) {
      _redoRecording(elemTarget);
    }
  }    
  
  function _packageButtonHandler(elemTarget) {
    _packageAudioRecordings();
  }
  
  function _playButtonHandler(elemTarget) {
    _playRecording(elemTarget);
  }
  
  function _audioEndedHandler(elemTarget) {
    _audioEnded(elemTarget);
  }

	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			page.notice.style.display = 'none'; 
		} else {
			page.notice.style.display = 'block';
		}
	}
  
  function _reportError(src, err) {
    _setNotice('Error in ' + src + ': ' + err.name + ' "' + err.message + '"');
  }

  function _getElementNumber(elem) {
    return parseInt(('000' + elem.id).slice(-3));
  }

  function _numberElementId(base, index) {
    return  base + ('000' + index).slice(-3);
  }

	//---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
