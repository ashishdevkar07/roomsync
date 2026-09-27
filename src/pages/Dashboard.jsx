import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"


function Dashboard() {
    const userName = localStorage.getItem("userName")
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate()

    // Step 1 — State
    const [userData, setUserData] = useState(null)
    const [profileComplete, setProfileComplete] = useState(false)
    const [loading, setLoading] = useState(true)
    const [interests, setInterests] = useState([])
    const [nearbyProfiles, setNearbyProfiles] = useState([])
    const [totalListings, setTotalListings] = useState(0)
    const [newToday, setNewToday] = useState(0)
    const [nearYouCount, setNearYouCount] = useState(0)

    useEffect(() => {
        async function fetchData() {
            if (!userId) { navigate("/login"); return }
            try {
                // Step 2 — Get current user data
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                let currentUser = null

                if (userSnap.exists()) {
                    currentUser = userSnap.data()
                    setUserData(currentUser)
                    setProfileComplete(currentUser.profileComplete || false)
                }

                // Step 3 — Get all complete profiles
                const allUsersSnap = await getDocs(
                    query(collection(db, "users"), where("profileComplete", "==", true))
                )

                const allProfiles = allUsersSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.id !== userId)

                setTotalListings(allProfiles.length)

                // Step 4 — Get today's new listings
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const todayProfiles = allProfiles.filter(p =>
                    p.updatedAt && new Date(p.updatedAt) >= today
                )
                setNewToday(todayProfiles.length)

                // Step 5 — Get nearby profiles (same city)
                if (currentUser?.city) {
                    const userCity = currentUser.city.toLowerCase().split(",")[0].trim()
                    const nearby = allProfiles.filter(p => {
                        if (!p.city) return false
                        const profileCity = p.city.toLowerCase().split(",")[0].trim()
                        return profileCity.includes(userCity) || userCity.includes(profileCity)
                    })
                    setNearYouCount(nearby.length)
                    setNearbyProfiles(nearby.slice(0, 6))
                } else {
                    setNearbyProfiles(allProfiles.slice(0, 6))
                }

                // Step 6 — Get received interests
                const interestSnap = await getDocs(
                    query(collection(db, "interests"), where("toId", "==", userId))
                )
                setInterests(interestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            } catch (err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    function handleLogout() {
        localStorage.clear()
        navigate("/")
    }

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#0F0A1E",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", gap: "16px"
        }}>
            <div style={{
                width: "44px", height: "44px",
                border: "3px solid rgba(124,58,237,0.2)",
                borderTop: "3px solid #7C3AED",
                borderRadius: "50%"
            }} />
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>
                Loading your dashboard...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#0F0A1E" }}>

            {/* ── NAVBAR ── */}
            <nav style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "16px 48px",
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

                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[
                        { label: "Browse", path: "/browse" },
                        { label: "My Profile", path: "/my-profile" },
                        { label: "Saved", path: "/saved" }
                    ].map((item, i) => (
                        <button key={i} onClick={() => navigate(item.path)} style={{
                            padding: "8px 16px", background: "transparent",
                            color: "rgba(249,250,251,0.6)", border: "none",
                            fontSize: "14px", fontFamily: "Poppins, sans-serif",
                            cursor: "pointer"
                        }}>{item.label}</button>
                    ))}

                    {/* Interests notification bell */}
                    <button
                        onClick={() => document.getElementById("interests-section").scrollIntoView({ behavior: "smooth" })}
                        style={{
                            padding: "8px 14px",
                            background: interests.length > 0 ? "rgba(124,58,237,0.15)" : "transparent",
                            border: interests.length > 0 ? "1px solid rgba(124,58,237,0.3)" : "none",
                            borderRadius: "20px",
                            color: interests.length > 0 ? "#A78BFA" : "rgba(249,250,251,0.4)",
                            fontSize: "14px", cursor: "pointer",
                            position: "relative"
                        }}
                    >
                        🔔
                        {interests.length > 0 && (
                            <span style={{
                                position: "absolute", top: "2px", right: "2px",
                                width: "16px", height: "16px",
                                background: "#7C3AED", borderRadius: "50%",
                                fontSize: "10px", color: "white",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", fontWeight: "700"
                            }}>{interests.length}</span>
                        )}
                    </button>

                    {/* User menu */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "25px", cursor: "pointer",
                        marginLeft: "8px"
                    }} onClick={handleLogout}>
                        {userData?.profileImage ? (
                            <img src={userData.profileImage} alt="Profile"
                                style={{
                                    width: "24px", height: "24px",
                                    borderRadius: "50%", objectFit: "cover"
                                }} />
                        ) : (
                            <div style={{
                                width: "24px", height: "24px",
                                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                borderRadius: "50%", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontSize: "11px", color: "white", fontWeight: "700"
                            }}>
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span style={{
                            color: "rgba(249,250,251,0.7)",
                            fontSize: "13px", fontFamily: "Poppins, sans-serif"
                        }}>{userName}</span>
                        <span style={{
                            color: "rgba(249,250,251,0.3)",
                            fontSize: "11px"
                        }}>Logout</span>
                    </div>
                </div>
            </nav>

            <div style={{ padding: "32px 48px" }}>

                {/* ── PROFILE INCOMPLETE BANNER ── */}
                {!profileComplete && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))",
                        border: "1px solid rgba(124,58,237,0.25)",
                        borderRadius: "16px", padding: "18px 24px",
                        marginBottom: "28px",
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <span style={{ fontSize: "28px" }}>✨</span>
                            <div>
                                <p style={{
                                    color: "#A78BFA", fontWeight: "600",
                                    fontFamily: "Poppins, sans-serif", marginBottom: "2px",
                                    fontSize: "15px"
                                }}>Complete your profile</p>
                                <p style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "13px", fontFamily: "Inter, sans-serif"
                                }}>
                                    You won't appear in search until your profile is complete
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/complete-profile")} style={{
                            padding: "10px 22px",
                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white", border: "none",
                            borderRadius: "20px", fontSize: "13px",
                            fontWeight: "600", cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                        }}>Complete Now →</button>
                    </div>
                )}

                {/* ── HERO WELCOME ── */}
                <div style={{
                    background: "linear-gradient(135deg, #13102B 0%, rgba(124,58,237,0.1) 100%)",
                    border: "1px solid rgba(124,58,237,0.15)",
                    borderRadius: "24px", padding: "32px 36px",
                    marginBottom: "24px",
                    position: "relative", overflow: "hidden"
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: "absolute", top: "-40px", right: "-40px",
                        width: "200px", height: "200px",
                        background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent)",
                        pointerEvents: "none"
                    }} />

                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", flexWrap: "wrap", gap: "20px"
                    }}>
                        <div>
                            <p style={{
                                color: "#A78BFA", fontSize: "13px",
                                fontFamily: "Inter, sans-serif", marginBottom: "8px",
                                fontWeight: "500"
                            }}>
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "long", day: "numeric", month: "long"
                                })}
                            </p>
                            <h1 style={{
                                color: "#F9FAFB", fontSize: "26px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginBottom: "8px"
                            }}>
                                Hey {userName?.split(" ")[0]}! 👋
                            </h1>
                            <p style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "14px", fontFamily: "Inter, sans-serif"
                            }}>
                                {nearYouCount > 0
                                    ? `${nearYouCount} people near you are looking for a roommate`
                                    : "Start browsing to find your perfect roommate"
                                }
                            </p>
                        </div>

                        {/* Quick action buttons */}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button onClick={() => navigate("/browse")} style={{
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                color: "white", border: "none",
                                borderRadius: "20px", fontSize: "14px",
                                fontWeight: "600", cursor: "pointer",
                                fontFamily: "Poppins, sans-serif",
                                boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                            }}>🔍 Browse Roommates</button>
                            <button onClick={() => navigate("/my-profile")} style={{
                                padding: "12px 24px",
                                background: "transparent",
                                color: "rgba(249,250,251,0.7)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "20px", fontSize: "14px",
                                fontWeight: "600", cursor: "pointer",
                                fontFamily: "Poppins, sans-serif"
                            }}>👤 Edit Profile</button>
                        </div>

                    </div>

                </div>

                {/* ── STATS ROW ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px", marginBottom: "28px"
                }}>
                    {[
                        {
                            icon: "🏠",
                            value: totalListings,
                            label: "Active Listings",
                            sub: "Verified profiles"
                        },
                        {
                            icon: "📍",
                            value: nearYouCount,
                            label: "Near You",
                            sub: userData?.city?.split(",")[0] || "Set your city"
                        },
                        {
                            icon: "✨",
                            value: newToday,
                            label: "New Today",
                            sub: "Joined recently"
                        },
                        {
                            icon: "💜",
                            value: interests.length,
                            label: "Interests",
                            sub: "People liked you"
                        }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "16px", padding: "20px",
                            transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"
                                e.currentTarget.style.transform = "translateY(-2px)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                                e.currentTarget.style.transform = "translateY(0)"
                            }}
                        >
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: "12px"
                            }}>
                                <span style={{ fontSize: "24px" }}>{stat.icon}</span>
                                <span style={{
                                    fontSize: "28px", fontWeight: "700",
                                    color: "#F9FAFB", fontFamily: "Poppins, sans-serif"
                                }}>{stat.value}</span>
                            </div>
                            <p style={{
                                color: "#F9FAFB", fontSize: "14px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "2px"
                            }}>{stat.label}</p>
                            <p style={{
                                color: "rgba(249,250,251,0.35)",
                                fontSize: "12px", fontFamily: "Inter, sans-serif"
                            }}>{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 320px",
                    gap: "24px", alignItems: "start"
                }}>

                    {/* ── LEFT SIDE ── */}
                    <div>

                        {/* Featured — real nearby profiles */}
                        <div style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", padding: "24px",
                            marginBottom: "20px"
                        }}>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", marginBottom: "20px"
                            }}>
                                <div>
                                    <h2 style={{
                                        color: "#F9FAFB", fontSize: "17px",
                                        fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                        marginBottom: "2px"
                                    }}>
                                        {userData?.city
                                            ? `People near ${userData.city.split(",")[0]}`
                                            : "Featured Roommates"
                                        }
                                    </h2>
                                    <p style={{
                                        color: "rgba(249,250,251,0.35)",
                                        fontSize: "12px", fontFamily: "Inter, sans-serif"
                                    }}>Real profiles from your area</p>
                                </div>
                                <button onClick={() => navigate("/browse")} style={{
                                    background: "transparent", border: "none",
                                    color: "#A78BFA", fontSize: "13px",
                                    fontFamily: "Inter, sans-serif", cursor: "pointer"
                                }}>View all →</button>
                            </div>

                            {nearbyProfiles.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: "40px",
                                    color: "rgba(249,250,251,0.3)",
                                    fontFamily: "Inter, sans-serif", fontSize: "14px"
                                }}>
                                    <p style={{ fontSize: "32px", marginBottom: "8px" }}>🏠</p>
                                    <p>No profiles in your area yet</p>
                                    <p style={{ fontSize: "12px", marginTop: "4px" }}>
                                        Complete your profile to appear here
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "14px"
                                }}>
                                    {nearbyProfiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            onClick={() => navigate(`/profile/${profile.id}`)}
                                            style={{
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                                borderRadius: "16px", overflow: "hidden",
                                                cursor: "pointer", transition: "all 0.3s"
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = "#7C3AED"
                                                e.currentTarget.style.transform = "translateY(-3px)"
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                                                e.currentTarget.style.transform = "translateY(0)"
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                height: "100px",
                                                background: `linear-gradient(135deg, ${profile.gender === "Female" ? "#EC4899, #A855F7" :
                                                        profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                                            "#7C3AED, #4F46E5"
                                                    })`,
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", position: "relative"
                                            }}>
                                                {profile.profileImage ? (
                                                    <img src={profile.profileImage}
                                                        alt={profile.name}
                                                        style={{
                                                            width: "100%", height: "100%",
                                                            objectFit: "cover"
                                                        }} />
                                                ) : (
                                                    <span style={{
                                                        fontSize: "40px", fontWeight: "700",
                                                        color: "rgba(255,255,255,0.9)",
                                                        fontFamily: "Poppins, sans-serif"
                                                    }}>
                                                        {profile.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <div style={{
                                                    position: "absolute", bottom: "8px", right: "8px",
                                                    background: "rgba(0,0,0,0.5)",
                                                    backdropFilter: "blur(4px)",
                                                    color: "white", padding: "2px 8px",
                                                    borderRadius: "10px", fontSize: "10px",
                                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                                }}>
                                                    ₹{profile.budget?.toLocaleString()}/mo
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div style={{ padding: "12px" }}>
                                                <p style={{
                                                    color: "#F9FAFB", fontSize: "14px",
                                                    fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                                    marginBottom: "3px"
                                                }}>{profile.name}</p>
                                                <p style={{
                                                    color: "rgba(249,250,251,0.4)",
                                                    fontSize: "11px", fontFamily: "Inter, sans-serif",
                                                    marginBottom: "8px"
                                                }}>📍 {profile.city?.split(",")[0]}</p>
                                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                    {profile.sleepSchedule && (
                                                        <span style={{
                                                            padding: "2px 8px",
                                                            background: "rgba(124,58,237,0.15)",
                                                            borderRadius: "10px",
                                                            color: "#A78BFA", fontSize: "10px",
                                                            fontFamily: "Inter, sans-serif"
                                                        }}>
                                                            {profile.sleepSchedule.split(" ")[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Interests received */}
                        <div id="interests-section" style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", padding: "24px"
                        }}>
                            <div style={{
                                display: "flex", alignItems: "center",
                                gap: "10px", marginBottom: "20px"
                            }}>
                                <h2 style={{
                                    color: "#F9FAFB", fontSize: "17px",
                                    fontWeight: "600", fontFamily: "Poppins, sans-serif"
                                }}>Interests Received</h2>
                                {interests.length > 0 && (
                                    <span style={{
                                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                        color: "white", fontSize: "12px",
                                        fontWeight: "700", padding: "2px 10px",
                                        borderRadius: "20px"
                                    }}>{interests.length}</span>
                                )}
                            </div>

                            {interests.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: "32px",
                                    color: "rgba(249,250,251,0.3)",
                                    fontFamily: "Inter, sans-serif", fontSize: "14px"
                                }}>
                                    <p style={{ fontSize: "28px", marginBottom: "8px" }}>💜</p>
                                    <p>No interests received yet</p>
                                    <p style={{ fontSize: "12px", marginTop: "4px" }}>
                                        Complete your profile to get noticed
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {interests.map((interest) => (
                                        <div key={interest.id} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", padding: "14px 16px",
                                            background: "rgba(124,58,237,0.08)",
                                            border: "1px solid rgba(124,58,237,0.15)",
                                            borderRadius: "14px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{
                                                    width: "40px", height: "40px",
                                                    borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "center", fontSize: "16px",
                                                    fontWeight: "700", color: "white",
                                                    fontFamily: "Poppins, sans-serif", flexShrink: 0
                                                }}>
                                                    {interest.fromName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{
                                                        color: "#F9FAFB", fontSize: "14px",
                                                        fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                                        marginBottom: "2px"
                                                    }}>{interest.fromName}</p>
                                                    <p style={{
                                                        color: "rgba(249,250,251,0.35)",
                                                        fontSize: "11px", fontFamily: "Inter, sans-serif"
                                                    }}>
                                                        Sent interest • {new Date(interest.createdAt).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${interest.fromId}`)}
                                                style={{
                                                    padding: "7px 16px",
                                                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                                    color: "white", border: "none",
                                                    borderRadius: "20px", fontSize: "12px",
                                                    fontWeight: "600", cursor: "pointer",
                                                    fontFamily: "Poppins, sans-serif",
                                                    whiteSpace: "nowrap"
                                                }}
                                            >View Profile</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* Profile strength */}
                        <div style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#F9FAFB", fontSize: "15px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "16px"
                            }}>Profile Strength</h3>

                            <div style={{
                                background: "rgba(255,255,255,0.06)",
                                borderRadius: "10px", height: "6px",
                                marginBottom: "8px"
                            }}>
                                <div style={{
                                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                    borderRadius: "10px", height: "100%",
                                    width: profileComplete ? "100%" : userData?.profileImage ? "60%" : "30%",
                                    transition: "width 0.8s ease"
                                }} />
                            </div>
                            <p style={{
                                color: "rgba(249,250,251,0.35)",
                                fontSize: "12px", fontFamily: "Inter, sans-serif",
                                marginBottom: "16px"
                            }}>
                                {profileComplete
                                    ? userData?.profileImage
                                        ? "100% — Looking great!"
                                        : "80% — Add a photo to complete"
                                    : "30% — Complete your profile"}
                            </p>

                            {[
                                { label: "Account created", done: true },
                                { label: "Profile details filled", done: profileComplete },
                                { label: "Photo added", done: !!userData?.profileImage },
                                { label: "Visible in search", done: profileComplete }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center",
                                    gap: "10px", marginBottom: "10px"
                                }}>
                                    <span style={{
                                        fontSize: "14px",
                                        color: item.done ? "#A78BFA" : "rgba(255,255,255,0.15)"
                                    }}>{item.done ? "✅" : "⬜"}</span>
                                    <p style={{
                                        color: item.done
                                            ? "rgba(249,250,251,0.7)"
                                            : "rgba(249,250,251,0.25)",
                                        fontSize: "13px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick links */}
                        <div style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#F9FAFB", fontSize: "15px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px"
                            }}>Quick Actions</h3>

                            {[
                                { icon: "🔍", label: "Find Roommates", path: "/browse" },
                                { icon: "👤", label: "Edit My Profile", path: "/my-profile" },
                                { icon: "✏️", label: "Update Details", path: "/complete-profile" }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        display: "flex", alignItems: "center",
                                        gap: "12px", padding: "12px",
                                        borderRadius: "12px", cursor: "pointer",
                                        transition: "background 0.2s",
                                        marginBottom: i < 2 ? "4px" : "0"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.1)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <span style={{ fontSize: "18px" }}>{item.icon}</span>
                                    <p style={{
                                        color: "rgba(249,250,251,0.6)",
                                        fontSize: "13px", fontFamily: "Inter, sans-serif"
                                    }}>{item.label}</p>
                                    <span style={{
                                        marginLeft: "auto",
                                        color: "rgba(249,250,251,0.2)",
                                        fontSize: "12px"
                                    }}>→</span>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))",
                            border: "1px solid rgba(124,58,237,0.15)",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#A78BFA", fontSize: "14px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px"
                            }}>💡 Tips</h3>
                            {[
                                "Add a clear photo to get 3x more views",
                                "Be honest about your habits",
                                "Meet in public before deciding",
                                "Discuss rent split upfront"
                            ].map((tip, i) => (
                                <p key={i} style={{
                                    color: "rgba(249,250,251,0.4)",
                                    fontSize: "12px", fontFamily: "Inter, sans-serif",
                                    lineHeight: "1.6", marginBottom: "10px",
                                    paddingLeft: "10px",
                                    borderLeft: "2px solid rgba(124,58,237,0.25)"
                                }}>{tip}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard