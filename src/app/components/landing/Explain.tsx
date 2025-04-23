import Image from "next/image";

interface datatype {
  imgSrc: string;
  heading: string;
  paragraph: string;
}

const Aboutdata: datatype[] = [
  {
    imgSrc: "/thinkicon.svg",
    heading: "Think",
    paragraph:
      "Connect with yourself and transform what you think and feel into words. Be part of this healthy transformation.",
  },
  {
    imgSrc: "/writeicon.svg",
    heading: "Write",
    paragraph:
      "Write your mind and create stories to manifest your thoughts and ideas. Grow while writing. ",
  },
  {
    imgSrc: "/shareicon.svg",
    heading: "Share",
    paragraph:
      "Share your cuentto® with the world and discover yourself feeling empowered.",
  },
];

const Explain = () => {
  return (
    <div className="bg-white" id="features">
      <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-4 lg:gap-x-8 mt-6">
          {Aboutdata.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 featureShadow">
              <Image
                src={item.imgSrc}
                alt={item.imgSrc}
                width={55}
                height={55}
                className="mb-2"
              />
              <h3 className="text-2xl font-semibold text-black mt-5">
                {item.heading}
              </h3>
              <h4 className="text-lg font-normal text-dark-gray my-2">
                {item.paragraph}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explain;
