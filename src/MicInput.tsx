import React, { useState, useEffect } from 'react';
import { useWhisper } from '@chengsokdara/use-whisper';
import { UseWhisperTranscript } from '@chengsokdara/use-whisper/dist/types';
import openAIkey from './openAIkey.json';

// Convert the class to a functional component
function MicInput() {
  // Initialize state variables with useState
  const [apiKey, setApiKey] = useState(openAIkey['apikey']);

  // Use the Whisper hook and destructure its return value
  const { 
    recording, 
    speaking, 
    transcribing, 
    transcript, 
    pauseRecording, 
    startRecording, 
    stopRecording 
  } = useWhisper({ apiKey });

  // Export the state variables and functions
  return { 
    recording, 
    speaking, 
    transcribing, 
    transcript, 
    pauseRecording, 
    startRecording, 
    stopRecording 
  };
}

export default MicInput;

// import React, { useState, useEffect } from 'react';
// import { useWhisper } from '@chengsokdara/use-whisper';
// import { UseWhisperTranscript } from '@chengsokdara/use-whisper/dist/types';
// import openAIkey from './openAIkey.json';


// class MicInput {

//     private apiKey: string;
//     public recording: boolean;
//     public speaking: boolean;
//     public transcribing: boolean;
//     public transcript: UseWhisperTranscript;
//     public pauseRecording: () => void;
//     public startRecording: () => void;
//     public stopRecording: () => void;

//     constructor(apiKey: string) {
//         this.apiKey = apiKey;
//         this.recording = false;
//         this.speaking = false;
//         this.transcribing = false;
//         this.transcript = { blob: undefined, text: undefined };
//         this.pauseRecording = () => { };
//         this.startRecording = () => { };
//         this.stopRecording = () => { };

//         // Call a method to initialize the Whisper functionality
//         this.initWhisper();
//     }

//     initWhisper() {
//         // Destructure the necessary variables and functions from useWhisper
//         const { recording, speaking, transcribing, transcript, pauseRecording, startRecording, stopRecording } = useWhisper({
//             apiKey: this.apiKey, // Use the apiKey passed to the class constructor
//         });

//         // Assign the destructured variables and functions to instance properties
//         this.recording = recording;
//         this.speaking = speaking;
//         this.transcribing = transcribing;
//         this.transcript = transcript;
//         this.pauseRecording = pauseRecording;
//         this.startRecording = startRecording;
//         this.stopRecording = stopRecording;
//     }
// }

// export default MicInput;