import React, { useState } from 'react';

const VoiceInputMic = ({ onTextRecognized }) => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate stop recording and API call
      setTimeout(() => {
        onTextRecognized("म्यूचुअल फंड में निवेश कैसे करें?");
      }, 1000);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <button 
      onClick={toggleRecording}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        isRecording 
          ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
      }`}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></span>
      )}
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default VoiceInputMic;
