import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

type ProcessProps = {
  currentStep: number;
  Page: JSX.Element;
  onBack?: () => void;
  onClose?: () => void;
};

const Process = ({ currentStep, Page }: ProcessProps) => {
  const totalPages = 4;
  const progress = ((currentStep - 1) / (totalPages - 1)) * 100;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center w-full mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-green-500 transition mr-4"
        >
          <IoChevronBack size={28} />
        </button>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {/* <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-red-500 transition"
        >
          <IoClose size={24} />
        </button> */}
      </div>
      <div className="w-full">{Page}</div>
    </div>
  );
};

export default Process;
