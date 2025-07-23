import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Zap, BarChart, Video, Crown } from "lucide-react"

export default function PricingPage() {
  const freeFeatures = ["Unlimited interview practice", "AI-powered feedback", "CV optimization", "Career insights"]

  const comingSoonFeatures = [
    "Video interview practice",
    "Premium AI coaches",
    "Advanced analytics",
    "Industry-specific prep",
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">InterviewIQ</h1>
        <p className="text-lg text-gray-600">Master every interview – With AI</p>
        <p className="text-gray-500">Choose the perfect plan for your career journey</p>
      </div>

      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-2">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl text-yellow-800">Coming Soon</CardTitle>
          <p className="text-yellow-700">Our pricing plans are launching soon</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2 mb-4">
            <p className="text-sm text-yellow-700">Development Progress</p>
            <Progress value={85} className="h-2" />
            <p className="text-lg font-bold text-yellow-800">85%</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2">
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-800">Free Beta Plan – Full Access</CardTitle>
          <p className="text-green-700">For now, all users get:</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <span>Coming Soon</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comingSoonFeatures.map((feature, index) => {
              const icons = [Video, Crown, BarChart, Zap]
              const Icon = icons[index] || CheckCircle
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{feature}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Beta Access Active</h3>
          <p className="text-blue-700">We'll notify you when pricing launches. Until then, enjoy unlimited access!</p>
        </CardContent>
      </Card>
    </div>
  )
}
