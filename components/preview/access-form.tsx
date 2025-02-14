'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function AccessForm() {
  const [loading, setLoading] = useState(false);

  return (
    <section className="py-20">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-10"
        >
          <h2 className="text-3xl font-bold">
            Join SmartHRFlow Early Access Program
          </h2>
          <p className="text-lg text-slate-600">
            Get priority access to SmartHRFlow's AI-powered recruitment platform and shape its future
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <form className="space-y-8 bg-white rounded-xl border p-6 sm:p-8">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Company Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <SelectContent>
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
                  <Input placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Work Email</Label>
                  <Input type="email" placeholder="Enter work email" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="Enter your job title" />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input type="tel" placeholder="Enter phone number" />
                </div>
              </div>
            </div>

            {/* Role & Requirements */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Your Role & Requirements</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup defaultValue="recruiter" className="grid sm:grid-cols-2 gap-4">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected hiring volume in next 6 months</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hiring volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 hires</SelectItem>
                      <SelectItem value="6-20">6-20 hires</SelectItem>
                      <SelectItem value="21-50">21-50 hires</SelectItem>
                      <SelectItem value="50+">50+ hires</SelectItem>
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