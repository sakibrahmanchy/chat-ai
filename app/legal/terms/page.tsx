import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - SmartHR Flow",
  description: "Terms and conditions for using SmartHR Flow's services",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using SmartHR Flow ("the Service"), you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          SmartHR Flow provides AI-powered recruitment tools, including resume parsing, candidate matching, 
          and recruitment workflow management. The Service operates on a credit-based system for processing 
          resumes and related recruitment activities.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          To use the Service, you must create an account. You are responsible for maintaining the 
          confidentiality of your account credentials and for all activities under your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Credits and Payments</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Credits are non-refundable once purchased</li>
          <li>Credits expire after 12 months from the date of purchase</li>
          <li>Pricing is subject to change with notice to users</li>
          <li>All payments are processed securely through Stripe</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Usage and Privacy</h2>
        <p>
          We process and store data in accordance with our Privacy Policy. By using the Service, 
          you grant us the right to process candidate data for the purposes of providing our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
        <p>
          All intellectual property rights in the Service remain the property of SmartHR Flow. 
          Users are granted a limited license to use the Service in accordance with these terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitations of Liability</h2>
        <p>
          SmartHR Flow provides the Service "as is" without any warranties. We shall not be liable 
          for any indirect, incidental, special, consequential, or punitive damages.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to the Service for violations of 
          these terms or for any other reason at our discretion.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
        <p>
          We may modify these terms at any time. Continued use of the Service after changes 
          constitutes acceptance of the modified terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact</h2>
        <p>
          For questions about these Terms of Service, please contact us at legal@smarthrflow.com
        </p>
      </div>
    </div>
  );
} 