import openAIkey from './openAIkey.json';


export const binarytoBlob = (binarydata: string): Blob => {
    const byteArray = new Uint8Array(binarydata.length);

    for (let i = 0; i < binarydata.length; i++) {
        byteArray[i] = binarydata.charCodeAt(i);
    }
    return new Blob([byteArray], { type: 'audio/mp3' });
};

/*
// with the input of a string of text, this function will return a string of mp3 data
async function dospeak(input: string) {
    const options = {
        method: 'POST',
        url: 'https://api.elevenlabs.io/v1/text-to-speech/' + openAIkey['xi-voice'],
        headers: {
            accept: 'audio/mpeg','content-type': 'application/json','xi-api-key': openAIkey['xi-api-key'],
        },
        data: { text: input },
        ResponseType: 'blob',
    };

    //using axios to make the request
    const response = await axios.request(options);

    console.log("speech blob length:" + response.data.length);
    const blob = binarytoBlob(response.data);
    //const blob = new Blob([response.data], { type: 'audio/mp3' });
    return blob;
}
*/
async function dospeak(input: string) {
    console.log("input: " + input)
    
    const options = {
        method: 'POST',
        headers: {
            accept: 'audio/mpeg',
            'content-type': 'application/json',
            'xi-api-key': process.env.REACT_APP_XI_API_KEY as string,
        },
        body: JSON.stringify({ 'text': input }),
    };

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + process.env.REACT_APP_XI_VOICE, options);
    const blob = await response.blob();
    return blob;
}

export default dospeak;