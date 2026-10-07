import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore"

function Saved() {
    const navigate = useNavigate()
    const currentUserId = localStorage.getItem("userId")
    const [savedProfiles, setSavedProfiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSaved() {
            if(!currentUserId) { navigate("/login"); return }
            try {
                const savedSnap = await getDocs(
                    query(collection(db, "saved"), where("userId", "==", currentUserId))
                )
                const profiles = await Promise.all(
                    savedSnap.docs.map(async (savedDoc) => {
                        const data = savedDoc.data()
                        const profileSnap = await getDoc(doc(db, "users", data.savedUserId))
                        if(profileSnap.exists()) {
                            return {
                                savedDocId: savedDoc.id,
                                ...profileSnap.data(),
                                id: profileSnap.id
                            }
                        }
                        return null
                    })
                )
                setSavedProfiles(profiles.filter(p => p !== null))
            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSaved()
    }, [])

    async function handleUnsave(savedDocId, profileId) {
        await deleteDoc(doc(db, "saved", savedDocId))
        setSavedProfiles(savedProfiles.filter(p => p.id !== profileId))
    }

    if(loading) return (
        <div style={{
            minHeight: "100vh", background: "#000000",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", gap: "16px"
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
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", cursor: "pointer"
                }} onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "15px",
                        boxShadow: "0 0 15px rgba(245,158,11,0.3)"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate("/browse")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "#444444", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif",
                        cursor: "pointer", transition: "color 0.3s"
                    }}
                        onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                        onMouseLeave={e => e.target.style.color = "#444444"}
                    >Browse</button>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "#444444", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif",
                        cursor: "pointer", transition: "color 0.3s"
                    }}
                        onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                        onMouseLeave={e => e.target.style.color = "#444444"}
                    >Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>

                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-end", marginBottom: "32px"
                }}>
                    <div>
                        <h1 style={{
                            color: "#FFFFFF", fontSize: "26px",
                            fontWeight: "800", fontFamily: "Poppins, sans-serif",
                            marginBottom: "4px"
                        }}>Saved Profiles</h1>
                        <p style={{
                            color: "#333333", fontSize: "13px",
                            fontFamily: "Inter, sans-serif"
                        }}>
                            {savedProfiles.length} saved {savedProfiles.length === 1 ? "roommate" : "roommates"}
                        </p>
                    </div>
                    <button onClick={() => navigate("/browse")} style={{
                        padding: "10px 22px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        color: "#000000", border: "none",
                        borderRadius: "20px", fontSize: "13px",
                        fontWeight: "700", cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                        boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                        transition: "all 0.3s"
                    }}
                        onMouseEnter={e => {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 0 30px rgba(245,158,11,0.5)"
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "0 0 20px rgba(245,158,11,0.3)"
                        }}
                    >Browse More →</button>
                </div>

                {/* Empty state */}
                {savedProfiles.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "100px 20px",
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "24px"
                    }}>
                        <p style={{ fontSize: "56px", marginBottom: "20px" }}>🤍</p>
                        <h3 style={{
                            color: "#FFFFFF", fontSize: "20px",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "700", marginBottom: "8px"
                        }}>No saved profiles yet</h3>
                        <p style={{
                            color: "#333333", fontFamily: "Inter, sans-serif",
                            fontSize: "14px", marginBottom: "28px"
                        }}>
                            Browse roommates and click ❤️ to save them here
                        </p>
                        <button onClick={() => navigate("/browse")} style={{
                            padding: "13px 32px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "25px", fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "700", cursor: "pointer",
                            boxShadow: "0 0 25px rgba(245,158,11,0.3)"
                        }}>Find Roommates →</button>
                    </div>
                )}

                {/* Saved cards grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px"
                }}>
                    {savedProfiles.map((profile) => (
                        <div key={profile.id} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", overflow: "hidden",
                            transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                                e.currentTarget.style.transform = "translateY(-5px)"
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1A1A1A"
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "none"
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                height: "150px",
                                background: `linear-gradient(135deg, ${
                                    profile.gender === "Female" ? "#EC4899, #A855F7" :
                                    profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                    "#F59E0B, #D97706"
                                })`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", position: "relative"
                            }}>
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt={profile.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{
                                        fontSize: "56px", fontWeight: "700",
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily: "Poppins, sans-serif"
                                    }}>{profile.name?.charAt(0).toUpperCase()}</span>
                                )}

                                {/* Budget badge */}
                                <div style={{
                                    position: "absolute", top: "10px", right: "10px",
                                    background: "rgba(0,0,0,0.7)",
                                    backdropFilter: "blur(10px)",
                                    color: "white", padding: "3px 10px",
                                    borderRadius: "20px", fontSize: "11px",
                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                }}>₹{profile.budget?.toLocaleString()}/mo</div>

                                {/* Saved heart badge */}
                                <div style={{
                                    position: "absolute", top: "10px", left: "10px",
                                    background: "rgba(0,0,0,0.5)",
                                    borderRadius: "20px", padding: "3px 8px",
                                    fontSize: "14px"
                                }}>❤️</div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "16px" }}>
                                <h3 style={{
                                    color: "#FFFFFF", fontSize: "16px",
                                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                    marginBottom: "6px"
                                }}>{profile.name}</h3>

                                <p style={{
                                    color: "#333333", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif", marginBottom: "3px"
                                }}>🎓 {profile.college}</p>

                                <p style={{
                                    color: "#333333", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif", marginBottom: "14px"
                                }}>📍 {profile.city?.split(",")[0]}</p>

                                {/* Tags */}
                                <div style={{
                                    display: "flex", gap: "6px",
                                    flexWrap: "wrap", marginBottom: "14px"
                                }}>
                                    {profile.sleepSchedule && (
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(245,158,11,0.08)",
                                            border: "1px solid rgba(245,158,11,0.15)",
                                            borderRadius: "20px", color: "#F59E0B",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.sleepSchedule.split(" ")[0]}</span>
                                    )}
                                    {profile.gender && (
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid #1A1A1A",
                                            borderRadius: "20px", color: "#333333",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.gender}</span>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => navigate(`/profile/${profile.id}`)}
                                        style={{
                                            flex: 1, padding: "10px",
                                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                            color: "#000000", border: "none",
                                            borderRadius: "10px", fontSize: "13px",
                                            fontWeight: "700", cursor: "pointer",
                                            fontFamily: "Poppins, sans-serif",
                                            transition: "all 0.3s"
                                        }}
                                        onMouseEnter={e => e.target.style.boxShadow = "0 0 20px rgba(245,158,11,0.4)"}
                                        onMouseLeave={e => e.target.style.boxShadow = "none"}
                                    >View Profile</button>

                                    <button
                                        onClick={() => handleUnsave(profile.savedDocId, profile.id)}
                                        style={{
                                            padding: "10px 14px",
                                            background: "rgba(239,68,68,0.06)",
                                            border: "1px solid rgba(239,68,68,0.15)",
                                            borderRadius: "10px", fontSize: "14px",
                                            cursor: "pointer", transition: "all 0.3s"
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = "rgba(239,68,68,0.12)"
                                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "rgba(239,68,68,0.06)"
                                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"
                                        }}
                                    >🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Saved