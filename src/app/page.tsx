<<<<<<< HEAD
"use client";

=======
>>>>>>> a02729169d6f11e8bf08ba98a08df1b564e8ce12
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// SVG assets for icons and logo
const ParrotLogo = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-6v-7a6 6 0 016-6zM8 8a6 6 0 016 6v7h-6v-7a6 6 0 016-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 00-8 8v7h16v-7a8 8 0 00-8-8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M16 12h.01M12 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-5 0h10m-5-13a6 6 0 016 6v2a6 6 0 01-6 6v0m0 0a6 6 0 01-6-6v-2a6 6 0 016-6z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const LightBulbIcon = () => (
  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674c.731 0 1.341-.571 1.32-1.295l-.645-3.666a.879.879 0 00-.853-.889H9.406c-.452 0-.9.2-1.166.529l-.645 3.666c-.021.724.588 1.295 1.32 1.295zm3.178-10.957a3.568 3.568 0 00-3.178 0 3.655 3.655 0 00-3.567 3.568H3.5l1.637 1.836a3.655 3.655 0 003.567 3.568h3.178a3.655 3.655 0 003.567-3.568L20.5 10.5h-2.529a3.655 3.655 0 00-3.568-3.568zM12 6a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

const AudioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L5.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.414l2.879-2.879A1 1 0 019.383 3.076zM12 6a1 1 0 010 2 2.99 2.99 0 000 6 1 1 0 010 2 4.99 4.99 0 010-10z" clipRule="evenodd" />
  </svg>
);

// Utility function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Utility function to convert PCM data to WAV Blob
const pcmToWav = (pcm, sampleRate) => {
  const pcm16 = new Int16Array(pcm.buffer);
  const dataLength = pcm16.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  let offset = 0;

  const writeString = (str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset++, str.charCodeAt(i));
    }
  };

  const writeUint16 = (val) => {
    view.setUint16(offset, val, true);
    offset += 2;
  };

  const writeUint32 = (val) => {
    view.setUint32(offset, val, true);
    offset += 4;
  };

  // RIFF chunk
  writeString('RIFF');
  writeUint32(36 + dataLength);
  writeString('WAVE');

  // fmt chunk
  writeString('fmt ');
  writeUint32(16); // Chunk size
  writeUint16(1); // Audio format (1 = PCM)
  writeUint16(1); // Number of channels
  writeUint32(sampleRate); // Sample rate
  writeUint32(sampleRate * 2); // Byte rate
  writeUint16(2); // Block align
  writeUint16(16); // Bits per sample

  // data chunk
  writeString('data');
  writeUint32(dataLength);

  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(offset, pcm16[i], true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

// Main App component
export default function App() {
  const [messages, setMessages] = useState([
    { text: "আমি বাংলাতে বলতে পারি। আমি Mojo AI, আপনার ডিজিটাল সহকারী। আমি আপনাকে কিভাবে সাহায্য করতে পারি?", sender: 'bot' },
    { text: "হ্যালো, কেমন আছেন?", sender: 'user' },
    { text: "বাংলাদেশে কৃষি নিয়ে কিছু তথ্য দাও।", sender: 'user' },
    { text: "অবশ্যই! বাংলাদেশের কৃষি অর্থনীতির মূল ভিত্তি হলো ধান, পাট, গম এবং চা এখানকার প্রধান ফসল। আপনি কোন নির্দিষ্ট ফসল সম্পর্কে জানতে চান?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to the Gemini model
      const prompt = `Translate the following text into a detailed and helpful response in Bangla, suitable for a chatbot:\n\nUser: ${input}\n\nChatbot:`;
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
      const newBotMessage = { text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error fetching from API:', error);
      const errorMessage = { text: "দুঃখিত, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।", sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProjectIdea = async () => {
    setIsLoading(true);
    const userPrompt = "বাংলায় একটি নতুন এবং সৃজনশীল প্রজেক্ট আইডিয়া তৈরি করুন। এই আইডিয়াটি আধুনিক প্রযুক্তি যেমন AI, ব্লকচেইন, অথবা IoT ব্যবহার করবে। আইডিয়াটি এমনভাবে লিখুন যাতে এটি একটি নতুন উদ্যোগ বা স্টার্টআপের জন্য উপযুক্ত হয়।";
    const newUserMessage = { text: "একটি নতুন প্রজেক্ট আইডিয়া তৈরি করো।", sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    try {
      const chatHistory = [{ role: "user", parts: [{ text: userPrompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, এই মুহূর্তে প্রজেক্ট আইডিয়া তৈরি করা সম্ভব হচ্ছে না।";
      const newBotMessage = { text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error fetching from API:', error);
      const errorMessage = { text: "দুঃখিত, প্রজেক্ট আইডিয়া জেনারেট করতে সমস্যা হয়েছে।", sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (text, messageId) => {
    if (audioRef.current && playingAudio === messageId) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingAudio(null);
      return;
    }

    setPlayingAudio(messageId);
    
    const prompt = `Say in a gentle voice: ${text}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Kore" }
                }
            }
        },
        model: "gemini-2.5-flash-preview-tts"
    };

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000;
        const pcmData = base64ToArrayBuffer(audioData);
        const pcm16 = new Int16Array(pcmData);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        
        audioRef.current.onended = () => {
          setPlayingAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.error('Invalid audio data received from API');
        setPlayingAudio(null);
      }
    } catch (error) {
      console.error('Error with TTS API:', error);
      setPlayingAudio(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 antialiased font-sans">
      <Head>
        <title>MoJo AI - আপনার স্মার্ট চ্যাট চ্যাটবট</title>
      </Head>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-64 bg-gray-800 p-6 flex flex-col shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-8">
          <ParrotLogo />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            MoJo AI
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            চ্যাট হিস্ট্রি
          </h2>
          <nav className="flex flex-col space-y-2 text-sm">
            <a href="#" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <ChatIcon />
              <span>কৃষি তথ্য</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <ChatIcon />
              <span>আইন পরামর্শ</span>
            </a>
            <button 
              onClick={handleGenerateProjectIdea}
              className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700 text-teal-400 hover:bg-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              <ChatIcon />
              <span>নতুন প্রজেক্ট আইডিয়া ✨</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold">
              N
            </span>
            <span className="text-sm">নতুন চ্যাট শুরু</span>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-gray-800 shadow-lg">
          <div className="flex items-center space-x-2">
            <ParrotLogo />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              MoJo AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
              <LightBulbIcon />
            </button>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-teal-400 flex items-center justify-center text-sm font-bold text-black">
                US
              </div>
            </div>
          </div>
        </header>

        {/* Chat History */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <ParrotLogo />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-xl shadow-lg break-words whitespace-pre-wrap ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none'
                  }`}
                >
                  {message.text}
                  {message.sender === 'bot' && (
                    <button
                      onClick={() => handlePlayAudio(message.text, index)}
                      className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 focus:outline-none"
                    >
                      {playingAudio === index ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <AudioIcon />
                      )}
                    </button>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-400 text-black flex items-center justify-center font-bold">
                    US
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <ParrotLogo />
                </div>
                <div className="max-w-2xl p-4 rounded-xl shadow-lg bg-gray-800 text-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* Input area */}
        <footer className="p-4 bg-gray-800 shadow-inner flex items-center space-x-4">
          <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
            <MicrophoneIcon />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="এখানে আপনার বার্তা লিখুন..."
              className="w-full pl-5 pr-12 py-3 rounded-full bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200"
              disabled={isLoading}
            >
              <SendIcon />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}