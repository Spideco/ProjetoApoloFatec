export const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="ai-message max-w-[85%] md:max-w-[70%] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-muted-foreground ml-2">Apolo está pensando...</span>
        </div>
      </div>
    </div>
  );
};