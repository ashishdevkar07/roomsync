import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"

function Dashboard() {
    const userName = localStorage.getItem("userName")
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate()

    const [userData, setUserData] = useState(null)
    const [profileComplete, setProfileComplete] = useState(false)
    const [loading, setLoading] = useState(true)
    const [interests, setInterests] = useState([])
    const [nearbyProfiles, setNearbyProfiles] = useState([])
    const [totalListings, setTotalListings] = useState(0)
    const [newToday, setNewToday] = useState(0)
    const [nearYouCount, setNearYouCount] = useState(0)
    const [greeting, setGreeting] = useState("")

    useEffect(() => {
        // Set greeting based on time
        const hour = new Date().getHours()
        if(hour < 12) setGreeting("Good morning")
        else if(hour < 17) setGreeting("Good afternoon")
        else setGreeting("Good evening")

        async function fetchData() {
            if(!userId) { navigate("/login"); return }
            try {
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                let currentUser = null
                if(userSnap.exists()) {
                    currentUser = userSnap.data()
                    setUserData(currentUser)
                    setProfileComplete(currentUser.profileComplete || false)
                }

                const allUsersSnap = await getDocs(
                    query(collection(db, "users"), where("profileComplete", "==", true))
                )
                const allProfiles = allUsersSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.id !== userId)

                setTotalListings(allProfiles.length)

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                setNewToday(allProfiles.filter(p =>
                    p.updatedAt && new Date(p.updatedAt) >= today
                ).length)

                if(currentUser?.city) {
                    const userCity = currentUser.city.toLowerCase().split(",")[0].trim()
                    const nearby = allProfiles.filter(p => {
                        if(!p.city) return false
                        const profileCity = p.city.toLowerCase().split(",")[0].trim()
                        return profileCity.includes(userCity) || userCity.includes(profileCity)
                    })
                    setNearYouCount(nearby.length)
                    setNearbyProfiles(nearby.slice(0, 6))
                } else {
                    setNearbyProfiles(allProfiles.slice(0, 6))
                }

                const interestSnap = await getDocs(
                    query(collection(db, "interests"), where("toId", "==", userId))
                )
                setInterests(interestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            } catch(err) {
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
            <p style={{ color: "#444444", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
                Loading your dashboard...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#000000" }}>

            {/* ── NAVBAR ── */}
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

                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[
                        { label: "Browse", path: "/browse" },
                        { label: "Saved", path: "/saved" },
                        { label: "My Profile", path: "/my-profile" }
                    ].map((item, i) => (
                        <button key={i} onClick={() => navigate(item.path)} style={{
                            padding: "8px 16px", background: "transparent",
                            color: "#444444", border: "none",
                            fontSize: "14px", fontFamily: "Poppins, sans-serif",
                            cursor: "pointer", transition: "color 0.3s",
                            borderRadius: "20px"
                        }}
                            onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                            onMouseLeave={e => e.target.style.color = "#444444"}
                        >{item.label}</button>
                    ))}

                    {/* Notification bell */}
                    <button
                        onClick={() => document.getElementById("interests-section")
                            ?.scrollIntoView({ behavior: "smooth" })}
                        style={{
                            padding: "8px 12px",
                            background: interests.length > 0
                                ? "rgba(245,158,11,0.08)"
                                : "transparent",
                            border: interests.length > 0
                                ? "1px solid rgba(245,158,11,0.2)"
                                : "1px solid transparent",
                            borderRadius: "20px",
                            color: interests.length > 0 ? "#F59E0B" : "#333333",
                            fontSize: "16px", cursor: "pointer",
                            position: "relative", transition: "all 0.3s"
                        }}
                    >
                        🔔
                        {interests.length > 0 && (
                            <span style={{
                                position: "absolute", top: "4px", right: "4px",
                                width: "14px", height: "14px",
                                background: "#F59E0B", borderRadius: "50%",
                                fontSize: "9px", color: "#000",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", fontWeight: "800"
                            }}>{interests.length}</span>
                        )}
                    </button>

                    {/* User avatar + logout */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "6px 14px 6px 6px",
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "25px", cursor: "pointer",
                        marginLeft: "8px", transition: "all 0.3s"
                    }}
                        onClick={handleLogout}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#1A1A1A"
                        }}
                    >
                        <div style={{
                            width: "28px", height: "28px",
                            borderRadius: "50%", overflow: "hidden",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0
                        }}>
                            {userData?.profileImage ? (
                                <img src={userData.profileImage} alt="Profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{
                                    color: "#000", fontWeight: "800",
                                    fontSize: "12px", fontFamily: "Poppins, sans-serif"
                                }}>{userName?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span style={{
                            color: "#888888", fontSize: "13px",
                            fontFamily: "Inter, sans-serif"
                        }}>{userName?.split(" ")[0]}</span>
                        <span style={{ color: "#333333", fontSize: "11px" }}>↗</span>
                    </div>
                </div>
            </nav>

            <div style={{ padding: "32px 48px", maxWidth: "1400px", margin: "0 auto" }}>

                {/* ── PROFILE INCOMPLETE BANNER ── */}
                {!profileComplete && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: "16px", padding: "16px 24px",
                        marginBottom: "28px",
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                                width: "36px", height: "36px",
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.2)",
                                borderRadius: "10px", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontSize: "16px"
                            }}>⚡</div>
                            <div>
                                <p style={{
                                    color: "#F59E0B", fontWeight: "600",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px", marginBottom: "2px"
                                }}>Complete your profile</p>
                                <p style={{
                                    color: "#333333", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif"
                                }}>
                                    You won't appear in search until your profile is complete
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/complete-profile")} style={{
                            padding: "10px 22px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "20px", fontSize: "13px",
                            fontWeight: "700", cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            whiteSpace: "nowrap",
                            boxShadow: "0 0 20px rgba(245,158,11,0.3)"
                        }}>Complete Now →</button>
                    </div>
                )}

                {/* ── HERO WELCOME ── */}
                <div style={{
                    background: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    borderRadius: "24px", padding: "36px",
                    marginBottom: "20px",
                    position: "relative", overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0,
                        width: "300px", height: "300px",
                        background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
                        pointerEvents: "none"
                    }} />
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", flexWrap: "wrap", gap: "20px"
                    }}>
                        <div>
                            <p style={{
                                color: "#333333", fontSize: "13px",
                                fontFamily: "Inter, sans-serif", marginBottom: "8px"
                            }}>
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "long", day: "numeric", month: "long"
                                })}
                            </p>
                            <h1 style={{
                                color: "#FFFFFF", fontSize: "30px",
                                fontWeight: "800", fontFamily: "Poppins, sans-serif",
                                marginBottom: "8px"
                            }}>
                                {greeting},{" "}
                                <span style={{
                                    background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>
                                    {userName?.split(" ")[0]}
                                </span> 👋
                            </h1>
                            <p style={{
                                color: "#333333", fontSize: "14px",
                                fontFamily: "Inter, sans-serif"
                            }}>
                                {nearYouCount > 0
                                    ? `${nearYouCount} people near you are looking for a roommate`
                                    : "Start browsing to find your perfect roommate"
                                }
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => navigate("/browse")} style={{
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                color: "#000000", border: "none",
                                borderRadius: "20px", fontSize: "14px",
                                fontWeight: "700", cursor: "pointer",
                                fontFamily: "Poppins, sans-serif",
                                boxShadow: "0 0 25px rgba(245,158,11,0.3)",
                                transition: "all 0.3s"
                            }}
                                onMouseEnter={e => {
                                    e.target.style.transform = "translateY(-2px)"
                                    e.target.style.boxShadow = "0 0 35px rgba(245,158,11,0.5)"
                                }}
                                onMouseLeave={e => {
                                    e.target.style.transform = "translateY(0)"
                                    e.target.style.boxShadow = "0 0 25px rgba(245,158,11,0.3)"
                                }}
                            >🔍 Browse Roommates</button>
                            <button onClick={() => navigate("/my-profile")} style={{
                                padding: "12px 24px",
                                background: "transparent",
                                color: "#888888",
                                border: "1px solid #222222",
                                borderRadius: "20px", fontSize: "14px",
                                fontWeight: "600", cursor: "pointer",
                                fontFamily: "Poppins, sans-serif",
                                transition: "all 0.3s"
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#F59E0B"
                                    e.currentTarget.style.color = "#F59E0B"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#222222"
                                    e.currentTarget.style.color = "#888888"
                                }}
                            >👤 Edit Profile</button>
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
                        { icon: "🏠", value: totalListings, label: "Active Listings", sub: "Verified profiles" },
                        { icon: "📍", value: nearYouCount, label: "Near You", sub: userData?.city?.split(",")[0] || "Set your city" },
                        { icon: "✨", value: newToday, label: "New Today", sub: "Recently joined" },
                        { icon: "💜", value: interests.length, label: "Interests", sub: "People liked you" }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "22px",
                            transition: "all 0.3s", cursor: "default"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"
                                e.currentTarget.style.transform = "translateY(-3px)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1A1A1A"
                                e.currentTarget.style.transform = "translateY(0)"
                            }}
                        >
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: "16px"
                            }}>
                                <div style={{
                                    width: "40px", height: "40px",
                                    background: "rgba(245,158,11,0.06)",
                                    border: "1px solid rgba(245,158,11,0.1)",
                                    borderRadius: "12px", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: "18px"
                                }}>{stat.icon}</div>
                                <span style={{
                                    fontSize: "32px", fontWeight: "800",
                                    color: "#FFFFFF", fontFamily: "Poppins, sans-serif"
                                }}>{stat.value}</span>
                            </div>
                            <p style={{
                                color: "#FFFFFF", fontSize: "13px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "3px"
                            }}>{stat.label}</p>
                            <p style={{
                                color: "#333333", fontSize: "11px",
                                fontFamily: "Inter, sans-serif"
                            }}>{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 300px",
                    gap: "20px", alignItems: "start"
                }}>

                    {/* ── LEFT ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Featured nearby profiles */}
                        <div style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "24px"
                        }}>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", marginBottom: "20px"
                            }}>
                                <div>
                                    <h2 style={{
                                        color: "#FFFFFF", fontSize: "16px",
                                        fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                        marginBottom: "3px"
                                    }}>
                                        {userData?.city
                                            ? `Near ${userData.city.split(",")[0]}`
                                            : "Featured Roommates"
                                        }
                                    </h2>
                                    <p style={{
                                        color: "#333333", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>Real profiles from your area</p>
                                </div>
                                <button onClick={() => navigate("/browse")} style={{
                                    background: "transparent", border: "none",
                                    color: "#F59E0B", fontSize: "13px",
                                    fontFamily: "Inter, sans-serif",
                                    cursor: "pointer", fontWeight: "500"
                                }}>View all →</button>
                            </div>

                            {nearbyProfiles.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: "48px",
                                    color: "#222222", fontFamily: "Inter, sans-serif"
                                }}>
                                    <p style={{ fontSize: "36px", marginBottom: "12px" }}>🏠</p>
                                    <p style={{ fontSize: "14px", marginBottom: "4px", color: "#333333" }}>
                                        No profiles in your area yet
                                    </p>
                                    <p style={{ fontSize: "12px" }}>
                                        Complete your profile to appear here
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                    gap: "12px"
                                }}>
                                    {nearbyProfiles.map((profile) => (
                                        <div key={profile.id}
                                            onClick={() => navigate(`/profile/${profile.id}`)}
                                            style={{
                                                background: "#111111",
                                                border: "1px solid #1A1A1A",
                                                borderRadius: "16px", overflow: "hidden",
                                                cursor: "pointer", transition: "all 0.3s"
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                                                e.currentTarget.style.transform = "translateY(-4px)"
                                                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5)"
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = "#1A1A1A"
                                                e.currentTarget.style.transform = "translateY(0)"
                                                e.currentTarget.style.boxShadow = "none"
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                height: "100px",
                                                background: `linear-gradient(135deg, ${
                                                    profile.gender === "Female" ? "#EC4899, #A855F7" :
                                                    profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                                    "#F59E0B, #D97706"
                                                })`,
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", position: "relative"
                                            }}>
                                                {profile.profileImage ? (
                                                    <img src={profile.profileImage}
                                                        alt={profile.name}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <span style={{
                                                        fontSize: "38px", fontWeight: "700",
                                                        color: "rgba(255,255,255,0.9)",
                                                        fontFamily: "Poppins, sans-serif"
                                                    }}>
                                                        {profile.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <div style={{
                                                    position: "absolute", bottom: "8px", right: "8px",
                                                    background: "rgba(0,0,0,0.7)",
                                                    color: "white", padding: "2px 8px",
                                                    borderRadius: "8px", fontSize: "10px",
                                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                                }}>
                                                    ₹{profile.budget?.toLocaleString()}/mo
                                                </div>
                                            </div>
                                            <div style={{ padding: "12px" }}>
                                                <p style={{
                                                    color: "#FFFFFF", fontSize: "13px",
                                                    fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                                    marginBottom: "3px"
                                                }}>{profile.name}</p>
                                                <p style={{
                                                    color: "#333333", fontSize: "11px",
                                                    fontFamily: "Inter, sans-serif"
                                                }}>📍 {profile.city?.split(",")[0]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Interests received */}
                        <div id="interests-section" style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "24px"
                        }}>
                            <div style={{
                                display: "flex", alignItems: "center",
                                gap: "10px", marginBottom: "20px"
                            }}>
                                <h2 style={{
                                    color: "#FFFFFF", fontSize: "16px",
                                    fontWeight: "700", fontFamily: "Poppins, sans-serif"
                                }}>Interests Received</h2>
                                {interests.length > 0 && (
                                    <span style={{
                                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                        color: "#000", fontSize: "11px",
                                        fontWeight: "800", padding: "2px 10px",
                                        borderRadius: "20px"
                                    }}>{interests.length}</span>
                                )}
                            </div>

                            {interests.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: "40px",
                                    color: "#222222", fontFamily: "Inter, sans-serif"
                                }}>
                                    <p style={{ fontSize: "32px", marginBottom: "10px" }}>💜</p>
                                    <p style={{ fontSize: "14px", color: "#333333", marginBottom: "4px" }}>
                                        No interests yet
                                    </p>
                                    <p style={{ fontSize: "12px" }}>
                                        Complete your profile to get noticed
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {interests.map((interest) => (
                                        <div key={interest.id} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", padding: "14px 16px",
                                            background: "#111111",
                                            border: "1px solid #1A1A1A",
                                            borderRadius: "14px", transition: "all 0.3s"
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = "#1A1A1A"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{
                                                    width: "40px", height: "40px",
                                                    borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "center", fontSize: "16px",
                                                    fontWeight: "800", color: "#000",
                                                    fontFamily: "Poppins, sans-serif", flexShrink: 0
                                                }}>
                                                    {interest.fromName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{
                                                        color: "#FFFFFF", fontSize: "14px",
                                                        fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                                        marginBottom: "2px"
                                                    }}>{interest.fromName}</p>
                                                    <p style={{
                                                        color: "#333333", fontSize: "11px",
                                                        fontFamily: "Inter, sans-serif"
                                                    }}>
                                                        Sent interest • {new Date(interest.createdAt).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${interest.fromId}`)}
                                                style={{
                                                    padding: "7px 16px",
                                                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                                    color: "#000", border: "none",
                                                    borderRadius: "20px", fontSize: "12px",
                                                    fontWeight: "700", cursor: "pointer",
                                                    fontFamily: "Poppins, sans-serif",
                                                    whiteSpace: "nowrap"
                                                }}
                                            >View →</button>
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
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#FFFFFF", fontSize: "14px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginBottom: "16px"
                            }}>Profile Strength</h3>

                            {/* Progress bar */}
                            <div style={{
                                background: "#111111",
                                borderRadius: "10px", height: "6px",
                                marginBottom: "8px", overflow: "hidden"
                            }}>
                                <div style={{
                                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                    borderRadius: "10px", height: "100%",
                                    width: profileComplete
                                        ? userData?.profileImage ? "100%" : "80%"
                                        : "30%",
                                    transition: "width 1s ease",
                                    boxShadow: "0 0 10px rgba(245,158,11,0.5)"
                                }} />
                            </div>
                            <p style={{
                                color: "#333333", fontSize: "11px",
                                fontFamily: "Inter, sans-serif", marginBottom: "16px"
                            }}>
                                {profileComplete
                                    ? userData?.profileImage ? "100% — Perfect!" : "80% — Add a photo"
                                    : "30% — Complete your profile"
                                }
                            </p>

                            {[
                                { label: "Account created", done: true },
                                { label: "Profile filled", done: profileComplete },
                                { label: "Photo added", done: !!userData?.profileImage },
                                { label: "Visible in search", done: profileComplete }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center",
                                    gap: "10px", marginBottom: "10px"
                                }}>
                                    <div style={{
                                        width: "18px", height: "18px",
                                        borderRadius: "50%",
                                        background: item.done
                                            ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                            : "#111111",
                                        border: item.done ? "none" : "1px solid #222222",
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,
                                        fontSize: "10px"
                                    }}>
                                        {item.done && "✓"}
                                    </div>
                                    <p style={{
                                        color: item.done ? "#888888" : "#222222",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick actions */}
                        <div style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#FFFFFF", fontSize: "14px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px"
                            }}>Quick Actions</h3>

                            {[
                                { icon: "🔍", label: "Find Roommates", path: "/browse" },
                                { icon: "❤️", label: "Saved Profiles", path: "/saved" },
                                { icon: "👤", label: "Edit Profile", path: "/my-profile" },
                                { icon: "✏️", label: "Update Details", path: "/complete-profile" }
                            ].map((item, i) => (
                                <div key={i}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        display: "flex", alignItems: "center",
                                        gap: "12px", padding: "10px 12px",
                                        borderRadius: "12px", cursor: "pointer",
                                        transition: "all 0.2s",
                                        marginBottom: i < 3 ? "2px" : "0"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "#111111"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "transparent"
                                    }}
                                >
                                    <span style={{
                                        width: "32px", height: "32px",
                                        background: "#111111",
                                        borderRadius: "9px", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        fontSize: "14px", flexShrink: 0
                                    }}>{item.icon}</span>
                                    <p style={{
                                        color: "#555555", fontSize: "13px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>{item.label}</p>
                                    <span style={{
                                        marginLeft: "auto", color: "#222222",
                                        fontSize: "12px"
                                    }}>→</span>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div style={{
                            background: "#0A0A0A",
                            border: "1px solid rgba(245,158,11,0.1)",
                            borderRadius: "20px", padding: "22px"
                        }}>
                            <h3 style={{
                                color: "#F59E0B", fontSize: "13px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginBottom: "14px", letterSpacing: "0.05em",
                                textTransform: "uppercase"
                            }}>💡 Tips</h3>
                            {[
                                "Add a clear photo to get 3x more views",
                                "Be honest about your daily habits",
                                "Always meet in public first",
                                "Discuss rent and rules upfront"
                            ].map((tip, i) => (
                                <p key={i} style={{
                                    color: "#333333", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif",
                                    lineHeight: "1.6", marginBottom: "10px",
                                    paddingLeft: "10px",
                                    borderLeft: "2px solid #1A1A1A"
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