"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cvAPI } from "@/lib/api";
import {
  FileText,
  Upload,
  Wrench,
  Sparkles,
  Menu,
  X,
  Star,
  ArrowLeft,
} from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import Image from "next/image";

export default function CvPage() {
  const router = useRouter();
  const [cvText, setCvText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleOptimizeCV = async () => {
    if (!cvText.trim() && !selectedFile) {
      alert("Please paste CV text or upload a file");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setOptimizationResult(null);

    try {
      const data = await cvAPI.optimize(
        cvText.trim() || undefined,
        selectedFile || undefined
      );
      setOptimizationResult(data.optimization);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsOptimizing(false);
    }
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
                CV Optimizer
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
                  CV Optimizer
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

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src="/image23.jpg"
          alt="CV Optimizer Background"
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
              CV <span className="text-blue-200">Optimizer</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              AI-powered CV optimization to help you land your dream job
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Enhanced CV Upload Section */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Optimize Your CV with AI
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI-powered CV optimizer analyzes your resume and provides
                personalized recommendations to improve your chances of landing
                interviews.
              </p>
            </div>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Option 1: Paste CV Text</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="cvText">Paste your CV text here</Label>
                  <Textarea
                    id="cvText"
                    placeholder="Paste your CV content here..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    rows={8}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Option 2: Upload File</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="cvFile">Upload CV file</Label>
                  <Input
                    id="cvFile"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="border-green-200 focus:border-green-400"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>Selected: {selectedFile?.name}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleOptimizeCV}
                disabled={isOptimizing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6 shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Wrench className="mr-2 h-5 w-5" />
                {isOptimizing ? "Optimizing CV..." : "Optimize CV with AI"}
              </Button>

              <Button
                onClick={() => router.push("/create-cv")}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg py-6 shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create New CV
              </Button>
            </div>

            {optimizationResult && (
              <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Optimization Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownToHTML(optimizationResult || ""),
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-red-50 to-orange-50">
                <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
                  <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
