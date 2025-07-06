import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { completeLesson, retryLesson, fetchLessons } from "@/services/features/lesson/lessonSlice";
import { CheckmarkSvg, StarSvg, CloseSvg, ChevronDownSvg } from "@/components/ui/Svgs";
import { Modal, Spin } from 'antd';
import { fetchUserProfile } from "@/services/features/user/userSlice";
import Confetti from 'react-confetti';
import { QuestionResult, CompleteLessonResponse } from "@/interfaces/ILesson";

interface LocationState {
    lessonId: string;
    score: number;
    questionResults: QuestionResult[];
    isRetried: boolean;
}

const LessonSubmitPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { profile: userProfile } = useAppSelector((state) => state.user);
    const { lessons } = useAppSelector((state) => state.lesson);
    const [showConfetti, setShowConfetti] = useState(false);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState<{ [key: string]: boolean }>({});
    const [serverResults, setServerResults] = useState<CompleteLessonResponse | null>(null);

    const state = location.state as LocationState;

    useEffect(() => {
        if (!state) {
            navigate("/learn");
            return;
        }

        const submitLesson = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 5000));

                const result = await dispatch(completeLesson({
                    lessonId: state.lessonId,
                    score: state.score,
                    questionResults: state.questionResults,
                    isRetried: state.isRetried,
                })).unwrap();

                setServerResults(result as CompleteLessonResponse);
                if (result.status === "COMPLETE") {
                    setShowConfetti(true);
                }
                await dispatch(fetchUserProfile());
                // Refresh lessons after completion
                await dispatch(fetchLessons({ page: 1, limit: 5 }));
            } catch (error: unknown) {
                console.error("Failed to submit lesson:", error);
            } finally {
                setLoading(false);
            }
        };

        submitLesson();
    }, [dispatch, state, navigate]);

    useEffect(() => {
        if (lessons.length > 0 && state) {
            const currentLesson = lessons.find(lesson => lesson.lessonId === state.lessonId);
            if (!currentLesson) return;

            const lessonsInTopic = lessons.filter(lesson => lesson.topic === currentLesson.topic);
            lessonsInTopic.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const currentIndex = lessonsInTopic.findIndex(lesson => lesson.lessonId === state.lessonId);

            if (currentIndex !== -1 && currentIndex < lessonsInTopic.length - 1 &&
                serverResults?.status === "COMPLETE" &&
                lessonsInTopic[currentIndex + 1].status !== "LOCKED") {
                setNextLessonId(lessonsInTopic[currentIndex + 1].lessonId);
            }
        }
    }, [lessons, state, serverResults]);

    const handleNextLesson = () => {
        if (nextLessonId) {
            navigate(`/lesson/${nextLessonId}`);
        }
    };

    const handleBackToLessons = async () => {
        // Refresh lessons before navigating back
        await dispatch(fetchLessons({ page: 1, limit: 5 }));
        navigate("/learn");
    };

    const handleRetry = async () => {
        if (userProfile?.lives === 0) {
            Modal.info({
                title: <span className="font-baloo text-xl">Out of Lives</span>,
                content: <span className="font-baloo text-lg">Hiện tại số tim của bạn là 0, bạn không thể làm lại bài này. Hãy chờ hoặc mua thêm tim để tiếp tục!</span>,
                centered: true,
                okText: <span className="font-baloo">OK</span>,
            });
            return;
        }
        Modal.confirm({
            title: <span className="font-baloo text-xl">Try this lesson again?</span>,
            content: <span className="font-baloo text-lg">Your previous result will be reset.</span>,
            okText: <span className="font-baloo">Yes, try again</span>,
            cancelText: <span className="font-baloo">Cancel</span>,
            centered: true,
            onOk: async () => {
                if (!user?.id || !state?.lessonId) return;
                try {
                    await dispatch(retryLesson({
                        lessonId: state.lessonId,
                    })).unwrap();
                    dispatch(fetchUserProfile());
                    navigate(`/lesson/${state.lessonId}`);
                } catch (error) {
                    console.error("Failed to retry lesson:", error);
                }
            },
        });
    };

    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    if (!state || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    const correctAnswers = serverResults?.progress?.questionResults?.filter((result) => result.isCorrect).length || 0;
    const totalQuestions = serverResults?.progress?.questionResults?.length || 0;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4 font-baloo">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
                    {showConfetti && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <Confetti
                                width={window.innerWidth}
                                height={window.innerHeight}
                                recycle={false}
                                numberOfPieces={500}
                                gravity={0.2}
                                colors={['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']}
                                initialVelocityY={10}
                                tweenDuration={5000}
                            />
                        </div>
                    )}

                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 font-baloo">Lesson Complete!</h1>
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-2xl sm:text-4xl font-bold text-red-600 font-baloo">{percentage}%</span>
                                </div>
                                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4">
                                    <StarSvg />
                                </div>
                            </div>
                        </div>
                        <p className="text-lg sm:text-xl text-gray-600 font-baloo">
                            You scored {serverResults?.progress?.score || 0} points!
                        </p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="font-semibold text-green-700 mb-1 sm:mb-2 text-sm sm:text-base font-baloo">Correct Answers</h3>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 font-baloo">{correctAnswers}</p>
                            </div>
                            <div className="bg-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="font-semibold text-red-700 mb-1 sm:mb-2 text-sm sm:text-base font-baloo">Incorrect Answers</h3>
                                <p className="text-xl sm:text-2xl font-bold text-red-600 font-baloo">{totalQuestions - correctAnswers}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base font-baloo">Question Results</h3>
                            <p className="text-gray-600 mb-4 text-sm">Click on each question to view your answer and feedback</p>
                            <div className="space-y-3 sm:space-y-4">
                                {serverResults?.progress?.questionResults?.map((result, index) => (
                                    <div key={result.questionId} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div
                                            className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleQuestion(result.questionId)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium font-baloo">Question {index + 1}</span>
                                                <span className="text-sm text-gray-500">(Click to {expandedQuestions[result.questionId] ? 'hide' : 'view'} details)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {result.score >= 50 ? (
                                                    <div className="w-7 h-7 flex items-center justify-center">
                                                        <CheckmarkSvg />
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 flex items-center justify-center text-red-500">
                                                        <CloseSvg />
                                                    </div>
                                                )}
                                                <div className={`w-5 h-5 transition-transform ${expandedQuestions[result.questionId] ? 'rotate-180' : ''}`}>
                                                    <ChevronDownSvg />
                                                </div>
                                            </div>
                                        </div>
                                        {expandedQuestions[result.questionId] && (
                                            <div className="p-4 border-t border-gray-100">
                                                <div className="mb-3">
                                                    <h4 className="font-semibold text-gray-700 mb-2">Your Answer:</h4>
                                                    <p className="text-gray-600">{result.answer}</p>
                                                </div>
                                                {result.feedback && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-2">Feedback:</h4>
                                                        <div className="text-gray-600 whitespace-pre-line">{result.feedback}</div>
                                                    </div>
                                                )}
                                                <div className="mt-3 text-sm text-gray-500">
                                                    Score: {result.score}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex justify-center gap-3 sm:gap-4">
                        <button
                            onClick={handleBackToLessons}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors text-sm sm:text-base font-baloo"
                        >
                            Back to Lessons
                        </button>
                        {nextLessonId && serverResults?.status === "COMPLETE" && (
                            <button
                                onClick={handleNextLesson}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors text-sm sm:text-base font-baloo"
                            >
                                Next Lesson
                            </button>
                        )}
                        <button
                            onClick={handleRetry}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-baloo ${userProfile?.lives === 0 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                            disabled={userProfile?.lives === 0}
                        >
                            {userProfile?.lives === 0 ? 'Try Again (Lives: 0)' : 'Try Again'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonSubmitPage; 