import React, { useState } from 'react';

const SERVER_URL = 'http://0.0.0.0:8000';

const SpeakClient: React.FC = () => {
  const [responseValue, setResponseValue] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleSpeak = async () => {
    try {
      const res = await fetch(SERVER_URL + '/speak', {
        method: 'POST',
        body: JSON.stringify({ question: responseValue }),
        headers: {
          'Content-Type': 'application/json',
          accept: 'audio/wav',
        },
      });

      if (res.status === 200) {
        const audioData = await res.arrayBuffer();
        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioURL(audioUrl);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div>
        <textarea
          className='text-box'
          id='response-box'
          value={responseValue || ''}
          onChange={(e) => setResponseValue(e.target.value)}
        />
        <div>
          {audioURL && (
            <audio autoPlay key={audioURL}>
              <source src={audioURL} type='audio/mpeg' />
            </audio>
          )}
        </div>
      </div>
      <div>
        <button className='play-btn large-btn' onClick={handleSpeak}>
          Speak
        </button>
      </div>
    </div>
  );
};

export default SpeakClient;
