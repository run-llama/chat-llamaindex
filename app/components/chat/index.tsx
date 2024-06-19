import ChatSection from "./chat-session";
import ChatHeader from "./chat-header";

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-4 h-full w-full p-4">
      <ChatHeader />
      <div className="flex-1 overflow-auto shadow-xl">
        <ChatSection />
      </div>
    </div>
  );
}
