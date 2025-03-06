import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - SmartHR Flow",
  description: "Privacy policy and data handling practices for SmartHR Flow",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          SmartHR Flow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
          explains how we collect, use, disclose, and safeguard your information when you use our service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Personal Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Name and contact information</li>
          <li>Company details</li>
          <li>Billing information</li>
          <li>Login credentials</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Candidate Data</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Resume content and parsed information</li>
          <li>Contact details</li>
          <li>Professional history</li>
          <li>Skills and qualifications</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and maintain our Service</li>
          <li>To process job applications and match candidates</li>
          <li>To communicate with you about our Service</li>
          <li>To process payments and manage your account</li>
          <li>To improve our Service and develop new features</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your data. 
          Your information is stored securely in data centers located in the United States.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide 
          you with our Service. We will delete or anonymize your information upon request unless 
          we are legally required to retain it.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
        <p>
          We use trusted third-party services for:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Payment processing (Stripe)</li>
          <li>Authentication (Clerk)</li>
          <li>Cloud infrastructure (AWS/Google Cloud)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to data processing</li>
          <li>Export your data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to improve your experience and analyze 
          how our Service is used. You can control cookie preferences through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children Privacy</h2>
        <p>
          Our Service is not intended for children under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
          <br />
          Email: privacy@smarthrflow.com
          <br />
          Address: [Your Company Address]
        </p>
      </div>
    </div>
  );
} 