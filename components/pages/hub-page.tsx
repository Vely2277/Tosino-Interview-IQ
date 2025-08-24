"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hubAPI } from "@/lib/api";
import Footer from "@/components/footer";
import {
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Menu,
  X,
  Star,
  ArrowLeft,
} from "lucide-react";
import { renderMarkdownToHTML } from "@/lib/markdown";
import DOMPurify from "dompurify";
import Image from "next/image";

// High-ranking careers for quick select
const TOP_CAREERS = [
  "Graphic Designer",
  "Website Developer",
  "AI Developer",
  "Cybersecurity",
  "Youtube Creator",
  "Digital Marketing"
];

// Autocomplete options
const CAREER_OPTIONS = [
"Graphic Designer",
"Website Developer",
"AI Developer",
"Content Creator",
"Mechanical Engineer",
"Medical Practitioner",
"Data Analyst",
"Software Engineer",
"Product Manager",
"Digital Marketer",
"Civil Engineer",
"UX/UI Designer",
"Financial Analyst",
"Project Manager",
"Business Analyst",
"Cybersecurity Specialist",
"Cloud Architect",
"Mobile App Developer",
"Network Engineer",
"Teacher",
"Nurse",
"Pharmacist",
"Accountant",
"Sales Manager",
"HR Specialist",
"Copywriter",
"Social Media Manager",
"Video Editor",
"Research Scientist",
"Legal Advisor",
"Operations Manager",
"Data Scientist",
"DevOps Engineer",
"Electrical Engineer",
"Architect",
"Interior Designer",
"Game Developer",
"Full Stack Developer",
"Front End Developer",
"Back End Developer",
"Machine Learning Engineer",
"Blockchain Developer",
"Robotics Engineer",
"Biomedical Engineer",
"Chemical Engineer",
"Petroleum Engineer",
"Aerospace Engineer",
"Automotive Engineer",
"Environmental Scientist",
"Geologist",
"Biotechnologist",
"Astrophysicist",
"Statistician",
"Mathematician",
"Physicist",
"Chemist",
"Biologist",
"Microbiologist",
"Epidemiologist",
"Doctor",
"Surgeon",
"Dentist",
"Veterinarian",
"Radiologist",
"Psychologist",
"Psychiatrist",
"Therapist",
"Occupational Therapist",
"Physical Therapist",
"Dietitian",
"Nutritionist",
"Paramedic",
"Lab Technician",
"Phlebotomist",
"Anesthesiologist",
"Cardiologist",
"Dermatologist",
"Oncologist",
"Pediatrician",
"Optometrist",
"Ophthalmologist",
"Flight Attendant",
"Pilot",
"Air Traffic Controller",
"Aircraft Mechanic",
"Logistics Manager",
"Supply Chain Analyst",
"Warehouse Manager",
"Procurement Specialist",
"Transportation Planner",
"Customs Officer",
"Maritime Engineer",
"Marine Biologist",
"Fisheries Scientist",
"Teacher Assistant",
"Professor",
"Lecturer",
"Research Fellow",
"Education Consultant",
"School Principal",
"Curriculum Developer",
"Instructional Designer",
"Special Education Teacher",
"Librarian",
"Book Editor",
"Journalist",
"Reporter",
"News Anchor",
"Radio Host",
"Podcaster",
"TV Producer",
"Film Director",
"Screenwriter",
"Sound Engineer",
"Lighting Technician",
"Actor",
"Musician",
"Singer",
"Music Producer",
"DJ",
"Photographer",
"Illustrator",
"Animator",
"Motion Graphics Designer",
"Art Director",
"Fashion Designer",
"Makeup Artist",
"Hairstylist",
"Model",
"Event Planner",
"Wedding Planner",
"Chef",
"Cook",
"Baker",
"Pastry Chef",
"Barista",
"Bartender",
"Waiter",
"Hotel Manager",
"Tour Guide",
"Travel Agent",
"Real Estate Agent",
"Property Manager",
"Construction Manager",
"Surveyor",
"Plumber",
"Electrician",
"Carpenter",
"Welder",
"Machinist",
"Truck Driver",
"Bus Driver",
"Taxi Driver",
"Rideshare Driver",
"Security Guard",
"Police Officer",
"Detective",
"Firefighter",
"Military Officer",
"Soldier",
"Border Patrol Agent",
"Immigration Officer",
"Lawyer",
"Judge",
"Paralegal",
"Legal Secretary",
"Compliance Officer",
"Auditor",
"Tax Consultant",
"Investment Banker",
"Financial Planner",
"Stockbroker",
"Insurance Agent",
"Loan Officer",
"Credit Analyst",
"Risk Manager",
"Economist",
"Entrepreneur",
"Startup Founder",
"Venture Capital Analyst",
"Business Consultant",
"Customer Support Specialist",
"Call Center Agent",
"Technical Support Engineer",
"IT Support Specialist",
"Systems Administrator",
"Database Administrator",
"Game Tester",
"QA Engineer",
"Tester",
"Automation Engineer",
"Robotics Technician",
"Drone Operator",
"3D Printing Specialist",
"Ethical Hacker",
"Penetration Tester",
"SEO Specialist",
"SEM Specialist",
"E-commerce Manager",
"Affiliate Marketer",
"Brand Manager",
"Community Manager",
"Influencer Manager",
"Content Strategist",
"Technical Writer",
"Grant Writer",
"Speechwriter",
"Translator",
"Interpreter",
"Tourism Manager",
"Sports Coach",
"Athlete",
"Fitness Trainer",
"Yoga Instructor",
"Martial Arts Instructor",
"Swimming Coach",
"Gym Manager",
"Choreographer",
"Dancer",
"Life Coach",
"Career Coach",
"Motivational Speaker",
"Politician",
"Government Officer",
"Public Relations Specialist",
"Policy Analyst",
"Urban Planner",
"NGO Manager",
"Humanitarian Worker",
"Social Worker",
"Childcare Worker",
"Elder Care Specialist",
"Volunteer Coordinator",
"Park Ranger",
"Zookeeper",
"Wildlife Biologist",
"Conservationist",
"Forester",
"Farmer",
"Agronomist",
"Agricultural Engineer",
"Food Scientist",
"Food Safety Inspector",
"Brewer",
"Winemaker",
"Sommelier",
"Fisherman",
"Miner",
"Oil Rig Worker",
"Ship Captain",
"Sailor",
"Dock Worker",
"Crane Operator",
"Forklift Operator",
"Factory Worker",
"Assembly Line Worker",
"Quality Control Inspector",
"Production Supervisor",
"Manufacturing Engineer",
"Industrial Designer",
"Supply Chain Manager",
"Operations Analyst",
"Business Development Manager",
"Partnership Manager",
"Account Manager",
"Key Account Executive",
"Territory Sales Manager",
"Retail Manager",
"Store Supervisor",
"Cashier",
"Customer Experience Manager",
"Merchandiser",
"Inventory Clerk",
"Visual Merchandiser",
"Franchise Owner",
"Restaurant Manager",
"Fast Food Worker",
"Housekeeper",
"Janitor",
"Maintenance Worker",
"Gardener",
"Landscaper",
"Groundskeeper",
"Florist",
"Veterinary Technician",
"Animal Trainer",
"Pet Groomer",
"Dog Walker",
"Pet Sitter",
"Event Coordinator",
"Stage Manager",
"Theater Director",
"Costume Designer",
"Set Designer",
"Prop Master",
"Lighting Designer",
"Voice Actor",
"Audiobook Narrator",
"Video Game Voice Artist",
"Cartoonist",
"Comic Book Artist",
"Tattoo Artist",
"Painter",
"Sculptor",
"Potter",
"Craftsperson",
"Leatherworker",
"Jeweler",
"Goldsmith",
"Watchmaker",
"Blacksmith",
"Glassblower",
"Sign Painter",
"Calligrapher",
"Archivist",
"Historian",
"Anthropologist",
"Archaeologist",
"Sociologist",
"Political Scientist",
"Geographer",
"Climatologist",
"Oceanographer",
"Volcanologist",
"Meteorologist",
"Seismologist",
"Hydrologist",
"Ecologist",
"Geneticist",
"Immunologist",
"Virologist",
"Pathologist",
"Hematologist",
"Neuroscientist",
"Philosopher",
"Theologian",
"Priest",
"Pastor",
"Imam",
"Rabbi",
"Monk",
"Missionary",
"Spiritual Counselor",
"Astrologer",
"Tarot Reader",
"Fortune Teller",
"Life Sciences Teacher",
"Math Teacher",
"History Teacher",
"Chemistry Teacher",
"Physics Teacher",
"Language Teacher",
"Computer Science Teacher",
"Driving Instructor",
"Music Teacher",
"Art Teacher",
"Craft Teacher",
"Diving Instructor",
"Ski Instructor",
"Surf Instructor",
"Flight Instructor",
"Dog Trainer",
"Horse Trainer",
"Stable Manager",
"Jockey",
"Race Car Driver",
"Mechanic",
"Auto Body Technician",
"Motorcycle Mechanic",
"Bicycle Repair Technician",
"Watch Repairer",
"Locksmith",
"Shoemaker",
"Tailor",
"Seamstress",
"Fashion Stylist",
"Personal Shopper",
"Image Consultant",
"Personal Assistant",
"Executive Assistant",
"Secretary",
"Receptionist",
"Office Clerk",
"Data Entry Clerk",
"File Clerk",
"Courier",
"Mail Carrier",
"Postal Worker",
"Delivery Driver",
"Warehouse Worker",
"Package Handler",
"Logistics Coordinator",
"Supply Officer"
];

