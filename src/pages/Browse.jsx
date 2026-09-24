import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore"
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"

function Browse() {
    const navigate = useNavigate()
    const currentUserId = localStorage.getItem("userId")

    // Data state
    const [profiles, setProfiles] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [savedIds, setSavedIds] = useState([])

    // Filter state
    const [cityFilter, setCityFilter] = useState("")
    const [budgetFilter, setBudgetFilter] = useState("")
    const [genderFilter, setGenderFilter] = useState("")
    const [lookingForFilter, setLookingForFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    // Map state
    const [showMap, setShowMap] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [nearMe, setNearMe] = useState(false)
    const [radius, setRadius] = useState(10)
    const collegeRef = useRef(null)
    const [collegeFilter, setCollegeFilter] = useState("")

    // Fetch profiles
    useEffect(() => {
        async function fetchProfiles() {
            try {
                // Fetch profiles
                const q = query(
                    collection(db, "users"),
                    where("profileComplete", "==", true)
                )

                const snapshot = await getDocs(q)

                const data = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUserId)

                setProfiles(data)
                setFiltered(data)


                // Fetch saved profile IDs
                const savedSnap = await getDocs(
                    query(
                        collection(db, "saved"),
                        where("userId", "==", currentUserId)
                    )
                )

                const savedData = savedSnap.docs.map(doc => ({
                    docId: doc.id,
                    ...doc.data()
                }))

                setSavedIds(savedData)

            } catch (err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfiles()
    }, [])



    // Apply filters
    useEffect(() => {
        let result = profiles

        if (searchQuery) {
            result = result.filter(p =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.city?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (cityFilter) {
            result = result.filter(p =>
                p.city?.toLowerCase().includes(cityFilter.toLowerCase())
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

        if (collegeFilter) {
            result = result.filter(p =>
                p.college?.toLowerCase().includes(collegeFilter.toLowerCase())
            )
        }

        // Tab filter
        if (activeTab === "recent") {
            result = [...result].sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )
        }

        if (activeTab === "budget") {
            result = [...result].sort((a, b) => a.budget - b.budget)
        }

        setFiltered(result)
    }, [cityFilter, budgetFilter, genderFilter, lookingForFilter, searchQuery, profiles, activeTab])

    // college 
    useEffect(() => {
        if (!collegeRef.current) return

        const autocomplete = new window.google.maps.places.Autocomplete(
            collegeRef.current,
            {
                types: ["establishment"],
                componentRestrictions: { country: "in" },
                fields: ["name"]
            }
        )

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (!place.name) return
            setCollegeFilter(place.name)
        })
    }, [])

    // Distance calculation
    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    // Near Me
    function handleNearMe() {
        if (!navigator.geolocation) {
            alert("Geolocation not supported")
            return
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude
            const userLng = position.coords.longitude
            setUserLocation({ lat: userLat, lng: userLng })
            setNearMe(true)
            setShowMap(true)

            const nearby = profiles.filter(p => {
                if (!p.location) return false
                return getDistance(userLat, userLng, p.location.lat, p.location.lng) <= radius
            })
            setFiltered(nearby)
        })
    }

    // Clear all filters
    function clearFilters() {
        setCityFilter("")
        setBudgetFilter("")
        setGenderFilter("")
        setLookingForFilter("")
        setCollegeFilter("")
        setSearchQuery("")
        setNearMe(false)
        setUserLocation(null)
        setFiltered(profiles)
        setActiveTab("all")
    }

    async function handleSave(e, profile) {
        // Stop card click from firing
        e.stopPropagation()

        const currentUserId = localStorage.getItem("userId")
        if (!currentUserId) { navigate("/login"); return }

        // Check if already saved
        const existingSave = savedIds.find(s => s.savedUserId === profile.id)

        if (existingSave) {
            // Step — Unsave — delete from Firestore
            await deleteDoc(doc(db, "saved", existingSave.docId))
            setSavedIds(savedIds.filter(s => s.savedUserId !== profile.id))
        } else {
            // Step — Save — add to Firestore
            const docRef = await addDoc(collection(db, "saved"), {
                userId: currentUserId,
                savedUserId: profile.id,
                savedUserName: profile.name,
                savedUserCity: profile.city,
                createdAt: new Date().toISOString()
            })
            setSavedIds([...savedIds, {
                docId: docRef.id,
                userId: currentUserId,
                savedUserId: profile.id
            }])
        }
    }

    const hasActiveFilters = cityFilter || budgetFilter || genderFilter || lookingForFilter || nearMe || searchQuery || collegeFilter

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: "#0F0A1E",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: "16px"
        }}>
            <div style={{
                width: "48px", height: "48px",
                border: "3px solid rgba(124,58,237,0.3)",
                borderTop: "3px solid #7C3AED",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }} />
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>
                Finding roommates...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#0F0A1E" }}>

            {/* ── STICKY NAVBAR ── */}
            <nav style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "16px 48px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(15,10,30,0.95)",
                position: "sticky", top: 0, zIndex: 100,
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: "15px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Dashboard</button>

                    <button onClick={() => navigate("/my-profile")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>My Profile</button>
                </div>
            </nav>

            {/* ── HERO SEARCH BAR ── */}
            <div style={{
                background: "linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%)",
                padding: "40px 48px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
                <h1 style={{
                    color: "#F9FAFB", fontSize: "28px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "4px"
                }}>Find Your Roommate</h1>
                <p style={{
                    color: "rgba(249,250,251,0.4)",
                    fontSize: "14px", fontFamily: "Inter, sans-serif",
                    marginBottom: "24px"
                }}>
                    {filtered.length} verified profiles available
                </p>

                {/* Search bar */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "#13102B",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px", padding: "14px 20px",
                    marginBottom: "20px"
                }}>
                    <span style={{ fontSize: "18px" }}>🔍</span>
                    <input
                        placeholder="Search by name, college or area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1, background: "transparent",
                            border: "none", color: "#F9FAFB",
                            fontSize: "15px", fontFamily: "Inter, sans-serif",
                            outline: "none"
                        }}
                    />
                    {searchQuery && (
                        <span
                            onClick={() => setSearchQuery("")}
                            style={{ color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "18px" }}
                        >✕</span>
                    )}
                </div>

                {/* Filter chips row */}
                <div style={{
                    display: "flex", gap: "10px",
                    flexWrap: "wrap", paddingBottom: "20px",
                    alignItems: "center"
                }}>
                    {/* City filter */}
                    <input
                        placeholder="📍 City"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{
                            padding: "8px 16px",
                            background: cityFilter ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                            border: cityFilter ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "25px", color: "#F9FAFB",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            outline: "none", width: "130px"
                        }}
                    />

                    {/* College filter */}
                    <input
                        ref={collegeRef}
                        placeholder="🎓 College"
                        value={collegeFilter}
                        onChange={(e) => setCollegeFilter(e.target.value)}
                        style={{
                            padding: "8px 16px",
                            background: collegeFilter ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                            border: collegeFilter ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "25px", color: "#F9FAFB",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            outline: "none", width: "150px"
                        }}
                    />

                    {/* Budget filter */}
                    <input
                        placeholder="💰 Max Budget"
                        type="number"
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                        style={{
                            padding: "8px 16px",
                            background: budgetFilter ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                            border: budgetFilter ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "25px", color: "#F9FAFB",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            outline: "none", width: "140px"
                        }}
                    />

                    {/* Gender filter */}
                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        style={{
                            padding: "8px 16px",
                            background: genderFilter ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                            border: genderFilter ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "25px", color: "#F9FAFB",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            outline: "none", cursor: "pointer"
                        }}
                    >
                        <option value="">👤 Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    {/* Looking for filter */}
                    <select
                        value={lookingForFilter}
                        onChange={(e) => setLookingForFilter(e.target.value)}
                        style={{
                            padding: "8px 16px",
                            background: lookingForFilter ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                            border: lookingForFilter ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "25px", color: "#F9FAFB",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            outline: "none", cursor: "pointer"
                        }}
                    >
                        <option value="">🤝 Looking For</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Any">Any</option>
                    </select>

                    {/* Near Me button */}
                    <button onClick={handleNearMe} style={{
                        padding: "8px 18px",
                        background: nearMe
                            ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                            : "rgba(255,255,255,0.05)",
                        color: nearMe ? "white" : "rgba(249,250,251,0.7)",
                        border: nearMe ? "none" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "25px", fontSize: "13px",
                        fontFamily: "Poppins, sans-serif", cursor: "pointer",
                        fontWeight: "500"
                    }}>
                        📍 Near Me
                    </button>

                    {/* Radius when near me active */}
                    {nearMe && (
                        <select
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            style={{
                                padding: "8px 14px",
                                background: "rgba(124,58,237,0.2)",
                                border: "1px solid #7C3AED",
                                borderRadius: "25px", color: "#F9FAFB",
                                fontSize: "13px", fontFamily: "Inter, sans-serif",
                                outline: "none", cursor: "pointer"
                            }}
                        >
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={20}>20 km</option>
                            <option value={50}>50 km</option>
                        </select>
                    )}

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button onClick={clearFilters} style={{
                            padding: "8px 18px",
                            background: "rgba(239,68,68,0.1)",
                            color: "#F87171",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "25px", fontSize: "13px",
                            fontFamily: "Poppins, sans-serif", cursor: "pointer"
                        }}>
                            ✕ Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* ── TABS + RESULTS ── */}
            <div style={{ padding: "24px 48px" }}>

                {/* Tabs row */}
                <div style={{
                    display: "flex", gap: "8px",
                    marginBottom: "24px", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap"
                }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[
                            { id: "all", label: "All Profiles" },
                            { id: "recent", label: "Recently Added" },
                            { id: "budget", label: "Low Budget First" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: "8px 18px",
                                    background: activeTab === tab.id
                                        ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                                        : "transparent",
                                    color: activeTab === tab.id
                                        ? "white"
                                        : "rgba(249,250,251,0.5)",
                                    border: activeTab === tab.id
                                        ? "none"
                                        : "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "25px",
                                    fontSize: "13px",
                                    fontFamily: "Poppins, sans-serif",
                                    cursor: "pointer",
                                    fontWeight: activeTab === tab.id ? "600" : "400"
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Map toggle */}
                    <button onClick={() => setShowMap(!showMap)} style={{
                        padding: "8px 18px",
                        background: showMap
                            ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                            : "rgba(255,255,255,0.05)",
                        color: showMap ? "white" : "rgba(249,250,251,0.7)",
                        border: showMap ? "none" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "25px", fontSize: "13px",
                        fontFamily: "Poppins, sans-serif", cursor: "pointer",
                        fontWeight: "500"
                    }}>
                        {showMap ? "📋 List View" : "🗺️ Map View"}
                    </button>
                </div>

                {/* Map view */}
                {showMap && (
                    <div style={{
                        borderRadius: "20px", overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.08)",
                        height: "450px", marginBottom: "28px"
                    }}>
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={userLocation || { lat: 18.5204, lng: 73.8567 }}
                            zoom={userLocation ? 13 : 11}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
                                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
                                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] }
                                ],
                                disableDefaultUI: true,
                                zoomControl: true
                            }}
                        >
                            {userLocation && (
                                <Marker
                                    position={userLocation}
                                    icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                                />
                            )}
                            {filtered.map((profile) => (
                                profile.location && (
                                    <Marker
                                        key={profile.id}
                                        position={profile.location}
                                        onClick={() => setSelectedProfile(profile)}
                                        icon={{ url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png" }}
                                    />
                                )
                            ))}
                            {selectedProfile?.location && (
                                <InfoWindow
                                    position={selectedProfile.location}
                                    onCloseClick={() => setSelectedProfile(null)}
                                >
                                    <div style={{ padding: "8px", minWidth: "160px" }}>
                                        <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px", fontFamily: "Poppins, sans-serif" }}>
                                            {selectedProfile.name}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>
                                            🎓 {selectedProfile.college}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                                            💰 ₹{selectedProfile.budget?.toLocaleString()}/mo
                                        </p>
                                        <button
                                            onClick={() => navigate(`/profile/${selectedProfile.id}`)}
                                            style={{
                                                padding: "6px 14px",
                                                background: "#7C3AED", color: "white",
                                                border: "none", borderRadius: "10px",
                                                fontSize: "12px", fontWeight: "600",
                                                cursor: "pointer", width: "100%"
                                            }}
                                        >View Profile</button>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </div>
                )}

                {/* No results */}
                {filtered.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "80px 20px",
                        background: "#13102B", borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</p>
                        <h3 style={{ color: "#F9FAFB", fontFamily: "Poppins, sans-serif", marginBottom: "8px" }}>
                            No roommates found
                        </h3>
                        <p style={{ color: "rgba(249,250,251,0.4)", fontFamily: "Inter, sans-serif", fontSize: "14px", marginBottom: "20px" }}>
                            Try adjusting your filters
                        </p>
                        <button onClick={clearFilters} style={{
                            padding: "10px 24px",
                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white", border: "none",
                            borderRadius: "20px", fontSize: "14px",
                            fontFamily: "Poppins, sans-serif", cursor: "pointer"
                        }}>Clear Filters</button>
                    </div>
                )}

                {/* Profile cards grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px"
                }}>
                    {filtered.map((profile) => (
                        <div key={profile.id} style={{
                            background: "#13102B",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "20px", overflow: "hidden",
                            cursor: "pointer", transition: "all 0.3s"
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
                            {/* Avatar section */}
                            <div style={{
                                height: "160px",
                                background: `linear-gradient(135deg, ${profile.gender === "Female" ? "#EC4899, #A855F7" :
                                    profile.gender === "Male" ? "#3B82F6, #6366F1" :
                                        "#7C3AED, #4F46E5"
                                    })`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", position: "relative"
                            }}>
                                <span style={{
                                    fontSize: "64px", fontWeight: "700",
                                    color: "rgba(255,255,255,0.9)",
                                    fontFamily: "Poppins, sans-serif"
                                }}>
                                    {profile.name?.charAt(0).toUpperCase()}
                                </span>

                                {/* Budget badge */}
                                <div style={{
                                    position: "absolute", top: "12px", right: "12px",
                                    background: "rgba(0,0,0,0.5)",
                                    backdropFilter: "blur(10px)",
                                    color: "white", padding: "4px 12px",
                                    borderRadius: "20px", fontSize: "12px",
                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                }}>
                                    ₹{profile.budget?.toLocaleString()}/mo
                                </div>

                                {/* Gender badge */}
                                <div style={{
                                    position: "absolute", top: "12px", left: "12px",
                                    background: "rgba(0,0,0,0.4)",
                                    backdropFilter: "blur(10px)",
                                    color: "white", padding: "4px 10px",
                                    borderRadius: "20px", fontSize: "11px",
                                    fontFamily: "Inter, sans-serif"
                                }}>
                                    {profile.gender}
                                </div>
                            </div>

                            {/* Card content */}
                            <div style={{ padding: "16px" }}>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "center", marginBottom: "8px"
                                }}>
                                    <h3 style={{
                                        color: "#F9FAFB", fontSize: "16px",
                                        fontWeight: "600", fontFamily: "Poppins, sans-serif"
                                    }}>{profile.name}</h3>
                                    <span
                                        onClick={(e) => handleSave(e, profile)}
                                        style={{
                                            fontSize: "18px",
                                            cursor: "pointer",
                                            transition: "transform 0.2s"
                                        }}
                                        onMouseEnter={e => e.target.style.transform = "scale(1.2)"}
                                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                    >
                                        {savedIds.find(s => s.savedUserId === profile.id) ? "❤️" : "🤍"}
                                    </span>
                                </div>

                                <p style={{
                                    color: "rgba(249,250,251,0.5)", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif", marginBottom: "4px"
                                }}>🎓 {profile.college}</p>

                                <p style={{
                                    color: "rgba(249,250,251,0.5)", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif", marginBottom: "12px"
                                }}>📍 {profile.city}</p>

                                {/* Tags */}
                                <div style={{
                                    display: "flex", gap: "6px",
                                    flexWrap: "wrap", marginBottom: "14px"
                                }}>
                                    {profile.sleepSchedule && (
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(124,58,237,0.15)",
                                            border: "1px solid rgba(124,58,237,0.2)",
                                            borderRadius: "20px", color: "#A78BFA",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.sleepSchedule.split(" ")[0]}</span>
                                    )}
                                    {profile.cleanliness && (
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(79,70,229,0.15)",
                                            border: "1px solid rgba(79,70,229,0.2)",
                                            borderRadius: "20px", color: "#818CF8",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.cleanliness}</span>
                                    )}
                                    <span style={{
                                        padding: "3px 10px",
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "20px",
                                        color: "rgba(249,250,251,0.4)",
                                        fontSize: "11px", fontFamily: "Inter, sans-serif"
                                    }}>Wants: {profile.lookingFor}</span>
                                </div>

                                {/* Bio preview */}
                                {profile.bio && (
                                    <p style={{
                                        color: "rgba(249,250,251,0.35)", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif", lineHeight: "1.5",
                                        marginBottom: "14px", overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical"
                                    }}>{profile.bio}</p>
                                )}

                                {/* View Profile button */}
                                <button
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    style={{
                                        width: "100%", padding: "10px",
                                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                        color: "white", border: "none",
                                        borderRadius: "10px", fontSize: "13px",
                                        fontWeight: "600", cursor: "pointer",
                                        fontFamily: "Poppins, sans-serif"
                                    }}
                                >View Profile →</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Browse