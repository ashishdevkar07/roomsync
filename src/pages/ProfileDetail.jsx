// Step 1 — Import dependencies
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

// Step 2 — Import Firebase
import { db } from "../firebase"
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"

function ProfileDetail() {
    // Step 3 — Get profile ID from URL
    const { id } = useParams()
    const navigate = useNavigate()

    // Step 4 — State
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [interestSent, setInterestSent] = useState(false)
    const [sending, setSending] = useState(false)

    // Step 5 — Current user from localStorage
    const currentUserId = localStorage.getItem("userId")
    const currentUserName = localStorage.getItem("userName")

    // Step 6 — Fetch profile data
    useEffect(() => {
        async function fetchProfile() {
            try {
                // Step 7 — Get user document by ID
                const userRef = doc(db, "users", id)
                const userSnap = await getDoc(userRef)

                if(userSnap.exists()) {
                    setProfile({ id: userSnap.id, ...userSnap.data() })
                }

                // Step 8 — Check if interest already sent
                const interestQuery = query(
                    collection(db, "interests"),
                    where("fromId", "==", currentUserId),
                    where("toId", "==", id)
                )
                const interestSnap = await getDocs(interestQuery)
                if(!interestSnap.empty) {
                    setInterestSent(true)
                }

            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    // Step 9 — Send interest function
    async function handleSendInterest() {
        if(!currentUserId) {
            navigate("/login")
            return
        }

        if(currentUserId === id) {
            alert("You cannot send interest to yourself")
            return
        }

        try {
            setSending(true)

            // Step 10 — Save interest to Firestore
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
            console.log("Error sending interest:", err)
        } finally {
            setSending(false)
        }
    }

    if(loading) return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>Loading profile...</p>
        </div>
    )

    if(!profile) return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#F87171", fontFamily: "Poppins, sans-serif" }}>Profile not found</p>
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
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", cursor: "pointer"
                }} onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "16px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB", fontSize: "18px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <button onClick={() => navigate("/browse")} style={{
                    padding: "8px 18px",
                    background: "transparent",
                    color: "rgba(249,250,251,0.6)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    cursor: "pointer"
                }}>← Back to Browse</button>
            </nav>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

                {/* ── PROFILE HEADER ── */}
                <div style={{
                    background: "#13102B",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    marginBottom: "24px"
                }}>
                    {/* Cover */}
                    <div style={{
                        height: "140px",
                        background: `linear-gradient(135deg, 
                            ${profile.gender === "Female" ? "#EC4899, #A855F7" :
                              profile.gender === "Male" ? "#3B82F6, #6366F1" :
                              "#7C3AED, #4F46E5"})`
                    }} />

                    <div style={{ padding: "0 32px 32px" }}>
                        {/* Avatar */}
                        <div style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, 
                                ${profile.gender === "Female" ? "#EC4899, #A855F7" :
                                  profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                  "#7C3AED, #4F46E5"})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "36px",
                            fontWeight: "700",
                            color: "white",
                            fontFamily: "Poppins, sans-serif",
                            marginTop: "-45px",
                            border: "4px solid #13102B"
                        }}>
                            {profile.name?.charAt(0).toUpperCase()}
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginTop: "16px"
                        }}>
                            <div>
                                <h1 style={{
                                    color: "#F9FAFB",
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    fontFamily: "Poppins, sans-serif",
                                    marginBottom: "6px"
                                }}>{profile.name}</h1>
                                <p style={{
                                    color: "rgba(249,250,251,0.5)",
                                    fontSize: "14px",
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
                                        ? "rgba(124,58,237,0.2)"
                                        : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                    color: interestSent ? "#A78BFA" : "white",
                                    border: interestSent ? "1px solid rgba(124,58,237,0.3)" : "none",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: interestSent ? "not-allowed" : "pointer",
                                    fontFamily: "Poppins, sans-serif",
                                    boxShadow: interestSent ? "none" : "0 4px 15px rgba(124,58,237,0.3)"
                                }}
                            >
                                {sending ? "Sending..." :
                                 interestSent ? "✅ Interest Sent" :
                                 currentUserId === id ? "Your Profile" :
                                 "💜 Send Interest"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── DETAILS GRID ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "24px"
                }}>
                    {/* Basic Info */}
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px",
                        padding: "24px"
                    }}>
                        <h3 style={{
                            color: "#A78BFA",
                            fontSize: "12px",
                            fontWeight: "600",
                            fontFamily: "Poppins, sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "16px"
                        }}>Basic Info</h3>

                        {[
                            { label: "Gender", value: profile.gender },
                            { label: "Looking For", value: profile.lookingFor },
                            { label: "Budget", value: `₹${profile.budget?.toLocaleString()}/month` },
                            { label: "City", value: profile.city }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none"
                            }}>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "13px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.label}</p>
                                <p style={{
                                    color: "#F9FAFB",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Lifestyle */}
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px",
                        padding: "24px"
                    }}>
                        <h3 style={{
                            color: "#A78BFA",
                            fontSize: "12px",
                            fontWeight: "600",
                            fontFamily: "Poppins, sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "16px"
                        }}>Lifestyle</h3>

                        {[
                            { label: "Sleep Schedule", value: profile.sleepSchedule || "Not specified" },
                            { label: "Cleanliness", value: profile.cleanliness || "Not specified" }
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.04)" : "none"
                            }}>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "13px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.label}</p>
                                <p style={{
                                    color: "#F9FAFB",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    fontFamily: "Inter, sans-serif"
                                }}>{item.value}</p>
                            </div>
                        ))}

                        {/* Tags */}
                        <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {profile.sleepSchedule && (
                                <span style={{
                                    padding: "4px 12px",
                                    background: "rgba(124,58,237,0.15)",
                                    border: "1px solid rgba(124,58,237,0.2)",
                                    borderRadius: "20px",
                                    color: "#A78BFA",
                                    fontSize: "12px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{profile.sleepSchedule.split(" ")[0]}</span>
                            )}
                            {profile.cleanliness && (
                                <span style={{
                                    padding: "4px 12px",
                                    background: "rgba(79,70,229,0.15)",
                                    border: "1px solid rgba(79,70,229,0.2)",
                                    borderRadius: "20px",
                                    color: "#818CF8",
                                    fontSize: "12px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{profile.cleanliness}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── BIO ── */}
                {profile.bio && (
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px",
                        padding: "24px"
                    }}>
                        <h3 style={{
                            color: "#A78BFA",
                            fontSize: "12px",
                            fontWeight: "600",
                            fontFamily: "Poppins, sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "12px"
                        }}>About</h3>
                        <p style={{
                            color: "rgba(249,250,251,0.7)",
                            fontSize: "15px",
                            fontFamily: "Inter, sans-serif",
                            lineHeight: "1.8"
                        }}>{profile.bio}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileDetail