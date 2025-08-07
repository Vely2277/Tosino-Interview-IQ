"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SharedNavigationProps {
  currentPage?: string;
}

export default function SharedNavigation({ currentPage }: SharedNavigationProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Home", path: "/", key: "home" },
    { label: "Practice", path: "/practice", key: "practice" },
    { label: "About", path: "/about", key: "about" },
    { label: "Find Jobs", path: "/hub", key: "hub" },
  ];

  return (
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
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => item.path !== "#" && router.push(item.path)}
                className={`transition-colors ${
                  currentPage === item.key
                    ? "text-white font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
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
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.path !== "#") router.push(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-left transition-colors ${
                    currentPage === item.key
                      ? "text-white font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex space-x-3 px-3 pt-3 border-t border-blue-800">
                {user ? (
                  <Button
                    variant="ghost"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-blue-800"
                      size="sm"
                      onClick={() => {
                        router.push("/auth/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      size="sm"
                      onClick={() => {
                        router.push("/auth/signup");
                        setMobileMenuOpen(false);
                      }}
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
  );
}
