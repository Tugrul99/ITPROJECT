import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./styles.css";

const SERVER_URL = "http://localhost:5000";

const TextEditor = () => {
    const [socket, setSocket] = useState(null);
    const [content, setContent] = useState("");
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [documentLoaded, setDocumentLoaded] = useState(false);

    useEffect(() => {
        const s = io(SERVER_URL);
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !username || documentLoaded) return;

        socket.emit("join-document", { documentId: "default-document", username });

        socket.on("load-document", (documentContent) => {
            setContent(documentContent);
            setDocumentLoaded(true);
        });

        socket.on("update-document", (newContent) => {
            setContent(newContent);
        });

    }, [socket, username, documentLoaded]);

    const sendMessage = () => {
        if (!socket || !username || !message.trim()) return;

        const newMessage = `[${username}]: ${message.trim()}`;
        
        const updatedContent = content ? `${content}\n${newMessage}` : newMessage;

        setContent(updatedContent);
        setMessage("");
        socket.emit("edit-document", { documentId: "default-document", content: updatedContent, username });
    };

    return (
        <div className="editor-container">
            {!isEditing ? (
                <div className="username-container">
                    <input 
                        type="text" 
                        className="username-input" 
                        placeholder="Enter your name..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="start-button" onClick={() => setIsEditing(true)}>
                        Start
                    </button>
                </div>
            ) : (
                <>
                    <div className="message-input-container">
                        <input
                            type="text"
                            className="message-input"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="send-button" onClick={sendMessage}>
                            Send
                        </button>
                    </div>

                    <div className="text-display">
                        <pre>{content}</pre>
                    </div>
                </>
            )}
        </div>
    );
};

export default TextEditor;
