import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - SmartHR Flow",
  description: "Cookie usage and tracking technologies policy for SmartHR Flow",
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you visit 
          our website. They are widely used to make websites work more efficiently and provide useful 
          information to website owners.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable core 
          functionality such as security, account authentication, and remembering your preferences.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Performance Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting 
          and reporting information anonymously. This helps us improve our websites functionality.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Functionality Cookies</h3>
        <p>
          These cookies enable enhanced functionality and personalization, such as remembering your 
          preferences and settings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Third-Party Cookies</h2>
        <p>
          We use third-party services that may set cookies on your device. These include:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Google Analytics (analytics)</li>
          <li>Stripe (payment processing)</li>
          <li>Clerk (authentication)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookie Management</h2>
        <p>
          Most web browsers allow you to control cookies through their settings preferences. 
          However, limiting cookies may impact your experience using our website.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">How to Manage Cookies:</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
          <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
          <li>Safari: Preferences → Privacy → Cookies and website data</li>
          <li>Edge: Settings → Privacy, search, and services → Cookies</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Choices</h2>
        <p>
          When you first visit our website, you will be presented with a cookie banner allowing 
          you to accept or decline non-essential cookies. You can change your preferences at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Any changes will be posted on this 
          page with an updated revision date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about our Cookie Policy, please contact us at:
          <br />
          Email: privacy@smarthrflow.com
        </p>
      </div>
    </div>
  );
} 