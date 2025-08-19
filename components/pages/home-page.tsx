"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Star,
  Users,
  Award,
  Target,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/footer";

export default function HomePage() {
  // Animated counter for "500+"
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const end = 500;
    const duration = 7000; // 7 seconds
    const frameDuration = 16; // ms
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    let timer: NodeJS.Timeout;
    function animate() {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      setCounter(Math.floor(progress * end));
      if (progress < 1) {
        timer = setTimeout(animate, frameDuration);
      } else {
        setCounter(end);
      }
    }
    animate();
    return () => clearTimeout(timer);
  }, []);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentImageSlide, setCurrentImageSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [typewriterText, setTypewriterText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(
    new Set()
  );

  // Mock slideshow images
  const slides = [
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg",
    "/image4.jpg",
    "/image5.jpg",
  ];

  // Image slideshow (before FAQ)
  const imageSlides = ["/image7.jpg", "/image9.jpg", "/image10.jpg"];

  // Typewriter effect configuration
  const TYPEWRITER_SPEED = 50; // milliseconds between characters (lower = faster)
  const fullText = "Get Personalized Interview Coaching - Master Every Question";

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
        // Remove cursor after typing is complete
        setTimeout(() => {
          setShowCursor(false);
        }, 500);
      }
    };

    typeNextCharacter();
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute("data-animate");
            if (elementId) {
              setAnimatedElements((prev) => new Set(prev).add(elementId));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observe all elements with data-animate attribute
    const elementsToAnimate = document.querySelectorAll("[data-animate]");
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Auto-advance image slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageSlide((prev) => (prev + 1) % imageSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imageSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextImageSlide = () => {
    setCurrentImageSlide((prev) => (prev + 1) % imageSlides.length);
  };

  const prevImageSlide = () => {
    setCurrentImageSlide(
      (prev) => (prev - 1 + imageSlides.length) % imageSlides.length
    );
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f0efe1]">
      {/* Header Navigation */}
      <header className="bg-blue-900 text-white sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
                onClick={() => router.push("/hub")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Find Jobs
              </button>
              <button
                onClick={() => router.push("/about")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
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
                  onClick={() => router.push("/hub")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  Find Jobs
                </button>
                <button
                  onClick={() => router.push("/about")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  About
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  Pricing
                </button>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-white text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight min-h-[80px]">
                  <span className="text-white">{typewriterText}</span>
                  {showCursor && (
                    <span className="animate-pulse text-blue-200">|</span>
                  )}
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Master every interview with AI-powered coaching, real-time
                  feedback, and personalized practice sessions tailored to your
                  career goals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/practice")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-transform"
                  size="lg"
                >
                  {user ? "Go to Interview" : "Get Started"}
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{counter}+</div>
                  <div className="text-blue-200 text-sm">Interviews Practiced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">90%</div>
                  <div className="text-blue-200 text-sm">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-200 text-sm">AI Support</div>
                </div>
              </div>
            </div>

            {/* Image1.jpg moved to right side */}
            <div className="relative lg:pl-8">
              <div className="relative w-full">
                <Image
                  src="/image1.jpg"
                  alt="Interview Coaching Preview"
                  width={500}
                  height={350}
                  className="rounded-lg shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-[#fafaf5] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              data-animate="title"
              className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 transition-transform duration-1000 ${
                animatedElements.has("title")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform -translate-x-12"
              }`}
            >
              Why InterviewIQ?
            </h2>
            <p
              data-animate="subtitle"
              className={`text-xl text-gray-600 transition-transform duration-1000 delay-200 ${
                animatedElements.has("subtitle")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-12"
              }`}
            >
              We are more than Interviews! Professionalism is the key! Secure
              your Job Today!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card
              data-animate="card1"
              className={`text-center p-6 hover:shadow-lg transition-transform duration-1000 delay-300 ${
                animatedElements.has("card1")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform -translate-x-12"
              }`}
            >
              <CardContent className="space-y-4 flex flex-col items-center justify-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-center">AI-Powered Coaching</h3>
                <p className="text-gray-600 text-center">
                  Real-time AI feedback and personalized coaching sessions
                </p>
              </CardContent>
            </Card>

            <Card
              data-animate="card2"
              className={`text-center p-6 hover:shadow-lg transition-transform duration-1000 delay-400 ${
                animatedElements.has("card2")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-12"
              }`}
            >
              <CardContent className="space-y-4 flex flex-col items-center justify-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <ChevronRight className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-center">Practice Real Question</h3>
                <p className="text-gray-600 text-center">
                  Practice role-specific questions based on your dream job — not generic internet lists
                </p>
              </CardContent>
            </Card>

            <Card
              data-animate="card3"
              className={`text-center p-6 hover:shadow-lg transition-transform duration-1000 delay-500 ${
                animatedElements.has("card3")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform -translate-x-12"
              }`}
            >
              <CardContent className="space-y-4 flex flex-col items-center justify-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-center">CV Suggestions That Matter</h3>
                <p className="text-gray-600 text-center">
                  Receive targeted edits to your existing CV — plus a better version, role-matched
                </p>
              </CardContent>
            </Card>

            <Card
              data-animate="card4"
              className={`text-center p-6 hover:shadow-lg transition-transform duration-1000 delay-600 ${
                animatedElements.has("card4")
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-12"
              }`}
            >
              <CardContent className="space-y-4 flex flex-col items-center justify-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-center">Targeted Practice</h3>
                <p className="text-gray-600 text-center">
                  Industry-specific questions and role-based preparation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See InterviewIQ in Action
            </h2>
            <p className="text-xl text-gray-600">
              Discover how our platform transforms interview preparation
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={slide || "/image3.jpg"}
                    alt={`Feature ${index + 1}`}
                    width={1200}
                    height={500}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-transform"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-transform"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-transform ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text after slideshow */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-black">
            We will get you ready!
          </h3>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-8 w-8 text-yellow-500" />
                    <h3 className="text-3xl font-bold text-gray-900">
                      Master Every Interview
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Practice with our AI interviewer, get personalized feedback,
                    and boost your confidence for any job interview.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Real-time AI feedback
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Voice and text practice modes
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        CV optimization tools
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Career insights and tips
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src="/image11.jpg?height=400&width=500&text=AI+Interview+Coach"
                    alt="AI Interview Coach"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-lg"
                  />
                </div>
                <div className="w-full px-0 sm:px-5 lg:px-8 text-center">
                  {user ? (
                    <Button 
                      onClick={() => router.push("/practice")}
                      className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform"
                    >
                      Start Interview
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => router.push("/auth/signup")}
                      className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform"
                    >
                      Sign up for early access
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-black">
            FAQ
          </h2>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentImageSlide * 100}%)`,
                }}
              >
                {imageSlides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <Image
                      src={slide}
                      alt={`Success Story ${index + 1}`}
                      width={800}
                      height={400}
                      className="w-full h-64 md:h-80 lg:h-96 object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <button
                onClick={prevImageSlide}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-transform"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextImageSlide}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-transform"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {imageSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageSlide(index)}
                    className={`w-3 h-3 rounded-full transition-transform ${
                      index === currentImageSlide
                        ? "bg-white scale-125"
                        : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <br></br>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(0)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  Is InterviewIQ just like ChatGPT?
                </span>
                {openFAQ === 0 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 0 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    No. While ChatGPT gives generic answers, InterviewIQ is
                    focused on you — your role, your CV, and your actual
                    responses. It gives structured feedback, realistic scoring,
                    and tailored coaching from your tone, to choosing your
                    preferred AI interview avatar, and more......
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  How does InterviewIQ know what to ask me?
                </span>
                {openFAQ === 1 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 1 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    You simply enter your target job title, and the app pulls in
                    relevant questions and feedback based on real job roles and
                    AI-powered analysis.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  Are there any other features?
                </span>
                {openFAQ === 2 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 2 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    Yes, you even get full career insights, how to start, what
                    to do and real times jobs on our hub page.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  Is this free? Will I need to pay?
                </span>
                {openFAQ === 3 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 3 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    Right now, it's completely free while in early access. We're
                    planning to offer affordable plans soon, with extra features
                    like advanced scoring, voice training, and downloadable
                    portfolios
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 5 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(4)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  Who is this website for?
                </span>
                {openFAQ === 4 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 4 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    Frustrated apprenticeship applicants, recent graduates
                    wanting to pursue dream roles, career switchers wanting to
                    get into a trending job industry, and anyone preparing for
                    interviews in tech, marketing, admin, or remote roles.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 6 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(5)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
              >
                <span className="text-lg font-semibold text-black">
                  What makes this better than interview courses?
                </span>
                {openFAQ === 5 ? (
                  <Minus className="h-6 w-6 text-black" />
                ) : (
                  <Plus className="h-6 w-6 text-black" />
                )}
              </button>
              {openFAQ === 5 && (
                <div className="px-6 py-4 bg-white text-black">
                  <p>
                    InterviewIQ is interactive, personalised, and on-demand. You
                    practice in real time, get instant coaching, and improve
                    every session. No long videos or guesswork. Way more cheaper
                    compared to the thousands you'd waste on static curriculum
                    courses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Motivational Section */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Image - Left Side */}
                <div className="relative order-2 lg:order-1">
                  <Image
                    src="/image8.jpg?height=400&width=500&text=AI+Interview+Coach"
                    alt="AI Interview Coach"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>

                {/* Text Content - Right Side */}
                <div className="space-y-6 order-1 lg:order-2">
                  <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent leading-tight">
                    2025 can be your dream year, but not if you keep doing what
                    didn't work last time....
                  </h2>

                  <div className="space-y-4 text-lg text-gray-700">
                    <div className="flex items-start space-x-3">
                      <span className="font-bold text-2xl text-teal-500 mt-1">•</span>
                      <span>Sign up today,  make a decision you will never regret</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="font-bold text-2xl text-blue-500 mt-1">•</span>
                      <span>Say yes to growth, practice, and preparation that actually sticks</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="font-bold text-2xl text-purple-500 mt-1">•</span>
                      <span>100s are already ahead — don't fall behind again</span>
                    </div>
                  </div>

                  {user && (
                    <div className="pt-6">
                      <Button 
                        onClick={() => router.push("/hub")}
                        className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform"
                      >
                        Get Career Insights
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
