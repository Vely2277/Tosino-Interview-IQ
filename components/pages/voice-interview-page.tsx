
"use client";



import { useState, useEffect, useRef } from "react";
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
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [endDisabled, setEndDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [chatHistory, setChatHistory] = useState<
    {
      from: "user" | "ai";
      text: string;
      grade?: number | null;
      reasoning?: string | null;
    }[]
  >([]);
  const [transcript, setTranscript] = useState("");
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsReadyRef = useRef(false);

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
  setAiResponse(data.initialMessage); // Set the initial AI message
  console.log("[INIT] Initial AI message:", data.initialMessage);
      setChatHistory((prev) => [
        // ...existing code...
        ...prev,
        { from: "ai", text: data.initialMessage },
      ]);
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

      setChatHistory((prev) => [
        // ...existing code...
        ...prev,
        {
          from: "user",
          text: userResponse,
          grade: data.grade ?? null,
          reasoning: data.reasoning ?? null,
        },
        {
          from: "ai",
          text: data.aiResponse,
        },
      ]);

  setAiResponse(data.aiResponse);
  console.log("[RESPOND] AI response set:", data.aiResponse);
  setTranscript("");
  console.log("[RESPOND] Transcript cleared");

    } catch (error) {
      console.error("[RESPOND] Error in handleRespond:", error);
      setAiResponse("Hmm... I couldn't process that. Try again?");
    } finally {
      setIsLoading(false);
      console.log("[RESPOND] Loading state set to false");
    }
  };

  // Handle microphone toggle (start/stop listening)
  // Handle microphone toggle (start/stop listening) with permission request





