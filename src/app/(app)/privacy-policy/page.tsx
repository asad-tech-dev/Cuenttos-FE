"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/app/components/icons";

function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-10 w-full py-16 px-10 md:px-28 text-gray-700">
      <div className="flex justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-black"
          onClick={() => router.back()}
        />
      </div>

      <div className="max-w-5xl space-y-6">
        <h1 className="text-3xl font-semibold text-black">Privacy Policy</h1>

        <p className="text-gray">
          Welcome to <span className="font-semibold text-black">Cuentto.</span>{" "}
          Your privacy is important to us, and we are committed to protecting
          any personal information you provide while using our website,{" "}
          <span className="font-semibold text-black">cuentto.com</span> (the
          &apos;&apos;Website&apos;&apos;).
        </p>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            1. Information We Collect
          </h2>
          <p className="text-gray mt-[20px]">
            When you use{" "}
            <span className="font-semibold text-black">cuentto</span>, we may
            collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>
              <span className="font-bold text-subtle-black">
                Personal Information:
              </span>{" "}
              If you sign up, subscribe, or contact us, we may collect your
              name, email address, and other relevant details.
            </li>
            <li>
              <span className="font-bold text-subtle-black">Usage Data:</span>{" "}
              Information about how you interact with the Website, such as pages
              visited, time spent, and browsing behavior.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Cookies and Tracking Technologies:
              </span>{" "}
              We may use cookies and analytics tools to enhance your experience
              and improve our services.
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            2. How We Use Your Information
          </h2>
          <p className="text-gray mt-[20px]">We use the collected data to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>Provide and improve our services.</li>
            <li>
              Personalize your experience on{" "}
              <span className="font-semibold text-black">Cuentto.</span>
            </li>
            <li>Respond to inquiries and communicate with you.</li>
            <li>Monitor and analyze website performance.</li>
            <li>Protect against unauthorized access and ensure security.</li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            3. How We Share Your Information
          </h2>
          <p className="text-gray mt-[20px]">
            We do not sell, rent, or trade your personal data. However, we may
            share information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>With service providers who help operate our Website.</li>
            <li>When required by law or to protect our rights.</li>
            <li>
              In case of a business transfer (e.g., merger or acquisition).
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            4. Your Privacy Choices
          </h2>
          <p className="text-gray mt-[20px]">
            You can manage your privacy settings by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>Disabling cookies in your browser.</li>
            <li>Unsubscribing from emails at any time.</li>
            <li>Contacting us to request data deletion or updates.</li>
          </ul>
        </section>
        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">5. Data Security</h2>
          <p className="text-gray mt-[20px]">
            We take appropriate security measures to protect your personal data
            from unauthorized access, loss, or misuse.
          </p>
        </section>
        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            6. Changes to This Policy
          </h2>
          <p className="text-gray mt-[20px]">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated &apos;&apos;Last
            updated&apos;&apos; date.
          </p>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            5. Contact Information for Safety Concerns
          </h2>
          <p className="text-gray mt-[20px]">
            If you encounter any content that you believe violates our policies
            or if you have concerns please contact us immediately:
          </p>
          <p className="text-gray mt-[20px]">
            <span className="font-bold text-subtle-black">
              Designated Contact:
            </span>{" "}
            Jose Arroyo <br />
            <span className="font-bold text-subtle-black">Email:</span>{" "}
            <span className="text-violet underline">
              {" "}
              Jose.arroyo@cuentto.com{" "}
            </span>
          </p>
          <p className="text-gray mt-[20px]">
            We take every report seriously and will respond promptly to any
            concerns raised.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
