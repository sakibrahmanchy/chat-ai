'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CandidateFiltersProps {
  filters: {
    search: string;
    matchScore: [number, number];
    skills: string[];
    experiences: 'any' | 'entry' | 'mid' | 'senior' | 'lead';
    location: 'any' | 'remote' | 'onsite' | 'hybrid';
    showFilters: boolean;
  };
  onFilterChange: (filters: any) => void;
}

const SKILL_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python",
  "Java", "AWS", "Docker", "Kubernetes", "SQL", "NoSQL",
  "Vue.js", "Angular", "DevOps", "CI/CD", "Git"
].map(skill => ({ label: skill, value: skill }));

export function CandidateFilters({ filters, onFilterChange }: CandidateFiltersProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 space-y-6">
        {/* Match Score Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-sm">Match Score</Label>
            <span className="text-sm text-muted-foreground">
              {filters.matchScore[0]}-{filters.matchScore[1]}/10
            </span>
          </div>
          <Slider 
            min={0} 
            max={10} 
            step={1}
            value={filters.matchScore}
            onValueChange={(value) => onFilterChange({ ...filters, matchScore: value })}
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Experience Level</Label>
          <RadioGroup 
            value={filters.experiences}
            onValueChange={(value: any) => onFilterChange({ ...filters, experiences: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-exp" />
              <Label htmlFor="any-exp" className="text-sm font-normal">Any Experience</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="entry" id="entry-exp" />
              <Label htmlFor="entry-exp" className="text-sm font-normal">Entry Level (0-2 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mid" id="mid-exp" />
              <Label htmlFor="mid-exp" className="text-sm font-normal">Mid Level (2-5 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="senior" id="senior-exp" />
              <Label htmlFor="senior-exp" className="text-sm font-normal">Senior Level (5-8 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lead" id="lead-exp" />
              <Label htmlFor="lead-exp" className="text-sm font-normal">Lead Level (8+ years)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Location</Label>
          <RadioGroup 
            value={filters.location}
            onValueChange={(value: any) => onFilterChange({ ...filters, location: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-loc" />
              <Label htmlFor="any-loc" className="text-sm font-normal">Any Location</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote-loc" />
              <Label htmlFor="remote-loc" className="text-sm font-normal">Remote</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="onsite-loc" />
              <Label htmlFor="onsite-loc" className="text-sm font-normal">On-site</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid-loc" />
              <Label htmlFor="hybrid-loc" className="text-sm font-normal">Hybrid</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Required Skills */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Required Skills</Label>
          <MultiSelect
            options={SKILL_OPTIONS}
            selected={filters.skills}
            onChange={(selected) => onFilterChange({ ...filters, skills: selected })}
            placeholder="Select required skills..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 