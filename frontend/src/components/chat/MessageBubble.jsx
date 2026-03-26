import React from 'react';
import { User, Bot } from 'lucide-react';

export function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="text-blue-600 w-6 h-6" />
        </div>
      )}
      <div>
        <div className={`p-4 rounded-lg shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="text-gray-600 w-6 h-6" />
        </div>
      )}
    </div>
  );
}
