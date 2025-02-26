import { Card } from "@/components/ui/card";
import { adminCompanyService } from "@/lib/services/admin/company.service";
import { CompanyList } from "@/components/admin/companies/company-list";
import { CompanyFilters } from "@/components/admin/companies/company-filters";

export default async function AdminCompaniesPage() {
  const companies = await adminCompanyService.getAllCompanies();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Companies</h1>
      </div>

      <Card className="p-6">
        <CompanyFilters />
        <CompanyList companies={companies} />
      </Card>
    </div>
  );
} 