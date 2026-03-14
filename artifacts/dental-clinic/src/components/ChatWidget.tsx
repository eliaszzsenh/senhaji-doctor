import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../i18n/useLang";
import type { Lang } from "../i18n/translations";

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
  actionResult?: string;
};

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "darija", label: "Darija", flag: "🇲🇦" },
];

const QUICK_REPLIES: Record<Lang, string[]> = {
  fr: ["📅 Prendre RDV", "❌ Annuler", "🔄 Modifier", "ℹ️ Infos"],
  en: ["📅 Book appt", "❌ Cancel", "🔄 Reschedule", "ℹ️ Info"],
  ar: ["📅 حجز موعد", "❌ إلغاء", "🔄 تغيير", "ℹ️ معلومات"],
  darija: ["📅 حجز ميعاد", "❌ إلغاء", "🔄 تبديل", "ℹ️ معلومات"],
};

const WELCOME_MESSAGES: Record<Lang, string> = {
  fr: "Bonjour! 👋 Je suis l'assistant virtuel du Centre Dentaire Senhaji. Comment puis-je vous aider?",
  en: "Hello! 👋 I'm the virtual assistant of Centre Dentaire Senhaji. How can I help you?",
  ar: "مرحباً! 👋 أنا المساعد الافتراضي لمركز سنهاجي للأسنان. كيف يمكنني مساعدتك؟",
  darija: "أهلاً! 👋 أنا المساعد ديال مركز سنهاجي للأسنان. بأش نقدر نعاونك؟",
};

const PLACEHOLDERS: Record<Lang, string> = {
  fr: "Tapez votre message...",
  en: "Type your message...",
  ar: "اكتب رسالتك...",
  darija: "اكتب شي حاجة...",
};

export default function ChatWidget() {
  const { lang: siteLang, isRTL } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [chatLang, setChatLang] = useState<Lang>("fr");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(
    localStorage.getItem("chat_session_id") ||
      Math.random().toString(36).substring(2, 15),
  );

  useEffect(() => {
    localStorage.setItem("chat_session_id", sessionId.current);
  }, []);

  useEffect(() => {
    const storedChatLang = localStorage.getItem("chat_lang");
    if (storedChatLang) {
      setChatLang(storedChatLang as Lang);
    } else if (siteLang) {
      setChatLang(siteLang);
    }
  }, [siteLang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!localStorage.getItem("chat_lang") && messages.length === 0) {
      setShowLangPicker(true);
    } else if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "bot",
          content: WELCOME_MESSAGES[chatLang],
          actionResult: undefined,
        },
      ]);
    }
  };

  const handleLangSelect = (lang: Lang) => {
    setChatLang(lang);
    localStorage.setItem("chat_lang", lang);
    setShowLangPicker(false);
    setMessages([
      {
        id: "1",
        role: "bot",
        content: WELCOME_MESSAGES[lang],
      },
    ]);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId.current,
          lang: chatLang,
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.reply,
        actionResult: data.action?.success ? data.action.message : undefined,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content:
            chatLang === "fr"
              ? "Une erreur est survenue. Veuillez réessayer."
              : chatLang === "en"
                ? "An error occurred. Please try again."
                : "حدث خطأ. يرجى المحاولة مرة أخرى.",
        },
      ]);
    }
  };

  const chatPosition = isRTL ? "bottom-6 left-6" : "bottom-6 right-6";
  const chatPanelPosition = isRTL
    ? { right: "auto", left: "1rem" }
    : { left: "auto", right: "1rem" };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={chatPanelPosition}
            className={`fixed bottom-24 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold leading-none">
                    Asst. Dr. Senhaji
                  </h3>
                  <span className="text-xs text-blue-200">En ligne</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {showLangPicker && (
                <div className="text-center p-4">
                  <h4 className="font-semibold text-slate-700 mb-4">
                    اختر لغتك / Choose your language
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium">
                          {lang.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-white" : "bg-accent text-secondary"}`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-sm shadow-sm"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {msg.actionResult && (
                    <div className="mt-2 ml-10 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-700">
                        ✅ {msg.actionResult}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent text-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-sm flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length > 0 && !showLangPicker && (
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-2">
                {QUICK_REPLIES[chatLang].map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleSend(qr)}
                    className="text-xs px-3 py-1.5 bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-full transition-colors shadow-sm"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            {!showLangPicker && (
              <div className="p-3 bg-white border-t border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(inputValue);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={PLACEHOLDERS[chatLang]}
                    className="w-full bg-slate-100 border-transparent rounded-full px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    disabled={isTyping}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-2 rtl:right-auto rtl:left-2 p-1.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={`fixed ${chatPosition} z-50 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-colors`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </>
  );
}
