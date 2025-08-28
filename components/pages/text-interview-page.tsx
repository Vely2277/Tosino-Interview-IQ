"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/contexts/interview-context";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Menu,
  X,
  Star,
  MessageSquare,
  Send,
  Mic,
  MicOff,
} from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import { interviewAPI } from "@/lib/api";
import Image from "next/image";

export default function TextInterviewPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { interviewData } = useInterview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null); // Declare a ref for sessionId
  const [summary, setSummary] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    {
      from: "user" | "ai";
      text: string;
      grade?: number | null;
      reasoning?: string | null;
    }[]
  >([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // Initialize the interview session STARTING THE INTERVIEW
  const initializeInterview = async () => {
    setIsLoading(true);
    try {
      const data = await interviewAPI.start(
        interviewData.jobTitle,
        interviewData.company,
        "text"
      );
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
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

  // Save session to localStorage whenever relevant state changes
  useEffect(() => {
    if (!sessionId) return;
    // Only save if not ended
    if (!isButtonDisabled) {
      const sessionData = {
        sessionId,
        chatHistory,
        interviewData,
        aiResponse,
        currentMessage,
      };
      localStorage.setItem("textInterviewSession", JSON.stringify(sessionData));
    }
  }, [sessionId, chatHistory, interviewData, aiResponse, currentMessage, isButtonDisabled]);

  // On mount, restore session if present
  useEffect(() => {
    const saved = localStorage.getItem("textInterviewSession");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        if (parsed.chatHistory) setChatHistory(parsed.chatHistory);
        if (parsed.interviewData) {
          // Optionally setInterviewData(parsed.interviewData);
        }
        if (parsed.aiResponse) setAiResponse(parsed.aiResponse);
        if (parsed.currentMessage) setCurrentMessage(parsed.currentMessage);
      } catch {}
    }
  }, []);

  const handleRespond = async (userResponse: string) => {

    setIsLoading(true);

    try {
      const data = await interviewAPI.respond(
        sessionIdRef.current!,
        userResponse,
        "text"
      );

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
      setCurrentMessage(""); // Reset the current message after responding
    } catch (error) {
      console.error("Error in handleRespond:", error);
      setAiResponse("Hmm... I couldn't process that. Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  // End the interview session
  const handleEndInterview = async () => {
    if (isButtonDisabled) return;
    if (!sessionId) return;
    setIsButtonDisabled(true);
    setShowEndConfirm(false);
    setIsLoading(true);
    try {
      const data = await interviewAPI.end(sessionId);
      setSummary(data.summary);
      // Clear session from localStorage after ending
      localStorage.removeItem("textInterviewSession");
    } catch (error) {
      console.error("Error ending interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize interview when the component mounts
  useEffect(() => {
    initializeInterview();
  }, []);

  return (
  <div className="min-h-screen bg-[#f0efe1] dark:bg-[#181a20]">
      {/* Header Navigation */}
  <header className="bg-blue-900 dark:bg-[#23263a] text-white sticky top-0 z-50 w-full">
  <div className="w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 dark:bg-blue-800 p-2 rounded-lg">
                <img
                  src="/interview-IQ-logo.jpg"
                  alt="InterviewIQ"
                  className="h-8 w-8 object-cover rounded"
                />
              </div>
              <span className="text-xl font-bold dark:text-blue-100">InterviewIQ</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push("/")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/practice")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                Practice
              </button>
              <a href="#" className="text-white dark:text-blue-100 font-semibold">
                Text Interview
              </a>
              <a
                href="#"
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Button
                  variant="ghost"
                  className="bg-white dark:bg-blue-900 dark:text-blue-200 text-blue-600 hover:bg-gray-100 dark:hover:bg-blue-800"
                  size="sm"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-white dark:text-blue-200 hover:bg-blue-800 dark:hover:bg-blue-900"
                    size="sm"
                    onClick={() => router.push("/auth/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-blue-200"
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
              className="md:hidden p-2 rounded-md text-gray-300 dark:text-blue-200 hover:text-white hover:bg-blue-800 dark:hover:bg-blue-900"
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
            <div className="md:hidden py-4 border-t border-blue-800 dark:border-blue-900">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => router.push("/practice")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  Practice
                </button>
                <a href="#" className="text-white dark:text-blue-100 font-semibold px-3 py-2">
                  Text Interview
                </a>
                <a
                  href="#"
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2"
                >
                  Contact
                </a>
                <div className="flex space-x-3 px-3 pt-3 border-t border-blue-800 dark:border-blue-900">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="bg-white dark:bg-blue-900 dark:text-blue-200 text-blue-600 hover:bg-gray-100 dark:hover:bg-blue-800"
                      size="sm"
                      onClick={signOut}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="text-white dark:text-blue-200 hover:bg-blue-800 dark:hover:bg-blue-900"
                        size="sm"
                        onClick={() => router.push("/auth/login")}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-blue-200"
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

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden w-full">
        <Image
          src="/image2.jpg"
          alt="Text Interview Background"
          fill
          className="object-cover dark:opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70"></div>
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
            <h1 className="text-4xl lg:text-5xl font-bold">
              Text <span className="text-blue-200 dark:text-blue-400">Interview</span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200">
              Practice your interview skills with AI-powered text conversations
            </p>
            {interviewData.jobTitle && (
              <div className="bg-blue-800/50 dark:bg-blue-900/70 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
                <p className="text-lg">
                  <span className="text-blue-200 dark:text-blue-400">Position:</span>{" "}
                  {interviewData.jobTitle}
                  {interviewData.company && (
                    <span className="text-blue-200 dark:text-blue-400">
                      {" "}
                      at {interviewData.company}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-[#f0efe1] dark:bg-[#181a20] w-full">
  <div className="w-full">
          <Card className="shadow-lg border-0 bg-white dark:bg-[#23263a] w-full">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#23263a] dark:to-[#23263a] text-white rounded-t-lg w-full">
              <CardTitle className="flex items-center w-full dark:text-blue-100">
                <MessageSquare className="h-5 w-5" />
                <span>Interview Conversation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 w-full">
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
                      <div className="relative ml-2 group">
                        <span className="text-sm cursor-pointer">ℹ️</span>
                        <div className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-gray-900 border border-gray-300 dark:border-blue-800 text-gray-800 dark:text-blue-100 text-xs p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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
                          ? "bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : msg.grade == null
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-blue-100"
                          : msg.grade < 5
                          ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200"
                          : "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">
                          {isAI ? "AI Interviewer" : "You"}
                        </span>
                      </div>

                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              <div className="flex space-x-2">
                <textarea
                  value={currentMessage}
                  onChange={(e) => {
                    setCurrentMessage(e.target.value);
                    e.target.style.height = "auto"; // Reset height to calculate new height
                    e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on scrollHeight
                  }}
                  placeholder="Type your response..."
                  className="p-2 border border-gray-300 dark:border-blue-800 rounded w-full resize-none bg-white dark:bg-[#23263a] dark:text-blue-100"
                  disabled={isLoading}
                  rows={1} // Initial number of rows
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevent Enter from submitting
                    }
                  }}
                />
                <Button
                  onClick={() => handleRespond(currentMessage)}
                  disabled={
                    isButtonDisabled || isLoading || !currentMessage.trim()
                  }
                  size="sm"
                  className={
                    isButtonDisabled
                      ? "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : ""
                  }
                >
                  Send
                </Button>
              </div>

              {isLoading && (
                <p className="text-center text-sm text-blue-600 dark:text-blue-200">
                  AI is thinking...
                </p>
              )}
            </CardContent>
          </Card>

          {summary && (
            <Card className="mt-4 dark:bg-[#23263a]">
              <CardContent className="p-6 space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
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

          <div className="mt-6">
            <Button
              onClick={() => setShowEndConfirm(true)}
              variant="outline"
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-900 dark:to-pink-900 hover:from-red-600 hover:to-pink-600 dark:hover:from-red-800 dark:hover:to-pink-800 text-white border-0 py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              disabled={
                isButtonDisabled ||
                !chatHistory.some((msg) => msg.from === "user")
              }
            >
              {isButtonDisabled ? "Interview Ended" : "End Interview"}
            </Button>

            {/* Confirmation Popup */}
            {showEndConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-[#23263a] rounded-lg shadow-lg p-6 w-full max-w-sm">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-100">Are you sure you want to end the interview?</h2>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-blue-100"
                      onClick={() => setShowEndConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleEndInterview}
                    >
                      Yes, End
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

  <Footer />
    </div>
  );
}
