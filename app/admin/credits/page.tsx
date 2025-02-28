import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminCreditService } from "@/lib/services/admin/credit.service";
import { adminCreditActionService } from "@/lib/services/admin/credit-actions.service";
import { adminCompanyService } from "@/lib/services/admin/company.service";
import { PackageList } from "@/components/admin/credits/package-list";
import { PackageForm } from "@/components/admin/credits/package-form";
import { ActionList } from "@/components/admin/credits/action-list";
import { ActionForm } from "@/components/admin/credits/action-form";
import { CreditAssignment } from "@/components/admin/credits/credit-assignment";
import { CreditTransactions } from "@/components/admin/credits/credit-transactions";

export default async function AdminCreditsPage() {
  const packages = await adminCreditService.getAllPackages();
  const actions = await adminCreditActionService.getAllActions();
  const companies = await adminCompanyService.getAllCompanies();
  const transactions = await adminCreditService.getCreditTransactions();

  return (
    <div className="space-y-8">
      <Tabs defaultValue="packages" className="w-full">
        <TabsList>
          <TabsTrigger value="packages">Credit Packages</TabsTrigger>
          <TabsTrigger value="actions">Credit Actions</TabsTrigger>
          <TabsTrigger value="transactions">Credit Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <div className="space-y-8">
            <Card className="p-6">
              <PackageList packages={packages} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Credit Actions</h1>
              <ActionForm />
            </div>

            <Card className="p-6">
              <ActionList actions={actions} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Credit Transactions</h1>
              <CreditAssignment companies={companies} />
            </div>

            <Card className="p-6">
              <CreditTransactions transactions={transactions} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 