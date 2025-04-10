"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/app/components/icons";

function ChildSafetyStandardsPage() {
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
        <h1 className="text-3xl font-semibold text-black">
          Cuentto Child Safety Standards
        </h1>

        <p className="text-gray">
          At <span className="font-bold text-black">Cuentto</span>, we are committed to creating a safe
          environment for all of our users. We prioritize{" "}
          <span className="font-bold text-black">child safety</span> and work hard to prevent child sexual
          abuse and exploitation (CSAE) in any form. This document outlines the
          steps we take to prevent, identify, and respond to incidents of CSAE.
          We also detail how we handle the reporting of child sexual abuse
          material (CSAM).
        </p>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            1. Our Commitment to Preventing CSAE
          </h2>
          <p className="text-gray mt-[20px]">
            We recognize that child sexual abuse and exploitation are serious
            issues that require strict measures to protect vulnerable
            individuals, especially children. To that end, we have implemented
            the following practices to safeguard users:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>
              <span className="font-bold text-subtle-black">
                User Age Verification:
              </span>{" "}
              We require users to confirm their age during account creation. Any
              user who does not meet the minimum age requirement will not be
              allowed to access the app.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Content Moderation:
              </span>{" "}
              We use automated systems, in addition to manual moderation, to
              detect and prevent the sharing of inappropriate content, including
              CSAM. Our system flags any content suspected of violating CSAE
              laws for further investigation.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Reporting Mechanism:
              </span>{" "}
              Users can easily report any content or behavior they believe
              violates our safety policies, including CSAE. Our reporting system
              is simple and accessible from within the app, and we take
              immediate action on any reported material.
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            2. Procedures for Reporting and Handling CSAE
          </h2>
          <p className="text-gray mt-[20px]">
            We take all reports of CSAE seriously. Our procedures for handling
            such reports include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>
              <span className="font-bold text-subtle-black">
                Immediate Review:
              </span>{" "}
              Upon receiving a report, our support team will immediately review
              the content in question. If necessary, we will escalate the matter
              to law enforcement authorities or relevant child protection
              agencies.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Removal of CSAM:
              </span>{" "}
              Any content found to violate CSAE standards will be removed from
              the platform, and the responsible user's account will be suspended
              or permanently banned, depending on the severity of the violation.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Cooperation with Authorities:
              </span>{" "}
              We cooperate with law enforcement and relevant authorities to
              investigate any reports of CSAE. If any content is found to be
              child sexual abuse material (CSAM), we will report it to the
              appropriate national and international authorities.
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            3. Preventing Access to Inappropriate Content
          </h2>
          <p className="text-gray mt-[20px]">
            We employ several methods to prevent users, particularly minors,
            from accessing harmful or inappropriate content:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>
              <span className="font-bold text-subtle-black">
                Restricted Search and Discovery:
              </span>{" "}
              We restrict the ability to search for certain types of content
              that may lead to exposure to CSAE.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Parental Controls:
              </span>{" "}
              For users under a certain age, we provide parental control
              features that allow guardians to monitor and limit the content
              their child can access.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                Educational Content:
              </span>{" "}
              We provide resources to educate users on the importance of safety
              online, including how to recognize and report inappropriate
              content.
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            4. Child Sexual Abuse Material (CSAM) Prevention
          </h2>
          <p className="text-gray mt-[20px]">
            We strictly prohibit the sharing of CSAM on our platform. Our
            platform uses a combination of machine learning algorithms,
            artificial intelligence, and manual reporting to detect and prevent
            the upload or sharing of CSAM.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray mt-[20px]">
            <li>
              <span className="font-bold text-subtle-black">
                Use of Technology:
              </span>{" "}
              We utilize industry-leading technologies to scan for and detect
              CSAM, including hash matching technologies to identify previously
              known CSAM images and videos.
            </li>
            <li>
              <span className="font-bold text-subtle-black">
                User Education:
              </span>{" "}
              We continuously work to educate our users about the dangers of
              CSAE and the importance of reporting any concerning behavior or
              content.
            </li>
          </ul>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            5. Contact Information for Child Safety Concerns
          </h2>
          <p className="text-gray mt-[20px]">
            If you encounter any content that you believe violates our child
            safety standards or if you have concerns related to CSAE, please
            contact us immediately:
          </p>
          <p className="text-gray mt-[20px]">
            <span className="font-bold text-subtle-black">
              Designated Contact:
            </span>{" "}
            Jose Arroyo <br />
            <span className="font-bold text-subtle-black">Email:</span >{" "}
            <span className="text-violet underline"> Jose.arroyo@cuentto.com </span>
          </p>
          <p className="text-gray mt-[20px]">
            We take every report seriously and will respond promptly to any
            concerns raised.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-[30px]">
            Reporting to Authorities
          </h2>
          <p className="text-gray mt-[20px]">
            As part of our commitment to child safety, we ensure that any
            reports of CSAE are forwarded to the relevant authorities. We are
            committed to fully complying with all laws and regulations regarding
            CSAE, and we encourage our users to report any suspicious activity
            to local law enforcement agencies.
          </p>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            6. Our Legal Obligations
          </h2>
          <p className="text-gray mt-[20px]">
            We comply with all relevant child protection laws, including those
            in the jurisdictions where our users are located. We follow legal
            requirements for reporting CSAE and CSAM to the appropriate regional
            and national authorities. This ensures that incidents are
            investigated thoroughly and that those responsible are held
            accountable.
          </p>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">
            7. Transparency and Accountability
          </h2>
          <p className="text-gray mt-[20px]">
            We believe in transparency when it comes to child safety. We
            regularly update our safety policies and procedures to reflect the
            latest best practices in child protection. We also encourage
            feedback from users, advocacy groups, and child safety organizations
            to continually improve our approach.
          </p>
        </section>

        <section className="mt-[40px]">
          <h2 className="text-xl font-semibold text-black">Conclusion</h2>
          <p className="text-gray mt-[20px]">
            At Cuentto, we are committed to providing a safe environment for all
            users. By implementing strict policies and using a combination of
            technological and manual oversight, we ensure that CSAE is prevented
            and addressed effectively. We are always open to feedback and
            continuously improve our practices to ensure that our platform
            remains a safe space for everyone. For more information on how we
            ensure safety on our platform, please visit our <span className="font-bold text-black">Help Center</span> or
            contact us directly at{" "}
            <span className="text-violet underline">
              Jose.arroyo@cuentto.com.
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}

export default ChildSafetyStandardsPage;
