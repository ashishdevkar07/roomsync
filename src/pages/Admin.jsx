import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

function Admin() {
    const navigate = useNavigate()
    const isAdmin = localStorage.getItem("isAdmin")
    const [users, setUsers] = useState([])
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all users
                const usersSnap = await getDocs(collection(db, "users"))
                const usersData = usersSnap.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }))
                setUsers(usersData)

                // Fetch all interests
                const interestsSnap = await getDocs(collection(db, "interests"))
                const interestsData = interestsSnap.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }))
                setInterests(interestsData)

            } catch (err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    function handleLogout() {
        localStorage.removeItem("isAdmin")
        navigate("/")
    }

    // Protect admin page
    if (!isAdmin) {
        return (
            <div style={{
                minHeight: "100vh", background: "#000000",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column",
                gap: "20px"
            }}>
                <h2 style={{
                    color: "#FFFFFF", fontFamily: "Poppins, sans-serif"
                }}>Access Denied</h2>
                <p style={{ color: "#444444", fontFamily: "Inter, sans-serif" }}>
                    You must be an admin to view this page
                </p>
                <button onClick={() => navigate("/admin-login")} style={{
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#000000", border: "none",
                    borderRadius: "20px", fontSize: "14px",
                    fontWeight: "700", cursor: "pointer",
                    fontFamily: "Poppins, sans-serif"
                }}>Go to Admin Login</button>
            </div>
        )
    }

    const completeProfiles = users.filter(u => u.profileComplete)
    const incompleteProfiles = users.filter(u => !u.profileComplete)

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#000000",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <p style={{ color: "#F59E0B", fontFamily: "Poppins, sans-serif" }}>
                Loading admin data...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#000000" }}>

            {/* Navbar */}
            <nav style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "18px 48px",
                borderBottom: "1px solid #111111",
                background: "rgba(0,0,0,0.95)",
                position: "sticky", top: 0, zIndex: 100,
                backdropFilter: "blur(20px)"
            }}>
                <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", cursor: "pointer"
                }} onClick={() => navigate("/")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "15px"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                    <span style={{
                        padding: "3px 10px",
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "20px", color: "#F59E0B",
                        fontSize: "11px", fontFamily: "Inter, sans-serif",
                        fontWeight: "600"
                    }}>ADMIN</span>
                </div>

                <button onClick={handleLogout} style={{
                    padding: "8px 20px",
                    background: "transparent",
                    color: "#444444",
                    border: "1px solid #222222",
                    borderRadius: "20px", fontSize: "13px",
                    fontFamily: "Poppins, sans-serif", cursor: "pointer",
                    transition: "all 0.3s"
                }}
                    onMouseEnter={e => {
                        e.target.style.borderColor = "#F59E0B"
                        e.target.style.color = "#F59E0B"
                    }}
                    onMouseLeave={e => {
                        e.target.style.borderColor = "#222222"
                        e.target.style.color = "#444444"
                    }}
                >Logout</button>
            </nav>

            <div style={{ padding: "40px 48px" }}>

                {/* Page title */}
                <div style={{ marginBottom: "36px" }}>
                    <h1 style={{
                        color: "#FFFFFF", fontSize: "28px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif",
                        marginBottom: "6px"
                    }}>Admin Dashboard</h1>
                    <p style={{
                        color: "#444444", fontSize: "14px",
                        fontFamily: "Inter, sans-serif"
                    }}>Platform overview and user management</p>
                </div>

                {/* Stats cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px", marginBottom: "36px"
                }}>
                    {[
                        { label: "Total Users", value: users.length, icon: "👥" },
                        { label: "Complete Profiles", value: completeProfiles.length, icon: "✅" },
                        { label: "Incomplete Profiles", value: incompleteProfiles.length, icon: "⏳" },
                        { label: "Total Interests", value: interests.length, icon: "💜" }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "24px",
                            transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
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
                                <span style={{ fontSize: "24px" }}>{stat.icon}</span>
                                <span style={{
                                    fontSize: "36px", fontWeight: "800",
                                    color: "#F59E0B", fontFamily: "Poppins, sans-serif"
                                }}>{stat.value}</span>
                            </div>
                            <p style={{
                                color: "#FFFFFF", fontSize: "14px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif"
                            }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex", gap: "8px", marginBottom: "28px"
                }}>
                    {[
                        { id: "overview", label: "All Users" },
                        { id: "complete", label: "Active Profiles" },
                        { id: "interests", label: "Interests" }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: "10px 22px",
                            background: activeTab === tab.id
                                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                : "transparent",
                            color: activeTab === tab.id ? "#000000" : "#444444",
                            border: activeTab === tab.id
                                ? "none"
                                : "1px solid #222222",
                            borderRadius: "25px", fontSize: "13px",
                            fontFamily: "Poppins, sans-serif",
                            cursor: "pointer", fontWeight: "600"
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* All Users Tab */}
                {activeTab === "overview" && (
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", overflow: "hidden"
                    }}>
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #111111",
                            display: "flex", justifyContent: "space-between"
                        }}>
                            <h3 style={{
                                color: "#FFFFFF", fontFamily: "Poppins, sans-serif",
                                fontSize: "15px", fontWeight: "600"
                            }}>All Registered Users ({users.length})</h3>
                        </div>

                        {users.map((user, i) => (
                            <div key={user.id} style={{
                                display: "flex", alignItems: "center",
                                gap: "16px", padding: "16px 24px",
                                borderBottom: i < users.length - 1 ? "1px solid #111111" : "none",
                                transition: "background 0.2s"
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "#111111"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: "42px", height: "42px",
                                    borderRadius: "50%", overflow: "hidden",
                                    background: `linear-gradient(135deg, ${user.gender === "Female" ? "#EC4899, #A855F7" :
                                            user.gender === "Male" ? "#3B82F6, #6366F1" :
                                                "#F59E0B, #D97706"
                                        })`,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", flexShrink: 0
                                }}>
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{
                                            color: "white", fontWeight: "700",
                                            fontSize: "16px", fontFamily: "Poppins, sans-serif"
                                        }}>{user.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        color: "#FFFFFF", fontSize: "14px",
                                        fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                        marginBottom: "3px"
                                    }}>{user.name}</p>
                                    <p style={{
                                        color: "#444444", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>{user.email}</p>
                                </div>

                                {/* College */}
                                <p style={{
                                    color: "#555555", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif",
                                    maxWidth: "200px", textAlign: "right"
                                }}>{user.college || "No college"}</p>

                                {/* City */}
                                <p style={{
                                    color: "#555555", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif",
                                    minWidth: "80px", textAlign: "right"
                                }}>📍 {user.city?.split(",")[0] || "No city"}</p>

                                {/* Status badge */}
                                <span style={{
                                    padding: "4px 12px",
                                    background: user.profileComplete
                                        ? "rgba(34,197,94,0.1)"
                                        : "rgba(245,158,11,0.1)",
                                    border: `1px solid ${user.profileComplete ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                                    borderRadius: "20px",
                                    color: user.profileComplete ? "#4ADE80" : "#F59E0B",
                                    fontSize: "11px", fontFamily: "Inter, sans-serif",
                                    fontWeight: "600", whiteSpace: "nowrap"
                                }}>
                                    {user.profileComplete ? "✅ Active" : "⏳ Incomplete"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active Profiles Tab */}
                {activeTab === "complete" && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "16px"
                    }}>
                        {completeProfiles.map((user) => (
                            <div key={user.id} style={{
                                background: "#0A0A0A",
                                border: "1px solid #1A1A1A",
                                borderRadius: "20px", overflow: "hidden",
                                transition: "all 0.3s"
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                                    e.currentTarget.style.transform = "translateY(-4px)"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#1A1A1A"
                                    e.currentTarget.style.transform = "translateY(0)"
                                }}
                            >
                                <div style={{
                                    height: "120px",
                                    background: `linear-gradient(135deg, ${user.gender === "Female" ? "#EC4899, #A855F7" :
                                            user.gender === "Male" ? "#3B82F6, #6366F1" :
                                                "#F59E0B, #D97706"
                                        })`,
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", position: "relative"
                                }}>
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{
                                            fontSize: "48px", fontWeight: "700",
                                            color: "rgba(255,255,255,0.9)",
                                            fontFamily: "Poppins, sans-serif"
                                        }}>{user.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div style={{ padding: "16px" }}>
                                    <h3 style={{
                                        color: "#FFFFFF", fontSize: "15px",
                                        fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                        marginBottom: "6px"
                                    }}>{user.name}</h3>
                                    <p style={{
                                        color: "#444444", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif", marginBottom: "3px"
                                    }}>🎓 {user.college}</p>
                                    <p style={{
                                        color: "#444444", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif", marginBottom: "10px"
                                    }}>📍 {user.city?.split(",")[0]}</p>
                                    <p style={{
                                        color: "#F59E0B", fontSize: "13px",
                                        fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                    }}>₹{user.budget?.toLocaleString()}/mo</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Interests Tab */}
                {activeTab === "interests" && (
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", overflow: "hidden"
                    }}>
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #111111"
                        }}>
                            <h3 style={{
                                color: "#FFFFFF", fontFamily: "Poppins, sans-serif",
                                fontSize: "15px", fontWeight: "600"
                            }}>All Interests ({interests.length})</h3>
                        </div>

                        {interests.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: "60px",
                                color: "#333333", fontFamily: "Inter, sans-serif"
                            }}>No interests yet</div>
                        ) : (
                            interests.map((interest, i) => (
                                <div key={interest.id} style={{
                                    display: "flex", alignItems: "center",
                                    gap: "16px", padding: "16px 24px",
                                    borderBottom: i < interests.length - 1 ? "1px solid #111111" : "none",
                                    transition: "background 0.2s"
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#111111"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <div style={{
                                        width: "38px", height: "38px",
                                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                        borderRadius: "50%", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        color: "#000", fontWeight: "700",
                                        fontSize: "14px", flexShrink: 0,
                                        fontFamily: "Poppins, sans-serif"
                                    }}>
                                        {interest.fromName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            color: "#FFFFFF", fontSize: "14px",
                                            fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                        }}>
                                            {interest.fromName}
                                            <span style={{ color: "#444444", fontWeight: "400" }}> → </span>
                                            {interest.toName}
                                        </p>
                                        <p style={{
                                            color: "#333333", fontSize: "12px",
                                            fontFamily: "Inter, sans-serif", marginTop: "2px"
                                        }}>
                                            {new Date(interest.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: "4px 12px",
                                        background: "rgba(245,158,11,0.1)",
                                        border: "1px solid rgba(245,158,11,0.2)",
                                        borderRadius: "20px", color: "#F59E0B",
                                        fontSize: "11px", fontFamily: "Inter, sans-serif",
                                        fontWeight: "600"
                                    }}>Pending</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Admin