function stripHTML(html: string): string {
  const cleanHTML = DOMPurify.sanitize(html);
  const doc = new DOMParser().parseFromString(cleanHTML, "text/html");
  return doc.body.textContent || "";
}

export default function HubPage() {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredCareers, setFilteredCareers] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [jobResults, setJobResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);
    setJobResults([]);

    let userLocation = "Remote"; //fallback for userLocation incase ip geolocation fails
    let userCountry = "gb"; // fallback for country incase ip geolocation fails

    try {
      // Step 1: Detect user location via IP
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.city) {
          userLocation = geo.city;
        } else if (geo.region) {
          userLocation = geo.region;
        } else if (geo.country_name) {
          userLocation = geo.country_name;
        }
        if (geo?.country_code) {
          userCountry = geo.country_code.toLowerCase();
        }
      }
    } catch (err) {
      console.warn("🌍 Location detection failed:", err);
      // location stays "Remote"
    }

    try {
      // Step 2: Fetch Insights
      const insightsData = await hubAPI.getInsights(searchQuery);
      setInsights(insightsData);

      // Step 3: Fetch Job Search Results
      const searchData = await hubAPI.search(
        searchQuery,
        userLocation,
        "All levels",
        "Full-time"
      );

      setJobResults(searchData.jobs || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
      setShowAutocomplete(false);
    }
  };

  // Handle input change for autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = CAREER_OPTIONS.filter((career) =>
        career.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCareers(filtered.slice(0, 6));
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Handle selecting an autocomplete option
  const handleAutocompleteSelect = (career: string) => {
    setSearchQuery(career);
    setShowAutocomplete(false);
    handleSearch();
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
                Career Hub
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
                  Career Hub
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
          src="/image24.jpg"
          alt="Career Hub Background"
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
              Career <span className="text-blue-200">Hub</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get AI-powered insights into the job market for any role.
            </p>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Apply for real-time jobs!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-[#f0efe1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Search Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Type any role (e.g. Data Analyst, Software Engineer, Product Manager)"
                      value={searchQuery}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => {
                        if (searchQuery.length > 0 && filteredCareers.length > 0) setShowAutocomplete(true);
                      }}
                      onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                      className="w-full text-lg py-3 border-2 border-gray-300 focus:border-blue-500"
                    />
                    {showAutocomplete && filteredCareers.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 max-h-56 overflow-y-auto">
                        {filteredCareers.map((career) => (
                          <div
                            key={career}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-100 flex items-center justify-between"
                            onMouseDown={() => handleAutocompleteSelect(career)}
                          >
                            <span>{career}</span>
                            <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-3"
                    size="icon"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
                {/* High Ranking Careers Quick Select */}
                <div className="flex flex-wrap gap-3 mt-6 mb-2">
                  {TOP_CAREERS.map((career) => (
                    <button
                      key={career}
                      type="button"
                      className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-full shadow-sm border border-blue-200 transition-all text-base font-medium"
                      onClick={() => {
                        setSearchQuery(career);
                        setShowAutocomplete(false);
                        handleSearch();
                      }}
                    >
                      <span>{career}</span>
                      <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">
                    Fetching career insights and job listings...
                  </p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {insights && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Market Overview: {insights.role}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold text-green-800">
                          Market Demand
                        </p>
                        <p className="text-green-600">
                          {insights.marketDemand}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <p className="font-semibold text-blue-800">
                          Salary Range
                        </p>
                        <p className="text-blue-600 text-sm">
                          {insights.averageSalary}
                        </p>
                      </div>
                    </div>
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownToHTML(insights.summary),
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.commonRequirements.map(
                        (req: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">{req}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {jobResults.length > 0 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span>Job Listings for "{searchQuery}"</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4"></div>
                    {jobResults.map((job, index) => {
                      const jobLink =
                        job.applyLink || job.url || job.link || job.jobUrl;
                      const safeDescription = stripHTML(job.description || "");

                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <h2 className="text-xl font-bold text-gray-900">
                            {job.title}
                          </h2>

                          <p className="text-gray-800 font-semibold">
                            {job.company} &bull; {job.location}
                          </p>

                          {job.salary && (
                            <p className="text-blue-600 font-medium">
                              {job.salary}
                            </p>
                          )}

                          {safeDescription && (
                            <p className="text-gray-700 text-sm">
                              {safeDescription.slice(0, 150)}
                              {safeDescription.length > 150 ? "…" : ""}
                            </p>
                          )}

                          {jobLink && (
                            <a
                              href={jobLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Apply
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
