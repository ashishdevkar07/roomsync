// Step 1 — Import dependencies
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Step 2 — Import Firebase auth functions
import { db } from "../firebase"
import { collection, addDoc } from "firebase/firestore"

// Step 3 — Register component
function Register() {
    // Step 4 — Form state
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    // Step 5 — Handle registration
    async function handleRegister() {
        // Step 6 — Validation
        if (!name || !email || !password) {
            setError("Please fill all fields")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        try {
            setLoading(true)
            setError("")

            // Step 7 — Save user to Firestore
            await addDoc(collection(db, "users"), {
                name,
                email,
                password, // Note: in real app use Firebase Auth
                createdAt: new Date().toISOString(),
                profileComplete: false
            })

            // Step 8 — Save to localStorage for session
            localStorage.setItem("userName", name)
            localStorage.setItem("userEmail", email)

            // Step 9 — Redirect to complete profile page
            navigate("/complete-profile")

        } catch (err) {
            setError("Something went wrong. Please try again.")
            console.log("Register error:", err)
        } finally {
            setLoading(false)
        }
    }

    // Step 10 — Render
    return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            {/* Step 11 — Main container with two sides */}
            <div style={{
                display: "flex",
                width: "100%",
                maxWidth: "1000px",
                minHeight: "580px",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
            }}>

                {/* Step 12 — Left side image */}
                <div style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #2D1B69 0%, #7C3AED 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 40px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* Background image overlay */}
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.2
                    }} />

                    {/* Content on image side */}
                    <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                        {/* Logo */}
                        <div style={{
                            width: "60px",
                            height: "60px",
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px",
                            margin: "0 auto 24px"
                        }}>🏠</div>

                        <h2 style={{
                            color: "white",
                            fontSize: "28px",
                            fontWeight: "700",
                            fontFamily: "Poppins, sans-serif",
                            marginBottom: "16px",
                            lineHeight: "1.3"
                        }}>
                            Find your perfect roommate
                        </h2>

                        <p style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "15px",
                            fontFamily: "Inter, sans-serif",
                            lineHeight: "1.7",
                            marginBottom: "40px"
                        }}>
                            Join thousands of students who found their ideal living partner through RoomSync.
                        </p>

                        {/* Feature list */}
                        {[
                            "✓ Verified student profiles",
                            "✓ Smart compatibility matching",
                            "✓ Filter by budget and location",
                            "✓ Safe and secure platform"
                        ].map((item, i) => (
                            <p key={i} style={{
                                color: "rgba(255,255,255,0.85)",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                marginBottom: "10px",
                                textAlign: "left"
                            }}>{item}</p>
                        ))}
                    </div>
                </div>

                {/* Step 13 — Right side form */}
                <div style={{
                    flex: 1,
                    background: "#13102B",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "60px 48px"
                }}>
                    {/* Back to home */}
                    <p
                        onClick={() => navigate("/")}
                        style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "13px",
                            fontFamily: "Inter, sans-serif",
                            cursor: "pointer",
                            marginBottom: "32px"
                        }}
                    >
                        ← Back to home
                    </p>

                    <h1 style={{
                        color: "#F9FAFB",
                        fontSize: "28px",
                        fontWeight: "700",
                        fontFamily: "Poppins, sans-serif",
                        marginBottom: "8px"
                    }}>Create account</h1>

                    <p style={{
                        color: "rgba(249,250,251,0.5)",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "32px"
                    }}>
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            style={{ color: "#A78BFA", cursor: "pointer", fontWeight: "500" }}
                        >
                            Login here
                        </span>
                    </p>

                    {/* Error message */}
                    {error && (
                        <p style={{
                            color: "#F87171",
                            fontSize: "13px",
                            marginBottom: "16px",
                            fontFamily: "Inter, sans-serif"
                        }}>{error}</p>
                    )}

                    {/* Step 14 — Form fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{
                                color: "rgba(249,250,251,0.6)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                display: "block",
                                marginBottom: "8px"
                            }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    color: "#F9FAFB",
                                    fontSize: "15px",
                                    fontFamily: "Inter, sans-serif",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                color: "rgba(249,250,251,0.6)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                display: "block",
                                marginBottom: "8px"
                            }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    color: "#F9FAFB",
                                    fontSize: "15px",
                                    fontFamily: "Inter, sans-serif",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                color: "rgba(249,250,251,0.6)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                display: "block",
                                marginBottom: "8px"
                            }}>Password</label>
                            <input
                                type="password"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    color: "#F9FAFB",
                                    fontSize: "15px",
                                    fontFamily: "Inter, sans-serif",
                                    outline: "none"
                                }}
                            />
                        </div>

                        {/* Step 15 — Submit button */}
                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: loading
                                    ? "rgba(124,58,237,0.5)"
                                    : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontFamily: "Poppins, sans-serif",
                                marginTop: "8px",
                                boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                            }}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register