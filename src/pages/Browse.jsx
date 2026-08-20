// Step 1 — Import dependencies
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Step 2 — Import Firebase
import { db } from "../firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

function Browse() {
    const navigate = useNavigate()

    // Step 3 — State for profiles and filters
    const [profiles, setProfiles] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)

    // Step 4 — Filter state
    const [cityFilter, setCityFilter] = useState("")
    const [budgetFilter, setBudgetFilter] = useState("")
    const [genderFilter, setGenderFilter] = useState("")
    const [lookingForFilter, setLookingForFilter] = useState("")

    // Step 5 — Fetch all complete profiles from Firestore
    useEffect(() => {
        async function fetchProfiles() {
            try {
                // Step 6 — Query only users with complete profiles
                const q = query(
                    collection(db, "users"),
                    where("profileComplete", "==", true)
                )
                const snapshot = await getDocs(q)

                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setProfiles(data)
                setFiltered(data)
            } catch (err) {
                console.log("Error fetching profiles:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfiles()
    }, [])

    // Step 7 — Apply filters whenever filter state changes
    useEffect(() => {
        let result = profiles

        if (cityFilter) {
            result = result.filter(p =>
                p.city.toLowerCase().includes(cityFilter.toLowerCase())
            )
        }

        if (budgetFilter) {
            result = result.filter(p => p.budget <= Number(budgetFilter))
        }

        if (genderFilter) {
            result = result.filter(p => p.gender === genderFilter)
        }

        if (lookingForFilter) {
            result = result.filter(p =>
                p.lookingFor === lookingForFilter || p.lookingFor === "Any"
            )
        }

        setFiltered(result)
    }, [cityFilter, budgetFilter, genderFilter, lookingForFilter, profiles])

    // Step 8 — Profile images from Unsplash (random assignment)
    const profileImages = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
    ]

    // Step 9 — Input style reused
    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        color: "#F9FAFB",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        outline: "none"
    }

    const labelStyle = {
        color: "rgba(249,250,251,0.5)",
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        display: "block",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    }

    if (loading) return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif", fontSize: "18px" }}>
                Finding roommates...
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

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 18px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Dashboard</button>
                    <button onClick={() => navigate("/complete-profile")} style={{
                        padding: "8px 18px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>My Profile</button>
                </div>
            </nav>

            <div style={{ display: "flex", padding: "32px 48px", gap: "28px" }}>

                {/* ── FILTER SIDEBAR ── */}
                <div style={{
                    width: "260px",
                    flexShrink: 0
                }}>
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px",
                        padding: "24px",
                        position: "sticky",
                        top: "90px"
                    }}>
                        <h3 style={{
                            color: "#F9FAFB", fontSize: "16px",
                            fontWeight: "600", fontFamily: "Poppins, sans-serif",
                            marginBottom: "24px"
                        }}>🔍 Filter</h3>

                        {/* City filter */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={labelStyle}>City / Area</label>
                            <input
                                type="text"
                                placeholder="e.g. Pune"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* Budget filter */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={labelStyle}>Max Budget (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 8000"
                                value={budgetFilter}
                                onChange={(e) => setBudgetFilter(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* Gender filter */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={labelStyle}>Gender</label>
                            <select
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    color: "black"
                                }}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Looking for filter */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={labelStyle}>Looking For</label>
                            <select
                                value={lookingForFilter}
                                onChange={(e) => setLookingForFilter(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    color : "black"
                                }}
                            >
                                <option value="">Any</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Clear filters */}
                        <button onClick={() => {
                            setCityFilter("")
                            setBudgetFilter("")
                            setGenderFilter("")
                            setLookingForFilter("")
                        }} style={{
                            width: "100%",
                            padding: "10px",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            color: "rgba(249,250,251,0.5)",
                            fontSize: "13px",
                            fontFamily: "Inter, sans-serif",
                            cursor: "pointer"
                        }}>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* ── PROFILES GRID ── */}
                <div style={{ flex: 1 }}>
                    {/* Results header */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}>
                        <h2 style={{
                            color: "#F9FAFB", fontSize: "20px",
                            fontWeight: "600", fontFamily: "Poppins, sans-serif"
                        }}>
                            {filtered.length} Roommates Found
                        </h2>
                        <p style={{
                            color: "rgba(249,250,251,0.4)",
                            fontSize: "13px", fontFamily: "Inter, sans-serif"
                        }}>
                            Showing verified profiles only
                        </p>
                    </div>

                    {/* No results */}
                    {filtered.length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "80px 20px",
                            background: "#13102B",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.06)"
                        }}>
                            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</p>
                            <h3 style={{
                                color: "#F9FAFB", fontFamily: "Poppins, sans-serif",
                                marginBottom: "8px"
                            }}>No roommates found</h3>
                            <p style={{
                                color: "rgba(249,250,251,0.4)",
                                fontFamily: "Inter, sans-serif", fontSize: "14px"
                            }}>Try adjusting your filters</p>
                        </div>
                    )}

                    {/* Profile cards grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "20px"
                    }}>
                        {filtered.map((profile, index) => (
                            <div key={profile.id} style={{
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
                                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(124,58,237,0.2)"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                                    e.currentTarget.style.transform = "translateY(0)"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            >
                                {/* Profile avatar */}
                                <div style={{
                                    height: "180px",
                                    background: `linear-gradient(135deg, 
        ${profile.gender === "Female" ? "#EC4899, #A855F7" :
                                            profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                                "#7C3AED, #4F46E5"})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative"
                                }}>
                                    <span style={{
                                        fontSize: "64px",
                                        fontWeight: "700",
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily: "Poppins, sans-serif"
                                    }}>
                                        {profile.name?.charAt(0).toUpperCase()}
                                    </span>
                                    {/* Budget badge */}
                                    <div style={{
                                        position: "absolute",
                                        top: "12px", right: "12px",
                                        background: "rgba(124,58,237,0.9)",
                                        backdropFilter: "blur(10px)",
                                        color: "white",
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: "600"
                                    }}>
                                        ₹{profile.budget?.toLocaleString()}/mo
                                    </div>

                                    {/* Gender badge */}
                                    <div style={{
                                        position: "absolute",
                                        top: "12px", left: "12px",
                                        background: "rgba(0,0,0,0.5)",
                                        backdropFilter: "blur(10px)",
                                        color: "white",
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontFamily: "Inter, sans-serif"
                                    }}>
                                        {profile.gender}
                                    </div>
                                </div>

                                {/* Card content */}
                                <div style={{ padding: "16px" }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "8px"
                                    }}>
                                        <h3 style={{
                                            color: "#F9FAFB", fontSize: "16px",
                                            fontWeight: "600",
                                            fontFamily: "Poppins, sans-serif"
                                        }}>{profile.name}</h3>
                                        <span style={{ fontSize: "18px", cursor: "pointer" }}>❤️</span>
                                    </div>

                                    <p style={{
                                        color: "rgba(249,250,251,0.5)",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                        marginBottom: "4px"
                                    }}>🎓 {profile.college}</p>

                                    <p style={{
                                        color: "rgba(249,250,251,0.5)",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                        marginBottom: "12px"
                                    }}>📍 {profile.city}</p>

                                    {/* Tags */}
                                    <div style={{
                                        display: "flex", gap: "6px",
                                        flexWrap: "wrap", marginBottom: "12px"
                                    }}>
                                        {profile.sleepSchedule && (
                                            <span style={{
                                                padding: "3px 10px",
                                                background: "rgba(124,58,237,0.15)",
                                                border: "1px solid rgba(124,58,237,0.2)",
                                                borderRadius: "20px",
                                                color: "#A78BFA",
                                                fontSize: "11px",
                                                fontFamily: "Inter, sans-serif"
                                            }}>
                                                {profile.sleepSchedule.split(" ")[0]}
                                            </span>
                                        )}
                                        {profile.cleanliness && (
                                            <span style={{
                                                padding: "3px 10px",
                                                background: "rgba(79,70,229,0.15)",
                                                border: "1px solid rgba(79,70,229,0.2)",
                                                borderRadius: "20px",
                                                color: "#818CF8",
                                                fontSize: "11px",
                                                fontFamily: "Inter, sans-serif"
                                            }}>
                                                {profile.cleanliness}
                                            </span>
                                        )}
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(255,255,255,0.06)",
                                            borderRadius: "20px",
                                            color: "rgba(249,250,251,0.5)",
                                            fontSize: "11px",
                                            fontFamily: "Inter, sans-serif"
                                        }}>
                                            Wants: {profile.lookingFor}
                                        </span>
                                    </div>

                                    {/* Bio preview */}
                                    {profile.bio && (
                                        <p style={{
                                            color: "rgba(249,250,251,0.4)",
                                            fontSize: "12px",
                                            fontFamily: "Inter, sans-serif",
                                            lineHeight: "1.5",
                                            marginBottom: "12px",
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical"
                                        }}>
                                            {profile.bio}
                                        </p>
                                    )}

                                    {/* Connect button */}
                                    <button 
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontFamily: "Poppins, sans-serif"
                                    }}>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Browse