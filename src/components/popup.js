import React, { useEffect } from "react";
import '../assets/popup.css'
import { useState } from "react";
import useSpeechToText from 'react-hook-speech-to-text';
import Wave from 'react-wavify'
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import TextToSpeech from "./texToSpeech";
import Switch from '@mui/material/Switch';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import { Configuration, OpenAIApi } from 'openai'



const Popup = () => {
    const [text, setText] = useState("");
    const [apiResponse, setApiResponse] = useState('');
    const [detectMode, setDetectMode] = useState(false);


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

    //page refresh 
    let lengthoFResults = results.length
    let modeActivation, modeActivationAcualData
    // console.log(results);
    function refreshPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id;
            // console.log(tabId);
            // console.log(tabId);
            if (lengthoFResults > 0) {
                const data = {
                    message: "messageFromPopup",
                    payload: results,
                    action: "refresh",
                    tabId: tabId,
                    url: tabs[0].url
                };
                chrome.runtime.sendMessage(data);
            }
        })
    }

    useEffect(() => {
        if (results[lengthoFResults - 1] != undefined) {
            modeActivation = results[lengthoFResults - 1].transcript.replaceAll(/[- )(.,;]/g, '').toLowerCase();
            modeActivationAcualData = results[lengthoFResults - 1].transcript
            // console.log(results);
            // console.log(modeActivation);
            // console.log(modeActivationAcualData);
            if (modeActivation.includes("activatechat")) {
                setDetectMode(true)
                // console.log(detectMode);
            }
            else if (modeActivation.includes("deactivatechat")) {
                setDetectMode(false)
                refreshPage();
                // console.log(detectMode);
            }
            else {
                if (!detectMode) {
                    console.log(detectMode);
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        const tabId = tabs[0].id;
                        // console.log(tabId);
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
                }


                //-------------------------------------------
                // to content.js  ----------------
                // async function collectLink() {
                //     tabsQuary = await chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //         var activeTab = tabs[0];
                //         chrome.tabs.sendMessage(activeTab.id, { action: "fromPopup" }, (response) => {
                //             chrome.tabs.executeScript(activeTab.id, { file: 'content.js' }, function () {
                //                 if (chrome.runtime.lastError) {
                //                     console.error('Failed to execute content script:', chrome.runtime.lastError);
                //                     return;
                //                 }
                //                 console.log(activeTab);
                //                 // chrome.runtime.sendMessage({greeting: "fromPopup"});
                //             })
                //         })
                //     })

                // }
                // // ----------------------
                // collectLink();
                //-------------------------------------------------------------------------------------

                else {
                    console.log(modeActivation);
                    if (modeActivation.includes("activatechatmode")) {
                        modeActivation = modeActivation.slice(16)
                    }
                    if (modeActivation.length > 0) {
                        // sendMessageToChatGPT(modeActivationAcualData)
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            const tabId = tabs[0].id;
                            // console.log(tabId);
                            if (modeActivation.length > 0) {
                                const data = {
                                    message: "messageFromPopupchat",
                                    payload: results,
                                    tabId: tabId,
                                    prompt: modeActivation,
                                    url: tabs[0].url
                                };
                                chrome.runtime.sendMessage(data);
                                // console.log(data);

                            }

                        })
                    }
                    else {
                        console.log("ask something");
                    }
                }
            }
        }

    }, [results])


    useEffect(() => {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message) {
                // Handle the received message
                // console.log(message.prompt);
                const recieivedText = message.prompt
                // console.log(recieivedText);
                // console.log(typeof (recieivedText));
                setText(recieivedText);
            }
        });
    }, []);


    return (
        <div className="parentContainer">
            <div className="wraper">
                <div onClick={isRecording ? stopSpeechToText : startSpeechToText}>
                    {isRecording ? <SettingsVoiceIcon sx={{
                        fontSize: 30,
                        padding: '20px 40px 10px 40px',
                        color: '#04094f',
                        '&:hover': {
                            transition: '0.5s ease',
                            cursor: 'pointer'
                        },
                    }}

                    />
                        :
                        <KeyboardVoiceIcon sx={{
                            fontSize: 30,
                            padding: '20px 40px 10px 40px',
                            color: '#04094f',
                            '&:hover': {
                                transition: '0.5s ease',
                                cursor: 'pointer'
                            },
                        }} />
                    }
                </div>
                <div ><Switch
                    checked={detectMode}
                    onChange={detectMode}
                    inputProps={{ 'aria-label': 'controlled' }}
                    sx={{
                        fontSize: 30,
                        margin: '20px 40px 10px 40px',
                        color: '#03fcf4'
                    }}
                />
                </div>

            </div>
            <div className="chatSection" >
                {results.map((result) => (
                    <p style={{ color: "black", paddingLeft: "10px" }} key={result.timestamp}>{result.transcript} , </p>
                ))}
            </div>
            <div className="response" >
                {(text) ? <div className="chatresponse"> {text} </div>
                    : <div></div>
                }
            </div>

            <Wave fill='#f79902'
                paused={false}
                options={{
                    height: 30,
                    amplitude: 5,
                    speed: 2,
                    points: 4
                }}
                className='wave'
            />
            {text && <TextToSpeech text={text} />}
        </div>
    )
};

export default Popup;