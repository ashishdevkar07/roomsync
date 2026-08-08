// Step 1 — Import dependencies
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Step 2 — Import Firebase
import { db } from "../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

// Step 3 — Login component
function Login() {
    // Step 4 — Form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    // Step 5 — Handle login
    async function handleLogin() {
        // Step 6 — Validation
        if(!email || !password) {
            setError("Please fill all fields")
            return
        }

        try {
            setLoading(true)
            setError("")

            // Step 7 — Search Firestore for user with this email
            const usersRef = collection(db, "users")
            const q = query(usersRef, where("email", "==", email))
            const snapshot = await getDocs(q)

            // Step 8 — Check if user exists
            if(snapshot.empty) {
                setError("No account found with this email")
                setLoading(false)
                return
            }

            // Step 9 — Get user data
            const userDoc = snapshot.docs[0]
            const userData = userDoc.data()

            // Step 10 — Check password
            if(userData.password !== password) {
                setError("Incorrect password")
                setLoading(false)
                return
            }

            // Step 11 — Save session to localStorage
            localStorage.setItem("userName", userData.name)
            localStorage.setItem("userEmail", userData.email)
            localStorage.setItem("userId", userDoc.id)

            // Step 12 — Redirect based on profile completion
            if(userData.profileComplete) {
                navigate("/dashboard")
            }

        } catch(err) {
            setError("Something went wrong. Please try again.")
            console.log("Login error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            {/* Step 13 — Same two side layout as Register */}
            <div style={{
                display: "flex",
                width: "100%",
                maxWidth: "1000px",
                minHeight: "580px",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
            }}>

                {/* Step 14 — Left side image — same as register */}
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
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.2
                    }} />

                    <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
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
                            Welcome back to RoomSync
                        </h2>

                        <p style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "15px",
                            fontFamily: "Inter, sans-serif",
                            lineHeight: "1.7"
                        }}>
                            Your perfect roommate is waiting. Login to continue your search.
                        </p>
                    </div>
                </div>

                {/* Step 15 — Right side login form */}
                <div style={{
                    flex: 1,
                    background: "#13102B",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "60px 48px"
                }}>
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
                    }}>Welcome back</h1>

                    <p style={{
                        color: "rgba(249,250,251,0.5)",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "32px"
                    }}>
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            style={{ color: "#A78BFA", cursor: "pointer", fontWeight: "500" }}
                        >
                            Register here
                        </span>
                    </p>

                    {error && (
                        <p style={{
                            color: "#F87171",
                            fontSize: "13px",
                            marginBottom: "16px",
                            fontFamily: "Inter, sans-serif"
                        }}>{error}</p>
                    )}

                    {/* Step 16 — Form fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                                placeholder="Enter your password"
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

                        {/* Step 17 — Submit button */}
                        <button
                            onClick={handleLogin}
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
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login