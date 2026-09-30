import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, addDoc } from "firebase/firestore"

function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function handleRegister() {
        if(!name || !email || !password) {
            setError("Please fill all fields")
            return
        }
        if(password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        try {
            setLoading(true)
            setError("")
            const docRef = await addDoc(collection(db, "users"), {
                name, email, password,
                createdAt: new Date().toISOString(),
                profileComplete: false
            })
            localStorage.setItem("userName", name)
            localStorage.setItem("userEmail", email)
            localStorage.setItem("userId", docRef.id)
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
                    top: "-100px", right: "-100px"
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(245,158,11,0.02) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(245,158,11,0.02) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }} />
            </div>

            {/* Left side — form */}
            <div style={{
                width: "480px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px 48px",
                position: "relative",
                zIndex: 1,
                borderRight: "1px solid #111111"
            }}>
                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    style={{
                        display: "flex", alignItems: "center",
                        gap: "10px", marginBottom: "48px",
                        cursor: "pointer"
                    }}>
                    <div style={{
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "10px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "16px",
                        boxShadow: "0 0 20px rgba(245,158,11,0.3)"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "18px",
                        fontWeight: "800", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <h2 style={{
                    color: "#FFFFFF", fontSize: "28px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "8px"
                }}>Create account</h2>

                <p style={{
                    color: "#444444", fontSize: "14px",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "36px"
                }}>
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        style={{ color: "#F59E0B", cursor: "pointer", fontWeight: "500" }}
                    >Sign in</span>
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
                    {/* Name */}
                    <div>
                        <label style={{
                            color: "#333333", fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            display: "block", marginBottom: "8px",
                            textTransform: "uppercase", letterSpacing: "0.08em"
                        }}>Full Name</label>
                        <input
                            type="text"
                            placeholder="Ashish Devkar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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
                        onClick={handleRegister}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "15px",
                            background: loading
                                ? "rgba(245,158,11,0.3)"
                                : "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "12px", fontSize: "15px",
                            fontWeight: "700",
                            cursor: loading ? "not-allowed" : "pointer",
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
                        {loading ? "Creating account..." : "Create Account →"}
                    </button>
                </div>

                <p style={{
                    textAlign: "center", marginTop: "28px",
                    color: "#222222", fontSize: "12px",
                    fontFamily: "Inter, sans-serif"
                }}>
                    By registering you agree to our Terms of Service
                </p>
            </div>

            {/* Right side — branding */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "60px",
                position: "relative",
                zIndex: 1
            }}>
                <h1 style={{
                    fontSize: "52px", fontWeight: "800",
                    fontFamily: "Poppins, sans-serif",
                    lineHeight: "1.1", marginBottom: "24px",
                    color: "#FFFFFF"
                }}>
                    Your next chapter<br />
                    <span style={{
                        background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>starts here.</span>
                </h1>

                <p style={{
                    color: "#444444", fontSize: "16px",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: "1.8", marginBottom: "52px",
                    maxWidth: "400px"
                }}>
                    Join thousands of students across India who found their perfect roommate through RoomSync.
                </p>

                {/* Stats */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px", maxWidth: "360px"
                }}>
                    {[
                        { number: "2,400+", label: "Active Listings" },
                        { number: "180+", label: "Colleges" },
                        { number: "94%", label: "Match Rate" },
                        { number: "Free", label: "Always" }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "16px", padding: "20px"
                        }}>
                            <p style={{
                                fontSize: "24px", fontWeight: "800",
                                fontFamily: "Poppins, sans-serif",
                                background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "4px"
                            }}>{stat.number}</p>
                            <p style={{
                                color: "#333333", fontSize: "12px",
                                fontFamily: "Inter, sans-serif"
                            }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Register