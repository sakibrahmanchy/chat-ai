'use client';

import { useState } from "react";
import { Resume } from "@/app/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Star,
  Eye,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { getRelativeTimeString } from "@/lib/utils";

interface ListViewProps {
  list: any;
  initialResumes: Resume[];
  userId: string;
}

export function ListView({ list, initialResumes, userId }: ListViewProps) {
  const [resumes, setResumes] = useState(initialResumes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredResumes = resumes.filter(resume => {
    const name = resume.parsedContent?.full_name?.toLowerCase() || "";
    const skills = resume.searchableSkills?.join(" ").toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || skills.includes(query);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-semibold">{list.name}</h1>
            <p className="text-sm text-muted-foreground">{list.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Search by name or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResumes.map((resume) => (
              <TableRow key={resume.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {resume.parsedContent?.full_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {resume.parsedContent?.occupation}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {resume.overall_score || 0}
                    </div>
                    <Progress 
                      value={(resume.overall_score || 0) * 10} 
                      className="w-20 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {resume.searchableSkills?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(resume.searchableSkills?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(resume.searchableSkills?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {resume.experienceMonths 
                    ? `${Math.floor(resume.experienceMonths / 12)} years`
                    : "Not specified"}
                </TableCell>
                <TableCell>
                  {getRelativeTimeString(resume.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedResume(resume);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Resume Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Resume Details</DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <div>{selectedResume.parsedContent?.full_name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Current Role</label>
                    <div>{selectedResume.parsedContent?.occupation}</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h3 className="font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedResume.searchableSkills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <h3 className="font-semibold">Experience</h3>
                <div className="space-y-4">
                  {selectedResume.parsedContent?.experiences?.map((exp: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-sm text-muted-foreground">{exp.company}</div>
                      <div className="text-sm">{exp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 