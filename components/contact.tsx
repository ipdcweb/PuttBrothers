"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, MessageSquare, Shield, ChevronDown, X, Building2, Briefcase } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    FindUs: "",
    FindUsOther: "",
    industry: "",
    businessStatus: "", // Added businessStatus field
    message: "",
  })

  const [focusedField, setFocusedField] = useState("")
  const [messageCharCount, setMessageCharCount] = useState(0)
  const [captchaNum1, setCaptchaNum1] = useState(0)
  const [captchaNum2, setCaptchaNum2] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaError, setCaptchaError] = useState(false)
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [showFindUsInfo, setShowFindUsInfo] = useState(false)

  // Generate random CAPTCHA numbers on mount
  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1)
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1)
  }, [])

  // Validate CAPTCHA
  useEffect(() => {
    if (captchaAnswer !== "" && Number.parseInt(captchaAnswer) === captchaNum1 + captchaNum2) {
      setIsCaptchaValid(true)
      setCaptchaError(false)
    } else {
      setIsCaptchaValid(false)
    }
  }, [captchaAnswer, captchaNum1, captchaNum2])

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (field === "message") {
      setMessageCharCount(value.length)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCaptchaValid) {
      setCaptchaError(true)
      return
    }

    const findUs = formData.FindUs === "Others" ? formData.FindUsOther : formData.FindUs
    const subject = `Website enquiry from ${formData.firstName} ${formData.lastName}`
    const body = [
      `Name: ${formData.firstName} ${formData.lastName}`,
      `Email: ${formData.email}`,
      `Mobile: ${formData.mobile}`,
      `How they found us: ${findUs}`,
      `Industry: ${formData.industry}`,
      `Business status: ${formData.businessStatus}`,
      "",
      "Message:",
      formData.message,
    ].join("\n")

    window.location.href = `mailto:sales@puttbrothers.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="contact" className="py-20 lg:py-32" style={{ backgroundColor: "#ffcc00" }}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance text-primary" style={{ color: "#512bb2" }}>
              Contact Us
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-pretty" style={{ color: "#41059a" }}>
              Have questions or need more information? Reach out to us today. We're here to help you plan your next
              mini-golf adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-base">First Name *</label>
                    <Input
                      required
                      placeholder="John"
                      className="w-full h-12 placeholder:text-gray-300"
                      value={formData.firstName}
                      maxLength={50}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                    {focusedField === "firstName" && (
                      <div className="text-sm text-gray-500 mt-1">{formData.firstName.length} / 50 Characters</div>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-base">Last Name *</label>
                    <Input
                      required
                      placeholder="Tonsic"
                      className="w-full h-12 placeholder:text-gray-300"
                      value={formData.lastName}
                      maxLength={100}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                    {focusedField === "lastName" && (
                      <div className="text-sm text-gray-500 mt-1">{formData.lastName.length} / 100 Characters</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-base">Mobile *</label>
                    <PhoneInput
                      required
                      value={formData.mobile}
                      onChange={(value) => handleInputChange("mobile", value)}
                      onFocus={() => setFocusedField("mobile")}
                      onBlur={() => setFocusedField("")}
                    />
                    {focusedField === "mobile" && (
                      <div className="text-sm text-gray-500 mt-1">{formData.mobile.length} / 15 Characters</div>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-base">Email *</label>
                    <Input
                      type="email"
                      required
                      placeholder="John@puttbrothers.co.nz"
                      className="w-full h-12 placeholder:text-gray-300"
                      value={formData.email}
                      maxLength={100}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                    {focusedField === "email" && (
                      <div className="text-sm text-gray-500 mt-1">{formData.email.length} / 100 Characters</div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center mb-2">
                    <Search className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label htmlFor="FindUs" className="block font-medium text-gray-700 text-base">
                      How did you find us? *
                    </label>
                  </div>
                  <select
                    id="FindUs"
                    name="FindUs"
                    required
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm"
                    value={formData.FindUs}
                    onChange={(e) => handleInputChange("FindUs", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Cinema Advertising">Cinema Advertising</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Flyers">Flyers</option>
                    <option value="Friends">Friends</option>
                    <option value="Global Events">Global Events</option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Market Place">Market Place</option>
                    <option value="Radio Advertising">Radio Advertising</option>
                    <option value="TV Advertising">TV Advertising</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Others">Others</option>
                  </select>
                  {formData.FindUs === "Others" && (
                    <div className="mt-4">
                      <label htmlFor="FindUsOther" className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify: *
                      </label>
                      <Input
                        id="FindUsOther"
                        name="FindUsOther"
                        required
                        className="w-full h-12"
                        value={formData.FindUsOther}
                        maxLength={15}
                        onFocus={() => setFocusedField("FindUsOther")}
                        onBlur={() => setFocusedField("")}
                        onChange={(e) => handleInputChange("FindUsOther", e.target.value)}
                      />
                      {focusedField === "FindUsOther" && (
                        <div className="text-sm text-gray-500 mt-1">{formData.FindUsOther.length} / 15 Characters</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label htmlFor="industry" className="block font-medium text-gray-700 text-base">
                      Industry *
                    </label>
                  </div>
                  <select
                    id="industry"
                    name="industry"
                    required
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Family Entertainment Center">Family Entertainment Center</option>
                    <option value="Theatre/Cinema">Theatre/Cinema</option>
                    <option value="Resort/Hotel">Resort/Hotel</option>
                    <option value="Sports Complex">Sports Complex</option>
                    <option value="Casino">Casino</option>
                    <option value="Museum/Zoo/Aquarium">Museum/Zoo/Aquarium</option>
                    <option value="Cruise Ship">Cruise Ship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-6">
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label htmlFor="businessStatus" className="block font-medium text-gray-700 text-base">
                      Business Status *
                    </label>
                  </div>
                  <select
                    id="businessStatus"
                    name="businessStatus"
                    required
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm"
                    value={formData.businessStatus}
                    onChange={(e) => handleInputChange("businessStatus", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Opening a first venue">Opening a first venue</option>
                    <option value="Opening an additional venue">Opening an additional venue</option>
                    <option value="Enhancing an existing venue">Enhancing an existing venue</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label className="block font-medium text-gray-700 text-base">Message *</label>
                  </div>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="w-full h-12 placeholder:text-gray-500"
                    value={formData.message}
                    maxLength={1000}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                  {focusedField === "message" && (
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">
                        <span className={messageCharCount >= 1000 ? "text-red-500 font-medium" : "text-gray-500"}>
                          {messageCharCount} / 1000 Characters
                        </span>
                      </div>
                      {messageCharCount >= 1000 && (
                        <div className="text-xs text-red-500 font-medium">Character limit reached</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <div className="flex items-center mb-3">
                    <Shield className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label className="block font-medium text-gray-700 text-base">Security Check *</label>
                    <button
                      type="button"
                      onClick={() => setShowFindUsInfo(!showFindUsInfo)}
                      className="ml-2 hover:opacity-80 transition-opacity duration-200 flex items-center"
                      style={{ color: "#512bb2" }}
                    >
                      <span className="text-sm underline">Info</span>
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${showFindUsInfo ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${showFindUsInfo ? "max-h-24 opacity-100 mb-4" : "max-h-0 opacity-0"}`}
                  >
                    <p
                      className="text-sm text-gray-600 p-3 rounded-md border"
                      style={{ backgroundColor: "#f3f0ff", borderColor: "#512bb2" }}
                    >
                      Quick brain stretch! 🧠💡 Solve the math question and enter the correct answer to continue. This
                      helps us keep the website safe and spam-free! 🤖🚫
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-gray-800">
                      {captchaNum1} + {captchaNum2} =
                    </div>
                    <Input
                      type="number"
                      required
                      value={captchaAnswer}
                      onChange={(e) => {
                        const newAnswer = e.target.value
                        setCaptchaAnswer(newAnswer)

                        if (newAnswer !== "" && Number.parseInt(newAnswer) !== captchaNum1 + captchaNum2) {
                          setCaptchaError(true)
                        } else {
                          setCaptchaError(false)
                        }
                      }}
                      className={`w-24 text-center text-lg ${captchaError ? "border-red-500 border-2" : ""}`}
                      placeholder="?"
                    />
                    {captchaError && <X className="h-6 w-6 text-red-500 flex-shrink-0" />}
                  </div>
                  {captchaError && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                      Incorrect answer. Almost there! 💪 Even calculators need a second chance sometimes!
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!isCaptchaValid}
                  size="lg"
                  className="w-full text-white font-bold h-auto transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xl py-3"
                  style={{
                    backgroundColor: isCaptchaValid ? "#512bb2" : "#cccccc",
                    color: isCaptchaValid ? "#ffcc00" : "#666666",
                  }}
                >
                  Send Message
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Submitting opens your email app with the enquiry ready to send to sales@puttbrothers.com.
                </p>
              </form>
            </div>

            {/* Contact Info */}
          </div>
        </div>
      </div>
    </section>
  )
}
