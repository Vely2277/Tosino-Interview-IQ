
"use client";
// Guard to ensure only one response per listening session
let hasRespondedThisTurn = false;

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/contexts/interview-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  ArrowLeft,
  Volume2,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import { interviewAPI } from "@/lib/api";
import Image from "next/image";

let micPermissionGranted = false;

const getSpeechRecognition = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};

export default function VoiceInterviewPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { interviewData } = useInterview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micDisabled, setMicDisabled] = useState(false); // disables mic during AI speech
  const transcriptRef = useRef("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [lastSpokenText, setLastSpokenText] = useState("");
  const sessionIdRef = useRef<string | null>(null); // Declare a ref for sessionId
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
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  // Initialize the interview session STARTING THE INTERVIEW
  const initializeInterview = async () => {
    setIsLoading(true);
    try {
      const data = await interviewAPI.start(
        interviewData.jobTitle,
        interviewData.company,
        "voice"
      );
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      console.log("Log session id:", data.sessionId);
      const id = data.sessionId;
      setSessionId(id);
      setAiResponse(data.initialMessage); // Set the initial AI message
      setChatHistory((prev) => [
        ...prev,
        { from: "ai", text: data.initialMessage },
      ]);
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (userResponse: string) => {
    console.log(
      " [handleRespond] preparing to send response to api:",
      userResponse
    );
    // if (!sessionId) return;

    setIsLoading(true);
    console.log("Sending user response to backend:", userResponse);

    try {
      console.log("session id ref:", sessionIdRef.current);
      const data = await interviewAPI.respond(
        sessionIdRef.current!,
        userResponse,
        "voice"
      );

      console.log(
        " [handleRespond] api call sent. we are waiting for response.."
      );

      console.log("Received response from backend:", data);

      setChatHistory((prev) => [
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
      setTranscript("");

    } catch (error) {
      console.error("Error in handleRespond:", error);
      setAiResponse("Hmm... I couldn't process that. Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle microphone toggle (start/stop listening)
  // Handle microphone toggle (start/stop listening) with permission request
  // Silence timeout ref
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const toggleListening = async () => {
  if (!recognition) {
    alert("Speech Recognition not supported on this browser.");
    return;
  }

  if (isListening) {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    setMicDisabled(true);
    setIsListening(false);
    // Stop recognition and send response if transcript exists
    const sr = recognition;
    setIsLoading(true); // FIX: set loading before stop so onend doesn't re-enable mic
    sr.stop();
    if (transcriptRef.current && transcriptRef.current.trim() && !hasRespondedThisTurn) {
      hasRespondedThisTurn = true;
      handleRespond(transcriptRef.current.trim()).finally(() => {
        setTranscript("");
        transcriptRef.current = "";
        setIsLoading(false);
        setMicDisabled(false);
      });
    } else {
      setMicDisabled(false);
      setIsLoading(false);
    }
  } else {
    try {
      if (!micPermissionGranted) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setTranscript("");
      transcriptRef.current = "";
      hasRespondedThisTurn = false;
      try {
        recognition.start();
        micPermissionGranted = true;
        setIsListening(true);
        // No initial silence timer here; timer is managed in onspeechstart/onresult
      } catch (recErr) {
        micPermissionGranted = false;
        alert("Microphone access is required. Please allow microphone permission in your browser settings.");
        setIsListening(false);
      }
    } catch (err) {
      micPermissionGranted = false;
      alert("Microphone access is required. Please allow microphone permission in your browser settings.");
      setIsListening(false);
    }
  }
};

  // End the interview session
  const handleEndInterview = async () => {
    if (!sessionId || endDisabled) return;
    setEndDisabled(true);
    setIsLoading(true);
    try {
      const data = await interviewAPI.end(sessionId);
      console.log("Interview Summary:", data.summary); // Handle the summary data
      setSummary(data.summary); //store the summary in state
    } catch (error) {
      console.error("Error ending interview:", error);
      setEndDisabled(false); // allow retry if error
    } finally {
      setIsLoading(false);
    }
  };

  // Speak out AI response
  const speakText = (text: string) => {
    if (!text || "speechSynthesis" in window === false) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onstart = () => {
      setMicDisabled(true);
    };
    utterance.onend = () => {
      setMicDisabled(false);
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const speakResponse = () => {
    speakText(aiResponse);
    setLastSpokenText(aiResponse); // update last spoken manually
  };

  // Initialize interview when the component mounts
  useEffect(() => {
    if (!aiResponse || aiResponse === lastSpokenText) return;

    speakText(aiResponse);
    setLastSpokenText(aiResponse);
  }, [aiResponse, lastSpokenText]);

  //same thing
  useEffect(() => {
    const sr = getSpeechRecognition();
    if (!sr) return;


    sr.lang = "en-US";
    sr.continuous = true;
    sr.interimResults = false;

    sr.onspeechstart = () => {
      // Only clear/reset any existing timer, do not schedule the finalizer here
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };

    sr.onresult = (event: any) => {
      // Accumulate transcript, do not stop or finalize here
      let result = "";
      for (let i = 0; i < event.results.length; i++) {
        result += event.results[i][0].transcript + " ";
      }
      result = result.trim();
      transcriptRef.current = result;
      setTranscript(result);
      // Reset silence timer for 3s after last speech
      if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
      silenceTimeoutRef.current = setTimeout(() => {
        if (!hasRespondedThisTurn && transcriptRef.current.trim()) {
          hasRespondedThisTurn = true;
          setIsListening(false);
          setMicDisabled(true);
          setIsLoading(true); // FIX: set loading before stop so onend doesn't re-enable mic
          sr.stop();
          handleRespond(transcriptRef.current.trim()).finally(() => {
            setTranscript("");
            transcriptRef.current = "";
            setIsLoading(false);
            setMicDisabled(false);
          });
        } else {
          setTranscript("");
          transcriptRef.current = "";
          setMicDisabled(false);
        }
      }, 3000);
    };


    sr.onerror = (error: any) => {
      setIsListening(false);
      // Only re-enable mic if not sending
      if (!hasRespondedThisTurn && !isLoading) setMicDisabled(false);
      if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
      console.error("Speech recognition error:", error);
      if (error.error === "not-allowed" || error.error === "denied") {
        alert("Microphone access denied. Please allow microphone permission in your browser settings.");
      } else if (error.error === "no-speech") {
        alert("No speech detected. Please try again and speak clearly.");
      }
      if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    };

    sr.onend = () => {
      setIsListening(false);
      // Only re-enable mic if not sending
      if (!hasRespondedThisTurn && !isLoading) setMicDisabled(false);
      if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
      setTranscript("");
      transcriptRef.current = "";
    };

    setRecognition(sr);
  }, []);

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
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-800"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Sign Up
                  </Button>
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
          {/* Voice Controls Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Settings className="h-5 w-5" />
                <span>Voice Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm w-16 font-medium">Pitch</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => {
                      const newPitch = parseFloat(e.target.value);
                      setPitch(newPitch);
                      speechSynthesis.cancel();
                      speakText(aiResponse);
                      setLastSpokenText(aiResponse);
                    }}
                    className="w-full h-1 appearance-none bg-blue-200 rounded-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <span className="text-xs w-8 text-right">
                    {pitch.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm w-16 font-medium">Rate</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value);
                      setRate(newRate);
                      speechSynthesis.cancel();
                      speakText(aiResponse);
                      setLastSpokenText(aiResponse);
                    }}
                    className="w-full h-1 appearance-none bg-blue-200 rounded-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <span className="text-xs w-8 text-right">
                    {rate.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm w-16 font-medium">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      speechSynthesis.cancel();
                      speakText(aiResponse);
                      setLastSpokenText(aiResponse);
                    }}
                    className="w-full h-1 appearance-none bg-blue-200 rounded-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <span className="text-xs w-8 text-right">
                    {volume.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Adjust voice settings to match your preference.
                </p>
              </div>
            </CardContent>
          </Card>

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