// WebRTC/WS audio streaming logic
const toggleListening = async () => {
  if (isListening) {
    console.log('[MIC] Stopping listening');
    setIsListening(false);
    setMicDisabled(true);
    // Stop silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    // Bulletproof mic cleanup
    if (audioStream) {
      try {
        audioStream.getTracks().forEach((track) => {
          track.stop();
          console.log('[MIC] Track stopped:', track.kind);
        });
      } catch (e) { console.warn('[MIC] Error stopping tracks:', e); }
      setAudioStream(null);
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        console.log('[MIC] Processor disconnected and cleared');
      } catch (e) { console.warn('[MIC] Error disconnecting processor:', e); }
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
        console.log('[MIC] AudioContext closed');
      } catch (e) { console.warn('[MIC] Error closing AudioContext:', e); }
      audioCtxRef.current = null;
    }
    // DO NOT close WebSocket here! Keep it open for session.
    setMicDisabled(false);
    return;
  }
  setMicDisabled(true); // Button is greyed out while handshake is pending
  // If ws already exists and is open, just start mic streaming
  if (ws && ws.readyState === 1) {
    // Already joined, just start mic
    try {
      console.log('[MIC] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[MIC] Microphone granted. Starting audio streaming.');
      setAudioStream(stream);
      setIsListening(true);
      setMicDisabled(false);
      const audioCtx = new window.AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(audioCtx.destination);
      let lastNonSilent = Date.now();
      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== 1) return;
        const input = e.inputBuffer.getChannelData(0);
        let silent = true;
        for (let i = 0; i < input.length; i++) {
          if (Math.abs(input[i]) > 0.01) { silent = false; break; }
        }
        if (!silent) {
          lastNonSilent = Date.now();
        }
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          if (Date.now() - lastNonSilent >= 3000) {
            console.log('[MIC] Detected 3 seconds of silence, stopping...');
            setIsListening(false);
            setMicDisabled(true);
            if (audioStream) {
              audioStream.getTracks().forEach((track) => track.stop());
              setAudioStream(null);
            }
            if (processorRef.current) {
              processorRef.current.disconnect();
              processorRef.current.onaudioprocess = null;
              processorRef.current = null;
            }
            if (audioCtxRef.current) {
              audioCtxRef.current.close();
              audioCtxRef.current = null;
            }
            setMicDisabled(false);
          }
        }, 3100);
        const buf = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          buf[i] = Math.max(-1, Math.min(1, input[i])) * 32767 | 0;
        }
        ws.send(buf.buffer);
      };
    } catch (err) {
      alert("Microphone access is required. Please allow microphone permission in your browser settings.");
      setIsListening(false);
      setMicDisabled(false);
    }
    return;
  }
  // Otherwise, open a new WebSocket and join
  console.log('[WS] Opening WebSocket connection...');
  const wsConn = voiceAPI.connectWebSocket(
    sessionIdRef.current,
    async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "joined") {
        wsReadyRef.current = true;
        setWs(wsConn);
        // Now start mic
        try {
          console.log('[MIC] Requesting microphone access...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[MIC] Microphone granted. Starting audio streaming.');
          setAudioStream(stream);
          setIsListening(true);
          setMicDisabled(false);
          const audioCtx = new window.AudioContext();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          source.connect(processor);
          processor.connect(audioCtx.destination);
          let lastNonSilent = Date.now();
          processor.onaudioprocess = (e) => {
            if (!wsConn || wsConn.readyState !== 1) return;
            const input = e.inputBuffer.getChannelData(0);
            let silent = true;
            for (let i = 0; i < input.length; i++) {
              if (Math.abs(input[i]) > 0.01) { silent = false; break; }
            }
            if (!silent) {
              lastNonSilent = Date.now();
            }
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = setTimeout(() => {
              if (Date.now() - lastNonSilent >= 3000) {
                console.log('[MIC] Detected 3 seconds of silence, stopping...');
                setIsListening(false);
                setMicDisabled(true);
                if (audioStream) {
                  audioStream.getTracks().forEach((track) => track.stop());
                  setAudioStream(null);
                }
                if (processorRef.current) {
                  processorRef.current.disconnect();
                  processorRef.current.onaudioprocess = null;
                  processorRef.current = null;
                }
                if (audioCtxRef.current) {
                  audioCtxRef.current.close();
                  audioCtxRef.current = null;
                }
                setMicDisabled(false);
              }
            }, 3100);
            const buf = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              buf[i] = Math.max(-1, Math.min(1, input[i])) * 32767 | 0;
            }
            wsConn.send(buf.buffer);
          };
        } catch (err) {
          alert("Microphone access is required. Please allow microphone permission in your browser settings.");
          setIsListening(false);
          setMicDisabled(false);
        }
      } else if (data.type === "partial_transcript") {
        setTranscript(data.text);
      } else if (data.type === "final_transcript") {
        setTranscript("");
        setChatHistory((prev) => [...prev, { from: "user", text: data.text }]);
      } else if (data.type === "ai_stream") {
        setChatHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.from === "ai") {
            return [
              ...prev.slice(0, -1),
              { ...last, text: data.text },
            ];
          } else {
            return [...prev, { from: "ai", text: data.text }];
          }
        });
        setAiResponse(data.text);
      } else if (data.type === "audio") {
        const audioData = Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0));
        const blob = new Blob([audioData], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        let player = audioPlayer;
        if (!player) {
          player = new Audio();
          setAudioPlayer(player);
        }
        player.src = url;
        player.play();
      }
    },
    () => {
      // onOpen: send join message only
      console.log('[WS] WebSocket opened. Sending "join" message...');
      if (wsConn.readyState === 1) {
        wsConn.send(JSON.stringify({ type: "join", sessionId: sessionIdRef.current }));
        console.log('[WS] "join" message sent:', { type: "join", sessionId: sessionIdRef.current });
      } else {
        wsConn.addEventListener("open", () => {
          wsConn.send(JSON.stringify({ type: "join", sessionId: sessionIdRef.current }));
          console.log('[WS] "join" message sent (after open):', { type: "join", sessionId: sessionIdRef.current });
        }, { once: true });
      }
    },
    () => {
      console.log('[WS] WebSocket closed. Cleaning up.');
      wsReadyRef.current = false;
      setIsListening(false);
      setMicDisabled(false);
      setAudioStream(null);
      setWs(null);
    }
  );
  // Don't setWs(wsConn) here, only after joined
};

  // End the interview session
  const handleEndInterview = async () => {
    console.log("[END] handleEndInterview called. sessionId:", sessionId, "endDisabled:", endDisabled);
    if (!sessionId || endDisabled) return;
  setEndDisabled(true);
  console.log("[END] endDisabled set to true");
  setIsLoading(true);
  console.log("[END] isLoading set to true");
    try {
  console.log("[END] Calling interviewAPI.end with sessionId:", sessionId);
  const data = await interviewAPI.end(sessionId);
  console.log("[END] Interview Summary:", data.summary); // Handle the summary data
  setSummary(data.summary); //store the summary in state
  console.log("[END] Summary set in state");
    } catch (error) {
      console.error("[END] Error ending interview:", error);
      setEndDisabled(false); // allow retry if error
    } finally {
      setIsLoading(false);
      console.log("[END] isLoading set to false");
    }
  };


  // No browser TTS; audio is streamed from backend and played automatically
  const speakResponse = () => {
    // Optionally replay last AI audio if needed
    // (Implementation depends on how you want to handle replay)
  };





  //use effect to start interview
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
                const isLastAI =
                  msg.from === "ai" && idx === chatHistory.length - 1;
                const isAI = msg.from === "ai";

                return (
                  <div
                    key={idx}
                    className={`flex mb-2 ${
                      isAI ? "justify-start" : "justify-end"
                    } items-center gap-2`}
                  >
                    {!isAI && (
                      <div className="relative mr-2 group">
                        <span className="text-sm cursor-pointer">ℹ️</span>
                        <div className="absolute bottom-full mb-2 left-0 w-52 bg-white border border-gray-300 text-gray-800 text-xs p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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
                      className={`p-4 rounded-lg ${
                        isAI
                          ? "bg-blue-50 text-blue-900"
                          : msg.grade == null
                          ? "bg-gray-100 text-gray-900"
                          : msg.grade < 5
                          ? "bg-red-100 text-red-900"
                          : "bg-green-100 text-green-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">
                          {isAI ? "AI Interviewer" : "You"}
                        </span>

                        {isLastAI && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={speakResponse}
                            className="ml-2 p-1"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm">{msg.text}</p>
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

              {transcript && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">
                    Your Response
                  </span>
                  <p className="text-gray-900 mt-1">{transcript}</p>
                </div>
              )}

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
