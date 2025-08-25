"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/footer";
import {
  CheckCircle,
  Clock,
  Zap,
  BarChart,
  Video,
  Crown,
  Menu,
  X,
  Star,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";

export default function PricingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const freeFeatures = [
    "Unlimited interview practice",
    "AI-powered feedback",
    "CV optimization",
    "Career insights",
  ];

  const comingSoonFeatures = [
    "Video interview practice",
    "Premium AI coaches",
    "Advanced analytics",
    "Industry-specific prep",
  ];

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
              <button
                onClick={() => router.push("/practice")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                Practice
              </button>
              <a href="#" className="text-white dark:text-blue-100 font-semibold">
                Pricing
              </a>
              <button
                onClick={() => router.push("/about")}
                className="text-gray-300 dark:text-blue-200 hover:text-white transition-colors"
              >
                About
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
                <button
                  onClick={() => router.push("/practice")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  Practice
                </button>
                <a href="#" className="text-white dark:text-blue-100 font-semibold px-3 py-2">
                  Pricing
                </a>
                <button
                  onClick={() => router.push("/about")}
                  className="text-gray-300 dark:text-blue-200 hover:text-white px-3 py-2 text-left"
                >
                  About
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

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src="/image25.jpg"
          alt="Pricing Background"
          fill
          className="object-cover dark:opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70"></div>
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
              InterviewIQ <span className="text-blue-200 dark:text-blue-400">Pricing</span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              Master every interview – With AI
            </p>
            <p className="text-lg text-blue-200 dark:text-blue-300">
              Choose the perfect plan for your career journey
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
  <section className="py-12 bg-[#f0efe1] dark:bg-[#181a20]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Coming Soon Card */}
            <Card className="border-2 border-yellow-200 dark:border-yellow-900 bg-white dark:bg-[#23263a] shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-[#23263a] dark:to-[#23263a] text-white">
                <div className="mx-auto bg-yellow-400 dark:bg-yellow-900 p-3 rounded-full w-fit mb-2">
                  <Clock className="h-8 w-8 text-yellow-800 dark:text-yellow-200" />
                </div>
                <CardTitle className="text-2xl dark:text-yellow-100">Coming Soon</CardTitle>
                <p className="text-yellow-100 dark:text-yellow-200">
                  Our pricing plans are launching soon
                </p>
              </CardHeader>
              <CardContent className="text-center p-8">
                <div className="space-y-4 mb-6">
                  <p className="text-lg font-semibold text-gray-700 dark:text-yellow-100">
                    Development Progress
                  </p>
                  <Progress value={85} className="h-3" />
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-200">85%</p>
                </div>
              </CardContent>
            </Card>

            {/* Free Beta Plan Card */}
            <Card className="border-2 border-green-200 dark:border-green-900 bg-white dark:bg-[#23263a] shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 dark:from-[#23263a] dark:to-[#23263a] text-white">
                <div className="mx-auto bg-green-500 dark:bg-green-900 p-3 rounded-full w-fit mb-2">
                  <Zap className="h-8 w-8 text-white dark:text-green-200" />
                </div>
                <CardTitle className="text-2xl dark:text-green-100">
                  Free Beta Plan – Full Access
                </CardTitle>
                <p className="text-green-100 dark:text-green-200">For now, all users get:</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <span className="text-lg text-gray-700 dark:text-green-100">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Coming Soon */}
            <Card className="bg-white dark:bg-[#23263a] shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-[#23263a] dark:to-[#23263a] text-white">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl dark:text-purple-100">
                  <Crown className="h-8 w-8 text-purple-200 dark:text-purple-300" />
                  <span>Premium Features Coming Soon</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {comingSoonFeatures.map((feature, index) => {
                    const icons = [Video, Crown, BarChart, Zap];
                    const Icon = icons[index] || CheckCircle;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-purple-500 dark:text-purple-300" />
                        <span className="text-lg text-gray-700 dark:text-purple-100">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Beta Access Notice */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#23263a] dark:to-[#23263a] border-2 border-blue-200 dark:border-blue-900 shadow-lg">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
                  Beta Access Active
                </h3>
                <p className="text-lg text-blue-700 dark:text-blue-200 mb-6">
                  We'll notify you when pricing launches. Until then, enjoy
                  unlimited access!
                </p>
                <Button
                  className="bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-8 py-3 text-lg"
                  onClick={() => router.push("/practice")}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
