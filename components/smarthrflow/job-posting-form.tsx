'use client';
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const JobPostingForm: React.FC = () => {
  const [job, setJob] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
      if (response.ok) {
        // Handle success
      }
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Job Title</label>
            <Input
              id="title"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              placeholder="Enter job title"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Job Description</label>
            <Textarea
              id="description"
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              placeholder="Enter job description"
              rows={4}
            />
          </div>

          <Button type="submit">Post Job</Button>
        </form>
      </CardContent>
    </Card>
  );
}; 