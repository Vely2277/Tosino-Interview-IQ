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
  console.log('[VOICE] recordAudioStream called, mimeType:', mimeType);
  if (!mimeType) {
    alert('Your browser does not support audio recording.');
    return null;
  }
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  let chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => {
    console.log('[VOICE] mediaRecorder.ondataavailable fired, data size:', e.data.size);
    if (e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.onstop = async () => {
    console.log('[VOICE] mediaRecorder.onstop fired, chunks:', chunks.length);
    const blob = new Blob(chunks, { type: mimeType });
    console.log('[VOICE] Blob created, size:', blob.size);
    const arrayBuffer = await blob.arrayBuffer();
    onStop(arrayBuffer);
  };
  mediaRecorder.onerror = (e) => {
    console.error('[VOICE] mediaRecorder.onerror:', e);
  };
  mediaRecorder.start();
  console.log('[VOICE] mediaRecorder started');
  return mediaRecorder;
}
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useInterview } from "@/contexts/interview-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, ArrowLeft, Volume2, Menu, X, Settings } from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import { interviewAPI, voiceAPI } from "@/lib/api";
import Image from "next/image";



export default function VoiceInterviewPage() {
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
      audioBase64: string;
    }[]
  >([]);
  // Removed transcript state, not needed for voice note chat
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  // Remove all WebRTC state
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  // Removed lastAIAudio state, not needed for voice note chat
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  // Initialize the interview session STARTING THE INTERVIEW
  const initializeInterview = async () => {
    console.log("[INIT] Initializing interview session");
  setIsLoading(true);
  console.log("[INIT] Loading state set to true");
    try {
  console.log("[INIT] Calling interviewAPI.start with:", interviewData.jobTitle, interviewData.company, "voice");
  const data = await interviewAPI.start(
        interviewData.jobTitle,
        interviewData.company,
        "voice"
      );
  console.log("[INIT] Received session data:", data);
  setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      console.log("Log session id:", data.sessionId);
      const id = data.sessionId;
      setSessionId(id);
      // Expecting backend to return initial audioBase64 for AI's first message
      if (data.audioBase64) {
        setChatHistory((prev) => [
          ...prev,
          { from: "ai", audioBase64: data.audioBase64 },
        ]);
      }
    } catch (error) {
      console.error("[INIT] Error starting interview:", error);
    } finally {
      setIsLoading(false);
      console.log("[INIT] Loading state set to false");
    }
  };

  const handleRespond = async (userResponse: string) => {
    console.log("[RESPOND] handleRespond called with:", userResponse);
    console.log(
      " [handleRespond] preparing to send response to api:",
      userResponse
    );
    // if (!sessionId) return;

    setIsLoading(true);
    console.log("[RESPOND] Loading state set to true");
    console.log("Sending user response to backend:", userResponse);

    try {
      console.log("[RESPOND] session id ref:", sessionIdRef.current);
      const data = await interviewAPI.respond(
        sessionIdRef.current!,
        userResponse,
        "voice"
      );

      console.log("[RESPOND] api call sent. waiting for response...");
      console.log("[RESPOND] Received response from backend:", data);


      // Add user voice note and AI voice note to chat history
      setChatHistory((prev) => [
        ...prev,
        { from: "user" as const, audioBase64: userResponse },
        ...(data.audioBase64 ? [{ from: "ai" as const, audioBase64: data.audioBase64 }] : []),
      ]);

    } catch (error) {
      console.error("[RESPOND] Error in handleRespond:", error);
      // Removed setAiResponse, not needed for voice note chat
    } finally {
      setIsLoading(false);
      console.log("[RESPOND] Loading state set to false");
    }
  };

  // Handle microphone toggle (start/stop listening)
  // Handle microphone toggle (start/stop listening) with permission request





// Robust audio recording and streaming logic with improved permission and state sync
const toggleListening = async () => {
  console.log('[VOICE] BUTTON TAPPED. Current recording state:', recording);
  if (recording) {
    console.log('[VOICE] STOP RECORDING requested.');
    // Stop recording and clean up
    setIsListening(false);
    setMicDisabled(true);
    try {
      if (mediaRecorder) {
        console.log('[VOICE] Calling mediaRecorder.stop()...');
        // Do NOT remove the onstop handler here!
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
    } catch (e) {
      console.error('[VOICE] Error when stopping mediaRecorder or cleaning up:', e);
    }
    setMicDisabled(false);
    setRecording(false);
    return;
  }
  setMicDisabled(true);
  console.log('[VOICE] START RECORDING requested. Requesting microphone permission...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setAudioStream(stream);
    setIsListening(true);
    setRecording(true);
    setMicDisabled(false);
    console.log('[VOICE] Microphone stream acquired. RECORDING...');
    // Start recording
    const rec = recordAudioStream(stream, (audioBuffer) => {
      console.log('[VOICE] RECORDING END. Callback fired. Preparing to send...');
      setIsListening(false);
      setRecording(false);
      setMicDisabled(true);
      // Use FileReader to safely encode audio as base64
      const mimeType = getSupportedMimeType();
      const blob = new Blob([audioBuffer], { type: mimeType });
      console.log('[VOICE] Blob for FileReader, size:', blob.size);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result;
        let base64 = '';
        if (typeof result === 'string') {
          base64 = result.split(',')[1]; // Remove data URI prefix
        }
        console.log('[VOICE] base64 length:', base64.length, 'sessionId:', sessionIdRef.current);
        if (!base64) {
          console.error('[VOICE] No base64 audio to send!');
          setMicDisabled(false);
          setAudioStream(null);
          return;
        }
        try {
          console.log('[VOICE] RECORDING SENT. Sending audio to backend...');
          // Send the WAV base64 directly as the user response
          await handleRespond(base64);
        } catch (err: any) {
          console.error('[VOICE] Error sending audio:', err);
        }
        setMicDisabled(false);
        // Clean up audio stream after recording
        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        setAudioStream(null);
      };
      reader.readAsDataURL(blob);
    });
    if (!rec) {
      console.error('[VOICE] Could not start recording. MediaRecorder not created.');
      setIsListening(false);
      setMicDisabled(false);
      setRecording(false);
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      setAudioStream(null);
      return;
    }
    setMediaRecorder(rec);
  } catch (err: any) {
    console.error('[VOICE] ERROR requesting microphone or starting recording:', err);
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
    // Clean up any open streams
    try {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }
    } catch (e) {}
  }
};

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
  const speakResponse = async (audioBase64?: string) => {
    if (!audioBase64) {
      alert("No audio available for this response.");
      return;
    }
    try {
      // Decode base64 to ArrayBuffer
      const binary = atob(audioBase64);
      const wavBuffer = new ArrayBuffer(binary.length);
      const view = new Uint8Array(wavBuffer);
      for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
      // Create Blob and play
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(wavBlob);
      const audio = new Audio(url);
      audio.play().catch((err) => {
        console.error("Audio playback error:", err);
        alert("Could not play audio. Please check your device's audio settings.");
      });
    } catch (err) {
      console.error('[AUDIO] Error during WAV playback:', err);
      alert('Could not play audio.');
    }
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
                    <div
                      className={`p-4 rounded-lg flex items-center gap-3 ${isAI ? "bg-blue-50 text-blue-900" : "bg-green-100 text-green-900"}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakResponse(msg.audioBase64)}
                        title={isAI ? "Play AI voice note" : "Play your voice note"}
                      >
                        <Volume2 className="w-6 h-6" />
                      </Button>
                      <span className="text-xs font-semibold">{isAI ? "AI" : "You"}</span>
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
                  onClick={toggleListening}
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
