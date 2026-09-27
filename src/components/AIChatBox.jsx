// Step 1 — Import dependencies
import { useState, useEffect, useRef } from "react"
import { db } from "../firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

// Step 2 — Your Gemini API key
const GEMINI_API_KEY = "AIzaSyDLIixvrPcV9FQd_GOTitCLHgf9oFo92HU"

function AIChatbox() {
    // Step 3 — State
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hi! 👋 I'm RoomSync AI. Tell me what kind of roommate you're looking for and I'll find the best matches for you!"
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [profiles, setProfiles] = useState([])
    const messagesEndRef = useRef(null)

    // Step 4 — Fetch all profiles once when component mounts
    useEffect(() => {
        async function fetchProfiles() {
            try {
                const snap = await getDocs(
                    query(collection(db, "users"), where("profileComplete", "==", true))
                )
                const data = snap.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }))
                setProfiles(data)
            } catch (err) {
                console.log("Error fetching profiles:", err)
            }
        }
        fetchProfiles()
    }, [])

    // Step 5 — Auto scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Step 6 — Send message to Gemini API
    async function handleSend() {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput("")

        // Add user message to chat
        setMessages(prev => [...prev, { role: "user", text: userMessage }])
        setLoading(true)

        try {
            // Step 7 — Prepare profiles data for AI
            const profilesSummary = profiles.map(p => `
                Name: ${p.name}
                City: ${p.city}
                College: ${p.college}
                Budget: ₹${p.budget}/month
                Gender: ${p.gender}
                Looking For: ${p.lookingFor}
                Sleep Schedule: ${p.sleepSchedule || "Not specified"}
                Cleanliness: ${p.cleanliness || "Not specified"}
                Bio: ${p.bio || "No bio"}
            `).join("\n---\n")

            // Step 8 — Create prompt for Gemini
            const prompt = `
You are RoomSync AI — a smart roommate finder assistant for Indian college students.

Here are all available roommate profiles on the platform:
${profilesSummary}

User's message: "${userMessage}"

Based on the user's request and the available profiles above:
1. Find the most relevant matching profiles
2. Explain why they match
3. Give practical advice about roommate selection
4. Keep response friendly, helpful and concise
5. If no profiles match, suggest what filters to change
6. Always respond in a conversational, helpful tone
7. Use emojis to make response friendly
`

            // Step 9 — Call Gemini API
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                }
            )

            const data = await response.json()
            console.log("Gemini response:", data)

            // Step 10 — Extract response text
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
                || "Sorry, I couldn't process that. Please try again."

            // Step 11 — Add AI response to chat
            setMessages(prev => [...prev, { role: "assistant", text: aiResponse }])

        } catch (err) {
            console.log("Gemini error:", err)
            setMessages(prev => [...prev, {
                role: "assistant",
                text: "Sorry, something went wrong. Please try again. 😔"
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* ── FLOATING CHAT BUTTON ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "28px",
                    right: "28px",
                    width: "56px",
                    height: "56px",
                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(124,58,237,0.5)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                {isOpen ? "✕" : "🤖"}
            </button>

            {/* ── CHAT WINDOW ── */}
            {isOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "96px",
                    right: "28px",
                    width: "360px",
                    height: "500px",
                    background: "#13102B",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 1000,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    overflow: "hidden"
                }}>

                    {/* Chat header */}
                    <div style={{
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <div style={{
                            width: "36px", height: "36px",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "50%",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "18px"
                        }}>🤖</div>
                        <div>
                            <p style={{
                                color: "white", fontSize: "14px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "1px"
                            }}>RoomSync AI</p>
                            <p style={{
                                color: "rgba(255,255,255,0.7)",
                                fontSize: "11px", fontFamily: "Inter, sans-serif"
                            }}>
                                {loading ? "Thinking..." : "Online • Ask me anything"}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                            }}>
                                <div style={{
                                    maxWidth: "80%",
                                    padding: "10px 14px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                                        : "rgba(255,255,255,0.06)",
                                    borderRadius: msg.role === "user"
                                        ? "18px 18px 4px 18px"
                                        : "18px 18px 18px 4px",
                                    color: "#F9FAFB",
                                    fontSize: "13px",
                                    fontFamily: "Inter, sans-serif",
                                    lineHeight: "1.6",
                                    border: msg.role === "assistant"
                                        ? "1px solid rgba(255,255,255,0.08)"
                                        : "none"
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    padding: "10px 16px",
                                    background: "rgba(255,255,255,0.06)",
                                    borderRadius: "18px 18px 18px 4px",
                                    border: "1px solid rgba(255,255,255,0.08)"
                                }}>
                                    <div style={{
                                        display: "flex", gap: "4px",
                                        alignItems: "center"
                                    }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: "6px", height: "6px",
                                                background: "#A78BFA",
                                                borderRadius: "50%",
                                                animation: `bounce 1s infinite ${i * 0.2}s`
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div style={{
                        padding: "12px 16px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                    }}>
                        <input
                            placeholder="Ask me to find a roommate..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            style={{
                                flex: 1,
                                padding: "10px 14px",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "20px",
                                color: "#F9FAFB",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                outline: "none"
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{
                                width: "36px", height: "36px",
                                background: loading || !input.trim()
                                    ? "rgba(124,58,237,0.3)"
                                    : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                border: "none",
                                borderRadius: "50%",
                                color: "white",
                                fontSize: "16px",
                                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >→</button>
                    </div>
                </div>
            )}

            {/* Bounce animation */}
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </>
    )
}

export default AIChatbox