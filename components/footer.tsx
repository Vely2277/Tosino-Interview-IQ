"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
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
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Transform your interview skills with cutting-edge AI technology
              and land your dream job.
            </p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
              ))}
              <span className="text-gray-600 dark:text-gray-300 ml-2">
                4.9/5 from Satisfied users
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>Finding Jobs</li>
              <li>AI-Powered Mock Interviews</li>
              <li>Personalized Feedback System</li>
              <li>Industry-Specific Questions</li>
              <li>Performance Analytics</li>
              <li>Real-Time Feedback</li>
              <li>Professional CV Optimization</li>
              <li>Comprehensive Job-based CV Creation</li>
              <li>Career Guidance</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <button
                  onClick={() => router.push("/about")}
                  className="hover:text-blue-700 dark:hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/hub")}
                  className="hover:text-blue-700 dark:hover:text-white transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/pricing")}
                  className="hover:text-blue-700 dark:hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Success Stories</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Join thousands of professionals who have successfully landed
              their dream jobs using InterviewIQ.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            © 2025 InterviewIQ. All rights reserved. Empowering careers
            through intelligent interview preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
