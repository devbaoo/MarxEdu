import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchSurvey, fetchSurveyStatus, resetSubmitStatus, submitSurvey } from "../../services/features/survey/surveySlice";
import { ISurveyAnswer } from "../../interfaces/ISurvey";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SurveyModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, setIsOpen }) => {
    const dispatch = useAppDispatch();
    const { survey, surveyStatus, loading, submitting, submitSuccess, error } = useAppSelector((state) => state.survey);

    const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [showReward, setShowReward] = useState(false);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchSurvey());
            dispatch(fetchSurveyStatus());
            setCurrentStep(0);
            setAnswers({});
            setShowReward(false);
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (submitSuccess) {
            setShowReward(true);
        }
    }, [submitSuccess]);

    const handleCloseModal = () => {
        setIsOpen(false);
        dispatch(resetSubmitStatus());
    };

    const handleInputChange = (questionId: string, value: string | number | string[]) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = () => {
        if (!survey) return;

        const surveyAnswers: ISurveyAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));

        dispatch(
            submitSurvey({
                surveyId: survey._id,
                answers: surveyAnswers,
            })
        );
    };

    const handleNext = () => {
        if (!survey) return;

        if (currentStep < survey.questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isCurrentQuestionAnswered = () => {
        if (!survey) return false;

        const currentQuestion = survey.questions[currentStep];
        if (!currentQuestion) return true;

        if (!currentQuestion.required) return true;

        return !!answers[currentQuestion._id];
    };

    const renderQuestion = () => {
        if (!survey || loading) return null;

        const currentQuestion = survey.questions[currentStep];
        if (!currentQuestion) return null;

        switch (currentQuestion.questionType) {
            case "rating":
                return (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
                        <div className="flex items-center justify-center mt-4 space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => handleInputChange(currentQuestion._id, rating)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold 
                    ${answers[currentQuestion._id] === rating
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case "multiple_choice":
                return (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
                        <div className="mt-4 space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`option-${index}`}
                                        name={currentQuestion._id}
                                        value={option}
                                        checked={answers[currentQuestion._id] === option}
                                        onChange={() => handleInputChange(currentQuestion._id, option)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor={`option-${index}`}
                                        className="ml-2 block text-sm font-medium text-gray-700"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "text":
                return (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
                        <textarea
                            value={answers[currentQuestion._id] as string || ""}
                            onChange={(e) => handleInputChange(currentQuestion._id, e.target.value)}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={4}
                            placeholder="Nhập câu trả lời của bạn..."
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const renderRewardScreen = () => {
        if (!survey) return null;

        return (
            <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
                    <svg
                        className="h-16 w-16 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                    Cảm ơn bạn đã hoàn thành khảo sát!
                </h2>
                <p className="mt-2 text-gray-600">
                    Bạn đã nhận được phần thưởng:
                </p>
                <div className="mt-4 flex justify-center space-x-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {survey.reward.xp}
                        </div>
                        <div className="text-sm text-gray-500">XP</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {survey.reward.points}
                        </div>
                        <div className="text-sm text-gray-500">Điểm</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-8 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                    Đóng
                </button>
            </div>
        );
    };

    const renderProgressBar = () => {
        if (!survey || survey.questions.length === 0) return null;

        const progress = ((currentStep + 1) / survey.questions.length) * 100;

        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        );
    };

    if (!survey || surveyStatus?.hasCompleted) {
        return null;
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="absolute top-0 right-0 pt-4 pr-4">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={handleCloseModal}
                                    >
                                        <span className="sr-only">Đóng</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : showReward ? (
                                    renderRewardScreen()
                                ) : (
                                    <>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {survey?.title}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {survey?.description}
                                        </p>

                                        {renderProgressBar()}
                                        {renderQuestion()}

                                        {error && (
                                            <div className="mt-4 text-sm text-red-600">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-between">
                                            <button
                                                type="button"
                                                onClick={handlePrevious}
                                                disabled={currentStep === 0}
                                                className={`inline-flex justify-center px-4 py-2 text-sm font-medium border rounded-md 
                          ${currentStep === 0
                                                        ? "text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed"
                                                        : "text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                                                    }`}
                                            >
                                                Quay lại
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={!isCurrentQuestionAnswered() || submitting}
                                                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md 
                          ${!isCurrentQuestionAnswered() || submitting
                                                        ? "bg-blue-400 cursor-not-allowed"
                                                        : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                            >
                                                {submitting ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                                        Đang gửi...
                                                    </div>
                                                ) : currentStep === survey?.questions.length - 1 ? (
                                                    "Hoàn thành"
                                                ) : (
                                                    "Tiếp theo"
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SurveyModal;
