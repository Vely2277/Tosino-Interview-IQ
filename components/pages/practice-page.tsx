"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/contexts/interview-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  Target,
  Users,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/footer";

export default function PracticePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { setInterviewData } = useInterview();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSecondSlide, setCurrentSecondSlide] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  // On mount, check for unfinished interview session in localStorage
  useEffect(() => {
    const savedVoice = localStorage.getItem("voiceInterviewSession");
    if (savedVoice) {
      // Optionally, you can check for a 'completed' flag in the session object
      router.push("/voice-interview");
      return;
    }
    const savedText = localStorage.getItem("textInterviewSession");
    if (savedText) {
      router.push("/text-interview");
      return;
    }
  }, [router]);

  // Slideshow images - create extended array for seamless loop
  const slides = [
    "/image1.jpg",
    "/image1.jpg",
    "/image1.jpg",
    "/image1.jpg",
    "/image1.jpg",
    "/image1.jpg",
  ];

  // Second slideshow images
  const secondSlides = [
    "/image19.jpg",
    "/image21.jpg",
    "/image20.jpg",
    "/image22.jpg",
  ];

  // Typewriter configuration
  const TYPEWRITER_SPEED = 30;
  const fullText =
    "🎯 Be specific about your target role for better questions • 🏠 Find a quiet space for your practice session • ⏰ Take your time to think before answering • 💪 Practice multiple times to build confidence";

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1500); // Changed to 1.5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  // Auto-advance second slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSecondSlide((prev) => (prev + 1) % secondSlides.length);
    }, 3000); // 3 seconds for second slideshow
    return () => clearInterval(timer);
  }, [secondSlides.length]);

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0;
    let currentText = "";

    const typeNextCharacter = () => {
      if (currentIndex < fullText.length) {
        currentText += fullText[currentIndex];
        setTypewriterText(currentText);
        currentIndex++;
        setTimeout(typeNextCharacter, TYPEWRITER_SPEED);
      } else {
        setTimeout(() => {
          setShowCursor(false);
        }, 500);
      }
    };

    typeNextCharacter();
  }, []);

  const handleStartInterview = () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title");
      return;
    }
    setInterviewData({ jobTitle, company });
    router.push("/interview-mode");
  };

  return (
  <div className="min-h-screen bg-[#f0efe1] dark:bg-[#181a20]">
      {/* Header Navigation */}
  <header className="bg-blue-900 dark:bg-[#23263a] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <a href="#" className="text-white dark:text-blue-100 font-semibold">
                Practice
              </a>
              <button
                onClick={() => router.push("/about")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => router.push("/hub")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                Find Jobs
              </button>
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
                    className="bg-white dark:bg-blue-900 dark:text-blue-200 text-blue-600 hover:bg-gray-100 dark:hover:bg-blue-800"
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
                <a href="#" className="text-white dark:text-blue-100 font-semibold px-3 py-2">
                  Practice
                </a>
                <button
                  onClick={() => router.push("/about")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  About
                </button>
                <button
                  onClick={() => router.push("/hub")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  Find Jobs
                </button>
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
                        className="bg-white dark:bg-blue-900 dark:text-blue-200 text-blue-600 hover:bg-gray-100 dark:hover:bg-blue-800"
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

      {/* Hero Section with Slideshow */}
  <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-[#23263a] dark:via-[#23263a] dark:to-[#23263a] text-white overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out w-full h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <Image
                  src={slide}
                  alt={`Practice Background ${index + 1}`}
                  fill
                  className="object-cover opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Transparent Overlay */}
  <div className="absolute inset-0 bg-black/20 dark:bg-black/60"></div>

        {/* Content */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold">
              Practice <span className="text-blue-200 dark:text-blue-400">Interview</span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              Set up your personalized AI interview session and start practicing
              for your dream job
            </p>
          </div>
        </div>
      </section>

      {/* Motivational Text */}
  <section className="py-8 bg-[#f0efe1] dark:bg-[#181a20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-blue-100">
              A step at a time...
            </h2>
          </div>
        </div>
      </section>

      {/* Second Slideshow Section */}
  <section className="py-8 bg-white dark:bg-[#23263a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSecondSlide * 100}%)` }}
            >
              {secondSlides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={slide}
                    alt={`Practice Step ${index + 1}`}
                    width={1200}
                    height={500}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover opacity-90 dark:opacity-70"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
  <section className="py-12 bg-[#f0efe1] dark:bg-[#181a20]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Enhanced Interview Setup Card */}
            <Card className="shadow-2xl border-0 bg-white dark:bg-[#23263a] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-[#23263a] dark:via-[#23263a] dark:to-[#23263a] text-white">
                <CardTitle className="text-3xl text-center font-bold flex items-center justify-center space-x-3 dark:text-blue-100">
                  <CheckCircle className="h-8 w-8" />
                  <span>Interview Setup</span>
                </CardTitle>
                <p className="text-center text-blue-100 dark:text-blue-200 mt-3 text-lg">
                  Tell us about the position you're applying for and we'll
                  create the perfect practice session
                </p>
              </CardHeader>
              <CardContent className="p-10 bg-gradient-to-br from-white to-blue-50 dark:from-[#23263a] dark:to-[#23263a]">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label
                      htmlFor="jobTitle"
                      className="text-xl font-bold text-gray-900 dark:text-blue-100 flex items-center space-x-2"
                    >
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Job Title *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Frontend Developer, Data Scientist, Product Manager, UX Designer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                        className="h-14 text-lg border-3 border-gray-300 dark:border-blue-800 focus:border-blue-600 rounded-xl shadow-sm bg-white dark:bg-[#23263a] dark:text-blue-100 pl-6 pr-4"
                      />
                      {/* Horizontal black line at bottom */}
                      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-black opacity-30 pointer-events-none"></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-blue-200 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border-l-4 border-blue-400 dark:border-blue-700">
                      💡 <strong>Tip:</strong> Be specific about the role you
                      want to practice for - this helps our AI generate more
                      relevant questions
                    </p>
                    <br></br>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="company"
                      className="text-xl font-bold text-gray-900 dark:text-blue-100 flex items-center space-x-2"
                    >
                      <Users className="h-5 w-5 text-green-600" />
                      <span>Company (Optional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="company"
                        placeholder="e.g., Google, Microsoft, Startup, Healthcare Company, Financial Services"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-14 text-lg border-3 border-gray-300 dark:border-blue-800 focus:border-blue-600 rounded-xl shadow-sm bg-white dark:bg-[#23263a] dark:text-blue-100 pl-6 pr-4"
                      />
                      {/* Horizontal black line at bottom */}
                      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-black opacity-30 pointer-events-none"></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-blue-200 bg-green-50 dark:bg-green-900 p-3 rounded-lg border-l-4 border-green-400 dark:border-green-700">
                      🏢 <strong>Optional:</strong> Adding a company helps us
                      tailor questions to match their culture and interview
                      style
                    </p>
                  </div>

                  <div className="pt-8">
                    <Button
                      onClick={handleStartInterview}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-900 dark:to-blue-900 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 text-white py-8 text-2xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:rotate-1 border-2 border-white/20 dark:border-blue-900"
                      size="lg"
                    >
                      <CheckCircle className="mr-4 h-8 w-8 animate-pulse" />
                      <span className="tracking-wide">START INTERVIEW</span>
                      <Sparkles className="ml-4 h-8 w-8 animate-bounce" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card with Typewriter */}
            <Card className="text-center p-8 bg-white dark:bg-[#23263a] shadow-lg border-0">
              <CardContent className="space-y-6">
                <div className="bg-blue-100 dark:bg-blue-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-blue-100">
                  Quick Tips for Better Practice
                </h3>
                <div className="text-gray-700 dark:text-blue-200 text-lg min-h-[100px] flex items-center justify-center leading-relaxed px-4">
                  <div className="text-left space-y-3">
                    {typewriterText.split("•").map((tip, index) => {
                      const trimmedTip = tip.trim();
                      if (!trimmedTip) return null;

                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="text-2xl mt-1">
                            {trimmedTip.includes("🎯") && "🎯"}
                            {trimmedTip.includes("🏠") && "🏠"}
                            {trimmedTip.includes("⏰") && "⏰"}
                            {trimmedTip.includes("💪") && "💪"}
                          </span>
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                            {trimmedTip.replace(/[🎯🏠⏰💪]\s*/, "")}
                          </span>
                        </div>
                      );
                    })}
                    {showCursor && (
                      <span className="animate-pulse ml-1 text-blue-600 text-xl">
                        |
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 bg-white dark:bg-[#23263a] shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-blue-100">AI-Powered</h3>
                  <p className="text-gray-600 dark:text-blue-200 text-sm">
                    Advanced AI asks relevant questions based on your role
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 bg-white dark:bg-[#23263a] shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-blue-100">Targeted Practice</h3>
                  <p className="text-gray-600 dark:text-blue-200 text-sm">
                    Role-specific questions for your target position
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 bg-white dark:bg-[#23263a] shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-blue-100">Real Feedback</h3>
                  <p className="text-gray-600 dark:text-blue-200 text-sm">
                    Get instant feedback to improve your responses
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
