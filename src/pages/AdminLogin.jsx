import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminLogin() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    function handleLogin() {
        if(username === "admin" && password === "admin123") {
            localStorage.setItem("isAdmin", "true")
            navigate("/admin")
        } else {
            setError("Invalid admin credentials")
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            {/* Background glow */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                background: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.05) 0%, transparent 70%)"
            }} />

            <div style={{
                width: "100%", maxWidth: "400px",
                background: "#0A0A0A",
                border: "1px solid #222222",
                borderRadius: "24px",
                padding: "40px",
                position: "relative",
                zIndex: 1
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", marginBottom: "32px",
                    cursor: "pointer"
                }} onClick={() => navigate("/")}>
                    <div style={{
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "16px"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "18px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <h1 style={{
                    color: "#FFFFFF", fontSize: "24px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "8px"
                }}>Admin Access</h1>
                <p style={{
                    color: "#444444", fontSize: "14px",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "32px"
                }}>Restricted — authorized personnel only</p>

                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "12px", padding: "12px 16px",
                        color: "#F87171", fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "20px"
                    }}>❌ {error}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{
                            color: "#444444", fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            display: "block", marginBottom: "8px",
                            textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Username</label>
                        <input
                            type="text"
                            placeholder="Enter admin username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            style={{
                                width: "100%", padding: "12px 16px",
                                background: "#111111",
                                border: "1px solid #222222",
                                borderRadius: "12px", color: "#FFFFFF",
                                fontSize: "14px", fontFamily: "Inter, sans-serif",
                                outline: "none"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            color: "#444444", fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            display: "block", marginBottom: "8px",
                            textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            style={{
                                width: "100%", padding: "12px 16px",
                                background: "#111111",
                                border: "1px solid #222222",
                                borderRadius: "12px", color: "#FFFFFF",
                                fontSize: "14px", fontFamily: "Inter, sans-serif",
                                outline: "none"
                            }}
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        style={{
                            width: "100%", padding: "14px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "12px", fontSize: "15px",
                            fontWeight: "700", cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            marginTop: "8px",
                            boxShadow: "0 0 30px rgba(245,158,11,0.3)",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 0 40px rgba(245,158,11,0.5)"
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "0 0 30px rgba(245,158,11,0.3)"
                        }}
                    >Login as Admin</button>
                </div>

                <p
                    onClick={() => navigate("/")}
                    style={{
                        textAlign: "center", marginTop: "24px",
                        color: "#333333", fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        cursor: "pointer"
                    }}
                >← Back to home</p>
            </div>
        </div>
    )
}

export default AdminLogin