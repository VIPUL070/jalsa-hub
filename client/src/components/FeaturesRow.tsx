import { FaRegClock, FaShieldAlt, FaTicketAlt } from "react-icons/fa";

const featuredItems = [
  {
    title: "Fast Booking",
    description:
      "Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.",
    icon: <FaRegClock />,
  },
  {
    title: "Seamless Access",
    description:
      "Download tickets instantly or manage them right from your personal dashboard with easily.",
    icon: <FaTicketAlt />,
  },
  {
    title: "Secure Platform",
    description:
      "All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.",
    icon: <FaShieldAlt />,
  },
];

const FeaturesRow = () => {
  return (
    <>
      {featuredItems.map((item, index) => (
        <div
          key={index} 
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300"
        >
          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
            {item.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </>
  );
};

export default FeaturesRow;
