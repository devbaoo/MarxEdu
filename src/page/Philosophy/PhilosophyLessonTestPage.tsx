import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Spin,
  Alert,
  Radio,
  Progress,
  Modal,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import {
  getMarxistPhilosophyLessonByPath,
  completeMarxistPhilosophyLesson,
  retryMarxistPhilosophyLesson,
  getMarxistPhilosophyLearningPath,
} from "@/services/features/marxist/philosophySlice";
import {
  updateUserLives,
  updateUserXPAndLevel,
} from "@/services/features/auth/authSlice";
import { ILesson, IQuestion } from "@/interfaces/ILesson";
import { shuffleQuestions, shuffleAllQuestionOptions } from "@/lib/utils";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface Answer {
  questionId: string;
  selectedAnswer: string;
}

const PhilosophyLessonTestPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // 🔄 Detect if this is a retry request from URL parameter
  const isRetry = searchParams.get("retry") === "true";

  const { error } = useAppSelector((state: RootState) => state.philosophy);
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); // Will be calculated dynamically from lesson questions
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  console.log("🔄 Retry mode detected:", isRetry);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [testStarted, timeLeft]);

  const fetchLessonDetail = useCallback(async () => {
    try {
      setLessonLoading(true);
      console.log("🔍 Fetching lesson detail for pathId:", pathId);

      const result = await dispatch(
        getMarxistPhilosophyLessonByPath(pathId!)
      ).unwrap();
      console.log("📚 Lesson detail result:", result);

      if (result.success && result.lesson) {
        // 🎲 SHUFFLE questions and options for randomization
        const originalLesson = result.lesson;
        console.log(
          "📝 Original lesson questions:",
          originalLesson.questions?.length
        );

        if (originalLesson.questions && originalLesson.questions.length > 0) {
          // Shuffle questions order
          const shuffledQuestions = shuffleQuestions(originalLesson.questions);
          console.log("🔀 Shuffled questions order");

          // Shuffle options within each question
          const questionsWithShuffledOptions =
            shuffleAllQuestionOptions(shuffledQuestions);
          console.log("🔄 Shuffled all question options");

          const shuffledLesson = {
            ...originalLesson,
            questions: questionsWithShuffledOptions,
          };

          setLesson(shuffledLesson);

          // 🕒 Calculate total time dynamically from questions
          const totalTimeSeconds =
            shuffledLesson.questions?.reduce(
              (total: number, question: IQuestion) => {
                return total + (question.timeLimit || 30); // Default 30s per question
              },
              0
            ) || 300; // Fallback to 5 minutes if no questions

          setTimeLeft(totalTimeSeconds);
          console.log(
            `⏰ Total test time: ${totalTimeSeconds}s (${Math.round(
              totalTimeSeconds / 60
            )}min) for ${shuffledLesson.questions?.length} questions`
          );
          console.log("✅ Lesson set with shuffled content");
        } else {
          setLesson(originalLesson);

          // 🕒 Calculate total time dynamically from questions (even if not shuffled)
          const totalTimeSeconds =
            originalLesson.questions?.reduce(
              (total: number, question: IQuestion) => {
                return total + (question.timeLimit || 30); // Default 30s per question
              },
              0
            ) || 300; // Fallback to 5 minutes if no questions

          setTimeLeft(totalTimeSeconds);
          console.log(
            `⏰ Total test time: ${totalTimeSeconds}s (${Math.round(
              totalTimeSeconds / 60
            )}min) for ${originalLesson.questions?.length} questions`
          );
          console.log("⚠️ No questions found to shuffle");
        }
      } else {
        console.error("❌ No lesson found in response:", result);
      }
    } catch (error) {
      console.error("❌ Error fetching lesson detail:", error);

      Modal.error({
        title: "❌ Lỗi khi tải bài kiểm tra",
        content: (
          <div>
            <p>Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.</p>
            <p className="text-sm text-gray-600 mt-2">
              Chi tiết lỗi:{" "}
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ),
        onOk: () => navigate("/philosophy"),
      });
    } finally {
      setLessonLoading(false);
    }
  }, [pathId, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🕒 Calculate total time and format for display
  const calculateTotalTime = (questions: IQuestion[]) => {
    const totalSeconds =
      questions?.reduce((total: number, question: IQuestion) => {
        return total + (question.timeLimit || 30);
      }, 0) || 300;

    const minutes = Math.round(totalSeconds / 60);
    return { totalSeconds, minutes, formatted: `${minutes} phút` };
  };

  const handleAnswerChange = (questionId: string, selectedAnswer: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, selectedAnswer } : a
        );
      } else {
        return [...prev, { questionId, selectedAnswer }];
      }
    });
  };

  const handleSubmitTest = useCallback(async () => {
    if (!lesson) return;

    try {
      // Calculate score
      const totalQuestions = lesson.questions?.length || 0;
      let correctCount = 0;

      lesson.questions?.forEach((question) => {
        const userAnswer = answers.find((a) => a.questionId === question._id);
        if (userAnswer?.selectedAnswer === question.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / totalQuestions) * 100);

      console.log("📊 Test Results:", {
        totalQuestions,
        correctCount,
        score,
        answers: answers.length,
      });

      // 📊 Collect question results for progress tracking (Match backend schema)
      const questionResults =
        lesson?.questions?.map((question) => {
          const userAnswer = answers.find((a) => a.questionId === question._id);
          const correctAnswer = question.correctAnswer || "";
          const isCorrect = userAnswer?.selectedAnswer === correctAnswer;
          const questionScore = isCorrect ? question.score || 100 : 0;

          return {
            questionId: question._id,
            answer: userAnswer?.selectedAnswer || "", // Backend expects 'answer', not 'userAnswer'
            isCorrect,
            score: questionScore,
            isTimeout: false, // Default values for backend schema compliance
            transcription: null,
            feedback: null,
          };
        }) || [];

      console.log("📊 Question results for backend:", questionResults);

      const lessonId = (lesson as unknown as { id?: string }).id || lesson?._id;

      console.log("🎯 Submitting lesson completion:", {
        lessonId,
        score,
        questionResultsCount: questionResults.length,
      });

      if (!lessonId) {
        console.error("❌ No lesson ID found");
        console.log("🔍 Lesson object fields:", Object.keys(lesson));
        console.log("🔍 Full lesson object:", lesson);

        Modal.error({
          title: "⚠️ Lỗi khi hoàn thành bài học",
          content: (
            <div>
              <p>Đã có lỗi xảy ra khi lưu kết quả bài học.</p>
              <p>
                <strong>Điểm số:</strong> {score}/100
              </p>
              <p>
                <strong>Số câu đúng:</strong> {correctCount}/{totalQuestions}
              </p>
              <p className="text-sm text-red-600 mt-2">
                <strong>Chi tiết lỗi:</strong> Lesson ID không tìm thấy
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Lesson ID:</strong> {lessonId || "undefined"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Path ID:</strong> {pathId}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Lesson fields:</strong> {Object.keys(lesson).join(", ")}
              </p>
            </div>
          ),
          onOk: () => navigate("/philosophy"),
        });
        return;
      }

      const result = await dispatch(
        completeMarxistPhilosophyLesson({
          lessonId,
          score,
          questionResults,
        })
      ).unwrap();

      console.log("✅ Lesson completion result:", result);

      // 🔥 UPDATE LIVES AND XP IN REAL-TIME
      if (typeof result.currentLives === "number") {
        dispatch(
          updateUserLives({
            lives: result.currentLives,
            livesDeducted: result.livesDeducted,
          })
        );
        console.log("🔄 Lives updated:", result.currentLives);
      }

      // 🚀 UPDATE XP AND LEVEL for successful completion
      if (result.earnedXP > 0) {
        dispatch(
          updateUserXPAndLevel({
            xp: result.currentXP,
            userLevel: result.newLevel,
            earnedXP: result.earnedXP,
          })
        );
        console.log("⭐ XP and Level updated:", {
          earnedXP: result.earnedXP,
          currentXP: result.currentXP,
          newLevel: result.newLevel,
          leveledUp: result.leveledUp,
        });

        // 🎉 TRIGGER LEADERBOARD REFRESH EVENT
        window.dispatchEvent(new CustomEvent("refreshLeaderboard"));
        console.log("📊 Leaderboard refresh event dispatched");
      }

      // Show success modal with detailed results
      Modal.success({
        title: result.passed
          ? "🎉 Chúc mừng! Bạn đã vượt qua!"
          : "📊 Kết quả bài kiểm tra",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {score}/100 điểm
              </div>
              <div className="text-lg text-gray-600">
                Đúng {correctCount}/{totalQuestions} câu
              </div>
            </div>

            {/* XP and Level Up Information */}
            {result.earnedXP > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-yellow-800">
                    ⭐ Kinh nghiệm nhận được:
                  </span>
                  <span className="text-xl font-bold text-yellow-600">
                    +{result.earnedXP} XP
                  </span>
                </div>
                <div className="text-sm text-yellow-700">
                  <div>💫 XP hiện tại: {result.currentXP}</div>
                  <div>
                    🎯 XP cần cho level tiếp theo: {result.nextLevelRequiredXP}
                  </div>
                </div>

                {result.leveledUp && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-500">
                    <div className="text-yellow-800 font-bold">
                      🎉 LEVEL UP! Bạn đã đạt Level {result.newLevel}!
                    </div>
                    {result.livesFromLevelUp > 0 && (
                      <div className="text-yellow-700 text-sm mt-1">
                        🎁 Bonus: +{result.livesFromLevelUp} ❤️ Lives
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lives Information */}
            {result.livesDeducted && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-red-800 font-semibold">
                  💔 Lives bị trừ do không đạt yêu cầu
                </div>
                <div className="text-red-700 text-sm">
                  ❤️ Lives còn lại: {result.currentLives}
                </div>
              </div>
            )}

            {/* Auto-generation info for passed tests */}
            {result.passed && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-green-800 font-semibold">
                  🤖 Đang tự động tạo bài học tiếp theo...
                </div>
                <div className="text-green-700 text-sm">
                  Hệ thống AI sẽ phân tích kết quả và tạo bài học phù hợp với
                  trình độ của bạn.
                </div>
              </div>
            )}
          </div>
        ),
        onOk: async () => {
          if (result.passed) {
            // Hiển thị loading message khi AI đang tạo ContentPack + quiz
            message.loading({
              content:
                "🤖 Multi-AI đang tạo: (1) Học liệu ôn tập + (2) Bài quiz 10 câu... Vui lòng chờ...",
              duration: 0, // Không tự động tắt
              key: "ai-generation-loading",
            });

            console.log(
              "✅ Lesson completed successfully. AI is generating ContentPack + quiz in background..."
            );

            // Progressive loading messages để user biết AI đang làm gì
            setTimeout(() => {
              message.loading({
                content:
                  "🧠 Đang tạo học liệu ôn tập (tóm tắt, mindmap, flashcards)...",
                duration: 0,
                key: "ai-generation-loading",
              });
            }, 3000);

            setTimeout(() => {
              message.loading({
                content:
                  "📝 Đang tạo bài quiz 10 câu dựa trên học liệu vừa tạo...",
                duration: 0,
                key: "ai-generation-loading",
              });
            }, 7000);

            // Chờ một chút để AI có thời gian tạo ContentPack + quiz
            setTimeout(async () => {
              try {
                // 🔄 Refresh learning path để lấy dữ liệu mới
                await dispatch(getMarxistPhilosophyLearningPath({})).unwrap();
                console.log("✅ Learning path refreshed successfully");

                // Tắt loading message
                message.destroy("ai-generation-loading");

                // Hiển thị thông báo thành công
                message.success({
                  content:
                    "🎉 Multi-AI đã hoàn thành: Học liệu ôn tập + Bài quiz 10 câu!",
                  duration: 4,
                });

                // Navigate về dashboard
                navigate("/philosophy");
              } catch (refreshError) {
                console.warn(
                  "⚠️ Failed to refresh learning path:",
                  refreshError
                );
                message.destroy("ai-generation-loading");
                message.error("Lỗi khi tải dữ liệu mới");
                navigate("/philosophy");
              }
            }, 20000); // Chờ 20 giây để AI tạo xong ContentPack + review quiz
          } else {
            // Nếu không pass, chỉ refresh và navigate bình thường
            try {
              await dispatch(getMarxistPhilosophyLearningPath({})).unwrap();
              console.log("✅ Learning path refreshed after failed attempt");
            } catch (refreshError) {
              console.warn("⚠️ Failed to refresh learning path:", refreshError);
            }

            navigate("/philosophy");
          }
        },
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("❌ Error submitting test:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      Modal.error({
        title: "⚠️ Lỗi khi hoàn thành bài học",
        content: (
          <div>
            <p>Đã có lỗi xảy ra khi lưu kết quả bài học.</p>
            <p className="text-sm text-red-600 mt-2">
              <strong>Chi tiết lỗi:</strong> {errorMessage}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Lesson ID:</strong>{" "}
              {(lesson as unknown as { id?: string }).id ||
                lesson?._id ||
                "undefined"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Path ID:</strong> {pathId}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Lesson fields:</strong>{" "}
              {lesson ? Object.keys(lesson).join(", ") : "N/A"}
            </p>
          </div>
        ),
        onOk: () => navigate("/philosophy"),
      });
    }
  }, [lesson, answers, navigate, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      handleSubmitTest();
    }
  }, [timeLeft, isSubmitted, handleSubmitTest]);

  useEffect(() => {
    if (pathId) {
      fetchLessonDetail();
    }
  }, [pathId, fetchLessonDetail]);

  const startTest = async () => {
    // If this is a retry, call the retry API first
    if (isRetry && lesson?._id) {
      try {
        console.log("🔄 Processing retry request for lesson:", lesson._id);
        const retryResult = await dispatch(
          retryMarxistPhilosophyLesson({
            lessonId: lesson._id,
            pathId: pathId,
          })
        ).unwrap();

        console.log("✅ Retry processed successfully:", retryResult);

        // 🔥 UPDATE LIVES IN REAL-TIME for retry
        if (typeof retryResult.currentLives === "number") {
          dispatch(
            updateUserLives({
              lives: retryResult.currentLives,
              livesDeducted: retryResult.livesDeducted,
            })
          );
          console.log("🔄 Lives updated for retry:", retryResult.currentLives);
        }

        // Show lives deduction info if applicable
        if (retryResult.livesDeducted) {
          Modal.info({
            title: "❤️ Lives đã được trừ",
            content: (
              <div>
                <p>Làm lại bài học đã tiêu tốn 1 life.</p>
                <p>
                  <strong>Lives còn lại:</strong> {retryResult.currentLives}
                </p>
                <p>
                  🔀 <strong>Lưu ý:</strong> Câu hỏi và đáp án đã được trộn ngẫu
                  nhiên!
                </p>
                <p>Chúc bạn may mắn với lần thử này! 🍀</p>
              </div>
            ),
            onOk: () => setTestStarted(true),
          });
        } else {
          setTestStarted(true);
        }
      } catch (error) {
        console.error("❌ Error processing retry:", error);
        Modal.error({
          title: "❌ Lỗi khi làm lại bài học",
          content: "Không thể xử lý yêu cầu làm lại. Vui lòng thử lại sau.",
          onOk: () => navigate("/philosophy"),
        });
        return;
      }
    } else {
      // Regular test start
      setTestStarted(true);
    }
  };

  const handleSubmitConfirm = () => {
    const unansweredCount = (lesson?.questions?.length || 0) - answers.length;

    if (unansweredCount > 0) {
      confirm({
        title: "⚠️ Xác nhận nộp bài",
        content: (
          <div>
            <p>
              Bạn còn <strong>{unansweredCount} câu hỏi</strong> chưa trả lời.
            </p>
            <p>Bạn có chắc chắn muốn nộp bài không?</p>
          </div>
        ),
        okText: "Nộp bài",
        cancelText: "Tiếp tục làm",
        onOk: handleSubmitTest,
      });
    } else {
      handleSubmitTest();
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg text-gray-600">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Lỗi khi tải bài kiểm tra"
            description={error || "Không tìm thấy bài học"}
            type="error"
            showIcon
            className="mb-6"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/philosophy")}
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <Title level={2} className="text-red-700 mb-4">
              {isRetry
                ? "🔄 Làm lại bài kiểm tra?"
                : "Sẵn sàng làm bài kiểm tra?"}
            </Title>
            <Text className="text-lg text-gray-600 block mb-6">
              {isRetry && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <Text strong className="text-yellow-800">
                    🔄 Chế độ làm lại: Câu hỏi và đáp án đã được trộn ngẫu
                    nhiên!
                  </Text>
                </div>
              )}
              <strong>{lesson.title}</strong>
              <br />
              {lesson.questions?.length || 10} câu hỏi •{" "}
              {calculateTotalTime(lesson.questions || []).formatted} • Điểm tối
              đa: {lesson.maxScore || 100}
            </Text>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <Title level={4} className="text-blue-700 mb-3">
                📋 Lưu ý quan trọng:
              </Title>
              <ul className="space-y-1 text-blue-800">
                <li>
                  • Bạn có{" "}
                  <strong>
                    {calculateTotalTime(lesson.questions || []).formatted}
                  </strong>{" "}
                  để hoàn thành bài kiểm tra (<strong>30 giây</strong> mỗi câu)
                </li>
                <li>
                  • Cần đạt <strong>ít nhất 70%</strong> để vượt qua
                </li>
                <li>
                  • Câu hỏi và đáp án được <strong>trộn ngẫu nhiên</strong>
                </li>
                <li>• Không thể tạm dừng sau khi bắt đầu</li>
                {isRetry && (
                  <li>
                    • <strong>Làm lại sẽ tiêu tốn 1 ❤️ Life</strong>
                  </li>
                )}
              </ul>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={startTest}
              className="bg-red-600 hover:bg-red-700 px-8 py-2 h-auto text-lg"
            >
              {isRetry ? "🔄 Bắt đầu làm lại" : "🚀 Bắt đầu kiểm tra"}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestionData = lesson.questions?.[currentQuestion];
  const progress =
    ((currentQuestion + 1) / (lesson.questions?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <Card className="shadow-lg mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <div className="text-center">
                <ClockCircleOutlined className="text-2xl text-red-600 mr-2" />
                <span
                  className={`text-xl font-bold ${
                    timeLeft < 300 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <Text strong>
                  Câu {currentQuestion + 1} / {lesson.questions?.length || 0}
                </Text>
                <Progress
                  percent={Math.round(progress)}
                  size="small"
                  className="mt-2"
                  strokeColor="#dc2626"
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <Text strong>
                  Đã trả lời: {answers.length} / {lesson.questions?.length || 0}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Question Card */}
        {currentQuestionData && (
          <Card className="shadow-lg mb-6">
            <div className="mb-4">
              <Tag color="blue" className="mb-2">
                Câu {currentQuestion + 1}
              </Tag>
              <Title level={4} className="mb-4">
                {(
                  currentQuestionData as {
                    content?: string;
                    questionText?: string;
                  }
                ).content ||
                  (
                    currentQuestionData as {
                      content?: string;
                      questionText?: string;
                    }
                  ).questionText}
              </Title>
            </div>

            <Radio.Group
              value={
                answers.find((a) => a.questionId === currentQuestionData._id)
                  ?.selectedAnswer
              }
              onChange={(e) =>
                handleAnswerChange(currentQuestionData._id, e.target.value)
              }
              className="w-full"
            >
              <div className="space-y-3">
                {currentQuestionData.options?.map((option, index) => (
                  <Radio key={index} value={option} className="w-full">
                    <div className="p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                      {option}
                    </div>
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Card>
        )}

        {/* Navigation and Submit */}
        <Card className="shadow-lg">
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                Câu trước
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                danger
                icon={<SendOutlined />}
                onClick={handleSubmitConfirm}
                className="mx-2"
              >
                Nộp bài
              </Button>
            </Col>
            <Col>
              <Button
                icon={<ArrowRightOutlined />}
                disabled={
                  currentQuestion === (lesson.questions?.length || 1) - 1
                }
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Câu sau
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default PhilosophyLessonTestPage;
