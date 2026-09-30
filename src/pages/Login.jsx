import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function handleLogin() {
        if(!email || !password) {
            setError("Please fill all fields")
            return
        }
        try {
            setLoading(true)
            setError("")
            const q = query(collection(db, "users"), where("email", "==", email))
            const snapshot = await getDocs(q)
            if(snapshot.empty) {
                setError("No account found with this email")
                setLoading(false)
                return
            }
            const userDoc = snapshot.docs[0]
            const userData = userDoc.data()
            if(userData.password !== password) {
                setError("Incorrect password")
                setLoading(false)
                return
            }
            localStorage.setItem("userName", userData.name)
            localStorage.setItem("userEmail", userData.email)
            localStorage.setItem("userId", userDoc.id)
            navigate("/dashboard")
        } catch(err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#000000",
            display: "flex",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background effects */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0
            }}>
                <div style={{
                    position: "absolute",
                    width: "500px", height: "500px",
                    background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
                    top: "-100px", left: "-100px"
                }} />
                <div style={{
                    position: "absolute",
                    width: "400px", height: "400px",
                    background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
                    bottom: "-100px", right: "-100px"
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(245,158,11,0.02) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(245,158,11,0.02) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }} />
            </div>

            {/* Left side — branding */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px",
                position: "relative",
                zIndex: 1,
                borderRight: "1px solid #111111"
            }}>
                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    style={{
                        display: "flex", alignItems: "center",
                        gap: "10px", marginBottom: "60px",
                        cursor: "pointer"
                    }}>
                    <div style={{
                        width: "38px", height: "38px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "10px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 0 20px rgba(245,158,11,0.3)"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "20px",
                        fontWeight: "800", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <h1 style={{
                    fontSize: "48px", fontWeight: "800",
                    fontFamily: "Poppins, sans-serif",
                    lineHeight: "1.1", marginBottom: "20px",
                    color: "#FFFFFF"
                }}>
                    Welcome<br />
                    <span style={{
                        background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>back.</span>
                </h1>

                <p style={{
                    color: "#444444", fontSize: "16px",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: "1.8", marginBottom: "48px",
                    maxWidth: "380px"
                }}>
                    Your perfect roommate is waiting. Login to continue your search and connect with compatible people near you.
                </p>

                {/* Feature list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                        { icon: "📍", text: "Find roommates near your college" },
                        { icon: "💜", text: "Send and receive interest requests" },
                        { icon: "🗺️", text: "View profiles on interactive map" },
                        { icon: "✅", text: "Verified student profiles only" }
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "12px"
                        }}>
                            <span style={{
                                width: "36px", height: "36px",
                                background: "rgba(245,158,11,0.08)",
                                border: "1px solid rgba(245,158,11,0.15)",
                                borderRadius: "10px",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: "16px",
                                flexShrink: 0
                            }}>{item.icon}</span>
                            <p style={{
                                color: "#555555", fontSize: "14px",
                                fontFamily: "Inter, sans-serif"
                            }}>{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side — form */}
            <div style={{
                width: "480px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px 48px",
                position: "relative",
                zIndex: 1
            }}>
                <h2 style={{
                    color: "#FFFFFF", fontSize: "28px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "8px"
                }}>Sign in</h2>

                <p style={{
                    color: "#444444", fontSize: "14px",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "36px"
                }}>
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        style={{
                            color: "#F59E0B", cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >Create one</span>
                </p>

                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "12px", padding: "12px 16px",
                        color: "#F87171", fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "24px"
                    }}>❌ {error}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Email */}
                    <div>
                        <label style={{
                            color: "#333333", fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            display: "block", marginBottom: "8px",
                            textTransform: "uppercase", letterSpacing: "0.08em"
                        }}>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            style={{
                                width: "100%", padding: "14px 16px",
                                background: "#0A0A0A",
                                border: "1px solid #1A1A1A",
                                borderRadius: "12px", color: "#FFFFFF",
                                fontSize: "15px", fontFamily: "Inter, sans-serif",
                                outline: "none", transition: "border-color 0.3s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#F59E0B"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{
                            color: "#333333", fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            display: "block", marginBottom: "8px",
                            textTransform: "uppercase", letterSpacing: "0.08em"
                        }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            style={{
                                width: "100%", padding: "14px 16px",
                                background: "#0A0A0A",
                                border: "1px solid #1A1A1A",
                                borderRadius: "12px", color: "#FFFFFF",
                                fontSize: "15px", fontFamily: "Inter, sans-serif",
                                outline: "none", transition: "border-color 0.3s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#F59E0B"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "15px",
                            background: loading
                                ? "rgba(245,158,11,0.3)"
                                : "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "12px", fontSize: "15px",
                            fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "Poppins, sans-serif",
                            marginTop: "4px",
                            boxShadow: loading ? "none" : "0 0 30px rgba(245,158,11,0.3)",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                            if(!loading) {
                                e.target.style.transform = "translateY(-2px)"
                                e.target.style.boxShadow = "0 0 40px rgba(245,158,11,0.5)"
                            }
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = loading ? "none" : "0 0 30px rgba(245,158,11,0.3)"
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in →"}
                    </button>
                </div>

                <p style={{
                    textAlign: "center", marginTop: "32px",
                    color: "#222222", fontSize: "12px",
                    fontFamily: "Inter, sans-serif"
                }}>
                    By continuing you agree to our Terms of Service
                </p>
            </div>
        </div>
    )
}

export default Login