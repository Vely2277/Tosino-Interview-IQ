"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, X, ArrowLeft, Users, Target, Award, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/footer";

export default function AboutPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow images (using image2 for all as placeholder)
  const slides = [
    "/image2.jpg",
    "/image2.jpg", 
    "/image2.jpg",
    "/image2.jpg"
  ];

  // Auto-advance slideshow every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-[#f0efe1]">
      {/* Header Navigation */}
      <header className="bg-blue-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                About
              </a>
              <button
                onClick={() => router.push("/hub")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Find Jobs
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
                    className="bg-white text-blue-600 hover:bg-gray-100"
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
                  About
                </a>
                <button
                  onClick={() => router.push("/hub")}
                  className="text-gray-300 hover:text-white px-3 py-2 text-left"
                >
                  Find Jobs
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
                        className="bg-white text-blue-600 hover:bg-gray-100"
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
      <section className="relative h-96 overflow-hidden">
        <Image
          src="/image2.jpg"
          alt="About Us Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center space-y-4 text-white">
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
              About <span className="text-blue-200">Us</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Learn more about InterviewIQ and our mission to help you succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Success Priority Text */}
      <section className="py-8 bg-[#f0efe1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Your success is our priority...
          </h2>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="py-8 bg-[#f0efe1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={slide}
                    alt={`About ${index + 1}`}
                    width={1200}
                    height={400}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-800 rotate-180" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Who are we? Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center space-x-3">
                  <Users className="h-6 w-6" />
                  <span>Who are we?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="text-gray-600 leading-relaxed space-y-3 list-disc list-inside">
                  <li>AI-powered platform revolutionizing interview preparation</li>
                  <li>Team of passionate developers, career coaches, and industry experts</li>
                  <li>Understanding modern job hunting challenges</li>
                  <li>Bridging the gap between job seekers and dream careers</li>
                  <li>Intelligent tools that adapt to your unique needs</li>
                  <li>Building confidence for any interview scenario</li>
                </ul>
              </CardContent>
            </Card>

            {/* What do we do? Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="flex items-center space-x-3">
                  <Target className="h-6 w-6" />
                  <span>What do we do?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="text-gray-600 leading-relaxed space-y-3 list-disc list-inside">
                  <li>AI-powered mock interviews with personalized feedback</li>
                  <li>CV optimization and enhancement tools</li>
                  <li>Real-time job market insights and opportunities</li>
                  <li>Practice sessions tailored to specific roles and industries</li>
                  <li>Progress tracking to monitor your improvement</li>
                  <li>Adaptive tools for all experience levels and career goals</li>
                </ul>
              </CardContent>
            </Card>

            {/* Why choose us? Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center space-x-3">
                  <Award className="h-6 w-6" />
                  <span>Why choose us?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="text-gray-600 leading-relaxed space-y-3 list-disc list-inside">
                  <li>Core features completely free to access</li>
                  <li>Premium options available at incredibly low costs</li>
                  <li>AI technology provides personalized feedback</li>
                  <li>Available 24/7 with unlimited practice sessions</li>
                  <li>Continuously updated with latest interview trends</li>
                  <li>More affordable than expensive coaching services</li>
                  <li>Convenient and effective interview preparation</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Image and Success Text Section */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <Image
              src="/image2.jpg"
              alt="We will make it happen"
              width={600}
              height={400}
              className="rounded-lg shadow-lg mx-auto"
            />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              We will make it happen...
            </h2>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
