import { EyeIcon, GlobeIcon, MonitorSmartphoneIcon, ServerCogIcon, ZapIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    name: "Store your PDF Documents",
    description: "Keep all your Important PDFs at the same place.",
    icon: GlobeIcon
  },
  {
    name: "Blazing Fast & Responsivee",
    description: "Keep all your Important PDFs at the same place.",
    icon: ZapIcon
  },
  {
    name: "Interactive PDF Viewer",
    description: "Keep all your Important PDFs at the same place.",
    icon: EyeIcon
  },
  {
    name: "Cloud Backup",
    description: "Keep all your Important PDFs at the same place.",
    icon: ServerCogIcon
  },
  {
    name: "Responsive across all devices",
    description: "Keep all your Important PDFs at the same place.",
    icon: MonitorSmartphoneIcon
  },
]

export default function Home() {
  return (
      <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
        <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
          <div className="flex flex-col justify-center items-center mx-auto max-w-7xl pxx-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Your Interactive Document Companion</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:texy-6xl">Transform your PDFs into Interactive Conversation</p>
              <p>
                Introducing{" "}
                <span className="font-bold text-indigo-600">Chat with PDF.</span>
                <br />
                <br /> Upload your document, and our chatbot will answer questions,
                summarize content, and answer all yours Qs. Ideal for everyone, {" "}
                <span className="text-indigo-600">Chat with PDF</span>{" "}
                <span className="font-bold">dynamic conversation</span>,
                enhancing productivity 10x fold effortlessly.
              </p>
            </div>

            <Button asChild className="mt-10">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>

          <div>
            <div>
              <Image
                alt="App Screnshot"
                src="https://i.imgur.com/ciRTSI.jpeg"
                width={2432}
                height={1442}
                className="mb-[-0%] rounded-xl shadow2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </main>
  );
}
