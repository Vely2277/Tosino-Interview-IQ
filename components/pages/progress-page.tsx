"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { progressAPI } from "@/lib/api";

export default function ProgressPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dynamic user data state
  const [userStats, setUserStats] = useState({
    questionsAnswered: 0,
    completedInterviews: 0,
    totalInterviews: 0,
    completionRate: 0,
    averageScore: 0
  });
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Slideshow images
  const slides = [
    "/image18.jpg",
    "/image13.jpg",
    "/image14.jpg",
    "/image15.jpg",
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fetch user progress data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch user statistics
        const stats = await progressAPI.getStats();
        setUserStats(stats);

        // Fetch interview history
        const history = await progressAPI.getHistory();
        setInterviewHistory(history);

        // Generate performance data based on history
        const performanceChartData = generatePerformanceData(Array.isArray(history) ? history : []);
        setPerformanceData(performanceChartData);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Helper function to generate performance data for chart
  const generatePerformanceData = (history: any[]) => {
    if (!history || history.length === 0) return [];
    // Only show the last 10 points, label as S1, S2, ...
    const last10 = history.slice(-10);
    return last10.map((entry, idx) => ({
      label: `S${idx + 1}`,
      score: entry.score,
      created_at: entry.created_at
    }));
  };

  // Helper function to format user join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Dynamic stats based on user data
  const stats = [
    {
      label: "Total Sessions",
      value: loading ? "..." : userStats.totalInterviews.toString(),
      icon: Clock,
      color: "blue",
      bgColor: "bg-blue-100",
    },
    {
      label: "Overall Score",
      value: loading ? "..." : `${userStats.averageScore}%`,
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-100",
    },
    {
      label: "Questions Answered",
      value: loading ? "..." : userStats.questionsAnswered.toString(),
      icon: Users,
      color: "purple",
      bgColor: "bg-purple-100",
    },
    {
      label: "Completed",
      value: loading ? "..." : userStats.completedInterviews.toString(),
      icon: CheckCircle,
      color: "orange",
      bgColor: "bg-orange-100",
    },
  ];

  // Dynamic job history data (will be replaced with interview history)
  const jobHistory = interviewHistory.map((interview: any) => ({
    title: interview.job_title && interview.job_title.trim() !== '' ? interview.job_title : 'Interview Session',
    sessions: 1,
    date: new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    score: interview.score ? `${interview.score}%` : "In Progress",
    id: interview.id,
    status: 'completed'
  }));

  // Chart data for performance over time (dynamic)
  const chartData = performanceData.length > 0
    ? performanceData.map((data, index) => ({
        session: index + 1,
        score: data.score,
        label: data.label
      }))
    : [
        { session: 1, score: 0, label: 'S1' }
      ];

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
                Progress
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
                  Progress
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
          src="/image16.jpg"
          alt="Progress Background"
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
              My <span className="text-blue-200">Progress</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Track your interview performance and improvement over time
            </p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-6 bg-[#f0efe1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="animate-pulse">Welcome back...</span>
              ) : (
                `Welcome back, ${user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}`
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={slide}
                    alt={`Progress ${index + 1}`}
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
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                      <p className="text-red-600">{error}</p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
                        size="sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Profile Card */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {/* Profile Picture */}
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-blue-200">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    
                    {/* User Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </h3>
                    
                    {/* Join Date */}
                    <p className="text-gray-600 text-lg">
                      Joined {formatJoinDate(user?.created_at)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`${stat.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}
                      >
                        <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm font-semibold text-gray-600 leading-tight">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Performance Chart */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8" />
                  <span>Performance Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                ) : chartData.length === 1 && chartData[0].score === 0 ? (
                  <div className="text-center py-16">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Performance Data</h3>
                    <p className="text-gray-500">Complete more interviews to see your progress chart</p>
                  </div>
                ) : (
                  <div className="relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="40"
                          y1={160 - y * 1.2}
                          x2="360"
                          y2={160 - y * 1.2}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Y-axis labels */}
                      {[0, 25, 50, 75, 100].map((y) => (
                        <text
                          key={y}
                          x="30"
                          y={165 - y * 1.2}
                          fontSize="12"
                          fill="#6b7280"
                          textAnchor="end"
                        >
                          {y}%
                        </text>
                      ))}

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>

                      {/* Chart line */}
                      {chartData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={chartData
                            .map(
                              (point, index) =>
                                `${60 + index * (280 / Math.max(chartData.length - 1, 1))},${160 - point.score * 1.2}`
                            )
                            .join(" ")}
                        />
                      )}

                      {/* Data points */}
                      {chartData.map((point, index) => (
                        <g key={index}>
                          <circle
                            cx={60 + index * (280 / Math.max(chartData.length - 1, 1))}
                            cy={160 - point.score * 1.2}
                            r="6"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="3"
                          />
                          {/* Score label on hover */}
                          <text
                            x={60 + index * (280 / Math.max(chartData.length - 1, 1))}
                            y={145 - point.score * 1.2}
                            fontSize="10"
                            fill="#374151"
                            textAnchor="middle"
                            className="opacity-75"
                          >
                            {point.score}%
                          </text>
                        </g>
                      ))}

                      {/* X-axis labels */}
                      {chartData.map((point, index) => (
                        <text
                          key={index}
                          x={60 + index * (280 / Math.max(chartData.length - 1, 1))}
                          y="185"
                          fontSize="12"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {point.label}
                        </text>
                      ))}
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job History */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardTitle className="text-2xl font-bold">
                  Interview History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex justify-between items-center p-6 bg-gray-100 rounded-xl">
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-300 rounded w-32"></div>
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-4 bg-gray-300 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Interviews Yet</h3>
                    <p className="text-gray-500 mb-6">Start your first interview to see your history here</p>
                    <Button 
                      onClick={() => router.push('/practice')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Start First Interview
                    </Button>
                  </div>
                ) : (
                  jobHistory.map((job: any, index: number) => (
                    <div
                      key={job.id || index}
                      className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-all cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                      onClick={() => {
                        if (job.id) {
                          router.push(`/interviews/${job.id}`);
                        }
                      }}
                    >
                      <div className="space-y-1">
                        <span className="text-xl font-bold text-gray-900">
                          {job.title}
                        </span>
                        <p className="text-sm text-gray-600">{job.date}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          {job.status === 'completed' ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`text-2xl font-bold ${job.score !== 'In Progress' ? 'text-green-600' : 'text-orange-600'}`}>
                          {job.score}
                        </div>
                        <div className="text-sm text-gray-600">
                          {job.sessions} session{job.sessions !== 1 ? 's' : ''}
                        </div>
                        {job.id && (
                          <div className="text-xs text-blue-500 hover:text-blue-700">
                            Click to review →
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Motivational Section */}
            <div className="text-center space-y-4">
              <div className="relative w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  We will get there!
                </h2>
                <br></br>
                <Image
                  src="/image17.jpg"
                  alt="Motivational Image"
                  width={800}
                  height={400}
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
