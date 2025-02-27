// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";

const ChatUI = () => {
  // State for storing messages
  const [messages, setMessages] = useState([]);
  // State for user input
  const [input, setInput] = useState("");
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // Reference to auto-scroll to the latest message
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll down when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to chat
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // LM Studio typically follows the OpenAI API format
      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama2", // This might vary based on your LM Studio setup
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            })),
            { role: "user", content: input }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      const data = await response.json();

      // Extract the assistant's response
      const assistantResponse = data.choices[0].message.content;

      // Add assistant message to chat
      setMessages(prev => [...prev, { sender: "bot", text: assistantResponse }]);
    } catch (error) {
      console.error("Error connecting to LM Studio:", error);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't connect to the AI model. Please make sure LM Studio is running locally."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Function to handle preset buttons
  const handlePresetMessage = (message) => {
    setInput(message);
    // Optional: send immediately
    // setInput(message, () => handleSendMessage());
  };

  return (
    <div className="h-screen w-screen bg-green-500 flex justify-center items-center">
      <div className="w-full h-full bg-black rounded-xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 bg-green-500 p-4 flex flex-col">
          <h2 className="text-white text-lg font-semibold mb-4">
            Healthcare Bot
          </h2>
          <input
            type="text"
            placeholder="Search Health Queries"
            className="p-2 rounded bg-gray-700 text-white outline-none"
          />
          <div className="mt-4">
            <h3 className="text-green-200 text-sm mb-2">Categories</h3>
            <ul className="text-white space-y-2">
              <li className="cursor-pointer">🩺 General Health</li>
              <li className="cursor-pointer">💊 Medications</li>
              <li className="cursor-pointer">🍎 Nutrition</li>
              <li className="cursor-pointer">🧘 Mental Wellness</li>
            </ul>
          </div>
          <button className="mt-auto bg-green-500 text-white p-2 rounded-lg font-semibold">
            New Consultation +
          </button>
        </div>

        {/* Main Chat Section */}
        <div className="flex-1 bg-black flex flex-col h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-white p-4">
              <div className="bg-gray-800 p-6 rounded-lg text-center w-2/3">
                <h1 className="text-xl font-semibold">
                  How can I assist with your health today?
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                  This healthcare chatbot provides guidance on medical queries...
                </p>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onClick={() => handlePresetMessage("What are common cold symptoms?")}
                  >
                    Symptom Checker
                  </button>
                  <button
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onClick={() => handlePresetMessage("How do antibiotics work?")}
                  >
                    Medication Info
                  </button>
                  <button
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onClick={() => handlePresetMessage("Tips for better sleep?")}
                  >
                    Lifestyle Tips
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"
                    }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${message.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-800 text-white"
                      }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-2 rounded-lg bg-gray-800 text-white">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center bg-gray-800 p-2 rounded-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health-related question..."
                className="flex-1 bg-transparent text-white p-2 outline-none"
              />
              <button
                className="bg-green-500 text-white p-2 rounded-lg"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? "..." : "➜"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;