import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchLessonById } from "@/services/features/lesson/lessonSlice";
import NotFoundPage from "@/page/Error/NotFoundPage";
import { IQuestion, QuestionResult } from "@/interfaces/ILesson";
import { PodcastIconSvg } from "@/components/ui/Svgs";
import { AudioOutlined, RedoOutlined, CloseOutlined, SoundOutlined, PauseCircleTwoTone } from '@ant-design/icons';
import { Button, Space, Card } from 'antd';

interface ShuffledQuestion extends Omit<IQuestion, 'options'> {
    options: string[];
    originalCorrectAnswer?: string;
}

const LessonPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentLesson, loading, error } = useAppSelector((state) => state.lesson);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [textInput, setTextInput] = useState<string>("");
    const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio] = useState(new Audio());
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const isCancelingRef = useRef(false);

    // Function to check if a question's skill matches any of the lesson's skills
    const isQuestionSkillInLesson = (questionSkillId: string): boolean => {
        return currentLesson?.skills.some(skill => skill._id === questionSkillId) || false;
    };

    // Function to handle audio playback
    const handleAudioPlay = () => {
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        if (currentQuestion.audioContent) {
            if (isPlaying) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
            } else {
                audio.src = currentQuestion.audioContent;
                audio.play();
                setIsPlaying(true);
            }
        }
    };

    // Add audio event listeners
    useEffect(() => {
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('play', () => setIsPlaying(true));

        return () => {
            audio.removeEventListener('ended', () => setIsPlaying(false));
            audio.removeEventListener('pause', () => setIsPlaying(false));
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.pause();
        };
    }, [audio]);

    // Format seconds to mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            setRecordingTime(0);
            setIsRecording(true);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                setIsRecording(false);
                if (isCancelingRef.current) {
                    setAudioBlob(null);
                    setAudioUrl("");
                    isCancelingRef.current = false;
                    return;
                }
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                setAudioUrl(URL.createObjectURL(audioBlob));
            };

            mediaRecorder.start();
        } catch {
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            alert('Không thể truy cập microphone.');
        }
    };

    // Stop and save recording
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Cancel recording (do not save)
    const handleCancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            isCancelingRef.current = true;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };

    // Function to convert Blob to base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]); // Remove the data URL prefix
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Function to shuffle array using Fisher-Yates algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Function to shuffle questions and their options
    const shuffleQuestionsAndOptions = (questions: IQuestion[]): ShuffledQuestion[] => {
        return questions.map(question => {
            const shuffledOptions = shuffleArray(question.options);
            return {
                ...question,
                options: shuffledOptions,
                originalCorrectAnswer: question.correctAnswer || ''
            };
        });
    };

    useEffect(() => {
        if (id) {
            dispatch(fetchLessonById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (currentLesson) {
            const shuffled = shuffleArray(shuffleQuestionsAndOptions(currentLesson.questions));
            setShuffledQuestions(shuffled);
        }
    }, [currentLesson]);

    // Update the timer when the current question changes
    useEffect(() => {
        if (shuffledQuestions.length > 0 && currentQuestionIndex < shuffledQuestions.length) {
            const currentQuestion = shuffledQuestions[currentQuestionIndex];
            setTimeLeft(currentQuestion.timeLimit || 30); // Default to 30 seconds if timeLimit not set
        }
    }, [currentQuestionIndex, shuffledQuestions]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            handleTimeout();
        }
    }, [timeLeft]);

    // Handle F5 refresh and navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang? Tiến độ bài học của bạn sẽ không được lưu.';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Handle browser back button
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault();
            if (window.confirm('Bạn có chắc chắn muốn rời khỏi trang? Tiến độ bài học của bạn sẽ không được lưu.')) {
                navigate('/learn');
            } else {
                window.history.pushState(null, '', `/lesson/${id}`);
            }
        };

        window.history.pushState(null, '', `/lesson/${id}`);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [id, navigate]);

    useEffect(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer("");
        setTextInput("");
        setQuestionResults([]);
        setScore(0);
        setIsPlaying(false);
        audio.pause();
        setAudioBlob(null);
        setAudioUrl("");
    }, [id, audio]);

    const handleTimeout = () => {
        if (currentLesson && currentQuestionIndex < shuffledQuestions.length) {
            const currentQuestion = shuffledQuestions[currentQuestionIndex];
            const result: QuestionResult = {
                questionId: currentQuestion._id,
                answer: "",
                isCorrect: false,
                isTimeout: true,
            };
            setQuestionResults([...questionResults, result]);
            handleNextQuestion();
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleTextInputChange = (value: string) => {
        setTextInput(value);
    };

    const handleNextQuestion = async () => {
        if (currentLesson && currentQuestionIndex < shuffledQuestions.length) {
            const currentQuestion = shuffledQuestions[currentQuestionIndex];
            const isTimeout = timeLeft === 0;

            let answer = "";
            if (currentQuestion.type === "audio_input" && audioBlob) {
                answer = await blobToBase64(audioBlob);
            } else if (currentQuestion.type === "multiple_choice") {
                answer = selectedAnswer;
            } else {
                answer = textInput;
            }

            const result: QuestionResult = {
                questionId: currentQuestion._id,
                answer: answer,
                isCorrect: false,
                isTimeout,
            };

            setQuestionResults([...questionResults, result]);
            setSelectedAnswer("");
            setTextInput("");
            setIsPlaying(false);
            audio.pause();
            setAudioBlob(null);
            setAudioUrl("");

            if (currentQuestionIndex + 1 < shuffledQuestions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                // Navigate to submit page with current results
                navigate("/lesson/submit", {
                    state: {
                        lessonId: currentLesson._id,
                        score: score,
                        questionResults: [...questionResults, result],
                        isRetried: false,
                    },
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen font-">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !currentLesson || shuffledQuestions.length === 0) {
        return <NotFoundPage />;
    }

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    const isTextInputQuestion = currentQuestion.type === "text_input" && isQuestionSkillInLesson(currentQuestion.skill);
    const isListeningQuestion = currentQuestion.audioContent && currentQuestion.skill === currentLesson.skills.find(skill => skill.name === "Listening")?._id;
    const isSpeakingQuestion = currentQuestion.type === "audio_input" && currentQuestion.skill === currentLesson.skills.find(skill => skill.name === "Speaking")?._id;

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4 font-baloo">
            <div className="max-w-3xl mx-auto mt-16">
                {/* Progress Bar */}
                <div className="mb-4 sm:mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-base sm:text-lg font-semibold">Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</span>
                        <span className="text-base sm:text-lg font-semibold">{timeLeft}s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                        <div
                            className="bg-blue-500 h-3 sm:h-4 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        {isListeningQuestion ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-8">
                                <div className={`relative ${isPlaying ? 'animate-bounce' : ''}`}>
                                    <button
                                        onClick={handleAudioPlay}
                                        className={`p-4 rounded-full transition-all duration-200 ${isPlaying ? 'bg-blue-500 text-white scale-110' : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        <PodcastIconSvg className="w-12 h-12" />
                                    </button>
                                    {isPlaying && (
                                        <div className="absolute -inset-4 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                                    )}
                                </div>
                                <p className="mt-4 text-gray-600 text-center">
                                    {isPlaying ? "Listening..." : "Click to listen"}
                                </p>
                            </div>
                        ) : (
                            <h2 className="text-xl sm:text-2xl font-bold">{currentQuestion.content}</h2>
                        )}
                    </div>

                    {isSpeakingQuestion ? (
                        <div className="space-y-4">
                            {/* Trạng thái 1: Chưa thu âm */}
                            {!isRecording && !audioUrl && (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        size="large"
                                        icon={<AudioOutlined style={{ fontSize: 32 }} />}
                                        onClick={startRecording}
                                        style={{ width: 72, height: 72, boxShadow: '0 2px 8px #91d5ff' }}
                                    />
                                    <p className="mt-4 text-gray-700 text-lg font-semibold">Nhấn để bắt đầu thu âm</p>
                                </div>
                            )}
                            {/* Trạng thái 2: Đang thu âm */}
                            {isRecording && (
                                <Space direction="horizontal" size="large" className="justify-center w-full py-8">
                                    {/* Nút hủy */}
                                    <Button
                                        type="default"
                                        shape="circle"
                                        icon={<CloseOutlined />}
                                        danger
                                        size="middle"
                                        onClick={handleCancelRecording}
                                        title="Hủy thu âm"
                                    />
                                    {/* Nút dừng và thời gian */}
                                    <div className="flex items-center bg-blue-50 rounded-full px-6 py-3 shadow-lg">
                                        <Button
                                            type="primary"
                                            shape="circle"
                                            icon={<PauseCircleTwoTone />}
                                            size="large"
                                            onClick={handleStopRecording}
                                            style={{ marginRight: 24, background: '#1890ff', borderColor: '#1890ff' }}
                                            title="Dừng thu âm"
                                        />
                                        <span className="bg-white text-blue-500 rounded-full px-4 py-1 font-mono text-lg font-bold">
                                            {formatTime(recordingTime)}
                                        </span>
                                    </div>
                                </Space>
                            )}
                            {/* Trạng thái 3: Đã thu xong */}
                            {!isRecording && audioUrl && (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <Card
                                        className="w-full max-w-md shadow-lg border border-blue-100 rounded-2xl"
                                        bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, background: '#f0f7ff' }}
                                        bordered
                                    >
                                        <div className="flex flex-col items-center justify-center mr-4">
                                            <div className="flex items-center justify-center bg-blue-100 rounded-full w-16 h-16 mb-2">
                                                <SoundOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <span className="text-base font-semibold text-blue-600 mb-2">Nghe lại câu trả lời của bạn</span>
                                            <audio src={audioUrl} controls className="w-full rounded-lg border border-blue-200" />
                                        </div>
                                    </Card>
                                    <Button
                                        icon={<RedoOutlined />}
                                        onClick={() => {
                                            setAudioBlob(null);
                                            setAudioUrl("");
                                            setRecordingTime(0);
                                        }}
                                        type="primary"
                                        shape="round"
                                        size="large"
                                        className="mt-2 shadow-md"
                                    >
                                        Thu âm lại
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : isTextInputQuestion ? (
                        <div className="space-y-4">
                            <textarea
                                value={textInput}
                                onChange={(e) => handleTextInputChange(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 resize-none min-h-[120px] sm:min-h-[180px] text-base"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {currentQuestion.options.map((option: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 text-sm sm:text-base ${selectedAnswer === option
                                        ? "bg-blue-500 text-white transform scale-105"
                                        : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end">
                    <button
                        onClick={handleNextQuestion}
                        disabled={
                            isSpeakingQuestion ? !audioBlob :
                                isTextInputQuestion ? !textInput.trim() :
                                    !selectedAnswer
                        }
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base ${(isSpeakingQuestion ? audioBlob :
                            isTextInputQuestion ? textInput.trim() :
                                selectedAnswer)
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {currentQuestionIndex + 1 === shuffledQuestions.length ? "Finish" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonPage;
