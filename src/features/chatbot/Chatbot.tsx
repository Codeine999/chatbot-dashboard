import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Ellipsis, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: "I understand your question. Let me help you with that. This is a simulated AI response that demonstrates how the chat interface works with longer messages that might wrap to multiple lines.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-2 flex flex-col h-screen">
      {/* Header */}
      <div className="lg:px-14 flex justify-between items-center border-b">
        <div className="flex items-center  h-14 gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <p className="text-lg font-medium">AI Assistant</p>
        </div>
        <div className='flex gap-2 items-center'>
          <Button variant='ghost'><Share />share</Button>
          <Button variant='ghost'><Ellipsis /></Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto lg:px-40 md:px-6 py-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex`}
          >
            <div className={`flex items-center gap-2`}>
              <div className={` rounded-full flex items-center justify-center`}>
                {message.type === 'user' ? (
                  <User className=" text-white" />
                ) : (
                  <Bot className="text-gray-600 " />
                )}
              </div>

              {/* Message bubble */}
              <div className="flex flex-col">
                <div
                  className={``}
                >
                  <p className="text-sm ">{message.content}</p>
                </div>
                <span className={`text-xs text-gray-400 `}>
                  {/* {formatTime(message.timestamp)} */}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {/* {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md xl:max-w-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 bg-gray-200">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} /> */}
      </div>

      {/* Input area */}
      <div className="py-19">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                // ref={textareaRef}
                // value={inputValue}
                // onChange={(e) => setInputValue(e.target.value)}
                // onKeyPress={handleKeyPress}
                placeholder="Ask anything . ."
                className="w-full p-6 resize-none rounded-3xl border h-25 text-sm shadow-sm placeholder:text-normal"
                rows={1}

              />
              <Button
                // onClick={handleSend}
                // disabled={!inputValue.trim() || isTyping}
                className="absolute right-4 bottom-4 w-8 h-8 text-white rounded-full flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chatbot