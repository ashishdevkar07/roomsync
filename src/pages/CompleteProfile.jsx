import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"
import { GoogleMap, Marker } from "@react-google-maps/api"

function CompleteProfile() {
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const navigate = useNavigate()
    const collegeInputRef = useRef(null)
    const cityInputRef = useRef(null)

    const [college, setCollege] = useState("")
    const [city, setCity] = useState("")
    const [budget, setBudget] = useState("")
    const [gender, setGender] = useState("")
    const [lookingFor, setLookingFor] = useState("")
    const [sleepSchedule, setSleepSchedule] = useState("")
    const [cleanliness, setCleanliness] = useState("")
    const [bio, setBio] = useState("")
    const [location, setLocation] = useState(null)
    const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if(!collegeInputRef.current) return
        const ac1 = new window.google.maps.places.Autocomplete(
            collegeInputRef.current,
            { types: ["establishment"], componentRestrictions: { country: "in" }, fields: ["name"] }
        )
        ac1.addListener("place_changed", () => {
            const place = ac1.getPlace()
            if(place.name) setCollege(place.name)
        })
    }, [])

    useEffect(() => {
        if(!cityInputRef.current) return
        const ac2 = new window.google.maps.places.Autocomplete(
            cityInputRef.current,
            { types: ["(cities)"], componentRestrictions: { country: "in" } }
        )
        ac2.addListener("place_changed", () => {
            const place = ac2.getPlace()
            if(!place.geometry) return
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            setCity(place.formatted_address)
            setLocation({ lat, lng })
            setMapCenter({ lat, lng })
        })
    }, [])

    function handleMapClick(event) {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        setLocation({ lat, lng })
        setMapCenter({ lat, lng })
    }

    async function handleSubmit() {
        if(!college || !city || !budget || !gender || !lookingFor) {
            setError("Please fill all required fields")
            return
        }
        try {
            setLoading(true)
            setError("")
            const userRef = doc(db, "users", userId)
            await updateDoc(userRef, {
                college, city,
                budget: Number(budget),
                gender, lookingFor,
                sleepSchedule, cleanliness, bio,
                location: location || null,
                profileComplete: true,
                updatedAt: new Date().toISOString()
            })
            navigate("/browse")
        } catch(err) {
            setError("Something went wrong. Please try again.")
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: "100%", padding: "12px 16px",
        background: "#111111",
        border: "1px solid #1A1A1A",
        borderRadius: "12px", color: "#FFFFFF",
        fontSize: "14px", fontFamily: "Inter, sans-serif",
        outline: "none", transition: "border-color 0.3s"
    }

    const labelStyle = {
        color: "#333333", fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        display: "block", marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.08em"
    }

    return (
        <div style={{ minHeight: "100vh", background: "#000000" }}>

            {/* Background effect */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0
            }}>
                <div style={{
                    position: "absolute",
                    width: "500px", height: "500px",
                    background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
                    top: "-100px", right: "-100px"
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(245,158,11,0.02) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(245,158,11,0.02) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }} />
            </div>

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
                }} onClick={() => navigate("/")}>
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
                <button onClick={() => navigate("/dashboard")} style={{
                    padding: "8px 20px",
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
                >Skip for now</button>
            </nav>

            <div style={{
                maxWidth: "640px", margin: "0 auto",
                padding: "48px 20px",
                position: "relative", zIndex: 1
            }}>
                {/* Header */}
                <div style={{ marginBottom: "36px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: "25px", padding: "6px 16px",
                        marginBottom: "20px"
                    }}>
                        <span style={{
                            width: "6px", height: "6px",
                            background: "#F59E0B", borderRadius: "50%"
                        }} />
                        <span style={{
                            color: "#F59E0B", fontSize: "12px",
                            fontFamily: "Inter, sans-serif", fontWeight: "500"
                        }}>One time setup</span>
                    </div>

                    <h1 style={{
                        color: "#FFFFFF", fontSize: "28px",
                        fontWeight: "800", fontFamily: "Poppins, sans-serif",
                        marginBottom: "8px"
                    }}>
                        Complete your profile,{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>{userName?.split(" ")[0]}</span>
                    </h1>
                    <p style={{
                        color: "#333333", fontSize: "14px",
                        fontFamily: "Inter, sans-serif"
                    }}>
                        Tell others about yourself so they can find you
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "12px", padding: "12px 18px",
                        color: "#F87171", fontSize: "13px",
                        fontFamily: "Inter, sans-serif", marginBottom: "24px"
                    }}>❌ {error}</div>
                )}

                {/* Form */}
                <div style={{
                    background: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    borderRadius: "24px", padding: "32px",
                    display: "flex", flexDirection: "column", gap: "20px"
                }}>
                    {/* College */}
                    <div>
                        <label style={labelStyle}>College Name *</label>
                        <input
                            ref={collegeInputRef}
                            type="text"
                            placeholder="Start typing your college..."
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label style={labelStyle}>City / Area *</label>
                        <input
                            ref={cityInputRef}
                            type="text"
                            placeholder="Start typing your city..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* Budget */}
                    <div>
                        <label style={labelStyle}>Monthly Budget (₹) *</label>
                        <input
                            type="number"
                            placeholder="e.g. 5000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* Gender + Looking For */}
                    <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Your Gender *</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                style={{ ...inputStyle, cursor: "pointer" }}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Looking For *</label>
                            <select
                                value={lookingFor}
                                onChange={(e) => setLookingFor(e.target.value)}
                                style={{ ...inputStyle, cursor: "pointer" }}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Any">Any</option>
                            </select>
                        </div>
                    </div>

                    {/* Sleep Schedule */}
                    <div>
                        <label style={labelStyle}>Sleep Schedule</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["Early Bird (Before 11pm)", "Night Owl (After 12am)", "Flexible"].map((opt) => (
                                <button key={opt} onClick={() => setSleepSchedule(opt)} style={{
                                    flex: 1, padding: "10px 6px",
                                    background: sleepSchedule === opt
                                        ? "rgba(245,158,11,0.1)" : "#111111",
                                    border: sleepSchedule === opt
                                        ? "1px solid rgba(245,158,11,0.3)" : "1px solid #1A1A1A",
                                    borderRadius: "10px",
                                    color: sleepSchedule === opt ? "#F59E0B" : "#333333",
                                    fontSize: "11px", fontFamily: "Inter, sans-serif",
                                    cursor: "pointer", textAlign: "center",
                                    transition: "all 0.3s"
                                }}>{opt}</button>
                            ))}
                        </div>
                    </div>

                    {/* Cleanliness */}
                    <div>
                        <label style={labelStyle}>Cleanliness Level</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["Very Clean", "Moderate", "Relaxed"].map((opt) => (
                                <button key={opt} onClick={() => setCleanliness(opt)} style={{
                                    flex: 1, padding: "10px",
                                    background: cleanliness === opt
                                        ? "rgba(245,158,11,0.1)" : "#111111",
                                    border: cleanliness === opt
                                        ? "1px solid rgba(245,158,11,0.3)" : "1px solid #1A1A1A",
                                    borderRadius: "10px",
                                    color: cleanliness === opt ? "#F59E0B" : "#333333",
                                    fontSize: "13px", fontFamily: "Inter, sans-serif",
                                    cursor: "pointer", transition: "all 0.3s"
                                }}>{opt}</button>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={labelStyle}>About Yourself</label>
                        <textarea
                            placeholder="Tell potential roommates about yourself, your routine, interests..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            style={{
                                ...inputStyle, resize: "none", lineHeight: "1.6"
                            }}
                            onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                            onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                        />
                    </div>

                    {/* Map */}
                    <div>
                        <label style={labelStyle}>Pin Your Location</label>
                        <p style={{
                            color: "#222222", fontSize: "12px",
                            fontFamily: "Inter, sans-serif", marginBottom: "10px"
                        }}>
                            City autocomplete above moves the map — or click directly to pin
                        </p>
                        <div style={{
                            borderRadius: "16px", overflow: "hidden",
                            border: "1px solid #1A1A1A", height: "260px"
                        }}>
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={mapCenter}
                                zoom={12}
                                onClick={handleMapClick}
                                options={{
                                    styles: [
                                        { elementType: "geometry", stylers: [{ color: "#0A0A0A" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
                                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
                                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
                                        { featureType: "poi", stylers: [{ visibility: "off" }] }
                                    ],
                                    disableDefaultUI: true, zoomControl: true
                                }}
                            >
                                {location && <Marker position={location} />}
                            </GoogleMap>
                        </div>
                        {location && (
                            <p style={{
                                color: "#F59E0B", fontSize: "12px",
                                fontFamily: "Inter, sans-serif", marginTop: "8px"
                            }}>
                                ✅ Location pinned: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "15px",
                            background: loading
                                ? "rgba(245,158,11,0.3)"
                                : "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "12px", fontSize: "15px",
                            fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "Poppins, sans-serif", marginTop: "8px",
                            boxShadow: loading ? "none" : "0 0 30px rgba(245,158,11,0.3)",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                            if(!loading) {
                                e.target.style.transform = "translateY(-2px)"
                                e.target.style.boxShadow = "0 0 40px rgba(245,158,11,0.5)"
                            }
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            if(!loading) e.target.style.boxShadow = "0 0 30px rgba(245,158,11,0.3)"
                        }}
                    >
                        {loading ? "Saving..." : "Save Profile & Browse →"}
                    </button>

                    <p style={{
                        textAlign: "center", color: "#222222",
                        fontSize: "12px", fontFamily: "Inter, sans-serif"
                    }}>
                        You can update your profile anytime from My Profile
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CompleteProfile