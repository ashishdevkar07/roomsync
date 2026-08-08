// Step 1 — Import dependencies
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

function Dashboard() {
    // Step 2 — Get user info from localStorage
    const userName = localStorage.getItem("userName")
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate()

    // Step 3 — State for profile completion status
    const [profileComplete, setProfileComplete] = useState(false)
    const [loading, setLoading] = useState(true)

    // Step 4 — Check if profile is complete
    useEffect(() => {
        async function checkProfile() {
            if(!userId) {
                navigate("/login")
                return
            }
            try {
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                if(userSnap.exists()) {
                    setProfileComplete(userSnap.data().profileComplete || false)
                }
            } catch(err) {
                console.log("Error fetching profile:", err)
            } finally {
                setLoading(false)
            }
        }
        checkProfile()
    }, [])

    // Step 5 — Logout function
    function handleLogout() {
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userId")
        navigate("/")
    }

    if(loading) return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>Loading...</p>
        </div>
    )

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E"
        }}>
            {/* Step 6 — Navbar */}
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 60px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer"
                }}
                    onClick={() => navigate("/dashboard")}
                >
                    <div style={{
                        width: "36px",
                        height: "36px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB",
                        fontSize: "18px",
                        fontWeight: "700",
                        fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        onClick={() => navigate("/browse")}
                        style={{
                            padding: "10px 20px",
                            background: "transparent",
                            color: "rgba(249,250,251,0.7)",
                            border: "none",
                            fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                            cursor: "pointer"
                        }}
                    >
                        Browse
                    </button>
                    <button
                        onClick={() => navigate("/complete-profile")}
                        style={{
                            padding: "10px 20px",
                            background: "transparent",
                            color: "rgba(249,250,251,0.7)",
                            border: "none",
                            fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                            cursor: "pointer"
                        }}
                    >
                        My Profile
                    </button>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "25px",
                        cursor: "pointer"
                    }}
                        onClick={handleLogout}
                    >
                        <span style={{
                            color: "#A78BFA",
                            fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "500"
                        }}>
                            👤 {userName}
                        </span>
                        <span style={{
                            color: "rgba(167,139,250,0.5)",
                            fontSize: "12px"
                        }}>Logout</span>
                    </div>
                </div>
            </nav>

            <div style={{ padding: "40px 60px" }}>

                {/* Step 7 — Profile incomplete banner */}
                {!profileComplete && (
                    <div style={{
                        background: "rgba(124,58,237,0.1)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "16px",
                        padding: "20px 24px",
                        marginBottom: "32px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div>
                            <p style={{
                                color: "#A78BFA",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "4px"
                            }}>
                                ✨ Complete your profile to appear in search
                            </p>
                            <p style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif"
                            }}>
                                Others can't find you until your profile is complete
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/complete-profile")}
                            style={{
                                padding: "10px 24px",
                                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                color: "white",
                                border: "none",
                                borderRadius: "20px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontFamily: "Poppins, sans-serif",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Complete Profile →
                        </button>
                    </div>
                )}

                {/* Step 8 — Welcome section */}
                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{
                        color: "#F9FAFB",
                        fontSize: "32px",
                        fontWeight: "700",
                        fontFamily: "Poppins, sans-serif",
                        marginBottom: "8px"
                    }}>
                        Welcome back, {userName}! 👋
                    </h1>
                    <p style={{
                        color: "rgba(249,250,251,0.5)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "15px"
                    }}>
                        Find your perfect roommate today
                    </p>
                </div>

                {/* Step 9 — Quick action cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {[
                        {
                            icon: "🔍",
                            title: "Browse Roommates",
                            desc: "Find compatible roommates near your college",
                            action: () => navigate("/browse"),
                            color: "#7C3AED"
                        },
                        {
                            icon: "👤",
                            title: "My Profile",
                            desc: "Update your preferences and details",
                            action: () => navigate("/complete-profile"),
                            color: "#4F46E5"
                        },
                        {
                            icon: "❤️",
                            title: "Saved Profiles",
                            desc: "View roommates you have saved",
                            action: () => navigate("/saved"),
                            color: "#7C3AED"
                        }
                    ].map((card, i) => (
                        <div
                            key={i}
                            onClick={card.action}
                            style={{
                                background: "#13102B",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "20px",
                                padding: "28px",
                                cursor: "pointer",
                                transition: "all 0.3s"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#7C3AED"
                                e.currentTarget.style.transform = "translateY(-4px)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                                e.currentTarget.style.transform = "translateY(0)"
                            }}
                        >
                            <div style={{
                                fontSize: "32px",
                                marginBottom: "16px"
                            }}>{card.icon}</div>
                            <h3 style={{
                                color: "#F9FAFB",
                                fontSize: "17px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "8px"
                            }}>{card.title}</h3>
                            <p style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                lineHeight: "1.6"
                            }}>{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Step 10 — Tips section */}
                <div style={{
                    background: "#13102B",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    padding: "28px"
                }}>
                    <h3 style={{
                        color: "#F9FAFB",
                        fontFamily: "Poppins, sans-serif",
                        marginBottom: "16px",
                        fontSize: "16px"
                    }}>💡 Tips for finding the perfect roommate</h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "12px"
                    }}>
                        {[
                            "Complete your profile for better matches",
                            "Be honest about your habits and schedule",
                            "Meet in a public place before deciding",
                            "Discuss rent split and house rules clearly"
                        ].map((tip, i) => (
                            <p key={i} style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                lineHeight: "1.6",
                                padding: "12px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "10px"
                            }}>
                                {i + 1}. {tip}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard