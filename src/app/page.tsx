"use client"; // এটি একটি ক্লায়েন্ট কম্পোনেন্ট, কারণ এটি ব্রাউজারের ইন্টারেক্টিভ ফিচার ব্যবহার করে।

import React, { useState, useEffect, useRef } from 'react'; // React এবং React Hooks ব্যবহার করার জন্য
import Image from 'next/image'; // ছবি ব্যবহারের জন্য
import { Mic, Send, Sun, Moon, Volume2, VolumeX, Loader2, User, Bot, CircleDollarSign, X } from 'lucide-react'; // আইকন ব্যবহারের জন্য

// গ্লোবাল টাইপ ডেফিনিশন Web Speech API এর জন্য
// এটি TypeScript কে 'webkitSpeechRecognition' এবং 'SpeechRecognitionEvent' চিনতে সাহায্য করবে।
// সরাসরি Window ইন্টারফেসের মধ্যে ঘোষণা করা হয়েছে।
type SpeechRecognition = typeof window.webkitSpeechRecognition extends { prototype: infer T } ? T : any;

declare global {
  interface Window {
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
    SpeechRecognitionEvent: {
      new (type: string, eventInitDict?: { [key: string]: any }): SpeechRecognitionResult;
      prototype: SpeechRecognitionResult;
    };
  }
}

