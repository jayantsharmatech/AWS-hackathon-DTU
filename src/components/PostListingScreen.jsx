import React, { useState, useRef } from 'react';
import { Camera, Mic, Square, CheckCircle2, Upload, MapPin, RefreshCw } from 'lucide-react';

export default function PostListingScreen({ onPostCreated }) {
  const [image, setImage] = useState(null);
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
  const autoDetectedLoc = 'Construction Site, Sector 62';

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      const categories = ['Red Brick', 'Concrete Rubble', 'Tiles & Ceramic', 'Steel Rebar'];
      setCategory(categories[Math.floor(Math.random() * categories.length)]);
    }
  };

  const startRecording = async () => {
    try {
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
    } catch {
      alert('Microphone access denied or unavailable on this browser.');
    }
  };

  const stopRecording = () => {
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

    setIsSubmitting(true);

    setTimeout(() => {
      const newListing = {
        id: Date.now(),
        category,
        priceType,
        price: priceType === 'Paid' ? price : '0',
        imageUrl: imagePreview,
        location: autoDetectedLoc,
        distance: '0.1 km',
        description: textNote || 'Demolition waste ready for immediate pickup.',
        hasVoiceNote: !!audioBlob,
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
        phone: '9876543210',
        sellerName: 'My Site Listing',
        timeAgo: 'Just now'
      };

      setIsSubmitting(false);
      onPostCreated(newListing);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-black text-white tracking-wide">POST C&D WASTE</h2>
          <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/30">
            STEP-BY-STEP
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="absolute bottom-3 right-3 bg-slate-950/90 text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" /> RETAKE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full h-40 border-2 border-dashed border-amber-500/50 bg-slate-950 hover:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-colors touch-target"
              >
                <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="font-black text-white text-base">TAP TO CAMERA / UPLOAD</span>
                <span className="text-slate-400 text-xs">Auto-detects material type</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Category
              </label>
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Price Type
              </label>
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Price Amount (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-slate-950 border-2 border-slate-700 text-amber-400 font-bold rounded-xl p-3 text-lg focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 tracking-wider uppercase">
                2. ADD VOICE NOTE OR TEXT
              </label>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNoteMode('voice')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    noteMode === 'voice'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Voice Note
                </button>
                <button
                  type="button"
                  onClick={() => setNoteMode('text')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    noteMode === 'text'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Type Text
                </button>
              </div>
            </div>

            {noteMode === 'voice' ? (
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center space-y-3">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 font-mono font-bold px-4 py-2 rounded-full border border-red-500/40 animate-pulse">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      RECORDING: 00:0{recordingTime}s
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-20 h-20 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center shadow-2xl active:scale-95 transition-transform touch-target"
                      >
                        <Square className="w-8 h-8 fill-current" />
                      </button>
                    </div>
                  </div>
                ) : audioBlob ? (
                  <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>VOICE NOTE RECORDED</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAudioBlob(null)}
                      className="text-xs text-red-400 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-transform touch-target"
                    >
                      <Mic className="w-10 h-10" />
                    </button>
                    <span className="font-bold text-white text-sm block">
                      TAP & SPEAK IN HINDI / ENGLISH
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                placeholder="Type location note or waste details..."
                className="w-full bg-slate-950 border-2 border-slate-700 text-white font-medium p-3 rounded-xl focus:border-amber-500 focus:outline-none text-sm placeholder-slate-600"
              />
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{autoDetectedLoc}</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">GPS ACTIVE</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform touch-target disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>UPLOADING LISTING...</span>
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
