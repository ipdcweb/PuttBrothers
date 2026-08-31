"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, MessageSquare, Shield, ChevronDown, X, Building2, Briefcase, Globe, Grid3x3, FileText } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { MobilePlannerWarningDialog } from "@/components/planner/mobile-planner-warning-dialog"
import { useIsPlannerMobileDevice } from "@/hooks/use-planner-device-warning"

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    FindUs: "",
    industry: "",
    businessStatus: "",
    deployment: "",
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
  const [emailError, setEmailError] = useState("") // Added email validation state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [showLayoutPlanner, setShowLayoutPlanner] = useState(false)
  const [isCollapsingLayout, setIsCollapsingLayout] = useState(false)
  const [showPlannerModal, setShowPlannerModal] = useState(false)
  const [showMobileWarning, setShowMobileWarning] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [layoutPdfUrl, setLayoutPdfUrl] = useState("")
  const [layoutPdfFilename, setLayoutPdfFilename] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isPlannerMobileDevice = useIsPlannerMobileDevice()
  const plannerIframeSrc = `/layout-planner/space?embedded=1&new=1&email=${encodeURIComponent(formData.email.trim())}`

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1)
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1)
  }, [])

  useEffect(() => {
    if (captchaAnswer !== "" && Number.parseInt(captchaAnswer) === captchaNum1 + captchaNum2) {
      setIsCaptchaValid(true)
      setCaptchaError(false)
    } else {
      setIsCaptchaValid(false)
    }
  }, [captchaAnswer, captchaNum1, captchaNum2])

  useEffect(() => {
    const handlePlannerMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data === "close-planner") {
        setShowPlannerModal(false)
        return
      }

      if (event.data?.type === "puttbrothers-planner-complete") {
        const payload = event.data.payload as { pdfUrl?: string; s3Url?: string; filename?: string }
        const s3Url = payload?.s3Url || payload?.pdfUrl
        if (!s3Url) return

        setLayoutPdfUrl(s3Url)
        setLayoutPdfFilename(payload.filename || "layout-summary.pdf")
        setShowPlannerModal(false)
        setShowLayoutPlanner(true)
        setIsCollapsingLayout(false)
      }
    }

    window.addEventListener("message", handlePlannerMessage)
    return () => window.removeEventListener("message", handlePlannerMessage)
  }, [])

  const validateEmail = (email: string) => {
    // Added email validation function
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!email) {
      return ""
    }

    if (!email.includes("@")) {
      return "Email must contain @"
    }

    if (!email.includes(".")) {
      return "Email must contain a domain (e.g., .com, .co.nz)"
    }

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }

    return ""
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (field === "message") {
      setMessageCharCount(value.length)
    }
    if (field === "email") {
      // Validate email on change
      const error = validateEmail(value)
      setEmailError(error)
    }
  }

  const handleCreateLayout = () => {
    if (isPlannerMobileDevice) {
      setShowMobileWarning(true)
      return
    }

    const emailValidationError = validateEmail(formData.email)
    if (!formData.email || emailValidationError) {
      setEmailError(emailValidationError || "Email is required before creating a layout")
      const emailInput = document.querySelector('input[type="email"]')
      emailInput?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    window.localStorage.removeItem("putt-brothers-planner")
    setShowPlannerModal(true)
  }

  const handleDeletePdf = () => {
    setLayoutPdfUrl("")
    setLayoutPdfFilename("")
    setShowDeleteConfirm(false)
    setIsCollapsingLayout(true)
    setTimeout(() => {
      setShowLayoutPlanner(false)
      setIsCollapsingLayout(false)
    }, 500)
    
    // Scroll to the "Plan your venue layout" button with smooth animation
    setTimeout(() => {
      const layoutButton = document.querySelector('[data-layout-button]')
      if (layoutButton) {
        layoutButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)
  }

  const handleToggleLayoutPlanner = () => {
    if (showLayoutPlanner) {
      setIsCollapsingLayout(true)
      setTimeout(() => {
        setShowLayoutPlanner(false)
        setIsCollapsingLayout(false)
      }, 500)
    } else {
      setShowLayoutPlanner(true)
      setIsCollapsingLayout(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailValidationError = validateEmail(formData.email) // Check email validation before submitting
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }
    if (!isCaptchaValid) {
      setCaptchaError(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    try {
      const payload = {
        personalInformation: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.mobile,
          email: formData.email,
        },
        howDidYouFindUs: {
          FindUs: formData.FindUs,
          FindUsOther: "",
        },
        industryInformation: {
          industry: formData.industry,
          businessStatus: formData.businessStatus,
          deployment: formData.deployment,
        },
        message: formData.message,
        layoutPdfUrl,
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit form")
      }

      setSubmitSuccess(true)
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        FindUs: "",
        industry: "",
        businessStatus: "",
        deployment: "",
        message: "",
      })
      setCaptchaAnswer("")
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1)
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1)
      setIsCaptchaValid(false)
      setMessageCharCount(0)
      setLayoutPdfUrl("")
      setLayoutPdfFilename("")

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-base">First Name *</label>
                    <Input
                      required
                      placeholder="John"
                      className="w-full h-12 placeholder:text-gray-300 text-base"
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
                      className="w-full h-12 placeholder:text-gray-300 text-base"
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
                      className={`w-full h-12 placeholder:text-gray-300 text-base ${
                        emailError ? "border-red-500 border-2" : ""
                      }`}
                      value={formData.email}
                      maxLength={100}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => {
                        // Validate on blur
                        setFocusedField("")
                        const error = validateEmail(formData.email)
                        setEmailError(error)
                      }}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                    {emailError ? ( // Show email validation error or character count
                      <div className="text-sm text-red-500 mt-1 font-medium">{emailError}</div>
                    ) : (
                      focusedField === "email" && (
                        <div className="text-sm text-gray-500 mt-1">{formData.email.length} / 100 Characters</div>
                      )
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
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm text-base cursor-pointer"
                    value={formData.FindUs}
                    onChange={(e) => handleInputChange("FindUs", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Cinema Advertising">Cinema Advertising</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Flyers">Flyers</option>
                    <option value="Friends">Friends</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Global Events">Global Events</option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Market Place">Market Place</option>
                    <option value="Radio Advertising">Radio Advertising</option>
                    <option value="TV Advertising">TV Advertising</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Others">Others</option>
                  </select>
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
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm text-base cursor-pointer"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Casino">Casino</option>
                    <option value="Cruise Ship">Cruise Ship</option>
                    <option value="Family Entertainment Center">Family Entertainment Center</option>
                    <option value="Museum/Zoo/Aquarium">Museum/Zoo/Aquarium</option>
                    <option value="Resort/Hotel">Resort/Hotel</option>
                    <option value="Sports Complex">Sports Complex</option>
                    <option value="Theatre/Cinema">Theatre/Cinema</option>
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
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm text-base cursor-pointer"
                    value={formData.businessStatus}
                    onChange={(e) => handleInputChange("businessStatus", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Opening a first venue">Opening a first venue</option>
                    <option value="Opening an additional venue">Opening an additional venue</option>
                    <option value="Enhancing an existing venue">Enhancing an existing venue</option>
                  </select>
                </div>

                <div className="pt-6">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 mr-2" style={{ color: "#512bb2" }} />
                    <label htmlFor="deployment" className="block font-medium text-gray-700 text-base">
                      Deployment Region*
                    </label>
                  </div>
                  <select
                    id="deployment"
                    name="deployment"
                    required
                    className="mt-1 block w-full h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#512bb2] focus:border-[#512bb2] sm:text-sm text-base cursor-pointer"
                    value={formData.deployment}
                    onChange={(e) => handleInputChange("deployment", e.target.value)}
                  >
                    <option value="">Select the deployment region</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="South America">South America</option>
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
                    className="w-full h-12 placeholder:text-gray-500 text-base"
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
                  <button
                    type="button"
                    data-layout-button
                    onClick={handleToggleLayoutPlanner}
                    className={`w-full h-12 border-2 border-gray-300 rounded-lg font-semibold flex items-center justify-between px-4 transition-all duration-500 ${
                      showLayoutPlanner && !isCollapsingLayout
                        ? "bg-[#ffcc00] text-[#41059a]"
                        : "bg-white text-gray-700 hover:bg-gray-50 animate-glow-pulse"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Plan your venue layout</span>
                      <span className="text-xs italic font-normal text-gray-500">Optional, but recommended</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-500 ${
                        showLayoutPlanner && !isCollapsingLayout ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showLayoutPlanner && (
                    <div 
                      className={`p-8 rounded-lg mt-0 origin-top ${
                        isCollapsingLayout ? "animate-collapse-button" : "animate-expand-button"
                      }`}
                      style={{ backgroundColor: "#41059a" }}
                    >
                      <div className="text-center mb-6">
                        <p className="text-xs font-bold text-[#ffcc00] uppercase tracking-wide mb-4">Putt Brothers</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Plan your venue layout</h3>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-8 items-center mb-8">
                        <div className="lg:w-1/2">
                          <p className="text-gray-300 text-base space-y-4">
                            <span className="block">
                              Plan your space and design your mini golf layout in minutes. Enter the dimensions of your venue and drag and drop the Putt Brothers Course Holes to visualize how your course could fit inside your available area.
                            </span>
                            <span className="block">
                              Once you finish the layout, the system will generate a Layout Summary PDF that will automatically be attached to your request so our team can prepare a quote for your project.
                            </span>
                          </p>
                        </div>

                        <div className="lg:w-1/2">
                          <img
                            src="/images/layout-drag-drop.png"
                            alt="Drag and drop course holes into your venue layout"
                            className="w-full rounded-lg shadow-lg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-center mt-8">
                        <button
                          type="button"
                          onClick={handleCreateLayout}
                          className="bg-[#7c3aed] hover:bg-[#ffcc00] text-white hover:text-[#41059a] font-bold px-8 py-3 rounded-full flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                          <Grid3x3 className="h-5 w-5" />
                          Create your Layout
                        </button>
                      </div>

                      <p className="text-center text-sm mt-6 font-semibold" style={{ color: "#ffcc00" }}>
                        🔓 No login • No password • Easy access • Start now! ✨
                      </p>

                      {layoutPdfUrl && (
                        <div className="mt-8 p-6 bg-[#2d0d5a] rounded-lg border border-[#7c3aed]">
                          <div className="text-center mb-6">
                            <p className="text-[#ffcc00] font-bold text-lg mb-2">✓ Layout Created!</p>
                            <p className="text-white text-base mb-4">
                              🎉 Congratulations! You've completed an important step that will help us accelerate your quote process. Your layout summary is ready and will be automatically attached to your request!
                            </p>
                            <p className="text-gray-300 text-sm italic">
                              ✨ You're all set! Go ahead and submit the form below, and we'll get back to you as soon as possible with your personalized quote. We can't wait to bring your mini golf dreams to life! 🏌️
                            </p>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-6 w-6 text-[#ffcc00]" />
                              <div>
                                <p className="text-white font-semibold">{layoutPdfFilename}</p>
                                <a
                                  href={layoutPdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-400 text-sm underline"
                                >
                                  Ready to submit
                                </a>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="text-red-500 hover:text-red-600 transition-colors text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
                      className="ml-2 hover:opacity-80 transition-opacity duration-200 flex items-center cursor-pointer"
                      style={{ color: "#512bb2" }}
                    >
                      <span className="text-sm underline">Info</span>
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                          showFindUsInfo ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showFindUsInfo ? "max-h-24 opacity-100 mb-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p
                      className="text-sm text-gray-600 p-3 rounded-md border"
                      style={{
                        backgroundColor: "#f3f0ff",
                        borderColor: "#512bb2",
                      }}
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

                {submitSuccess && (
                  <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-400 text-green-700">
                    <p className="font-medium">✓ Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
                    <p className="font-medium">✗ {submitError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!isCaptchaValid || isSubmitting}
                  size="lg"
                  className="w-full text-white font-bold h-auto transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xl py-3"
                  style={{
                    backgroundColor: isCaptchaValid && !isSubmitting ? "#512bb2" : "#cccccc",
                    color: isCaptchaValid && !isSubmitting ? "#ffcc00" : "#666666",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showPlannerModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Putt Brothers Layout Planner"
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl sm:h-[calc(100dvh-2rem)] sm:rounded-xl">
            <iframe
              src={plannerIframeSrc}
              title="Putt Brothers Layout Planner"
              className="h-full w-full flex-1 border-0"
              allow="clipboard-write"
            />
          </div>
        </div>
      )}

      <MobilePlannerWarningDialog open={showMobileWarning} onClose={() => setShowMobileWarning(false)} />

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Example Layout Summary</h2>
                <p className="text-gray-600 text-sm mt-1">This is an example of the layout PDF generated after designing your venue space.</p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 bg-gray-50 flex-1 overflow-hidden">
              <embed
                src="/pdfs/example-layout.pdf"
                type="application/pdf"
                className="w-full border border-gray-200 rounded-lg"
                style={{ height: "600px", width: "100%" }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  If the PDF viewer is not working, you can download the file:
                </p>
                <a
                  href="/pdfs/example-layout.pdf"
                  download="example-layout.pdf"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete PDF Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6 border-b-2" style={{ borderColor: "#41059a" }}>
              <h2 className="text-2xl font-bold" style={{ color: "#41059a" }}>Delete Layout PDF?</h2>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full" style={{ backgroundColor: "#41059a20" }}>
                  <p style={{ color: "#41059a" }} className="font-bold text-lg">⚠</p>
                </div>
                <div>
                  <p className="font-semibold mb-2" style={{ color: "#41059a" }}>This action cannot be undone</p>
                  <p className="text-gray-600 text-sm">
                    If you want to submit your layout, you'll need to create it again from scratch. Are you sure you want to delete this PDF?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 rounded-lg border-2 font-semibold transition-all duration-200"
                style={{
                  borderColor: "#41059a",
                  color: "#41059a",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffcc00"
                  e.currentTarget.style.color = "#41059a"
                  e.currentTarget.style.borderColor = "#ffcc00"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#41059a"
                  e.currentTarget.style.borderColor = "#41059a"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePdf}
                className="px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200"
                style={{ backgroundColor: "#41059a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffcc00"
                  e.currentTarget.style.color = "#41059a"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#41059a"
                  e.currentTarget.style.color = "white"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