// MoJoX AI অ্যাপ্লিকেশনের মূল কম্পোনেন্ট
export default function HomePage() {
  // চ্যাট মেসেজগুলো সংরক্ষণের জন্য স্টেট। প্রতিটি মেসেজের একটি রোল (user/bot) এবং কন্টেন্ট থাকে।
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  // ব্যবহারকারীর ইনপুট টেক্সট সংরক্ষণের জন্য স্টেট।
  const [input, setInput] = useState<string>('');
  // ভয়েস রিকগনিশন চলছে কিনা তা ট্র্যাক করার জন্য স্টেট।
  const [isListening, setIsListening] = useState<boolean>(false);
  // ভয়েস আউটপুট চলছে কিনা তা ট্র্যাক করার জন্য স্টেট।
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // AI রেসপন্স লোড হচ্ছে কিনা তা ট্র্যাক করার জন্য স্টেট।
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ডার্ক মোড সক্রিয় কিনা তা ট্র্যাক করার জন্য স্টেট।
  const [darkMode, setDarkMode] = useState<boolean>(false);
  // প্রো ইউজার কিনা তা ট্র্যাক করার জন্য স্টেট (পরবর্তীতে Firebase Auth থেকে আসবে)।
  const [isProUser, setIsProUser] = useState<boolean>(false);
  // দৈনিক ফ্রি প্রো অ্যাক্সেসের অবশিষ্ট সময় (মিনিটে)।
  const [proAccessTimeLeft, setProAccessTimeLeft] = useState<number>(2); // 2 মিনিট ফ্রি অ্যাক্সেস
  // পেমেন্ট মডাল খোলা আছে কিনা তা ট্র্যাক করার জন্য স্টেট।
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  // পেমেন্ট স্ট্যাটাস মেসেজ
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // চ্যাট স্ক্রল করার জন্য রেফারেন্স।
  const messagesEndRef = useRef<HTMLDivElement>(null); // HTMLDivElement টাইপ করা হয়েছে
  // স্পিচ রিকগনিশন অবজেক্টের জন্য রেফারেন্স।
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // স্পিচ সিন্থেসিস অবজেক্টের জন্য রেফারেন্স।
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // কম্পোনেন্ট মাউন্ট হওয়ার পর ডার্ক মোড সেটিংস লোড করা এবং স্পিচ API ইনিশিয়ালাইজ করা।
  useEffect(() => {
    // লোকালস্টোরেজ থেকে ডার্ক মোড সেটিংস লোড করুন।
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
      if (JSON.parse(savedDarkMode)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // স্পিচ রিকগনিশন API ইনিশিয়ালাইজ করুন।
    if ('webkitSpeechRecognition' in window) {
      // 'window.webkitSpeechRecognition' কে সরাসরি ব্যবহার করা হয়েছে গ্লোবাল টাইপ ডেফিনিশনের কারণে।
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false; // একটানা শোনা বন্ধ করুন
      recognition.interimResults = false; // মধ্যবর্তী ফলাফল দেখাবেন না
      recognition.lang = 'bn-BD'; // বাংলা ভাষা সেট করুন (বা 'en-US' ইংরেজির জন্য)

      recognition.onstart = () => {
        setIsListening(true);
        console.log('ভয়েস ইনপুট শুরু হয়েছে...');
      };

      // 'event: SpeechRecognitionEvent' ব্যবহার করা হয়েছে গ্লোবাল টাইপ ডেফিনিশনের কারণে।
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript); // ইনপুট ফিল্ডে ট্রান্সক্রিপ্ট সেট করুন
        setIsListening(false);
        console.log('ভয়েস ইনপুট শেষ হয়েছে:', transcript);
        // ইনপুট পাওয়ার পর মেসেজ পাঠান
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('ভয়েস রিকগনিশন এরর:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('ভয়েস রিকগনিশন শেষ হয়েছে।');
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('আপনার ব্রাউজার Web Speech Recognition API সমর্থন করে না।');
    }

    // স্পিচ সিন্থেসিস API ইনিশিয়ালাইজ করুন।
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn('আপনার ব্রাউজার Web Speech Synthesis API সমর্থন করে না।');
    }

    // দৈনিক প্রো অ্যাক্সেস টাইমার শুরু করুন (শুধুমাত্র গেস্ট ব্যবহারকারীদের জন্য)
    if (!isProUser) {
      const timer = setInterval(() => {
        setProAccessTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // এখানে প্রো অ্যাক্সেস শেষ হওয়ার লজিক যোগ করুন
            return 0;
          }
          return prevTime - 1;
        });
      }, 60 * 1000); // প্রতি মিনিটে আপডেট করুন

      return () => clearInterval(timer); // কম্পোনেন্ট আনমাউন্ট হলে টাইমার পরিষ্কার করুন
    }

  }, [isProUser]); // isProUser পরিবর্তন হলে useEffect আবার চলবে

  // মেসেজ যোগ হলে স্বয়ংক্রিয়ভাবে নিচে স্ক্রল করার জন্য।
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ডার্ক মোড টoggle করার ফাংশন।
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  // ইনপুট ফিল্ডের মান পরিবর্তন হলে স্টেট আপডেট করার ফাংশন।
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // মেসেজ পাঠানোর ফাংশন।
  const handleSendMessage = async (messageContent: string = input) => {
    if (!messageContent.trim()) return; // খালি মেসেজ পাঠাবেন না

    const newUserMessage = { role: 'user' as const, content: messageContent };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput(''); // ইনপুট ফিল্ড খালি করুন
    setIsLoading(true); // লোডিং স্টেট সেট করুন

    try {
      // জেমিনি API কল করার জন্য প্লেসহোল্ডার।
      // এখানে আপনার জেমিনি API কী ব্যবহার করুন।
      // Canvas এনভায়রনমেন্টে __app_id, __firebase_config, __initial_auth_token গ্লোবাল ভেরিয়েবল হিসেবে উপলব্ধ।
      // এখানে API কী সরাসরি কোডে না লিখে, একটি এনভায়রনমেন্ট ভেরিয়েবল হিসেবে ব্যবহার করা উচিত।
      // তবে, Canvas-এর জন্য, API কী সাধারণত রানটাইমে ইনজেক্ট করা হয় যদি এটি খালি স্ট্রিং হয়।
      const apiKey = ""; // Canvas স্বয়ংক্রিয়ভাবে API কী সরবরাহ করবে

      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model', // Gemini API 'model' রোল ব্যবহার করে
        parts: [{ text: msg.content }]
      }));
      chatHistory.push({ role: "user", parts: [{ text: messageContent }] }); // বর্তমান মেসেজ যোগ করুন

      const payload = { contents: chatHistory };
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
      let botResponse = "দুঃখিত, আমি আপনার অনুরোধটি প্রক্রিয়া করতে পারিনি।";

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        botResponse = result.candidates[0].content.parts[0].text;
      }

      const newBotMessage = { role: 'bot' as const, content: botResponse };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);

      // ভয়েস আউটপুট (TTS)
      speakResponse(botResponse);

    } catch (error) {
      console.error('মেসেজ পাঠাতে এরর হয়েছে:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'bot', content: "দুঃখিত, একটি এরর হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }]);
    } finally {
      setIsLoading(false); // লোডিং স্টেট বন্ধ করুন
    }
  };

  // ভয়েস ইনপুট শুরু করার ফাংশন।
  const startSpeechRecognition = () => {
    if (recognitionRef.current && !isListening) {
      // 'recognitionRef.current.lang' এরর এড়াতে এটি 'any' টাইপ করা হয়েছিল, এখন গ্লোবাল টাইপ ডেফিনিশন ব্যবহার করা হয়েছে
      recognitionRef.current.lang = darkMode ? 'en-US' : 'bn-BD'; // ডার্ক মোড অনুযায়ী ভাষা সেট করুন
      recognitionRef.current.start();
    }
  };

  // ভয়েস আউটপুট (TTS) ফাংশন।
  const speakResponse = async (text: string) => {
    if (synthRef.current && !isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      // এখানে ভয়েস কাস্টমাইজেশন যোগ করতে পারেন (যেমন ভয়েস, পিচ, রেট)
      // utterance.voice = synthRef.current.getVoices().find(voice => voice.lang === 'bn-BD'); // বাংলা ভয়েস খোঁজা
      utterance.rate = 1.0; // স্পিচ রেট
      utterance.pitch = 1.0; // পিচ

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('ভয়েস আউটপুট এরর:', event.error);
        setIsSpeaking(false);
      };

      // Gemini TTS API ব্যবহার করে অডিও জেনারেট করুন
      const payload = {
        contents: [{
          parts: [{ text: text }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: darkMode ? "Puck" : "Kore" } // ডার্ক মোড অনুযায়ী ভয়েস
            }
          }
        },
        model: "gemini-2.5-flash-preview-tts"
      };
      const apiKey = ""; // Canvas স্বয়ংক্রিয়ভাবে API কী সরবরাহ করবে
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
          const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000; // ডিফল্ট 16kHz
          const pcmData = base64ToArrayBuffer(audioData);
          const pcm16 = new Int16Array(pcmData);
          const wavBlob = pcmToWav(pcm16, sampleRate);
          const audioUrl = URL.createObjectURL(wavBlob);

          const audio = new Audio(audioUrl);
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = (e) => {
            console.error("অডিও প্লেব্যাক এরর:", e);
            setIsSpeaking(false);
          };
          audio.play();
        } else {
          console.error("অডিও ডেটা বা মাইমটাইপ অনুপস্থিত বা ভুল।");
          // যদি Gemini TTS কাজ না করে, ব্রাউজারের ডিফল্ট TTS ব্যবহার করুন
          synthRef.current.speak(utterance);
        }
      } catch (error) {
        console.error("Gemini TTS API কল করতে এরর হয়েছে:", error);
        // এরর হলে ব্রাউজারের ডিফল্ট TTS ব্যবহার করুন
        synthRef.current.speak(utterance);
      }
    } else if (synthRef.current && isSpeaking) {
      // যদি কথা বলা চলছে, তাহলে থামান
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Base64 থেকে ArrayBuffer-এ রূপান্তর করার জন্য সহায়ক ফাংশন
  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // PCM অডিও ডেটা থেকে WAV Blob তৈরি করার জন্য সহায়ক ফাংশন
  const pcmToWav = (pcmData: Int16Array, sampleRate: number) => {
    const numChannels = 1; // মনো অডিও
    const bytesPerSample = 2; // Int16Array (16-bit PCM)

    const wavBuffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
    const view = new DataView(wavBuffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
    view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length * bytesPerSample, true); // Subchunk2Size

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(44 + i * bytesPerSample, pcmData[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // DataView-এ স্ট্রিং লেখার জন্য সহায়ক ফাংশন
  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // Google লগইন ফাংশন (প্লেসহোল্ডার)
  const handleGoogleLogin = () => {
    alert("Google লগইন ফিচারটি এখনো ডেভেলপমেন্টাধীন।");
    // পরবর্তীতে Firebase Auth ব্যবহার করে Google লগইন ইন্টিগ্রেট করা হবে।
  };

  // পেমেন্ট মডাল খোলার ফাংশন।
  const openPaymentModal = () => {
    setShowPaymentModal(true);
    setPaymentStatus(null); // নতুন করে মডাল খুললে স্ট্যাটাস রিসেট করুন
  };

  // পেমেন্ট মডাল বন্ধ করার ফাংশন।
  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  // মক পেমেন্ট লজিক (Bkash/Nagad এর জন্য)
  const handleMockPayment = (method: string) => {
    setPaymentStatus(`${method} পেমেন্ট প্রক্রিয়া শুরু হচ্ছে...`);
    setTimeout(() => {
      setPaymentStatus(`${method} পেমেন্ট সফল হয়েছে!`);
      // এখানে পেমেন্ট সফল হওয়ার পর প্রো ফিচার অ্যাক্টিভ করার লজিক যোগ করুন
      setIsProUser(true);
      setTimeout(() => closePaymentModal(), 2000); // 2 সেকেন্ড পর মডাল বন্ধ করুন
    }, 2000);
  };

  // Stripe-এর মতো UI পেমেন্ট লজিক (Payeer, Debit Card, Google Pay এর জন্য)
  const handleStripeLikePayment = (method: string) => {
    setPaymentStatus(`${method} পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...`);
    setTimeout(() => {
      setPaymentStatus(`${method} পেমেন্ট প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে!`);
      // এখানে পেমেন্ট সফল হওয়ার পর প্রো ফিচার অ্যাক্টিভ করার লজিক যোগ করুন
      setIsProUser(true);
      setTimeout(() => closePaymentModal(), 2000); // 2 সেকেন্ড পর মডাল বন্ধ করুন
    }, 3000);
  };


  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* হেডার সেকশন */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md rounded-b-xl">
        <div className="flex items-center space-x-3">
          {/* প্যারট লোগো */}
          <Image src="/parrot_logo.svg" alt="MoJoX AI Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">MoJoX AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* ডার্ক/লাইট মোড সুইচ */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
          {/* প্রো/গেস্ট ইউজার গ্রিটিং */}
          <div className="text-sm font-medium">
            {isProUser ? (
              <span className="text-green-600 dark:text-green-400">হ্যালো, [ইউজারনেম] (প্রো)</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">হ্যালো, গেস্ট</span>
            )}
          </div>
          {/* Google লগইন বাটন */}
          {!isProUser && (
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200"
            >
              Google লগইন
            </button>
          )}
          {/* দৈনিক ফ্রি প্রো অ্যাক্সেস টাইমার */}
          {!isProUser && proAccessTimeLeft > 0 && (
            <div className="text-sm text-blue-500 dark:text-blue-300">
              ফ্রি প্রো অ্যাক্সেস: {proAccessTimeLeft} মিনিট
            </div>
          )}
          {/* পেমেন্ট বাটন */}
          {!isProUser && (
            <button
              onClick={openPaymentModal}
              className="px-4 py-2 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <CircleDollarSign className="w-5 h-5" />
              <span>প্রো আপগ্রেড</span>
            </button>
          )}
        </div>
      </header>

      {/* চ্যাট এরিয়া */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <p className="text-lg">MoJoX AI-তে স্বাগতম! 👋</p>
              <p className="text-sm">আপনার প্রশ্ন টাইপ করুন অথবা মাইক্রোফোন আইকনে ক্লিক করে ভয়েস ইনপুট দিন।</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="flex-shrink-0">
                  <Bot className="w-8 h-8 text-blue-500 dark:text-blue-300" />
                </div>
              )}
              <div
                className={`max-w-xl p-3 rounded-lg shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0">
                  <User className="w-8 h-8 text-green-500 dark:text-green-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-center space-x-3">
              <Bot className="w-8 h-8 text-blue-500 dark:text-blue-300 animate-bounce" />
              <div className="max-w-xl p-3 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="ml-2">টাইপ করছে...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* স্ক্রল করার জন্য রেফারেন্স */}
        </div>
      </main>

      {/* ইনপুট এরিয়া */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-t-xl flex items-center space-x-3">
        {/* ভয়েস ইনপুট বাটন */}
        <button
          onClick={startSpeechRecognition}
          className={`p-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} text-white shadow-md hover:bg-blue-600 transition-colors duration-200`}
          aria-label="Start voice input"
          disabled={isLoading || isSpeaking}
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* ভয়েস আউটপুট টগল বাটন */}
        <button
          onClick={() => speakResponse("")} // খালি স্ট্রিং পাস করে TTS টগল করবে
          className={`p-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'} text-white shadow-md hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors duration-200`}
          aria-label="Toggle voice output"
          disabled={isLoading}
        >
          {isSpeaking ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* টেক্সট ইনপুট ফিল্ড */}
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // নতুন লাইন তৈরি করা বন্ধ করুন
              handleSendMessage();
            }
          }}
          rows={1}
          placeholder="আপনার মেসেজ লিখুন..."
          className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden transition-all duration-200"
          disabled={isLoading || isListening}
        />

        {/* সেন্ড বাটন */}
        <button
          onClick={() => handleSendMessage()}
          className="p-3 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors duration-200"
          aria-label="Send message"
          disabled={isLoading || isListening || !input.trim()}
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      {/* পেমেন্ট মডাল */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={closePaymentModal}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">প্রো আপগ্রেড করুন</h2>

            {paymentStatus && (
              <div className={`p-3 mb-4 rounded-md text-center ${paymentStatus.includes('সফল') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>
                {paymentStatus}
              </div>
            )}

            <div className="space-y-4">
              {/* Bkash পেমেন্ট */}
              <button
                onClick={() => handleMockPayment('Bkash')}
                className="w-full flex items-center justify-center p-3 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-200 font-semibold"
              >
                <Image src="https://placehold.co/30x30/ffffff/000000?text=Bk" alt="Bkash" width={30} height={30} className="mr-3" />
                Bkash দিয়ে পেমেন্ট করুন
              </button>
              {/* Nagad পেমেন্ট */}
              <button
                onClick={() => handleMockPayment('Nagad')}
                className="w-full flex items-center justify-center p-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200 font-semibold"
              >
                <Image src="https://placehold.co/30x30/ffffff/000000?text=Ng" alt="Nagad" width={30} height={30} className="mr-3" />
                Nagad দিয়ে পেমেন্ট করুন
              </button>
              {/* Payeer পেমেন্ট (Stripe-like UI) */}
              <button
                onClick={() => handleStripeLikePayment('Payeer')}
                className="w-full flex items-center justify-center p-3 bg-yellow-500 text-gray-900 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200 font-semibold"
              >
                <Image src="https://placehold.co/30x30/000000/ffffff?text=Py" alt="Payeer" width={30} height={30} className="mr-3" />
                Payeer দিয়ে পেমেন্ট করুন
              </button>
              {/* Debit Card পেমেন্ট (Stripe-like UI) */}
              <button
                onClick={() => handleStripeLikePayment('ডেবিট কার্ড')}
                className="w-full flex items-center justify-center p-3 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200 font-semibold"
              >
                <Image src="https://placehold.co/30x30/ffffff/000000?text=DC" alt="Debit Card" width={30} height={30} className="mr-3" />
                ডেবিট কার্ড দিয়ে পেমেন্ট করুন
              </button>
              {/* Google Pay পেমেন্ট (Stripe-like UI) */}
              <button
                onClick={() => handleStripeLikePayment('Google Pay')}
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                <Image src="https://placehold.co/30x30/ffffff/000000?text=GP" alt="Google Pay" width={30} height={30} className="mr-3" />
                Google Pay দিয়ে পেমেন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
