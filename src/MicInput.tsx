import { useWhisper } from '@chengsokdara/use-whisper';
// import { UseWhisperTranscript } from '@chengsokdara/use-whisper/dist/types';

// Convert the class to a functional component
function MicInput() {
  // Initialize state variables with useState
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  //console.log(apiKey);

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