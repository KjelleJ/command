import * as speechCommands from '@tensorflow-models/speech-commands';
import 'regenerator-runtime'; // only for parcel

var recognizer;
var t1 = 0;
var t2; // t2 - t1 = ms between predictions

var listen = 0; // listen on recognizer

// 18w means using a model handling following words:
// zero,one,two,three,four,five,six,seven,eight,none,up,down,left,right,go,stop,yes,no
recognizer = speechCommands.create('BROWSER_FFT', '18w'); // (1)
loadAndListen();

async function loadAndListen() {
	// Make sure that the underlying model and metadata are loaded via HTTPS requests.
	await recognizer.ensureModelLoaded();
	start_listen(); // start listen for words (2)
}

// start_listen ----------------------------------------------------
function start_listen() {
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields such a
    //    - includeSpectrogram
    //    - probabilityThreshold
    //    - includeEmbedding

    var nlisten = 0;
	var ntime = 0;
    var ix;
    var pword;
    var score;
    var tdiff; 
    recognizer.listen(function (result) { // callback function (3)
      // - result.scores contains the probability scores that correspond to
      //   recognizer.wordLabels().
      // - result.spectrogram contains the spectrogram of the recognized word.
      var d = new Date();
      var words = recognizer.wordLabels();
      t2 = d.getTime();
      tdiff = t2 - t1;
      t1 = t2;
      ix = result.scores.indexOf(Math.max.apply(null, result.scores));
      score = result.scores[ix].toFixed(2) * 100 + '%';
      pword = words[ix]; // best word
	  if (nlisten == 0) {
			console.clear(); // shows that listening is started
			nlisten = 1;
	  } 

      if (tdiff >= 1000) {
 			console.log('*** ', pword, ' ', score, ' ***');
			result.scores[ix] = 0.;
			ix = result.scores.indexOf(Math.max.apply(null, result.scores));
			score = result.scores[ix].toFixed(2) * 100 + '%';
			pword = words[ix]; // best word
			console.log(pword, ' ', score);
			result.scores[ix] = 0.;
			ix = result.scores.indexOf(Math.max.apply(null, result.scores));
			score = result.scores[ix].toFixed(2) * 100 + '%';
			pword = words[ix]; // best word
			console.log(pword, ' ', score);
	} else { // words are coming too fast
		ntime++;
		console.log(nlisten, ix, pword, score, tdiff, 'TOO FAST - DISCARDED');
	} 

	}, { // configuration object
	  includeSpectrogram: false,
	  invokeCallbackOnNoiseAndUnknown: false,
	  probabilityThreshold: 0.75, // (4)
	  overlapFactor: 0.0
	});
  }

