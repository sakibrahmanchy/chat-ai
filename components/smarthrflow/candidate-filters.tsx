'use client';

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CandidateFiltersProps {
  filters: {
    showFilters: boolean;
    skills: string[] | undefined;
    scoreRange: [number, number];
    experienceMonths: [number, number];
    matchType: 'AND' | 'OR';
    sortBy: 'score' | 'date';
    location: string;
    availability: number;
    searchTerm?: string;
  };
  onFilterChange: (filters: Partial<FilterCriteria>) => void;
  availableLocations: string[];
  availableSkills: string[];
}

const SKILL_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python",
  "Java", "AWS", "Docker", "Kubernetes", "SQL", "NoSQL",
  "Vue.js", "Angular", "DevOps", "CI/CD", "Git"
].map(skill => ({ label: skill, value: skill }));

const EXPERIENCE_RANGES = {
  any: [0, 999] as [number, number],
  entry: [0, 24] as [number, number], // 0-2 years
  mid: [24, 60] as [number, number],  // 2-5 years
  senior: [60, 96] as [number, number], // 5-8 years
  lead: [96, 999] as [number, number]  // 8+ years
} as const;

export interface FilterCriteria {
  showFilters: boolean;
  matchType: 'AND' | 'OR';
  searchTerm: string;
  sortBy: 'score' | 'date';
  skills: string[] | undefined;
  experience?: number;
  location: string;
  scoreRange: [number, number];
  experienceMonths: [number, number];
  availability: number;
  fetchStatusCount: boolean;
  limit?: number;
}

// const AVAILABILITY_WEEKS = [1, 2, 4, 8, 12, 24] as const;

export function CandidateFilters({ 
  filters, 
  onFilterChange,
  availableLocations,
  availableSkills
}: CandidateFiltersProps) {
  const formatExperience = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years ${remainingMonths} months`;
  };
  const getCurrentExperienceRange = (months: [number, number]) => {
    for (const [key, [min, max]] of Object.entries(EXPERIENCE_RANGES)) {
      if (months[0] === min && months[1] === max) return key;
    }
    return 'custom';
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 space-y-6">
        {/* Match Score Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-sm">Match Score</Label>
            <span className="text-sm text-muted-foreground">
              {filters.scoreRange[0]} - {filters.scoreRange[1]}
            </span>
          </div>
          <Slider 
            min={0} 
            max={10} 
            step={1}
            value={filters.scoreRange}
            onValueChange={(value) => onFilterChange({ ...filters, scoreRange: value as [number, number] })}
          />
        </div>        

        <div className="space-y-3">
          <Label className="font-medium text-sm">Experience Level</Label>
          <RadioGroup 
            value={getCurrentExperienceRange(filters.experienceMonths)}
            onValueChange={(value) => {
              const range = EXPERIENCE_RANGES[value as keyof typeof EXPERIENCE_RANGES];
              onFilterChange({ ...filters, experienceMonths: range });
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-exp" />
              <Label htmlFor="any-exp" className="text-sm font-normal">Any Experience</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="entry" id="entry-exp" />
              <Label htmlFor="entry-exp" className="text-sm font-normal">
                Entry Level ({formatExperience(0)} - {formatExperience(24)})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mid" id="mid-exp" />
              <Label htmlFor="mid-exp" className="text-sm font-normal">
                Mid Level ({formatExperience(24)} - {formatExperience(60)})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="senior" id="senior-exp" />
              <Label htmlFor="senior-exp" className="text-sm font-normal">
                Senior Level ({formatExperience(60)} - {formatExperience(96)})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lead" id="lead-exp" />
              <Label htmlFor="lead-exp" className="text-sm font-normal">
                Lead Level ({formatExperience(96)}+)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <Select
            value={filters.location || "all"}
            onValueChange={(value) => 
              onFilterChange({ ...filters, location: value === "all" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Locations</SelectItem>
              {availableLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notice Period</Label>
          <Select
            value={filters.availability?.toString() || ""}
            onValueChange={(value) => 
              onFilterChange({ ...filters, availability: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notice period" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="1">Immediate</SelectItem>
              <SelectItem value="2">2 weeks</SelectItem>
              <SelectItem value="4">1 month</SelectItem>
              <SelectItem value="8">2 months</SelectItem>
              <SelectItem value="12">3 months</SelectItem>
              <SelectItem value="24">6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Required Skills */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Required Skills</Label>
          <MultiSelect
            options={availableSkills.map(skill => ({ label: skill, value: skill }))}
            selected={filters.skills || []}
            onChange={(selected) => onFilterChange({ ...filters, skills: selected })}
            placeholder="Select required skills..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 