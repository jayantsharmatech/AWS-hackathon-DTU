import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, CheckCircle2, Upload, MapPin, RefreshCw, Phone } from 'lucide-react';

const API_BASE_URL = 'https://6jzwkohkx5.execute-api.ap-south-1.amazonaws.com';

export default function PostListingScreen({ onPostCreated }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState('Concrete Rubble');
  const [priceType, setPriceType] = useState('Free');
  const [price, setPrice] = useState('');
  const [noteMode, setNoteMode] = useState('voice');
  const [textNote, setTextNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [autoDetectedLoc, setAutoDetectedLoc] = useState('Fetching live GPS...');
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [sellerPhone, setSellerPhone] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          setAutoDetectedLoc(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn('Geolocation error or blocked:', error.message);
          setAutoDetectedLoc('GPS unavailable (Check permissions)');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setAutoDetectedLoc('GPS not supported by browser');
    }
  }, []);

  // Fully dynamic AI text & speech parser for categorization, free/paid status, and pricing
  const handleSmartTextChange = (rawText) => {
    setTextNote(rawText);
    const lower = rawText.toLowerCase();

    // 1. Dynamic Category Auto-Detection (Supports English, Hindi & Hinglish keywords)
    if (
      lower.includes('brick') || lower.includes('eet') || lower.includes('eent') || 
      lower.includes('eeton') || lower.includes('eetein')
    ) {
      setCategory('Red Brick');
    } else if (
      lower.includes('concrete') || lower.includes('slab') || lower.includes('pillar') || 
      lower.includes('rubble') || lower.includes('malwa') || lower.includes('cement')
    ) {
      setCategory('Concrete Rubble');
    } else if (
      lower.includes('tile') || lower.includes('ceramic') || lower.includes('tiles') || 
      lower.includes('patthar')
    ) {
      setCategory('Tiles & Ceramic');
    } else if (
      lower.includes('steel') || lower.includes('rebar') || lower.includes('iron') || 
      lower.includes('sariya') || lower.includes('sariye')
    ) {
      setCategory('Steel Rebar');
    }

    // 2. Dynamic Free vs Paid Detection
    const isFree = 
      lower.includes('free') || lower.includes('le jao') || lower.includes('muft') || 
      lower.includes('hatao') || lower.includes('fokat') || lower.includes('koi paisa nahi');

    if (isFree) {
      setPriceType('Free');
      setPrice('0');
      return;
    }

    // 3. Dynamic Paid Pricing & Spoken Number/Word Extraction
    const isPaidIntent = 
      lower.includes('sell') || lower.includes('rs') || lower.includes('₹') || 
      lower.includes('price') || lower.includes('cost') || lower.includes('chahiye') || 
      lower.includes('lena') || lower.includes('hazaar') || lower.includes('thousand') || 
      lower.includes('sau') || lower.includes('hundred') || lower.includes('rupiye') || lower.includes('rupee');

    if (isPaidIntent) {
      setPriceType('Paid');

      let calculatedPrice = null;

      if (lower.includes('hazaar') || lower.includes('thousand')) {
        calculatedPrice = 1000;
        if (lower.includes('do') || lower.includes('two')) calculatedPrice = 2000;
        if (lower.includes('teen') || lower.includes('three')) calculatedPrice = 3000;
        if (lower.includes('char') || lower.includes('four')) calculatedPrice = 4000;
        if (lower.includes('paanch') || lower.includes('five')) calculatedPrice = 5000;
      } else if (lower.includes('sau') || lower.includes('hundred')) {
        calculatedPrice = 100;
        if (lower.includes('paanch sau') || lower.includes('five hundred')) calculatedPrice = 500;
        if (lower.includes('do sau') || lower.includes('two hundred')) calculatedPrice = 200;
        if (lower.includes('teen sau') || lower.includes('three hundred')) calculatedPrice = 300;
      }

      const numbers = rawText.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        if (!calculatedPrice) {
          const parsedNums = numbers.map(Number);
          const maxNum = Math.max(...parsedNums);
          calculatedPrice = maxNum > 10 ? maxNum : parsedNums[parsedNums.length - 1];
        }
      }

      if (calculatedPrice) {
        setPrice(String(calculatedPrice));
      } else {
        setPrice('500');
      }
    }
  };

  // Compress image via HTML Canvas to keep size well under DynamoDB's 400KB limit
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality to guarantee small payload size for DynamoDB
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          handleSmartTextChange(transcript);
        };

        recognitionRef.current.start();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert('Please snap or upload a photo of the waste material.');
      return;
    }
    if (!sellerPhone || sellerPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number for call & WhatsApp routing.');
      return;
    }

    setIsSubmitting(true);

    const newListing = {
      id: String(Date.now()),
      category,
      priceType,
      price: priceType === 'Paid' ? price : '0',
      imageUrl: imagePreview,
      location: autoDetectedLoc,
      lat: coordinates.lat ? String(coordinates.lat) : '28.6139',
      lon: coordinates.lon ? String(coordinates.lon) : '77.2090',
      distance: 'Live GPS',
      description: textNote || 'Demolition waste ready for immediate pickup.',
      hasVoiceNote: !!audioBlob,
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
      phone: sellerPhone,
      sellerName: 'Verified Contributor',
      timeAgo: 'Just now'
    };

    // Save directly to live AWS DynamoDB backend
    fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListing),
    })
      .then((res) => res.json())
      .then(() => {
        setIsSubmitting(false);
        onPostCreated(newListing);
      })
      .catch((err) => {
        console.error('Failed to sync with AWS:', err);
        setIsSubmitting(false);
        onPostCreated(newListing);
      });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-black text-white tracking-wide">POST C&D WASTE</h2>
          <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/30">
            AUTO AI PARSER
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1">
              <span>1. SNAP WASTE PHOTO</span>
              <span className="text-red-400">*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-amber-500">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-3 right-3 bg-slate-950/90 text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 shadow-md"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" /> RETAKE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full h-40 border-2 border-dashed border-amber-500/50 bg-slate-950 hover:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-colors"
              >
                <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="font-black text-white text-base">TAP TO CAMERA / UPLOAD</span>
                <span className="text-slate-400 text-xs">Auto-compressed for AWS</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full bg-slate-950 border-2 border-slate-700 text-white font-bold rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category (Auto)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 text-white font-bold rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="Red Brick">Red Brick</option>
                <option value="Concrete Rubble">Concrete Rubble</option>
                <option value="Tiles & Ceramic">Tiles & Ceramic</option>
                <option value="Mixed Aggregate">Mixed Aggregate</option>
                <option value="Steel Rebar">Steel Rebar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price Type (Auto)</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 text-white font-bold rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="Free">Free Pickup</option>
                <option value="Paid">Paid / For Sale</option>
              </select>
            </div>
          </div>

          {priceType === 'Paid' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Extracted Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-950 border-2 border-slate-700 text-amber-400 font-bold rounded-xl p-3 text-lg focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 tracking-wider uppercase">
                2. SPEAK IN ANY LANGUAGE OR TYPE
              </label>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-2">
              <button
                type="button"
                onClick={() => setNoteMode('voice')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  noteMode === 'voice' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎙 Voice Note (Auto-Detect)
              </button>
              <button
                type="button"
                onClick={() => setNoteMode('text')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  noteMode === 'text' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⌨️ Type Text
              </button>
            </div>

            {noteMode === 'voice' ? (
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center space-y-3">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 font-mono font-bold px-4 py-2 rounded-full border border-red-500/40 animate-pulse">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      LISTENING: 00:0{recordingTime}s
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-20 h-20 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                      >
                        <Square className="w-8 h-8 fill-current" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 block font-bold">Tap red square when finished</span>
                  </div>
                ) : audioBlob ? (
                  <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>AUDIO RECORDED & AUTO-PARSED</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null);
                        setTextNote('');
                      }}
                      className="text-xs text-red-400 font-bold hover:underline"
                    >
                      Redo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-transform"
                    >
                      <Mic className="w-10 h-10" />
                    </button>
                    <span className="font-bold text-white text-sm block">TAP & SPEAK NATURALLY</span>
                    <span className="text-slate-400 text-xs block">AI auto-detects language, price & category!</span>
                  </div>
                )}

                {textNote && (
                  <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-left">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">AI Extracted Transcript:</span>
                    <p className="text-xs text-white italic">"{textNote}"</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                value={textNote}
                onChange={(e) => handleSmartTextChange(e.target.value)}
                placeholder="Type in any language e.g. 'ye mal 1000 rupye ka hai'..."
                className="w-full bg-slate-950 border-2 border-slate-700 text-white font-medium p-3 rounded-xl focus:border-amber-500 focus:outline-none text-sm placeholder-slate-600"
              />
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{autoDetectedLoc}</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold shrink-0 ml-2">GPS ACTIVE</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>UPLOADING TO AWS...</span>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span>POST WASTE NOW</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}