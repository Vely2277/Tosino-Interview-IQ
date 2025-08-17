"use client";





import { useState, useEffect, useRef } from "react";
// Audio recording helpers
// Helper to get a supported audio mime type for MediaRecorder
function getSupportedMimeType() {
  const possibleTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
  ];
  for (const type of possibleTypes) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

function recordAudioStream(stream: MediaStream, onStop: (audioBuffer: ArrayBuffer) => void) {
  const mimeType = getSupportedMimeType();
  if (!mimeType) {
    alert('Your browser does not support audio recording.');
    return null;
  }
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  let chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: mimeType });
    const arrayBuffer = await blob.arrayBuffer();
    onStop(arrayBuffer);
  };
  mediaRecorder.onerror = (e) => {
    console.error('[VOICE] mediaRecorder.onerror:', e);
  };
  mediaRecorder.start();
  return mediaRecorder;
}
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useInterview } from "@/contexts/interview-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, ArrowLeft, Volume2, Menu, X, Settings } from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import { interviewAPI, voiceAPI, getBackendUrl } from "@/lib/api";
import Image from "next/image";



export default function VoiceInterviewPage() {
  // Cleanup effect: stop recorder and mic on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        try {
          mediaRecorder.stop();
        } catch {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      setIsListening(false);
      setRecording(false);
      setMicDisabled(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { interviewData } = useInterview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micDisabled, setMicDisabled] = useState(false);
  // Removed aiResponse state, not needed for voice note chat
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [endDisabled, setEndDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [chatHistory, setChatHistory] = useState<
    {
      from: "user" | "ai";
      text: string;
      audioBase64?: string;
      grade?: number | null;
      reasoning?: string | null;
      file_present?: boolean;
    }[]
  >([]);
  // Removed transcript state, not needed for voice note chat
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  // Remove all WebRTC state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentlyPlayingIdx, setCurrentlyPlayingIdx] = useState<number | null>(null);
  // Removed lastAIAudio state, not needed for voice note chat
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  // Initialize the interview session: fetch start message audio from backend (using interviewAPI.start)
  const initializeInterview = async () => {
  // [INIT] Fetching initial AI audio message from backend
    setIsLoading(true);
    try {
      const data = await interviewAPI.start(
        interviewData.jobTitle || '',
        interviewData.company || '',
        'voice'
      );
      if (!data.sessionId) {
        throw new Error('No sessionId in initial AI response');
      }
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      if (data.initialMessage) {
        setChatHistory((prev) => [
          ...prev,
          {
            from: "ai" as const,
            text: data.initialMessage,
            audioBase64: data.audioBase64,
            file_present: data.file_present,
          },
        ]);
        speakResponse(data.audioBase64, data.initialMessage, undefined, data.file_present);
      }
  // [INIT] Initial AI audio message loaded
    } catch (error) {
      console.error("[INIT] Error fetching initial AI audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Respond to the interview: send user audio to backend (using interviewAPI.respond)
  const handleRespond = async (userResponse: string, userDataUrl?: string) => {
    setIsLoading(true);
    try {
      const sid = sessionIdRef.current || sessionId;
      if (!sid) {
        throw new Error("No sessionId available for response!");
      }
      // userResponse is the user's voice note base64 (WAV)
      const data = await interviewAPI.respond(sid, userResponse, 'voice');
      setChatHistory((prev) => [
        ...prev,
        {
          from: "user" as const,
          text: '',
          audioBase64: userDataUrl || '', // Save full Data URL for playback
          grade: data.grade ?? null,
          reasoning: data.reasoning ?? null,
        },
        ...(data.aiResponse
          ? [{
              from: "ai" as const,
              text: data.aiResponse,
              audioBase64: data.audioBase64,
              file_present: data.file_present,
            }]
          : []),
      ]);
      if (data.sessionId) {
        setSessionId(data.sessionId);
        sessionIdRef.current = data.sessionId;
      }
    } catch (error) {
      console.error("[RESPOND] Error in handleRespond:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle microphone toggle (start/stop listening)
  // Handle microphone toggle (start/stop listening) with permission request





// Robust audio recording and streaming logic with improved permission and state sync
const toggleListening = async () => {
  if (recording) {
    setIsListening(false);
    setMicDisabled(true);
    try {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
      // Do not stop audioStream here; keep it for reuse
    } catch (e) {
      console.error('[VOICE] Error when stopping mediaRecorder or cleaning up:', e);
    }
    setMicDisabled(false);
    setRecording(false);
    return;
  }
  setMicDisabled(true);
  try {
    let stream = audioStreamRef.current;
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setAudioStream(stream);
    }
    setIsListening(true);
    setRecording(true);
    setMicDisabled(false);
    const rec = recordAudioStream(stream, (audioBuffer) => {
      setIsListening(false);
      setRecording(false);
      setMicDisabled(true);
      const mimeType = getSupportedMimeType();
      const blob = new Blob([audioBuffer], { type: mimeType });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result;
        let dataUrl = '';
        let base64 = '';
        if (typeof result === 'string') {
          dataUrl = result;
          base64 = result.split(',')[1];
        }
        if (!base64) {
          setMicDisabled(false);
          return;
        }
        try {
          await handleRespond(base64, dataUrl);
        } catch (err: any) {}
        setMicDisabled(false);
      };
      reader.readAsDataURL(blob);
    });
    if (!rec) {
      setIsListening(false);
      setMicDisabled(false);
      setRecording(false);
      return;
    }
    setMediaRecorder(rec);
  } catch (err: any) {
    let message = "Microphone access is required. Please allow microphone permission in your browser settings.";
    if (err && err.name === 'NotAllowedError') {
      message = "Microphone access denied. Please enable it in your browser settings.";
    } else if (err && err.name === 'NotFoundError') {
      message = "No microphone found. Please connect a microphone and try again.";
    }
    alert(message);
    setIsListening(false);
    setMicDisabled(false);
    setRecording(false);
  }
};
  // Auto-play the latest AI response after chatHistory updates
  useEffect(() => {
    if (chatHistory.length === 0) return;
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.from === 'ai') {
      speakResponse(lastMsg.audioBase64, lastMsg.text, chatHistory.length - 1, lastMsg.file_present);
    }
  }, [chatHistory]);

  // End the interview session
  const handleEndInterview = async () => {
    if (!sessionId || endDisabled) return;
    setEndDisabled(true);
    setIsLoading(true);
    try {
      const data = await interviewAPI.end(sessionId);
      setSummary(data.summary);
      // Cleanup audio
      if (mediaRecorder) {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
    } catch (error) {
      setEndDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };


  // Play WAV audio from base64
  // Play WAV audio from base64, fallback to browser TTS if error or missing
  // Play WAV audio from base64, fallback to browser TTS if error or missing
  const speakResponse = async (
    audioBase64?: string,
    text?: string,
    idx?: number,
    file_present?: boolean
  ) => {
    // Stop any ongoing audio or TTS
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setCurrentlyPlayingIdx(idx ?? null);

    // Only use TTS if file_present is strictly false
    if (file_present === false) {
      if (text && "speechSynthesis" in window) {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.onend = () => setCurrentlyPlayingIdx(null);
        window.speechSynthesis.speak(utterance);
      } 
      return;
    }

    // Only play audio if file_present is strictly true
    if (file_present === true) {
      try {
        let audioUrl = '';
        if (audioBase64 && audioBase64.startsWith('data:audio/')) {
          audioUrl = audioBase64;
        } else if (audioBase64) {
          audioUrl = `data:audio/wav;base64,${audioBase64}`;
        } else {
          setCurrentlyPlayingIdx(null);
          return;
        }
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            setCurrentlyPlayingIdx(null);
          };
          await audioRef.current.play();
        }
      } catch (err) {
        setCurrentlyPlayingIdx(null);
      }
      return;
    }

    // If file_present is neither true nor false, do nothing
    setCurrentlyPlayingIdx(null);
  };





  // useEffect to start interview and speak initial AI message
  useEffect(() => {
    initializeInterview();
  }, []);

  return (
    <div className="min-h-screen w-screen overflow-x-hidden" style={{ backgroundColor: "#f5f5dc" }}>
      {/* Header Navigation */}
      <header className="bg-blue-900 text-white sticky top-0 z-50 w-screen">
        <div className="w-screen px-0">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <img
                  src="/interview-IQ-logo.jpg"
                  alt="InterviewIQ"
                  className="h-8 w-8 object-cover rounded"
                />
              </div>
              <span className="text-xl font-bold">InterviewIQ</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push("/")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/practice")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Practice
              </button>
              <a href="#" className="text-white font-semibold">
                Voice Interview
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Button
                  variant="ghost"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="sm"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-800"
                    size="sm"
                    onClick={() => router.push("/auth/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-800"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-blue-800">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => router.push("/practice")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  Practice
                </button>
                <a href="#" className="text-white font-semibold px-3 py-2">
                  Voice Interview
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Contact
                </a>
                <div className="flex space-x-3 px-3 pt-3 border-t border-blue-800">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      size="sm"
                      onClick={signOut}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="text-white hover:bg-blue-800"
                        size="sm"
                        onClick={() => router.push("/auth/login")}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        onClick={() => router.push("/auth/signup")}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Editable Height */}
      <section className="relative overflow-hidden w-screen" style={{ height: "200px" }}>
        <Image
          src="/image2.jpg"
          alt="Voice Interview Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center space-y-4 text-white">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Button
                onClick={() => router.push("/interview-mode")}
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Interview Mode
              </Button>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Voice <span className="text-blue-200">Interview</span>
            </h1>
            <p className="text-lg text-blue-100">
              {interviewData.jobTitle}{" "}
              {interviewData.company && `at ${interviewData.company}`}
            </p>
          </div>
        </div>
      </section>

  {/* Hidden audio element for reliable autoplay */}
  <audio ref={audioRef} style={{ display: 'none' }} preload="auto" />

  {/* Main Content */}
  <div className="w-screen px-0 py-8">
        <div className="space-y-6 w-screen">
          {/* Speech Recognition Error Message */}

          {/* Voice Controls Card */}


          <Card>
            <CardContent className="p-6 space-y-4">
              {chatHistory.map((msg, idx) => {
                const isAI = msg.from === "ai";
                return (
                  <div
                    key={idx}
                    className={`flex mb-2 ${isAI ? "justify-start" : "justify-end"} items-center gap-2`}
                  >
                    {!isAI && (msg.grade !== undefined || msg.reasoning !== undefined) && (
                      <div className="relative mr-2 group">
                        <span className="text-sm cursor-pointer">ℹ️</span>
                        <div className={`absolute bottom-full mb-2 ${isAI ? "left-0" : "right-0"} w-52 bg-white border border-gray-300 text-gray-800 text-xs p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20`}>
                          {msg.grade == null ? (
                            <p>NULL</p>
                          ) : (
                            <>
                              <p>
                                <strong>Grade:</strong> {msg.grade}/10
                              </p>
                              <p>
                                <strong>Reason:</strong> {msg.reasoning}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-lg flex items-center gap-3 ${
                        isAI
                          ? "bg-blue-50 text-blue-900"
                          : msg.grade == null
                          ? "bg-gray-100 text-gray-900"
                          : msg.grade < 5
                          ? "bg-red-100 text-red-900"
                          : "bg-green-100 text-green-900"
                      }`}
                    >
                      {(msg.audioBase64 || msg.text) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            speakResponse(
                              msg.audioBase64,
                              msg.text,
                              idx,
                              isAI ? msg.file_present : true
                            )
                          }
                          title={isAI ? "Play AI voice note" : "Play your voice note"}
                          disabled={recording || (currentlyPlayingIdx !== null && currentlyPlayingIdx !== idx)}
                        >
                          <Volume2 className={`w-6 h-6 ${currentlyPlayingIdx === idx ? 'text-blue-600 animate-pulse' : ''}`} />
                        </Button>
                      )}
                      <span className="text-xs font-semibold">{isAI ? "AI" : "You"}</span>
                      <span className="ml-2 text-sm">{msg.text}</span>
                    </div>
                  </div>
                );
              })}

              {/*
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                AI Interviewer
              </span>
              <Button variant="ghost" size="sm" onClick={speakResponse}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-blue-900">{aiResponse}</p>
          </div>
          */}

              {/* transcript removed: no longer used in voice note chat */}

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    // Stop any playing audio or TTS when starting recording
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                    if (window.speechSynthesis && window.speechSynthesis.speaking) {
                      window.speechSynthesis.cancel();
                    }
                    setCurrentlyPlayingIdx(null);
                    toggleListening();
                  }}
                  className={`w-20 h-20 rounded-full ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : isLoading || micDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isLoading || micDisabled}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                {isListening
                  ? "Listening... Tap to stop"
                  : isLoading
                  ? "AI is thinking..."
                  : "Tap to speak"}
              </p>
            </CardContent>
          </Card>

          {summary && (
            <Card className="mt-4">
              <CardContent className="p-6 space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">
                      Interview Summary
                    </span>
                  </div>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownToHTML(summary),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleEndInterview}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
            disabled={endDisabled || isLoading}
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <img
                    src="/interview-IQ-logo.jpg"
                    alt="InterviewIQ"
                    className="h-8 w-8 object-cover rounded"
                  />
                </div>
                <span className="text-xl font-bold">InterviewIQ</span>
              </div>
              <p className="text-gray-400">
                AI-powered interview preparation and CV optimization platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mock Interviews
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    CV Optimizer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Practice Hub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Progress Tracking
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InterviewIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
