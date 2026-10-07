import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"

function ProfileDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUserId = localStorage.getItem("userId")
    const currentUserName = localStorage.getItem("userName")

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [interestSent, setInterestSent] = useState(false)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const userRef = doc(db, "users", id)
                const userSnap = await getDoc(userRef)
                if(userSnap.exists()) {
                    setProfile({ id: userSnap.id, ...userSnap.data() })
                }

                const interestQuery = query(
                    collection(db, "interests"),
                    where("fromId", "==", currentUserId),
                    where("toId", "==", id)
                )
                const interestSnap = await getDocs(interestQuery)
                if(!interestSnap.empty) setInterestSent(true)

            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    async function handleSendInterest() {
        if(!currentUserId) { navigate("/login"); return }
        if(currentUserId === id) return

        try {
            setSending(true)
            await addDoc(collection(db, "interests"), {
                fromId: currentUserId,
                fromName: currentUserName,
                toId: id,
                toName: profile.name,
                status: "pending",
                createdAt: new Date().toISOString()
            })
            setInterestSent(true)
        } catch(err) {
            console.log("Error:", err)
        } finally {
            setSending(false)
        }
    }

    if(loading) return (
        <div style={{
            minHeight: "100vh", background: "#000000",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: "16px"
        }}>
            <div style={{
                width: "44px", height: "44px",
                border: "3px solid #111111",
                borderTop: "3px solid #F59E0B",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if(!profile) return (
        <div style={{
            minHeight: "100vh", background: "#000000",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", gap: "16px"
        }}>
            <p style={{ fontSize: "48px" }}>😕</p>
            <p style={{ color: "#444444", fontFamily: "Poppins, sans-serif" }}>Profile not found</p>
            <button onClick={() => navigate("/browse")} style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#000", border: "none", borderRadius: "20px",
                fontFamily: "Poppins, sans-serif", fontWeight: "700",
                cursor: "pointer"
            }}>Back to Browse</button>
        </div>
    )

    const gradientColor = profile.gender === "Female" ? "#EC4899, #A855F7" :
        profile.gender === "Male" ? "#3B82F6, #6366F1" : "#F59E0B, #D97706"

    return (
        <div style={{ minHeight: "100vh", background: "#000000" }}>

            {/* Navbar */}
            <nav style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "16px 48px",
                borderBottom: "1px solid #111111",
                background: "rgba(0,0,0,0.95)",
                position: "sticky", top: 0, zIndex: 100,
                backdropFilter: "blur(20px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "15px", boxShadow: "0 0 15px rgba(245,158,11,0.3)"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>
                <button onClick={() => navigate("/browse")} style={{
                    padding: "9px 20px",
                    background: "transparent",
                    color: "#444444",
                    border: "1px solid #1A1A1A",
                    borderRadius: "20px", fontSize: "13px",
                    fontFamily: "Poppins, sans-serif", cursor: "pointer",
                    transition: "all 0.3s"
                }}
                    onMouseEnter={e => {
                        e.target.style.borderColor = "#F59E0B"
                        e.target.style.color = "#F59E0B"
                    }}
                    onMouseLeave={e => {
                        e.target.style.borderColor = "#1A1A1A"
                        e.target.style.color = "#444444"
                    }}
                >← Back to Browse</button>
            </nav>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 20px" }}>

                {/* Profile card */}
                <div style={{
                    background: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    borderRadius: "24px", overflow: "hidden",
                    marginBottom: "20px"
                }}>
                    {/* Cover gradient */}
                    <div style={{
                        height: "160px",
                        background: `linear-gradient(135deg, ${gradientColor})`,
                        position: "relative"
                    }}>
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "rgba(0,0,0,0.2)"
                        }} />
                    </div>

                    <div style={{ padding: "0 32px 32px" }}>
                        {/* Avatar */}
                        <div style={{
                            width: "90px", height: "90px",
                            borderRadius: "50%", overflow: "hidden",
                            background: `linear-gradient(135deg, ${gradientColor})`,
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            marginTop: "-45px",
                            border: "4px solid #0A0A0A",
                            boxShadow: "0 0 30px rgba(0,0,0,0.5)"
                        }}>
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt={profile.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{
                                    fontSize: "36px", fontWeight: "700",
                                    color: "white", fontFamily: "Poppins, sans-serif"
                                }}>{profile.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginTop: "16px",
                            flexWrap: "wrap", gap: "16px"
                        }}>
                            <div>
                                <h1 style={{
                                    color: "#FFFFFF", fontSize: "24px",
                                    fontWeight: "800", fontFamily: "Poppins, sans-serif",
                                    marginBottom: "6px"
                                }}>{profile.name}</h1>
                                <p style={{
                                    color: "#333333", fontSize: "13px",
                                    fontFamily: "Inter, sans-serif"
                                }}>
                                    🎓 {profile.college} &nbsp;•&nbsp; 📍 {profile.city}
                                </p>
                            </div>

                            {/* Send Interest button */}
                            <button
                                onClick={handleSendInterest}
                                disabled={interestSent || sending || currentUserId === id}
                                style={{
                                    padding: "12px 28px",
                                    background: interestSent
                                        ? "rgba(245,158,11,0.08)"
                                        : currentUserId === id
                                        ? "transparent"
                                        : "linear-gradient(135deg, #F59E0B, #D97706)",
                                    color: interestSent ? "#F59E0B" : currentUserId === id ? "#333333" : "#000000",
                                    border: interestSent || currentUserId === id
                                        ? `1px solid ${interestSent ? "rgba(245,158,11,0.2)" : "#1A1A1A"}`
                                        : "none",
                                    borderRadius: "20px", fontSize: "14px",
                                    fontWeight: "700",
                                    cursor: interestSent || currentUserId === id ? "not-allowed" : "pointer",
                                    fontFamily: "Poppins, sans-serif",
                                    boxShadow: interestSent || currentUserId === id
                                        ? "none"
                                        : "0 0 25px rgba(245,158,11,0.3)",
                                    transition: "all 0.3s"
                                }}
                                onMouseEnter={e => {
                                    if(!interestSent && currentUserId !== id) {
                                        e.target.style.transform = "translateY(-2px)"
                                        e.target.style.boxShadow = "0 0 35px rgba(245,158,11,0.5)"
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.target.style.transform = "translateY(0)"
                                    if(!interestSent && currentUserId !== id) {
                                        e.target.style.boxShadow = "0 0 25px rgba(245,158,11,0.3)"
                                    }
                                }}
                            >
                                {sending ? "Sending..." :
                                 interestSent ? "✅ Interest Sent" :
                                 currentUserId === id ? "Your Profile" :
                                 "💛 Send Interest"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px", marginBottom: "16px"
                }}>
                    {/* Basic info */}
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", padding: "24px"
                    }}>
                        <p style={{
                            color: "#333333", fontSize: "11px",
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            marginBottom: "16px", fontWeight: "600"
                        }}>Basic Info</p>

                        {[
                            { label: "Gender", value: profile.gender },
                            { label: "Looking For", value: profile.lookingFor },
                            { label: "Budget", value: `₹${profile.budget?.toLocaleString()}/month` },
                            { label: "City", value: profile.city?.split(",")[0] }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: i < 3 ? "1px solid #111111" : "none"
                            }}>
                                <p style={{
                                    color: "#333333", fontSize: "13px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.label}</p>
                                <p style={{
                                    color: "#FFFFFF", fontSize: "13px",
                                    fontWeight: "600", fontFamily: "Inter, sans-serif"
                                }}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Lifestyle */}
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", padding: "24px"
                    }}>
                        <p style={{
                            color: "#333333", fontSize: "11px",
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            marginBottom: "16px", fontWeight: "600"
                        }}>Lifestyle</p>

                        {[
                            { label: "Sleep", value: profile.sleepSchedule || "Not specified" },
                            { label: "Cleanliness", value: profile.cleanliness || "Not specified" }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: i < 1 ? "1px solid #111111" : "none"
                            }}>
                                <p style={{
                                    color: "#333333", fontSize: "13px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.label}</p>
                                <p style={{
                                    color: "#FFFFFF", fontSize: "13px",
                                    fontWeight: "600", fontFamily: "Inter, sans-serif"
                                }}>{item.value}</p>
                            </div>
                        ))}

                        <div style={{
                            display: "flex", gap: "8px",
                            flexWrap: "wrap", marginTop: "16px"
                        }}>
                            {profile.sleepSchedule && (
                                <span style={{
                                    padding: "4px 12px",
                                    background: "rgba(245,158,11,0.08)",
                                    border: "1px solid rgba(245,158,11,0.15)",
                                    borderRadius: "20px", color: "#F59E0B",
                                    fontSize: "12px", fontFamily: "Inter, sans-serif"
                                }}>{profile.sleepSchedule.split(" ")[0]}</span>
                            )}
                            {profile.cleanliness && (
                                <span style={{
                                    padding: "4px 12px",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid #1A1A1A",
                                    borderRadius: "20px", color: "#444444",
                                    fontSize: "12px", fontFamily: "Inter, sans-serif"
                                }}>{profile.cleanliness}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", padding: "24px"
                    }}>
                        <p style={{
                            color: "#333333", fontSize: "11px",
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            marginBottom: "14px", fontWeight: "600"
                        }}>About</p>
                        <p style={{
                            color: "#888888", fontSize: "15px",
                            fontFamily: "Inter, sans-serif", lineHeight: "1.8"
                        }}>{profile.bio}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileDetail