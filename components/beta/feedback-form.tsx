'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function BetaFeedbackForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Handle form submission
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg border">
      {/* Professional Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">About You</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" type="email" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input id="company" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <Input id="role" required />
        </div>

        <div className="space-y-2">
          <Label>Company Size</Label>
          <RadioGroup defaultValue="10-50">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-10" id="size-1" />
              <Label htmlFor="size-1">1-10 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10-50" id="size-2" />
              <Label htmlFor="size-2">10-50 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50-200" id="size-3" />
              <Label htmlFor="size-3">50-200 employees</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="200+" id="size-4" />
              <Label htmlFor="size-4">200+ employees</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Current Process */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Current Hiring Process</h3>
        
        <div className="space-y-2">
          <Label>What tools do you currently use for recruitment?</Label>
          <Textarea placeholder="E.g., ATS systems, spreadsheets, etc." />
        </div>

        <div className="space-y-2">
          <Label>What are your biggest challenges in the hiring process?</Label>
          <Textarea placeholder="Tell us about the problems you face" />
        </div>

        <div className="space-y-2">
          <Label>How much time do you spend on resume screening per week?</Label>
          <RadioGroup defaultValue="5-10">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0-5" id="time-1" />
              <Label htmlFor="time-1">0-5 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5-10" id="time-2" />
              <Label htmlFor="time-2">5-10 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10-20" id="time-3" />
              <Label htmlFor="time-3">10-20 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20+" id="time-4" />
              <Label htmlFor="time-4">20+ hours</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Feature Importance</h3>
        
        <div className="space-y-4">
          <Label>Which features would be most valuable to you?</Label>
          <div className="space-y-2">
            {[
              "AI-powered resume screening",
              "Candidate scoring and ranking",
              "Automated skill matching",
              "Team collaboration tools",
              "Interview scheduling",
              "Analytics and reporting",
              "Integration with existing ATS",
              "Mobile app access",
              "Candidate communication tools",
              "Custom workflow automation"
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox id={feature} />
                <Label htmlFor={feature}>{feature}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What other features would you like to see?</Label>
          <Textarea placeholder="Tell us about additional features you'd find useful" />
        </div>
      </div>

      {/* Additional Feedback */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Feedback</h3>
        
        <div className="space-y-2">
          <Label>What would make you choose our solution over alternatives?</Label>
          <Textarea />
        </div>

        <div className="space-y-2">
          <Label>Any other comments or suggestions?</Label>
          <Textarea />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
} 