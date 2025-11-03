"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function InterviewPreferencesPage() {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewFrequency, setInterviewFrequency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!interviewDate || !interviewFrequency) {
      setError('Please select both interview date and frequency');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewDate,
          interviewFrequency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSuccess(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip this step and go directly to home
    router.push('/');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5dc" }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-700">Preferences Saved!</h2>
              <p className="text-gray-600">
                Your interview preferences have been saved successfully. Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f5dc" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Set Your Interview Preferences
          </CardTitle>
          <CardDescription className="text-gray-600">
            Help us personalize your interview practice experience by selecting your target interview date and practice frequency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="interviewDate" className="text-sm font-medium text-gray-700">
                Target Interview Date
              </Label>
              <Input
                id="interviewDate"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={today}
                className="w-full"
                placeholder="Select your interview date"
              />
              <p className="text-xs text-gray-500">
                Choose the date you're preparing for, or your next planned interview
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewFrequency" className="text-sm font-medium text-gray-700">
                Practice Frequency
              </Label>
              <Select value={interviewFrequency} onValueChange={setInterviewFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="How often do you plan to practice?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily - Practice every day</SelectItem>
                  <SelectItem value="weekly">Weekly - Practice once a week</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly - Practice twice a week</SelectItem>
                  <SelectItem value="monthly">Monthly - Practice once a month</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                We'll use this to create a personalized practice schedule
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences & Continue'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}