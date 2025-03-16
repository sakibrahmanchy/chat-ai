'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "../ui/button";
import { JobEditor } from "@/components/job-editor";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface JobFormProps {
  jobId?: string;
}

interface JobFormData {
  // Core job details
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  skills: string[];
  description: string;
  requirements: string;
  // benefits: string;
  applicationDeadline: string;
  createdAt: Date;
  
  // Location
  city: string;
  state: string;
  country: string;
  
  // Employment details
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceRequired: number;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  should_ask_expected_salary: boolean;
  
  // Skills and requirements
  responsibilities: string;
  // qualifications: string;
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
];

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Product',
  'Design',
  'Customer Support',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Other'
];

interface FormError {
  field: string;
  message: string;
  tab: string;
}

export default function JobPostingForm({ jobId }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClientComponentClient();
  const [errors, setErrors] = useState<FormError[]>([]);

  const [job, setJob] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experience: '',
    salary: '',
    skills: [],
    description: '',
    requirements: '',
    // benefits: '',
    applicationDeadline: '',
    createdAt: new Date(),
    city: '',
    state: '',
    country: '',
    employmentType: 'full-time',
    experienceRequired: 0,
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'USD',
    responsibilities: '',
    // qualifications: '',
    should_ask_expected_salary: true,
  });

  // Fetch company ID and job data when component mounts
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      setIsLoading(true);
      // Fetch company ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching company ID:', userError);
        return;
      }

      setCompanyId(userData.company_id);

      // If jobId is provided, fetch job data
      if (jobId) {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          toast({
            title: "Error",
            description: "Failed to fetch job data",
            variant: "destructive",
          });
          return;
        }

        // Transform job data to match form structure
        setJob({
          title: jobData.title,
          department: jobData.department || '',
          location: jobData.location?.city ? `${jobData.location.city}, ${jobData.location.state}, ${jobData.location.country}` : '',
          type: jobData.type,
          experience: jobData.experience?.toString() || '',
          salary: '',
          skills: jobData.required_skills || [],
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          // benefits: jobData.benefits || '',
          applicationDeadline: jobData.application_deadline || '',
          createdAt: new Date(jobData.created_at),
          city: jobData.location?.city || '',
          state: jobData.location?.state || '',
          country: jobData.location?.country || '',
          employmentType: jobData.type || 'full-time',
          experienceRequired: jobData.experience || 0,
          salaryMin: jobData.salary_min || 0,
          salaryMax: jobData.salary_max || 0,
          salaryCurrency: jobData.salary_currency || 'USD',
          responsibilities: jobData.responsibilities || '',
          // qualifications: jobData.qualifications || '',
          should_ask_expected_salary: jobData.should_ask_expected_salary ?? true,
        });
      }
      setIsLoading(false);
    }

    fetchData();
  }, [user?.id, jobId, supabase]);

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!job.skills.includes(currentSkill.trim())) {
        setJob({ ...job, skills: [...job.skills, currentSkill.trim()] });
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJob({
      ...job,
      skills: job.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const validateForm = (): FormError[] => {
    const newErrors: FormError[] = [];
    
    // Basic Info tab validation
    if (!job.title) {
      newErrors.push({ field: 'title', message: 'Job title is required', tab: 'basic' });
    }
    if (!job.department) {
      newErrors.push({ field: 'department', message: 'Department is required', tab: 'basic' });
    }
    if (!job.city) {
      newErrors.push({ field: 'city', message: 'City is required', tab: 'basic' });
    }

    if (!job.country) {
      newErrors.push({ field: 'country', message: 'Country is required', tab: 'basic' });
    }
    if (!job.employmentType) {
      newErrors.push({ field: 'employmentType', message: 'Employment type is required', tab: 'basic' });
    }

    // Requirements tab validation
    if (!job.description) {
      newErrors.push({ field: 'description', message: 'Job description is required', tab: 'requirements' });
    }
    if (!job.responsibilities) {
      newErrors.push({ field: 'responsibilities', message: 'Responsibilities are required', tab: 'requirements' });
    }
    if (!job.requirements) {
      newErrors.push({ field: 'requirements', message: 'Requirements are required', tab: 'requirements' });
    }

    // Salary validation (only if asking for salary)
    if (job.should_ask_expected_salary) {
      if (!job.salaryCurrency) {
        newErrors.push({ field: 'salaryCurrency', message: 'Salary currency is required', tab: 'salary' });
      }
      if (job.salaryMin <= 0) {
        newErrors.push({ field: 'salaryMin', message: 'Minimum salary must be greater than 0', tab: 'salary' });
      }
      if (job.salaryMax <= 0) {
        newErrors.push({ field: 'salaryMax', message: 'Maximum salary must be greater than 0', tab: 'salary' });
      }
      if (job.salaryMax <= job.salaryMin) {
        newErrors.push({ field: 'salaryMax', message: 'Maximum salary must be greater than minimum salary', tab: 'salary' });
      }
    }

    if (!job.applicationDeadline) {
      newErrors.push({ field: 'applicationDeadline', message: 'Application deadline is required', tab: 'basic' });
    }

    if (!job.experienceRequired) {
      newErrors.push({ field: 'experienceRequired', message: 'Experience required is required', tab: 'details' });
    }

    if (!job.skills.length) {
      newErrors.push({ field: 'skills', message: 'At least one skill is required', tab: 'details' });
    } 
    console.log({ newErrors});
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      // Switch to the first tab with an error
      const firstErrorTab = validationErrors[0].tab;
      setActiveTab(firstErrorTab);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!companyId) {
        throw new Error('No company ID found');
      }
      
      // Structure job data for Supabase
      const jobData = {
        title: job.title,
        company_id: companyId,
        department: job.department,
        location: {
          city: job.city || job.location.split(',')[0]?.trim(),
          state: job.state,
          country: job.country
        },
        type: job.employmentType,
        experience: job.experienceRequired,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        salary_currency: job.salaryCurrency,
        required_skills: job.skills,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        // qualifications: job.qualifications,
        application_deadline: job.applicationDeadline,
        should_ask_expected_salary: job.should_ask_expected_salary,
        status: 'active',
      };

      let result;
      if (jobId) {
        // Update existing job
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId)
          .select()
          .single();
      } else {
        // Create new job
        result = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Job ${jobId ? 'updated' : 'created'} successfully`,
      });

      router.push(`/dashboard/jobs/${result.data.id}`);
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: `Failed to ${jobId ? 'update' : 'create'} job posting`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    return validateForm().length === 0;
  }, [job]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Card className={`w-full p-4 ${isLoading ? 'opacity-50' : ''}`} aria-disabled={isLoading}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Please fix the following errors:</div>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error.message} <span className="text-xs opacity-70">(in {error.tab} tab)</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="salary">Salary</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 bg-white p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Job Title *</label>
            <Input
              id="title"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">Department *</label>
                  <Input
                    id="department"
                    value={job.department}
                    onChange={(e) => setJob({ ...job, department: e.target.value })}
                    placeholder="Enter department"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City *</label>
                  <Input
                    id="city"
                    value={job.city}
                    onChange={(e) => setJob({ ...job, city: e.target.value })}
                    placeholder="City"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">State</label>
                  <Input
                    id="state"
                    value={job.state}
                    onChange={(e) => setJob({ ...job, state: e.target.value })}
                    placeholder="State"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">Country *</label>
                  <Input
                    id="country"
                    value={job.country}
                    onChange={(e) => setJob({ ...job, country: e.target.value })}
                    placeholder="Country"
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="employmentType" className="text-sm font-medium">Employment Type *</label>
                  <Select
                    value={job.employmentType}
                    onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'internship') => 
                      setJob({ ...job, employmentType: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="applicationDeadline" className="text-sm font-medium">Application Deadline</label>
                  <Input
                    id="applicationDeadline" 
                    type="date"
                    value={job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => setJob({ ...job, applicationDeadline: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 bg-white p-6 rounded-lg border">
              <div className="space-y-2">
                <label htmlFor="experienceRequired" className="text-sm font-medium">Experience Required (years)</label>
                <Input
                  id="experienceRequired"
                  type="number"
                  min="0"
                  value={job.experienceRequired}
                  onChange={(e) => setJob({ ...job, experienceRequired: parseInt(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1 bg-gray-100">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  placeholder="Type a skill and press Enter"
                  className="bg-white"
                />
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-6 bg-white p-6 rounded-lg border">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 p-4  rounded-lg border">
                  <Switch
                    id="should_ask_expected_salary"
                    checked={job.should_ask_expected_salary}
                    onCheckedChange={(checked) => {
                      setJob({ ...job, should_ask_expected_salary: checked });
                      if (!checked) {
                        // Clear salary errors when disabling salary fields
                        setErrors(errors.filter(e => e.tab !== 'salary'));
                      }
                    }}
                  />
                  <label htmlFor="should_ask_expected_salary" className="text-sm font-medium">
                    Ask candidates for expected salary
                  </label>
                </div>

                <fieldset disabled={!job.should_ask_expected_salary} 
                  className={`space-y-6 ${!job.should_ask_expected_salary && 'opacity-50'}`}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="salaryCurrency" className="text-sm font-medium">Salary Currency</label>
                      <Select
                        value={job.salaryCurrency}
                        onValueChange={(value) => setJob({ ...job, salaryCurrency: value })}
                      >
                        <SelectTrigger className="bg-white w-[200px]">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BDT'].map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="salaryMin" className="text-sm font-medium">Minimum Salary (Annual)</label>
                        <div className="relative">
                          <Input
                            id="salaryMin"
                            type="number"
                            min="0"
                            value={job.salaryMin}
                            onChange={(e) => setJob({ ...job, salaryMin: parseInt(e.target.value) })}
                            className="bg-white pl-12"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            {job.salaryCurrency}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="salaryMax" className="text-sm font-medium">Maximum Salary (Annual)</label>
                        <div className="relative">
                          <Input
                            id="salaryMax"
                            type="number"
                            min="0"
                            value={job.salaryMax}
                            onChange={(e) => setJob({ ...job, salaryMax: parseInt(e.target.value) })}
                            className="bg-white pl-12"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            {job.salaryCurrency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6 bg-white p-6 rounded-lg border">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Job Description *</label>
                  <JobEditor
                    content={job.description}
                    onChange={(content) => setJob({ ...job, description: content })}
                    placeholder="Enter job description..."
            />
          </div>
          
          <div className="space-y-2">
                  <label htmlFor="responsibilities" className="text-sm font-medium">Responsibilities *</label>
                  <JobEditor
                    content={job.responsibilities}
                    onChange={(content) => setJob({ ...job, responsibilities: content })}
                    placeholder="Enter job responsibilities..."
            />
          </div>

                <div className="space-y-2">
                  <label htmlFor="requirements" className="text-sm font-medium">Requirements *</label>
                  <JobEditor
                    content={job.requirements}
                    onChange={(content) => setJob({ ...job, requirements: content })}
                    placeholder="Enter job requirements..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={cn(
                "text-white",
                isFormValid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {jobId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                jobId ? 'Update Job' : 'Create Job'
              )}
            </Button>
          </div>
        </form>
    </Card>
    </div>
  );
} 