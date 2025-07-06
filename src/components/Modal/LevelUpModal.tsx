import { Modal } from 'antd';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { FaCrown, FaStar } from 'react-icons/fa';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
}

const LevelUpModal = ({ isOpen, onClose, newLevel }: LevelUpModalProps) => {
    useEffect(() => {
        if (isOpen) {
            // Trigger confetti effect
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                // Confetti from left
                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount,
                    origin: { x: 0, y: 0.7 },
                    colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']
                });

                // Confetti from right
                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount,
                    origin: { x: 1, y: 0.7 },
                    colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={400}
            className="level-up-modal"
            closable={false}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center p-6"
            >
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="mb-4"
                >
                    <FaCrown className="text-6xl text-yellow-400" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-center mb-2 font-baloo"
                >
                    Chúc mừng!
                </motion.h2>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-4"
                >
                    <p className="text-lg font-baloo">Bạn đã lên cấp</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent font-baloo">
                            Level {newLevel}
                        </span>
                        <FaStar className="text-yellow-400 text-xl" />
                    </div>
                </motion.div>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-baloo hover:bg-red-700 transition-colors"
                >
                    Tiếp tục
                </motion.button>
            </motion.div>
        </Modal>
    );
};

export default LevelUpModal; 