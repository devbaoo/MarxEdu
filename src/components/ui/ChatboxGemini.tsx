import React, { useState, useRef } from 'react';
import { Button, Input, Spin, Card } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT =
    "Bạn là chuyên gia về kinh tế chính trị Mác Lê Nin, giúp tôi trả lời các câu hỏi về chủ đề này. Luôn trả lời toàn bộ bằng tiếng Việt.";

async function askGemini(prompt: string): Promise<string> {
    try {
        const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: SYSTEM_PROMPT },
                                { text: prompt }
                            ]
                        }
                    ]
                })
            }
        );
        const data = await res.json();
        // Gemini API trả về dạng: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
    } catch {
        return 'Lỗi khi gửi câu hỏi đến Gemini AI.';
    }
}

const ChatboxGemini: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user' as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        const aiReply = await askGemini(userMsg.content);
        // Chèn xuống dòng trước mỗi dấu * hoặc ** để dễ nhìn hơn
        let formattedReply = aiReply.replace(/(\*\*?)/g, '\n$1');
        // Định dạng: **Tiêu đề:** => <strong>Tiêu đề:</strong>, * Bullet => <li>Bullet</li>
        formattedReply = formattedReply
            // Định dạng tiêu đề phụ
            .replace(/\n\*\*([^\n*]+)\*\*/g, '<br/><strong>$1</strong>')
            // Định dạng bullet
            .replace(/\n\*\s?([^\n*]+)/g, '<br/>&bull; $1')
            // Định dạng xuống dòng cho các đoạn khác
            .replace(/\n/g, '<br/>');
        // Loại bỏ toàn bộ dấu ** còn lại
        formattedReply = formattedReply.replace(/\*\*/g, '');
        // Loại bỏ các dòng trống/thừa (nhiều <br/> liên tiếp)
        formattedReply = formattedReply.replace(/(<br\/>\s*){2,}/g, '<br/>');
        setMessages((prev) => [...prev, { role: 'ai', content: formattedReply }]);
        setLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <>
            {/* Floating Button */}
            {!open && (
                <Button
                    type="primary"
                    shape="circle"
                    icon={<RobotOutlined style={{ fontSize: 32 }} />}
                    size="large"
                    style={{
                        position: 'fixed',
                        right: 24,
                        bottom: 24,
                        zIndex: 1000,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        width: 56,
                        height: 56,
                        minWidth: 56,
                        minHeight: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32
                    }}
                    onClick={() => setOpen(true)}
                />
            )}
            {/* Chatbox */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        right: 24,
                        bottom: 24,
                        zIndex: 1001,
                        width: 420,
                        maxWidth: '98vw',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        borderRadius: 16,
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Card
                        title={<span><RobotOutlined />  Hỏi Cùng AI</span>}
                        extra={
                            <>
                                <Button type="text" onClick={() => setMessages([])} style={{ marginRight: 4 }}>
                                    Xoá lịch sử
                                </Button>
                                <Button type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
                            </>
                        }
                        bodyStyle={{ padding: 12, maxHeight: 520, minHeight: 220, overflowY: 'auto', background: '#fafbfc' }}
                        style={{ margin: 0, borderRadius: 16, border: 'none' }}
                        headStyle={{ borderRadius: '16px 16px 0 0', background: '#f5f5f5' }}
                    >
                        <div style={{ minHeight: 120 }}>
                            {messages.length === 0 && (
                                <div style={{ color: '#888', textAlign: 'center', margin: '32px 0' }}>
                                    <MessageOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                    <div>Hỏi AI về Kinh tế chính trị Mác Lê Nin hoặc bất cứ điều gì!</div>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    margin: '8px 0',
                                    textAlign: msg.role === 'user' ? 'right' : 'left',
                                }}>
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            background: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5',
                                            color: '#222',
                                            borderRadius: 12,
                                            padding: '8px 12px',
                                            maxWidth: '80%',
                                            fontSize: 15,
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                                        }}
                                        dangerouslySetInnerHTML={msg.role === 'ai' ? { __html: msg.content } : undefined}
                                    >
                                        {msg.role === 'user' ? msg.content : null}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </Card>
                    <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', background: '#fff', borderRadius: '0 0 16px 16px' }}>
                        <Input.Group compact>
                            <TextArea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={e => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Nhập câu hỏi cho Gemini..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                disabled={loading}
                                style={{ width: 'calc(100% - 48px)', marginRight: 8 }}
                            />
                            <Button
                                type="primary"
                                icon={loading ? <Spin size="small" /> : <SendOutlined />}
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                            />
                        </Input.Group>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatboxGemini; 