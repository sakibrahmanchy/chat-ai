'use client';

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, MoreVertical, Power, PowerOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCreditService } from "@/lib/services/admin/credit.service";
import { toast } from "@/hooks/use-toast";
import { PackageForm } from "./package-form";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogDescription } from "@radix-ui/react-dialog";
import { adminCompanyService } from "@/lib/services/admin/company.service";
import { creditService } from "@/lib/services/credits.service";

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  type: 'one_time' | 'subscription';
  is_active: boolean;
  created_at: string;
}

interface PackageListProps {
  packages: CreditPackage[];
}

export function PackageList({ packages }: PackageListProps) {
  const [packageList, setPackageList] = useState(packages);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [assigningPackage, setAssigningPackage] = useState<CreditPackage | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      await adminCreditService.updatePackage(id, { is_active: isActive });
      setPackageList(prev =>
        prev.map(pkg =>
          pkg.id === id ? { ...pkg, is_active: isActive } : pkg
        )
      );
      toast({
        title: "Package updated",
        description: `Package has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      const companies = await adminCompanyService.getAllCompanies();
      setCompanies(companies);
    };
    fetchCompanies();
  }, []);
  console.log(assigningPackage);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Credit Packages</h1>
        <PackageForm onSuccess={() => {
          // Refresh package list or handle success
        }} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packageList.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{pkg.name}</div>
                  <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: pkg.description }}></div>
                </div>
              </TableCell>
              <TableCell>{pkg.credits}</TableCell>
              <TableCell>${pkg.price}</TableCell>
              <TableCell>
                <Badge>
                  {pkg.type === 'one_time' ? 'One Time' : 'Subscription'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={pkg.is_active ? "success" : "secondary"}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(pkg.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      console.log('editing package', pkg);
                      setEditingPackage(pkg);
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Package
                    </DropdownMenuItem>
                    {pkg.is_active ? (
                      <DropdownMenuItem onClick={() => handleStatusChange(pkg.id, false)}>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleStatusChange(pkg.id, true)}>
                        <Power className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                      setAssigningPackage(pkg);
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Assign to Company
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingPackage && (
        <PackageForm 
          packageId={editingPackage.id}
          setPackageId={setEditingPackage}
          onSuccess={() => {
            setEditingPackage(null);
            // Refresh package list or handle success
          }}
        />
      )}
      {assigningPackage && (
        <Dialog open={!!assigningPackage} onOpenChange={() => setAssigningPackage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Package to Company</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Select a company to assign the package to.
              <Select onValueChange={(value) => {
                console.log('selected company', value);
                setSelectedCompany(value as string);
              }}>
                <SelectTrigger className="mt-4">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={async () => {
                    console.log('assigning package', assigningPackage);
                    await creditService.addCreditPackageToCompany(selectedCompany as string, assigningPackage.id);
                    toast({
                      title: "Package assigned",
                      description: "Package has been assigned to the company.",
                    });
                    setAssigningPackage(null);
                  }} className="mt-4">
                    Assign
                  </Button>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 