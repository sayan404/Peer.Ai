import React from "react";
import '../assets/popup.css'
import '../assets/button.css'
import Chat from "./chat";
import Asistant from "./asistant";
import { useState } from "react";
import TopSection from "./top";
import useSpeechToText from 'react-hook-speech-to-text';
import Wave from 'react-wavify'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TextToSpeech from "./texToSpeech";

const Popup = () => {
    const [text, setText] = useState("");
    const {
        results,
        isRecording,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        timeout: 150000,
    });
    let lengthoFResults = results.length
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        console.log(tabId);
        if (lengthoFResults > 0) {
            const data = {
                message: "messageFromPopup",
                payload: results,
                tabId: tabId,
                url: tabs[0].url
            };
            chrome.runtime.sendMessage(data);

        }
    })
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message) {
            // Handle the received message
            console.log(message.prompt);
           const recieivedText = message.prompt
            console.log(recieivedText);
            console.log(typeof (recieivedText));
            setText(recieivedText);
        }
    });

    console.log(text)
    return (
        <div className="parentContainer">
            <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {results.map((result) => (
                <p style={{ color: "white" }} key={result.timestamp}>{result.transcript} , </p>
            ))}
            {text && <TextToSpeech text={text} />}
        </div>
    )
};

export default Popup;