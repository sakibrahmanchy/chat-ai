'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useEarlyAccess } from "@/hooks/use-early-access";
import { getUserData } from "@/lib/analytics/tracking";

// Define form schema
const accessFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["recruiter", "hiring-manager"]),
  hiringChallenges: z.string().optional(),
  hiringVolume: z.string().min(1, "Hiring volume is required"),
});

type AccessFormData = z.infer<typeof accessFormSchema>;

export function AccessForm() {
  const { hasSubmitted, loading: checkingSubmission, setHasSubmitted } = useEarlyAccess();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AccessFormData>>({
    role: "recruiter",
  });
  const { toast } = useToast();

  useEffect(() => {
    const getInitialData = async () => {
      const data = await getUserData();
      setUserData(data);
    };
    getInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = accessFormSchema.parse(formData);

      // Add to Firestore with tracking data
      const docRef = await addDoc(collection(db, "earlyAccessRequests"), {
        ...validatedData,
        status: "pending",
        createdAt: serverTimestamp(),
        tracking: {
          ...userData,
          submittedAt: new Date().toISOString(),
          pathname: window.location.pathname,
          url: window.location.href,
          queryParams: Object.fromEntries(new URLSearchParams(window.location.search)),
        },
        identifier: [userData?.ip, formData.email].filter(Boolean),
      });

      // Store submission in localStorage
      localStorage.setItem('earlyAccessSubmitted', 'true');
      localStorage.setItem('userEmail', formData.email || '');

      toast({
        title: "Request submitted successfully!",
        description: "We'll be in touch with you soon.",
        variant: "default",
      });

      setFormData({ role: "recruiter" });

      setHasSubmitted(true);

    } catch (error) {
      console.error("Error submitting form:", error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid form data",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error submitting request",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AccessFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (checkingSubmission) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (hasSubmitted) {
    return (
      <section className="py-8" id="early-access">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Thank You for Your Interest!</h2>
          <p className="text-lg text-slate-600">
            We've received your early access request and will be in touch soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8" id="early-access">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-10"
        >
          <h2 className="text-3xl font-bold">
            Join Our Early Access Program
          </h2>
          <p className="text-lg text-slate-600">
            Get priority access to our AI-powered recruitment platform and shape its future
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-xl border p-6 sm:p-8">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Company Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    placeholder="Enter company name"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select 
                    value={formData.companySize}
                    onValueChange={(value) => handleInputChange('companySize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501+">501+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Email</Label>
                  <Input 
                    type="email"
                    placeholder="Enter work email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="Enter your job title" />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input 
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Role & Requirements */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Your Role & Requirements</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup 
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recruiter" id="recruiter" />
                      <Label htmlFor="recruiter">Recruiter/HR Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hiring-manager" id="hiring-manager" />
                      <Label htmlFor="hiring-manager">Hiring Manager</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>What are your main hiring challenges?</Label>
                  <Textarea 
                    placeholder="Tell us about your current recruitment challenges..."
                    className="h-24"
                    value={formData.hiringChallenges || ''}
                    onChange={(e) => handleInputChange('hiringChallenges', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected hiring volume in next 6 months</Label>
                  <Select 
                    value={formData.hiringVolume}
                    onValueChange={(value) => handleInputChange('hiringVolume', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hiring volume" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1-5">1-10 hires</SelectItem>
                      <SelectItem value="6-20">11-100 hires</SelectItem>
                      <SelectItem value="21-50">100-500 hires</SelectItem>
                      <SelectItem value="50+">500+ hires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Request Early Access"}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
} 