import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore"
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"

function Browse() {
    const navigate = useNavigate()
    const currentUserId = localStorage.getItem("userId")
    const collegeRef = useRef(null)

    const [profiles, setProfiles] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [savedIds, setSavedIds] = useState([])
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [cityFilter, setCityFilter] = useState("")
    const [budgetFilter, setBudgetFilter] = useState("")
    const [genderFilter, setGenderFilter] = useState("")
    const [lookingForFilter, setLookingForFilter] = useState("")
    const [collegeFilter, setCollegeFilter] = useState("")
    const [showMap, setShowMap] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [nearMe, setNearMe] = useState(false)
    const [radius, setRadius] = useState(10)

    useEffect(() => {
        async function fetchData() {
            try {
                const q = query(
                    collection(db, "users"),
                    where("profileComplete", "==", true)
                )
                const snapshot = await getDocs(q)
                const data = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.id !== currentUserId)
                setProfiles(data)
                setFiltered(data)

                const savedSnap = await getDocs(
                    query(collection(db, "saved"), where("userId", "==", currentUserId))
                )
                setSavedIds(savedSnap.docs.map(d => ({ docId: d.id, ...d.data() })))
            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if(!collegeRef.current) return
        const autocomplete = new window.google.maps.places.Autocomplete(
            collegeRef.current,
            { types: ["establishment"], componentRestrictions: { country: "in" }, fields: ["name"] }
        )
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if(place.name) setCollegeFilter(place.name)
        })
    }, [loading])

    useEffect(() => {
        let result = profiles

        if(searchQuery) result = result.filter(p =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if(cityFilter) result = result.filter(p =>
            p.city?.toLowerCase().includes(cityFilter.toLowerCase())
        )
        if(budgetFilter) result = result.filter(p => p.budget <= Number(budgetFilter))
        if(genderFilter) result = result.filter(p => p.gender === genderFilter)
        if(lookingForFilter) result = result.filter(p =>
            p.lookingFor === lookingForFilter || p.lookingFor === "Any"
        )
        if(collegeFilter) result = result.filter(p =>
            p.college?.toLowerCase().includes(collegeFilter.toLowerCase())
        )
        if(activeTab === "recent") result = [...result].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        )
        if(activeTab === "budget") result = [...result].sort((a, b) => a.budget - b.budget)

        setFiltered(result)
    }, [cityFilter, budgetFilter, genderFilter, lookingForFilter,
        searchQuery, collegeFilter, profiles, activeTab])

    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    function handleNearMe() {
        if(!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            setUserLocation({ lat, lng })
            setNearMe(true)
            setShowMap(true)
            setFiltered(profiles.filter(p => {
                if(!p.location) return false
                return getDistance(lat, lng, p.location.lat, p.location.lng) <= radius
            }))
        })
    }

    async function handleSave(e, profile) {
        e.stopPropagation()
        if(!currentUserId) { navigate("/login"); return }
        const existing = savedIds.find(s => s.savedUserId === profile.id)
        if(existing) {
            await deleteDoc(doc(db, "saved", existing.docId))
            setSavedIds(savedIds.filter(s => s.savedUserId !== profile.id))
        } else {
            const docRef = await addDoc(collection(db, "saved"), {
                userId: currentUserId,
                savedUserId: profile.id,
                savedUserName: profile.name,
                createdAt: new Date().toISOString()
            })
            setSavedIds([...savedIds, { docId: docRef.id, userId: currentUserId, savedUserId: profile.id }])
        }
    }

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
        setShowMap(false)
        if(collegeRef.current) collegeRef.current.value = ""
    }

    const hasFilters = cityFilter || budgetFilter || genderFilter ||
        lookingForFilter || nearMe || searchQuery || collegeFilter

    const inputStyle = {
        padding: "9px 16px",
        background: "#0A0A0A",
        border: "1px solid #1A1A1A",
        borderRadius: "25px", color: "#FFFFFF",
        fontSize: "13px", fontFamily: "Inter, sans-serif",
        outline: "none", transition: "border-color 0.3s"
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
            <p style={{ color: "#333333", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
                Finding roommates...
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: "15px",
                        boxShadow: "0 0 15px rgba(245,158,11,0.3)"
                    }}>🏠</div>
                    <span style={{
                        color: "#FFFFFF", fontSize: "17px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "#444444", border: "none", fontSize: "14px",
                        fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Dashboard</button>
                    <button onClick={() => navigate("/my-profile")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "#444444", border: "none", fontSize: "14px",
                        fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>My Profile</button>
                </div>
            </nav>

            {/* ── SEARCH HEADER ── */}
            <div style={{
                background: "#000000",
                borderBottom: "1px solid #111111",
                padding: "32px 48px 0"
            }}>
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-end", marginBottom: "24px"
                }}>
                    <div>
                        <h1 style={{
                            color: "#FFFFFF", fontSize: "26px",
                            fontWeight: "800", fontFamily: "Poppins, sans-serif",
                            marginBottom: "4px"
                        }}>Find Roommates</h1>
                        <p style={{
                            color: "#333333", fontSize: "13px",
                            fontFamily: "Inter, sans-serif"
                        }}>{filtered.length} verified profiles</p>
                    </div>
                    <button onClick={() => setShowMap(!showMap)} style={{
                        padding: "10px 20px",
                        background: showMap
                            ? "linear-gradient(135deg, #F59E0B, #D97706)"
                            : "transparent",
                        color: showMap ? "#000000" : "#444444",
                        border: showMap ? "none" : "1px solid #222222",
                        borderRadius: "20px", fontSize: "13px",
                        fontFamily: "Poppins, sans-serif",
                        cursor: "pointer", fontWeight: "600",
                        transition: "all 0.3s"
                    }}>
                        {showMap ? "📋 List" : "🗺️ Map"}
                    </button>
                </div>

                {/* Search bar */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    borderRadius: "16px", padding: "14px 20px",
                    marginBottom: "20px", transition: "border-color 0.3s"
                }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"}
                    onBlur={e => e.currentTarget.style.borderColor = "#1A1A1A"}
                >
                    <span style={{ fontSize: "16px", color: "#333333" }}>🔍</span>
                    <input
                        placeholder="Search by name, college or area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1, background: "transparent",
                            border: "none", color: "#FFFFFF",
                            fontSize: "14px", fontFamily: "Inter, sans-serif",
                            outline: "none"
                        }}
                    />
                    {searchQuery && (
                        <span onClick={() => setSearchQuery("")}
                            style={{ color: "#222222", cursor: "pointer", fontSize: "16px" }}>✕</span>
                    )}
                </div>

                {/* Filter chips */}
                <div style={{
                    display: "flex", gap: "8px",
                    flexWrap: "wrap", paddingBottom: "20px",
                    alignItems: "center"
                }}>
                    <input
                        placeholder="📍 City"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{
                            ...inputStyle,
                            width: "110px",
                            borderColor: cityFilter ? "rgba(245,158,11,0.4)" : "#1A1A1A",
                            background: cityFilter ? "rgba(245,158,11,0.05)" : "#0A0A0A"
                        }}
                    />
                    <input
                        ref={collegeRef}
                        placeholder="🎓 College"
                        value={collegeFilter}
                        onChange={(e) => setCollegeFilter(e.target.value)}
                        style={{
                            ...inputStyle,
                            width: "140px",
                            borderColor: collegeFilter ? "rgba(245,158,11,0.4)" : "#1A1A1A",
                            background: collegeFilter ? "rgba(245,158,11,0.05)" : "#0A0A0A"
                        }}
                    />
                    <input
                        placeholder="💰 Max Budget"
                        type="number"
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                        style={{
                            ...inputStyle,
                            width: "130px",
                            borderColor: budgetFilter ? "rgba(245,158,11,0.4)" : "#1A1A1A",
                            background: budgetFilter ? "rgba(245,158,11,0.05)" : "#0A0A0A"
                        }}
                    />
                    <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
                        style={{
                            ...inputStyle,
                            borderColor: genderFilter ? "rgba(245,158,11,0.4)" : "#1A1A1A",
                            background: genderFilter ? "rgba(245,158,11,0.05)" : "#0A0A0A",
                            cursor: "pointer"
                        }}>
                        <option value="">👤 Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <select value={lookingForFilter} onChange={(e) => setLookingForFilter(e.target.value)}
                        style={{
                            ...inputStyle,
                            borderColor: lookingForFilter ? "rgba(245,158,11,0.4)" : "#1A1A1A",
                            background: lookingForFilter ? "rgba(245,158,11,0.05)" : "#0A0A0A",
                            cursor: "pointer"
                        }}>
                        <option value="">🤝 Looking For</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Any">Any</option>
                    </select>

                    <button onClick={handleNearMe} style={{
                        ...inputStyle,
                        background: nearMe ? "rgba(245,158,11,0.1)" : "#0A0A0A",
                        border: nearMe ? "1px solid rgba(245,158,11,0.4)" : "1px solid #1A1A1A",
                        color: nearMe ? "#F59E0B" : "#444444",
                        cursor: "pointer", fontWeight: "500"
                    }}>📍 Near Me</button>

                    {nearMe && (
                        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                            style={{
                                ...inputStyle,
                                background: "rgba(245,158,11,0.05)",
                                borderColor: "rgba(245,158,11,0.3)",
                                color: "#F59E0B", cursor: "pointer"
                            }}>
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={20}>20 km</option>
                            <option value={50}>50 km</option>
                        </select>
                    )}

                    {hasFilters && (
                        <button onClick={clearFilters} style={{
                            ...inputStyle,
                            background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#F87171", cursor: "pointer"
                        }}>✕ Clear</button>
                    )}
                </div>
            </div>

            <div style={{ padding: "24px 48px" }}>

                {/* Tabs */}
                <div style={{
                    display: "flex", gap: "8px", marginBottom: "24px"
                }}>
                    {[
                        { id: "all", label: "All" },
                        { id: "recent", label: "Recent" },
                        { id: "budget", label: "Budget ↑" }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: "8px 20px",
                            background: activeTab === tab.id
                                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                : "transparent",
                            color: activeTab === tab.id ? "#000000" : "#333333",
                            border: activeTab === tab.id ? "none" : "1px solid #1A1A1A",
                            borderRadius: "25px", fontSize: "13px",
                            fontFamily: "Poppins, sans-serif",
                            cursor: "pointer", fontWeight: "600",
                            transition: "all 0.3s"
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* Map view */}
                {showMap && (
                    <div style={{
                        borderRadius: "20px", overflow: "hidden",
                        border: "1px solid #1A1A1A",
                        height: "420px", marginBottom: "24px"
                    }}>
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={userLocation || { lat: 18.5204, lng: 73.8567 }}
                            zoom={userLocation ? 13 : 11}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#0A0A0A" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
                                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
                                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
                                    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111111" }] },
                                    { featureType: "poi", stylers: [{ visibility: "off" }] }
                                ],
                                disableDefaultUI: true, zoomControl: true
                            }}
                        >
                            {userLocation && (
                                <Marker position={userLocation}
                                    icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />
                            )}
                            {filtered.map((profile) => profile.location && (
                                <Marker key={profile.id} position={profile.location}
                                    onClick={() => setSelectedProfile(profile)}
                                    icon={{ url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png" }} />
                            ))}
                            {selectedProfile?.location && (
                                <InfoWindow position={selectedProfile.location}
                                    onCloseClick={() => setSelectedProfile(null)}>
                                    <div style={{ padding: "8px", minWidth: "150px" }}>
                                        <p style={{ fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                                            {selectedProfile.name}
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
                                            ₹{selectedProfile.budget?.toLocaleString()}/mo
                                        </p>
                                        <button onClick={() => navigate(`/profile/${selectedProfile.id}`)}
                                            style={{
                                                padding: "6px 12px", background: "#F59E0B",
                                                color: "#000", border: "none",
                                                borderRadius: "8px", fontSize: "11px",
                                                fontWeight: "700", cursor: "pointer", width: "100%"
                                            }}>View Profile</button>
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
                        background: "#0A0A0A", borderRadius: "20px",
                        border: "1px solid #1A1A1A"
                    }}>
                        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</p>
                        <h3 style={{
                            color: "#FFFFFF", fontFamily: "Poppins, sans-serif",
                            marginBottom: "8px"
                        }}>No roommates found</h3>
                        <p style={{
                            color: "#333333", fontFamily: "Inter, sans-serif",
                            fontSize: "14px", marginBottom: "20px"
                        }}>Try adjusting your filters</p>
                        <button onClick={clearFilters} style={{
                            padding: "10px 24px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000", border: "none", borderRadius: "20px",
                            fontSize: "14px", fontFamily: "Poppins, sans-serif",
                            cursor: "pointer", fontWeight: "700"
                        }}>Clear Filters</button>
                    </div>
                )}

                {/* Profile cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                    gap: "16px"
                }}>
                    {filtered.map((profile) => (
                        <div key={profile.id} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", overflow: "hidden",
                            cursor: "pointer", transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                                e.currentTarget.style.transform = "translateY(-5px)"
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.6)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1A1A1A"
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "none"
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                height: "160px",
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
                                        fontSize: "60px", fontWeight: "700",
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily: "Poppins, sans-serif"
                                    }}>{profile.name?.charAt(0).toUpperCase()}</span>
                                )}

                                {/* Budget badge */}
                                <div style={{
                                    position: "absolute", top: "12px", right: "12px",
                                    background: "rgba(0,0,0,0.7)",
                                    backdropFilter: "blur(10px)",
                                    color: "white", padding: "4px 12px",
                                    borderRadius: "20px", fontSize: "12px",
                                    fontFamily: "Poppins, sans-serif", fontWeight: "600"
                                }}>₹{profile.budget?.toLocaleString()}/mo</div>

                                {/* Gender badge */}
                                <div style={{
                                    position: "absolute", top: "12px", left: "12px",
                                    background: "rgba(0,0,0,0.5)",
                                    backdropFilter: "blur(10px)",
                                    color: "white", padding: "3px 10px",
                                    borderRadius: "20px", fontSize: "11px",
                                    fontFamily: "Inter, sans-serif"
                                }}>{profile.gender}</div>

                                {/* Save button */}
                                <div style={{
                                    position: "absolute", bottom: "12px", right: "12px"
                                }}>
                                    <span
                                        onClick={(e) => handleSave(e, profile)}
                                        style={{
                                            fontSize: "20px", cursor: "pointer",
                                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                                            transition: "transform 0.2s"
                                        }}
                                        onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
                                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                    >
                                        {savedIds.find(s => s.savedUserId === profile.id) ? "❤️" : "🤍"}
                                    </span>
                                </div>
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
                                            background: "rgba(245,158,11,0.08)",
                                            border: "1px solid rgba(245,158,11,0.15)",
                                            borderRadius: "20px", color: "#F59E0B",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.sleepSchedule.split(" ")[0]}</span>
                                    )}
                                    {profile.cleanliness && (
                                        <span style={{
                                            padding: "3px 10px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid #1A1A1A",
                                            borderRadius: "20px", color: "#444444",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif"
                                        }}>{profile.cleanliness}</span>
                                    )}
                                    <span style={{
                                        padding: "3px 10px",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: "20px", color: "#333333",
                                        fontSize: "11px", fontFamily: "Inter, sans-serif"
                                    }}>Wants: {profile.lookingFor}</span>
                                </div>

                                {profile.bio && (
                                    <p style={{
                                        color: "#222222", fontSize: "12px",
                                        fontFamily: "Inter, sans-serif", lineHeight: "1.5",
                                        marginBottom: "14px", overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical"
                                    }}>{profile.bio}</p>
                                )}

                                <button
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    style={{
                                        width: "100%", padding: "10px",
                                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                        color: "#000000", border: "none",
                                        borderRadius: "10px", fontSize: "13px",
                                        fontWeight: "700", cursor: "pointer",
                                        fontFamily: "Poppins, sans-serif",
                                        transition: "all 0.3s"
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.boxShadow = "0 0 20px rgba(245,158,11,0.4)"
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.boxShadow = "none"
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