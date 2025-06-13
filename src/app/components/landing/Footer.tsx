import Link from "next/link";
import Image from "next/image";

interface ProductType {
  id: number;
  section: string;
  link: string[];
}

interface socialLinks {
  imgSrc: string;
  link: string;
  width: number;
}

const socialLinks: socialLinks[] = [
  {
    imgSrc: "/fb.svg",
    link: "https://facebook.com",
    width: 10,
  },
  {
    imgSrc: "/instagram.svg",
    link: "https://instagram.com",
    width: 14,
  },
  {
    imgSrc: "/twitter.svg",
    link: "https://twitter.com",
    width: 14,
  },
];

const products: ProductType[] = [
  {
    id: 1,
    section: "Company",
    link: ["About", "Careers", "Mobile", "Blog", "How we work?"],
  },
  {
    id: 2,
    section: "Contact",
    link: ["Help/FAQ", "Press", "Affiliates", "Terms", "Partners"],
  },
  {
    id: 3,
    section: "More",
    link: ["Regulations", "Permissions", "Licensing", "Support"],
  },
];

const Footer = () => {
  return (
    <div className="mx-auto  w-[80%] ">
      <div className="my-12 grid grid-cols-1 gap-y-10 sm:grid-cols-6 lg:grid-cols-12">
        <div className="sm:col-span-6 lg:col-span-5">
          <div className="flex flex-shrink-0 items-center border-right">
            <Link href="/" className="text-2xl font-semibold text-black">
              <img src="/dark-logo.png" alt="logo" width={126} height={156} />
            </Link>
          </div>
          <h3 className="text-sm max-w-xs font-normal mt-5 mb-4 lg:mb-12">
            {" "}
            In a world dominated by dopamine generating algorithms, Cuentto provides a safe haven for connecting with yourself and others through writing.
          </h3>
          <div className="flex gap-8">
            {socialLinks.map((items, i) => (
              <Link href={items.link} key={i}>
                <div className="bg-white flex items-center justify-center">
                  <Image
                    src={items.imgSrc}
                    alt={items.imgSrc}
                    width={20}
                    height={10}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CLOUMN-2/3/4 */}

        {products.map((product) => (
          <div key={product.id} className="sm:col-span-2">
            <p className="text-black text-lg font-semibold mb-9">
              {product.section}
            </p>
            <ul>
              {product.link.map((link: string, index: number) => (
                <li key={index} className="mb-5">
                  <Link
                    href="/"
                    className="text-sm text-gray text-base font-normal mb-6"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="py-10 md:flex items-center justify-between border-gray border-t border-t-bordertop">
        <h4 className="text-dark-gray text-sm text-center md:text-start font-normal">
          @2025 - cuentto. All Rights Reserved{" "}
        </h4>
        <div className="flex gap-5 mt-5 md:mt-0 justify-center md:justify-start">
          <h4 className="text-dark-gray text-sm font-normal">
            <Link href="/privacy-policy" >
              Privacy policy
            </Link>
          </h4>
          <div className="h-5 bg-bordertop w-0.5"></div>
          <h4 className="text-dark-gray text-sm font-normal">
            <Link href="/" target="_blank">
              Terms & conditions
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Footer;
