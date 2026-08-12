import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

function Dashboard() {
    const userName = localStorage.getItem("userName")
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate()

    const [profileComplete, setProfileComplete] = useState(false)
    const [loading, setLoading] = useState(true)
    const [totalListings, setTotalListings] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchData() {
            if(!userId) { navigate("/login"); return }
            try {
                // Step 1 — Get user profile status
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                if(userSnap.exists()) {
                    setProfileComplete(userSnap.data().profileComplete || false)
                }

                // Step 2 — Get total listings count
                const usersSnap = await getDocs(collection(db, "users"))
                setTotalListings(usersSnap.size)

            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    function handleLogout() {
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userId")
        navigate("/")
    }

    // Step 3 — Featured roommate images from Unsplash
    const featuredRoomates = [
        {
            id: 1,
            name: "Priya S.",
            college: "MIT Pune",
            budget: "₹6,000/mo",
            area: "Kothrud",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
            tags: ["Early Bird", "Non-smoker", "Clean"]
        },
        {
            id: 2,
            name: "Rahul M.",
            college: "COEP",
            budget: "₹5,500/mo",
            area: "Shivajinagar",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
            tags: ["Night Owl", "Gym Lover", "Moderate"]
        },
        {
            id: 3,
            name: "Sneha K.",
            college: "DYPU",
            budget: "₹4,500/mo",
            area: "Lohagaon",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
            tags: ["Flexible", "Bookworm", "Clean"]
        }
    ]

    if(loading) return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif", fontSize: "18px" }}>
                Loading your dashboard...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#0F0A1E" }}>

            {/* ── NAVBAR ── */}
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 48px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(19,16,43,0.95)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB", fontSize: "18px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {["Browse", "My Profile"].map((item, i) => (
                        <button key={i}
                            onClick={() => navigate(i === 0 ? "/browse" : "/complete-profile")}
                            style={{
                                padding: "8px 18px",
                                background: "transparent",
                                color: "rgba(249,250,251,0.6)",
                                border: "none",
                                fontSize: "14px",
                                fontFamily: "Poppins, sans-serif",
                                cursor: "pointer"
                            }}
                        >{item}</button>
                    ))}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 16px",
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "25px", cursor: "pointer"
                    }} onClick={handleLogout}>
                        <span style={{ color: "#A78BFA", fontSize: "14px", fontFamily: "Poppins, sans-serif", fontWeight: "500" }}>
                            👤 {userName}
                        </span>
                        <span style={{ color: "rgba(167,139,250,0.5)", fontSize: "12px" }}>Logout</span>
                    </div>
                </div>
            </nav>

            <div style={{ padding: "32px 48px" }}>

                {/* ── PROFILE INCOMPLETE BANNER ── */}
                {!profileComplete && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "16px",
                        padding: "20px 28px",
                        marginBottom: "32px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ fontSize: "32px" }}>✨</div>
                            <div>
                                <p style={{
                                    color: "#A78BFA", fontWeight: "600",
                                    fontFamily: "Poppins, sans-serif", marginBottom: "4px"
                                }}>Your profile is incomplete</p>
                                <p style={{
                                    color: "rgba(249,250,251,0.5)",
                                    fontSize: "13px", fontFamily: "Inter, sans-serif"
                                }}>
                                    Complete your profile to appear in search results
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/complete-profile")} style={{
                            padding: "10px 24px",
                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white", border: "none",
                            borderRadius: "20px", fontSize: "14px",
                            fontWeight: "600", cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                        }}>
                            Complete Now →
                        </button>
                    </div>
                )}

                {/* ── WELCOME + SEARCH ── */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                    flexWrap: "wrap",
                    gap: "16px"
                }}>
                    <div>
                        <h1 style={{
                            color: "#F9FAFB", fontSize: "28px",
                            fontWeight: "700", fontFamily: "Poppins, sans-serif",
                            marginBottom: "4px"
                        }}>
                            Good day, {userName}! 👋
                        </h1>
                        <p style={{
                            color: "rgba(249,250,251,0.4)",
                            fontFamily: "Inter, sans-serif", fontSize: "14px"
                        }}>
                            Find your perfect roommate today
                        </p>
                    </div>

                    {/* Search bar */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        minWidth: "280px"
                    }}>
                        <span style={{ fontSize: "16px" }}>🔍</span>
                        <input
                            placeholder="Search by college, area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/browse")}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#F9FAFB",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                outline: "none",
                                width: "100%"
                            }}
                        />
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                    marginBottom: "32px"
                }}>
                    {[
                        { label: "Active Listings", value: totalListings, icon: "🏠", color: "#7C3AED" },
                        { label: "Cities Covered", value: "12+", icon: "📍", color: "#4F46E5" },
                        { label: "Colleges", value: "50+", icon: "🎓", color: "#7C3AED" },
                        { label: "Avg Budget", value: "₹5K", icon: "💰", color: "#4F46E5" }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "16px",
                            padding: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px"
                        }}>
                            <div style={{
                                width: "48px", height: "48px",
                                background: `rgba(124,58,237,0.15)`,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "22px",
                                flexShrink: 0
                            }}>{stat.icon}</div>
                            <div>
                                <p style={{
                                    color: "#F9FAFB",
                                    fontSize: "22px",
                                    fontWeight: "700",
                                    fontFamily: "Poppins, sans-serif",
                                    lineHeight: "1"
                                }}>{stat.value}</p>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "12px",
                                    fontFamily: "Inter, sans-serif",
                                    marginTop: "4px"
                                }}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN CONTENT GRID ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 340px",
                    gap: "24px",
                    alignItems: "start"
                }}>

                    {/* LEFT — Featured listings */}
                    <div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}>
                            <h2 style={{
                                color: "#F9FAFB",
                                fontSize: "18px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif"
                            }}>Featured Roommates</h2>
                            <button onClick={() => navigate("/browse")} style={{
                                background: "transparent",
                                border: "none",
                                color: "#A78BFA",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                cursor: "pointer"
                            }}>View all →</button>
                        </div>

                        {/* Roommate cards */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "16px"
                        }}>
                            {featuredRoomates.map((person) => (
                                <div key={person.id} style={{
                                    background: "#13102B",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    transition: "all 0.3s"
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "#7C3AED"
                                        e.currentTarget.style.transform = "translateY(-4px)"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                                        e.currentTarget.style.transform = "translateY(0)"
                                    }}
                                >
                                    {/* Image */}
                                    <div style={{
                                        height: "180px",
                                        backgroundImage: `url(${person.image})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        position: "relative"
                                    }}>
                                        <div style={{
                                            position: "absolute",
                                            top: "12px",
                                            right: "12px",
                                            background: "rgba(124,58,237,0.9)",
                                            color: "white",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontFamily: "Poppins, sans-serif",
                                            fontWeight: "600"
                                        }}>
                                            {person.budget}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: "16px" }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "8px"
                                        }}>
                                            <h3 style={{
                                                color: "#F9FAFB",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                fontFamily: "Poppins, sans-serif"
                                            }}>{person.name}</h3>
                                            <span style={{
                                                fontSize: "18px",
                                                cursor: "pointer"
                                            }}>❤️</span>
                                        </div>

                                        <p style={{
                                            color: "rgba(249,250,251,0.5)",
                                            fontSize: "12px",
                                            fontFamily: "Inter, sans-serif",
                                            marginBottom: "4px"
                                        }}>🎓 {person.college}</p>

                                        <p style={{
                                            color: "rgba(249,250,251,0.5)",
                                            fontSize: "12px",
                                            fontFamily: "Inter, sans-serif",
                                            marginBottom: "12px"
                                        }}>📍 {person.area}</p>

                                        {/* Tags */}
                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                            {person.tags.map((tag, i) => (
                                                <span key={i} style={{
                                                    padding: "4px 10px",
                                                    background: "rgba(124,58,237,0.15)",
                                                    border: "1px solid rgba(124,58,237,0.2)",
                                                    borderRadius: "20px",
                                                    color: "#A78BFA",
                                                    fontSize: "11px",
                                                    fontFamily: "Inter, sans-serif"
                                                }}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Profile completion card */}
                        <div style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px",
                            padding: "24px"
                        }}>
                            <h3 style={{
                                color: "#F9FAFB",
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "16px"
                            }}>Profile Strength</h3>

                            {/* Progress bar */}
                            <div style={{
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: "10px",
                                height: "8px",
                                marginBottom: "8px"
                            }}>
                                <div style={{
                                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                    borderRadius: "10px",
                                    height: "100%",
                                    width: profileComplete ? "100%" : "30%",
                                    transition: "width 0.5s ease"
                                }} />
                            </div>
                            <p style={{
                                color: "rgba(249,250,251,0.4)",
                                fontSize: "12px",
                                fontFamily: "Inter, sans-serif",
                                marginBottom: "16px"
                            }}>
                                {profileComplete ? "100% — Your profile is complete!" : "30% — Complete your profile"}
                            </p>

                            {/* Checklist */}
                            {[
                                { label: "Account created", done: true },
                                { label: "Email verified", done: true },
                                { label: "Profile details filled", done: profileComplete },
                                { label: "Visible in search", done: profileComplete }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "10px"
                                }}>
                                    <span style={{
                                        fontSize: "14px",
                                        color: item.done ? "#A78BFA" : "rgba(255,255,255,0.2)"
                                    }}>
                                        {item.done ? "✅" : "⬜"}
                                    </span>
                                    <p style={{
                                        color: item.done ? "rgba(249,250,251,0.7)" : "rgba(249,250,251,0.3)",
                                        fontSize: "13px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick tips card */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))",
                            border: "1px solid rgba(124,58,237,0.2)",
                            borderRadius: "20px",
                            padding: "24px"
                        }}>
                            <h3 style={{
                                color: "#A78BFA",
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px"
                            }}>💡 Quick Tips</h3>
                            {[
                                "Be honest about your habits",
                                "Meet in public before deciding",
                                "Discuss rent split upfront",
                                "Check the locality and transport"
                            ].map((tip, i) => (
                                <p key={i} style={{
                                    color: "rgba(249,250,251,0.5)",
                                    fontSize: "12px",
                                    fontFamily: "Inter, sans-serif",
                                    lineHeight: "1.6",
                                    marginBottom: "8px",
                                    paddingLeft: "12px",
                                    borderLeft: "2px solid rgba(124,58,237,0.3)"
                                }}>
                                    {tip}
                                </p>
                            ))}
                        </div>

                        {/* Cities card */}
                        <div style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px",
                            padding: "24px"
                        }}>
                            <h3 style={{
                                color: "#F9FAFB",
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px"
                            }}>🏙️ Popular Cities</h3>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px"
                            }}>
                                {["Pune", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Delhi"].map((city, i) => (
                                    <span key={i}
                                        onClick={() => navigate("/browse")}
                                        style={{
                                            padding: "6px 14px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "20px",
                                            color: "rgba(249,250,251,0.6)",
                                            fontSize: "12px",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.borderColor = "#7C3AED"
                                            e.target.style.color = "#A78BFA"
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.08)"
                                            e.target.style.color = "rgba(249,250,251,0.6)"
                                        }}
                                    >{city}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard