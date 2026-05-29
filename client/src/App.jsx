import { useState } from "react";
import "./index.css";

function App({ keycloak }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: "Hello Rahul, I am your Enterprise HR AI Assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // =====================================
  // Authentication Functions
  // =====================================

  // Logout handler
  // Terminates current Keycloak session
  // and redirects user back to chatbot homepage
  const handleLogout = () => {

    keycloak.logout({

      redirectUri: "https://enterprise-ai-security-lab.vercel.app",

    });

  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const employeeId = import.meta.env.VITE_DEMO_EMPLOYEE_ID || "EMP001";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChat((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-employee-id": employeeId,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || data.message || "No response received.",
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Unable to connect to enterprise backend. Please check the API URL.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-8 py-5 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Enterprise AI Assistant</h1>
            <p className="text-sm text-slate-300">
              HR Operations • Secure Employee Chatbot Demo
            </p>
          </div>

          <div className="text-right">

  {/* Logged-in User Information */}

  <p className="text-sm font-medium">

    User: {keycloak.tokenParsed?.name || "Authenticated User"}

  </p>

  <p className="text-xs text-slate-300">

    Username: {keycloak.tokenParsed?.preferred_username}

  </p>

  {/* Logout Button */}

  <button

    onClick={handleLogout}

    className="mt-2 bg-white text-slate-950 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-200"

  >

    Logout

  </button>

</div>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-3 bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Enterprise Portal
          </h2>

          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-950 text-white">
              AI HR Assistant
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              Employee Profile
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              Leave Balance
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              Access Control
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              Security Testing
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-semibold text-blue-900">
              Security Mode
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Requests are sent with employee identity header for demo testing.
            </p>
          </div>
        </aside>

        <section className="col-span-9 bg-white rounded-2xl shadow flex flex-col h-[75vh]">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              HR AI Chatbot
            </h2>
            <p className="text-sm text-slate-500">
              Ask about leave balance, HR policy, or employee-related support.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                    item.role === "user"
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-slate-500">
                Enterprise assistant is thinking...
              </div>
            )}
          </div>

          <div className="border-t p-4 flex gap-3">
            <input
              className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Ask: What is my leave balance?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-slate-950 text-white px-6 py-3 rounded-xl disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;