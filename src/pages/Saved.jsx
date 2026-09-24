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
                // Step — Get all saved entries for current user
                const savedSnap = await getDocs(
                    query(collection(db, "saved"), where("userId", "==", currentUserId))
                )

                // Step — For each saved entry fetch full profile
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
            minHeight: "100vh", background: "#0F0A1E",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>
                Loading saved profiles...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#0F0A1E" }}>

            {/* Navbar */}
            <nav style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "18px 48px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(15,10,30,0.95)",
                position: "sticky", top: 0, zIndex: 100,
                backdropFilter: "blur(10px)"
            }}>
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", cursor: "pointer"
                }} onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "15px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate("/browse")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Browse</button>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>

                <h1 style={{
                    color: "#F9FAFB", fontSize: "26px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "4px"
                }}>Saved Profiles</h1>
                <p style={{
                    color: "rgba(249,250,251,0.4)",
                    fontSize: "14px", fontFamily: "Inter, sans-serif",
                    marginBottom: "32px"
                }}>
                    {savedProfiles.length} saved roommates
                </p>

                {/* Empty state */}
                {savedProfiles.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "80px 20px",
                        background: "#13102B", borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🤍</p>
                        <h3 style={{
                            color: "#F9FAFB", fontFamily: "Poppins, sans-serif",
                            marginBottom: "8px"
                        }}>No saved profiles yet</h3>
                        <p style={{
                            color: "rgba(249,250,251,0.4)",
                            fontFamily: "Inter, sans-serif", fontSize: "14px",
                            marginBottom: "20px"
                        }}>Browse roommates and click ❤️ to save them here</p>
                        <button onClick={() => navigate("/browse")} style={{
                            padding: "12px 28px",
                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white", border: "none",
                            borderRadius: "20px", fontSize: "14px",
                            fontFamily: "Poppins, sans-serif", cursor: "pointer"
                        }}>Browse Roommates</button>
                    </div>
                )}

                {/* Saved profiles grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "20px"
                }}>
                    {savedProfiles.map((profile) => (
                        <div key={profile.id} style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", overflow: "hidden",
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
                            {/* Avatar */}
                            <div style={{
                                height: "140px",
                                background: `linear-gradient(135deg, ${
                                    profile.gender === "Female" ? "#EC4899, #A855F7" :
                                    profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                    "#7C3AED, #4F46E5"
                                })`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", position: "relative"
                            }}>
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt={profile.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{
                                        fontSize: "52px", fontWeight: "700",
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily: "Poppins, sans-serif"
                                    }}>
                                        {profile.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <div style={{
                                    position: "absolute", top: "10px", right: "10px",
                                    background: "rgba(0,0,0,0.5)",
                                    backdropFilter: "blur(4px)",
                                    color: "white", padding: "3px 10px",
                                    borderRadius: "10px", fontSize: "11px",
                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                }}>
                                    ₹{profile.budget?.toLocaleString()}/mo
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "16px" }}>
                                <h3 style={{
                                    color: "#F9FAFB", fontSize: "16px",
                                    fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                    marginBottom: "6px"
                                }}>{profile.name}</h3>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "12px", fontFamily: "Inter, sans-serif",
                                    marginBottom: "3px"
                                }}>🎓 {profile.college}</p>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "12px", fontFamily: "Inter, sans-serif",
                                    marginBottom: "14px"
                                }}>📍 {profile.city}</p>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => navigate(`/profile/${profile.id}`)}
                                        style={{
                                            flex: 1, padding: "9px",
                                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                            color: "white", border: "none",
                                            borderRadius: "10px", fontSize: "13px",
                                            fontWeight: "600", cursor: "pointer",
                                            fontFamily: "Poppins, sans-serif"
                                        }}
                                    >View Profile</button>
                                    <button
                                        onClick={() => handleUnsave(profile.savedDocId, profile.id)}
                                        style={{
                                            padding: "9px 14px",
                                            background: "rgba(239,68,68,0.1)",
                                            border: "1px solid rgba(239,68,68,0.2)",
                                            borderRadius: "10px", fontSize: "14px",
                                            cursor: "pointer"
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