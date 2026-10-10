import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, CheckCircle2, Upload, MapPin, RefreshCw, Phone, Sparkles, Play, Pause, RotateCcw } from 'lucide-react';

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
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [autoDetectedLoc, setAutoDetectedLoc] = useState('Fetching live GPS...');
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [sellerPhone, setSellerPhone] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previewAudioRef = useRef(null);
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

    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const handleSmartTextChange = (rawText) => {
    setTextNote(rawText);
    const lower = rawText.toLowerCase();

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

    const isFree = 
      lower.includes('free') || lower.includes('le jao') || lower.includes('muft') || 
      lower.includes('hatao') || lower.includes('fokat') || lower.includes('koi paisa nahi');

    if (isFree) {
      setPriceType('Free');
      setPrice('0');
      return;
    }

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
      } else if (lower.includes('sau') || lower.includes('hundred')) {
        calculatedPrice = 100;
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
        setAudioUrl(URL.createObjectURL(blob));
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

  const togglePreviewPlayback = () => {
    if (!audioUrl) return;
    if (isPlayingPreview) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    const audio = new Audio(audioUrl);
    previewAudioRef.current = audio;
    audio.play();
    setIsPlayingPreview(true);
    audio.onended = () => setIsPlayingPreview(false);
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
      audioUrl: audioUrl || null,
      phone: sellerPhone,
      sellerName: 'Verified Contributor',
      timeAgo: 'Just now'
    };

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
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-24">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Post C&D Waste Listing</h2>
            <p className="text-xs text-slate-500">Provide material details and media for verified pickup.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500" /> AI Auto-Parser
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Photo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 tracking-wide uppercase flex items-center gap-1">
              <span>1. Material Photo</span>
              <span className="text-red-500">*</span>
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
              <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Retake Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full h-44 border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all"
              >
                <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Tap to Camera or Upload Photo</span>
                <span className="text-slate-400 text-xs">Auto-compressed for instant AWS sync</span>
              </button>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Category & Price Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Category (Auto-Detected)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
              >
                <option value="Red Brick">Red Brick</option>
                <option value="Concrete Rubble">Concrete Rubble</option>
                <option value="Tiles & Ceramic">Tiles & Ceramic</option>
                <option value="Mixed Aggregate">Mixed Aggregate</option>
                <option value="Steel Rebar">Steel Rebar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Price Structure</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-3 text-sm focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
              >
                <option value="Free">Free Pickup</option>
                <option value="Paid">Paid / For Sale</option>
              </select>
            </div>
          </div>

          {priceType === 'Paid' && (
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-3 text-base focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Step 2: Voice or Text Note */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                2. Voice Note / Description Note
              </label>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setNoteMode('voice')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  noteMode === 'voice' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎙 Voice Note (AI Parser)
              </button>
              <button
                type="button"
                onClick={() => setNoteMode('text')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  noteMode === 'text' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⌨️ Type Description
              </button>
            </div>

            {noteMode === 'voice' ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-mono font-bold px-4 py-1.5 rounded-full border border-red-200 animate-pulse">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                      RECORDING: 00:0{recordingTime}s
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 bg-red-600 text-white rounded-full mx-auto flex items-center justify-center shadow-md active:scale-95 transition-transform"
                      >
                        <Square className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 block font-medium">Tap red square when finished speaking</span>
                  </div>
                ) : audioBlob ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Audio Recorded & Auto-Parsed Successfully</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl(null);
                          setTextNote('');
                        }}
                        className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Record Again
                      </button>
                    </div>

                    {/* Preview Player to listen to audio before uploading */}
                    <button
                      type="button"
                      onClick={togglePreviewPlayback}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlayingPreview ? 'Pause Audio Preview' : 'Listen Recorded Audio'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-16 h-16 bg-slate-900 text-amber-400 rounded-full mx-auto flex items-center justify-center shadow-md hover:bg-slate-800 active:scale-95 transition-transform"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <span className="font-bold text-slate-900 text-sm block">Tap & Speak in Any Language</span>
                    <span className="text-slate-500 text-xs block">AI automatically detects category, pricing & intent!</span>
                  </div>
                )}

                {textNote && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl text-left shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block mb-1">AI Extracted Transcript:</span>
                    <p className="text-xs text-slate-900 italic font-medium">"{textNote}"</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                value={textNote}
                onChange={(e) => handleSmartTextChange(e.target.value)}
                placeholder="Type description in any language e.g. '100 bricks 2 cement bags for 1000 rs'..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium p-3 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none text-sm placeholder-slate-400 transition-colors"
              />
            )}
          </div>

          {/* GPS Location Status Badge */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 truncate">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate font-medium">{autoDetectedLoc}</span>
            </div>
            <span className="text-emerald-700 font-mono font-bold shrink-0 ml-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">GPS ACTIVE</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Publishing to AWS Cloud...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Publish Listing Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}