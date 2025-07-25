import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Tag, Spin, Alert, Radio, Progress, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import { getMarxistLessonByPath, completeMarxistLesson, retryMarxistLesson, generateMarxistLesson, getMarxistLearningPath } from '@/services/features/marxist/marxistSlice';
import { updateUserLives, updateUserXPAndLevel } from '@/services/features/auth/authSlice';
import { ILesson, IQuestion } from '@/interfaces/ILesson';
import { shuffleQuestions, shuffleAllQuestionOptions } from '@/lib/utils';

const { Title, Text } = Typography;

interface Answer {
  questionId: string;
  selectedAnswer: string;
}

const MarxistLessonTestPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // 🔄 Detect if this is a retry request from URL parameter
  const isRetry = searchParams.get('retry') === 'true';

  const { error } = useAppSelector((state: RootState) => state.marxist);
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes = 2700 seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (pathId) {
      fetchLessonDetail();
    }
  }, [pathId]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmitTest();
    }
    return () => clearTimeout(timer);
  }, [testStarted, timeLeft]);

  const fetchLessonDetail = async () => {
    if (!pathId) return;
    
    setLessonLoading(true);
    try {
      const result = await dispatch(getMarxistLessonByPath(pathId)).unwrap();
      console.log('📚 Full API response:', result);
      console.log('📚 Lesson object from API:', result.lesson);
      console.log('📚 Lesson ID inspection:', {
        lesson_id: result.lesson?._id,
        lesson_id_type: typeof result.lesson?._id,
        lesson_object_keys: result.lesson ? Object.keys(result.lesson) : 'lesson is null'
      });
      
      let processedLesson = result.lesson;
      
      // 🔀 SHUFFLE QUESTIONS AND OPTIONS for randomization
      if (processedLesson?.questions && processedLesson.questions.length > 0) {
        console.log('🔀 Original questions count:', processedLesson.questions.length);
        
        // Step 1: Shuffle options within each question first
        const questionsWithShuffledOptions = shuffleAllQuestionOptions(processedLesson.questions);
        
        // Step 2: Shuffle the order of questions
        const shuffledQuestions = shuffleQuestions(questionsWithShuffledOptions);
        
        // Update lesson with shuffled data
        processedLesson = {
          ...processedLesson,
          questions: shuffledQuestions
        };
        
        console.log('✅ Questions and options shuffled successfully');
        console.log('📊 Shuffled questions count:', shuffledQuestions.length);
      }
      
      setLesson(processedLesson);
      
      // Initialize answers array with shuffled questions
      if (processedLesson?.questions) {
        const initialAnswers = processedLesson.questions.map((q: IQuestion) => ({
          questionId: q._id,
          selectedAnswer: ''
        }));
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('❌ Error fetching lesson detail:', error);
    } finally {
      setLessonLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, selectedAnswer: string) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { ...answer, selectedAnswer }
        : answer
    ));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (lesson?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    // Calculate score
    let correctCount = 0;
    answers.forEach(answer => {
      const question = lesson?.questions?.find((q: IQuestion) => q._id === answer.questionId);
      if (question && answer.selectedAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = lesson?.questions?.length || 0;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    console.log('📊 Test completed:', {
      correctCount,
      totalQuestions,
      score,
      answers
    });

    // 📊 Collect question results for progress tracking (Match backend schema)
    const questionResults = lesson?.questions?.map((question) => {
      const userAnswer = answers.find(a => a.questionId === question._id);
      const correctAnswer = question.correctAnswer || '';
      const isCorrect = userAnswer?.selectedAnswer === correctAnswer;
      const questionScore = isCorrect ? (question.score || 100) : 0;
      
      return {
        questionId: question._id,
        answer: userAnswer?.selectedAnswer || '', // Backend expects 'answer', not 'userAnswer'
        isCorrect,
        score: questionScore,
        isTimeout: false, // Default values for backend schema compliance
        transcription: null,
        feedback: null
      };
    }) || [];

    console.log('📊 Question results for backend:', questionResults);

    const lessonId = (lesson as unknown as {id?: string}).id || lesson?._id;
    if (!lessonId) {
      throw new Error('Không tìm thấy lesson ID');
    }

    try {
      console.log('📤 Calling completeMarxistLesson API...');
      const result = await dispatch(completeMarxistLesson({ 
        lessonId,
        score,
        questionResults // Send question results to backend
      })).unwrap();

      console.log('✅ Lesson completed successfully:', result);

      // 🔥 UPDATE LIVES AND XP IN REAL-TIME after completion
      if (typeof result.currentLives === 'number') {
        dispatch(updateUserLives({ 
          lives: result.currentLives,
          livesDeducted: result.livesDeducted 
        }));
        console.log('🔄 Lives updated after completion:', result.currentLives);
      }

      // 🎯 UPDATE USER XP AND LEVEL if earned
      if (result.earnedXP > 0 || result.leveledUp) {
        dispatch(updateUserXPAndLevel({
          xp: result.currentXP,
          userLevel: result.newLevel,
          earnedXP: result.earnedXP
        }));
        console.log('🎯 Updated XP/Level in auth state:', {
          xp: result.currentXP,
          level: result.newLevel,
          earned: result.earnedXP
        });
        
        // 🏆 TRIGGER LEADERBOARD REFRESH via custom event
        console.log('🏆 Triggering leaderboard refresh after XP/level update...');
        window.dispatchEvent(new CustomEvent('refreshLeaderboard', {
          detail: { 
            newScore: result.scoreAchieved,
            earnedXP: result.earnedXP,
            newLevel: result.newLevel
          }
        }));
      }

      // Show success modal with results
      Modal.success({
        title: result.passed ? '🎉 Chúc mừng! Bạn đã vượt qua!' : '📊 Kết quả bài kiểm tra',
        width: 500,
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
            
            {/* XP and Level Information */}
            {result.earnedXP > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold text-blue-800">
                    +{result.earnedXP} XP
                  </span>
                </div>
                
                {result.leveledUp ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <span className="font-bold text-purple-600">
                        Lên Level {result.newLevel}!
                      </span>
                    </div>
                    {result.livesFromLevelUp > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❤️</span>
                        <span className="text-sm text-gray-600">
                          +{result.livesFromLevelUp} life từ level up
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      XP hiện tại: {result.currentXP}/{result.nextLevelRequiredXP}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((result.currentXP / result.nextLevelRequiredXP) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lives Information */}
            {result.livesDeducted && (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <span>💔</span>
                  <span className="text-sm">
                    Đã trừ 1 life (còn {result.currentLives})
                  </span>
                </div>
              </div>
            )}
            
            {/* Auto-generation info */}
            {result.passed && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <span>🤖</span>
                  <span className="text-sm">
                    AI đang tạo bài học tiếp theo...
                  </span>
                </div>
              </div>
            )}
          </div>
        ),
        onOk: async () => {
          // 🚀 CLIENT-SIDE AUTO-GENERATION for passed tests
          if (result.passed) {
            try {
              console.log('🤖 Auto-generating next lesson after successful completion...');
              const generateResult = await dispatch(generateMarxistLesson({})).unwrap();
              console.log('✅ Next lesson auto-generated:', generateResult);
              
              // 🔄 FORCE REFRESH learning path after successful generation
              console.log('🔄 Force refreshing learning path after AI generation...');
              await dispatch(getMarxistLearningPath({})).unwrap();
              console.log('✅ Learning path refreshed successfully');
              
            } catch (genError) {
              console.warn('⚠️ Failed to auto-generate next lesson:', genError);
              // Still refresh learning path even if generation failed
              try {
                await dispatch(getMarxistLearningPath({})).unwrap();
              } catch (refreshError) {
                console.warn('⚠️ Failed to refresh learning path:', refreshError);
              }
            }
          } else {
            // 🔄 Always refresh learning path for failed attempts too
            try {
              await dispatch(getMarxistLearningPath({})).unwrap();
              console.log('✅ Learning path refreshed after failed attempt');
            } catch (refreshError) {
              console.warn('⚠️ Failed to refresh learning path:', refreshError);
            }
          }
          
          // Navigate back to dashboard
          navigate('/marxist-economics');
        }
      });

    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      
      // Better error handling - stringify error object properly
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Handle API error responses with proper type checking
        const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
        if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
      }

      Modal.error({
        title: '⚠️ Lỗi khi hoàn thành bài học',
        content: (
          <div className="space-y-3">
            <p>Đã có lỗi xảy ra khi lưu kết quả bài học.</p>
            <p><strong>Điểm số:</strong> {score}/100</p>
            <p><strong>Số câu đúng:</strong> {correctCount}/{totalQuestions}</p>
            <div className="bg-gray-50 p-3 rounded mt-3">
              <p className="text-sm"><strong>Chi tiết lỗi:</strong></p>
              <pre className="text-xs text-red-600 whitespace-pre-wrap">{errorMessage}</pre>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Lesson ID:</strong> {lesson?._id || 'N/A'}<br/>
                <strong>Path ID:</strong> {pathId || 'N/A'}<br/>
                <strong>Lesson fields:</strong> {lesson ? Object.keys(lesson).join(', ') : 'N/A'}
              </p>
            </div>
            
            {score >= 70 && (
              <div className="bg-blue-50 p-3 rounded mt-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Giải pháp tạm thời:</strong><br/>
                  Bạn vẫn đạt điểm cao ({score}/100). Hãy quay về dashboard và:<br/>
                  1. Bấm "🤖 Tạo bài học mới với AI"<br/>
                  2. Hoặc refresh trang và thử lại
                </p>
              </div>
            )}
          </div>
        ),
        width: 600,
        okText: 'Đóng',
        onOk: () => {
          // Always redirect to dashboard after error
          navigate('/marxist-economics');
        }
      });
    }
  };

  const startTest = async () => {
    // If this is a retry, call the retry API first
    if (isRetry && lesson?._id) {
      try {
        console.log('🔄 Processing retry request for lesson:', lesson._id);
        const retryResult = await dispatch(retryMarxistLesson({
          lessonId: lesson._id,
          pathId: pathId
        })).unwrap();
        
        console.log('✅ Retry processed successfully:', retryResult);
        
        // 🔥 UPDATE LIVES IN REAL-TIME for retry
        if (typeof retryResult.currentLives === 'number') {
          dispatch(updateUserLives({ 
            lives: retryResult.currentLives,
            livesDeducted: retryResult.livesDeducted 
          }));
          console.log('🔄 Lives updated for retry:', retryResult.currentLives);
        }
        
        // Show lives deduction info if applicable
        if (retryResult.livesDeducted) {
          Modal.info({
            title: '❤️ Lives đã được trừ',
            content: (
              <div>
                <p>Làm lại bài học đã tiêu tốn 1 life.</p>
                <p><strong>Lives còn lại:</strong> {retryResult.currentLives}</p>
                <p>🔀 <strong>Lưu ý:</strong> Câu hỏi và đáp án đã được trộn ngẫu nhiên!</p>
                <p>Chúc bạn may mắn với lần thử này! 🍀</p>
              </div>
            ),
            onOk: () => setTestStarted(true)
          });
        } else {
          setTestStarted(true);
        }
      } catch (error) {
        console.error('❌ Error processing retry:', error);
        Modal.error({
          title: '❌ Lỗi khi làm lại bài học',
          content: 'Không thể xử lý yêu cầu làm lại. Vui lòng thử lại sau.',
          onOk: () => navigate('/marxist-economics')
        });
      }
    } else {
      // Show shuffle notification for first-time test takers
      Modal.info({
        title: '🔀 Bài kiểm tra đã sẵn sàng!',
        content: (
          <div>
            <p>🎲 <strong>Câu hỏi và đáp án đã được trộn ngẫu nhiên</strong> để đảm bảo tính công bằng.</p>
            <p>⏰ Bạn có <strong>{Math.floor(timeLeft / 60)} phút</strong> để hoàn thành <strong>{lesson?.questions?.length || 0} câu hỏi</strong>.</p>
            <p>✨ Chúc bạn làm bài tốt!</p>
          </div>
        ),
        onOk: () => setTestStarted(true)
      });
    }
  };

  if (lessonLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
        <div className="ml-4">Đang tải câu hỏi...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert
          message="Lỗi khi tải bài kiểm tra"
          description={error || "Không thể tải dữ liệu bài học"}
          type="error"
          showIcon
        />
        <Button 
          className="mt-4" 
          onClick={() => navigate('/marxist-economics')}
          icon={<ArrowLeftOutlined />}
        >
          Về Dashboard
        </Button>
      </div>
    );
  }

  if (!testStarted) {
    // Pre-test screen
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="text-center">
          <Title level={2} className="text-red-700 mb-4">
            <QuestionCircleOutlined className="mr-2" />
            {isRetry ? '🔄 Làm lại bài kiểm tra?' : 'Sẵn sàng làm bài kiểm tra?'}
          </Title>
          
          {isRetry && (
            <Alert
              message="⚠️ Cảnh báo làm lại bài học"
              description={
                <div>
                  <p>Bạn đã hoàn thành bài học này trước đó.</p>
                  <p><strong>🩸 Làm lại sẽ tiêu tốn 1 tim (lives)</strong></p>
                  <p>Chỉ làm lại nếu muốn cải thiện điểm số.</p>
                </div>
              }
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <Title level={4} className="mb-1 text-blue-800">
                  {lesson.title}
                </Title>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <ClockCircleOutlined />
                  <span>Thời gian: {formatTime(timeLeft)}</span>
                  <span>•</span>
                  <span>Câu {currentQuestion + 1}/{lesson.questions.length}</span>
                  <span>•</span>
                  <Tag color="blue">🔀 Đã trộn ngẫu nhiên</Tag>
                </div>
              </div>
              <div className="text-right">
                <Progress
                  type="circle"
                  percent={Math.round(((currentQuestion + 1) / lesson.questions.length) * 100)}
                  width={60}
                  strokeColor="#1890ff"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 text-left">
            <Title level={4}>📋 Hướng dẫn:</Title>
            <ul className="text-gray-700">
              <li>✅ Thời gian làm bài: {formatTime(timeLeft)}</li>
              <li>📝 Tổng số câu hỏi: {lesson.questions?.length || 0}</li>
              <li>🔄 Có thể xem lại và thay đổi câu trả lời</li>
              <li>⏰ Bài thi sẽ tự động nộp khi hết thời gian</li>
              <li>🎯 Cần đạt ít nhất 70% để hoàn thành bài học</li>
            </ul>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={startTest}
            className="bg-red-600 hover:bg-red-700"
            icon={<CheckCircleOutlined />}
          >
            🚀 Bắt đầu làm bài
          </Button>
        </Card>
      </div>
    );
  }

  const currentQ = lesson.questions?.[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ?._id);
  const answeredCount = answers.filter(a => a.selectedAnswer !== '').length;
  const progress = ((currentQuestion + 1) / (lesson.questions?.length || 1)) * 100;

  return (
    <div className="marxist-test-page p-6 max-w-4xl mx-auto">
      {/* Header with timer and progress */}
      <Card className="mb-4">
        <Row align="middle" justify="space-between">
          <Col>
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-red-600" />
              <Text strong className="text-lg">
                {formatTime(timeLeft)}
              </Text>
            </div>
          </Col>
          <Col>
            <Text>Câu {currentQuestion + 1}/{lesson.questions?.length || 0}</Text>
          </Col>
          <Col>
            <Text>Đã trả lời: {answeredCount}/{lesson.questions?.length || 0}</Text>
          </Col>
        </Row>
        <Progress percent={progress} className="mt-2" />
      </Card>

      {/* Question */}
      <Card className="mb-4">
        <Title level={4} className="mb-4">
          Câu {currentQuestion + 1}: {currentQ?.content}
        </Title>

        <Radio.Group
          value={currentAnswer?.selectedAnswer}
          onChange={(e) => handleAnswerSelect(currentQ?._id, e.target.value)}
          className="w-full"
        >
          <div className="space-y-3">
            {currentQ?.options?.map((option: string, index: number) => (
              <Radio key={index} value={option} className="block p-3 border rounded hover:bg-gray-50">
                <Text>{option}</Text>
              </Radio>
            ))}
          </div>
        </Radio.Group>
      </Card>

      {/* Navigation */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              icon={<ArrowLeftOutlined />}
            >
              Câu trước
            </Button>
          </Col>
          
          <Col>
            <Button
              type="primary"
              onClick={() => setShowSubmitModal(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={answeredCount === 0}
            >
              📝 Nộp bài ({answeredCount}/{lesson.questions?.length || 0})
            </Button>
          </Col>

          <Col>
            {currentQuestion < (lesson.questions?.length || 0) - 1 ? (
              <Button
                type="primary"
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Câu tiếp theo
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => setShowSubmitModal(true)}
                className="bg-red-600 hover:bg-red-700"
                disabled={answeredCount === 0}
              >
                🏁 Hoàn thành
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Submit Modal */}
      <Modal
        title="🤔 Xác nhận nộp bài"
        visible={showSubmitModal}
        onOk={handleSubmitTest}
        onCancel={() => setShowSubmitModal(false)}
        okText="✅ Chắc chắn nộp"
        cancelText="❌ Hủy"
        okButtonProps={{ className: 'bg-red-600 hover:bg-red-700' }}
      >
        <p>Bạn đã trả lời <strong>{answeredCount}/{lesson.questions?.length || 0}</strong> câu hỏi.</p>
        <p>Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong></p>
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
      </Modal>
    </div>
  );
};

export default MarxistLessonTestPage; 