import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

function MyProfile() {
    const navigate = useNavigate()
    const userId = localStorage.getItem("userId")
    const fileInputRef = useRef(null)
    const collegeInputRef = useRef(null)
    const cityInputRef = useRef(null)

    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState("preview")
    const [successMsg, setSuccessMsg] = useState("")
    const [error, setError] = useState("")

    const [college, setCollege] = useState("")
    const [city, setCity] = useState("")
    const [budget, setBudget] = useState("")
    const [gender, setGender] = useState("")
    const [lookingFor, setLookingFor] = useState("")
    const [sleepSchedule, setSleepSchedule] = useState("")
    const [cleanliness, setCleanliness] = useState("")
    const [bio, setBio] = useState("")
    const [profileImage, setProfileImage] = useState("")

    const CLOUD_NAME = "wgi3le8f"
    const UPLOAD_PRESET = "roomsync"

    useEffect(() => {
        async function fetchUser() {
            if(!userId) { navigate("/login"); return }
            try {
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                if(userSnap.exists()) {
                    const data = userSnap.data()
                    setUserData(data)
                    setCollege(data.college || "")
                    setCity(data.city || "")
                    setBudget(data.budget || "")
                    setGender(data.gender || "")
                    setLookingFor(data.lookingFor || "")
                    setSleepSchedule(data.sleepSchedule || "")
                    setCleanliness(data.cleanliness || "")
                    setBio(data.bio || "")
                    setProfileImage(data.profileImage || "")
                }
            } catch(err) {
                console.log("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    useEffect(() => {
        if(loading || !collegeInputRef.current) return
        const ac1 = new window.google.maps.places.Autocomplete(
            collegeInputRef.current,
            { types: ["establishment"], componentRestrictions: { country: "in" }, fields: ["name"] }
        )
        ac1.addListener("place_changed", () => {
            const place = ac1.getPlace()
            if(place.name) setCollege(place.name)
        })
    }, [loading])

    useEffect(() => {
        if(loading || !cityInputRef.current) return
        const ac2 = new window.google.maps.places.Autocomplete(
            cityInputRef.current,
            { types: ["(cities)"], componentRestrictions: { country: "in" } }
        )
        ac2.addListener("place_changed", () => {
            const place = ac2.getPlace()
            if(place.formatted_address) setCity(place.formatted_address)
        })
    }, [loading])

    async function handleImageUpload(e) {
        const file = e.target.files[0]
        if(!file) return
        if(file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB")
            return
        }
        try {
            setUploading(true)
            setError("")
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", UPLOAD_PRESET)
            formData.append("folder", "roomsync/profiles")

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            )
            const data = await response.json()
            if(data.secure_url) {
                setProfileImage(data.secure_url)
                const userRef = doc(db, "users", userId)
                await updateDoc(userRef, { profileImage: data.secure_url })
                setSuccessMsg("Photo updated!")
                setTimeout(() => setSuccessMsg(""), 3000)
            }
        } catch(err) {
            setError("Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    async function handleSave() {
        if(!college || !city || !budget || !gender || !lookingFor) {
            setError("Please fill all required fields")
            return
        }
        try {
            setSaving(true)
            setError("")
            const userRef = doc(db, "users", userId)
            await updateDoc(userRef, {
                college, city, budget: Number(budget),
                gender, lookingFor, sleepSchedule,
                cleanliness, bio, profileComplete: true,
                updatedAt: new Date().toISOString()
            })
            setSuccessMsg("Profile updated!")
            setTimeout(() => setSuccessMsg(""), 3000)
        } catch(err) {
            setError("Something went wrong.")
        } finally {
            setSaving(false)
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

    const gradientColor = gender === "Female" ? "#EC4899, #A855F7" :
        gender === "Male" ? "#3B82F6, #6366F1" : "#F59E0B, #D97706"

    if(loading) return (
        <div style={{
            minHeight: "100vh", background: "#000000",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: "16px"
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}>
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "9px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "15px", boxShadow: "0 0 15px rgba(245,158,11,0.3)"
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
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Browse</button>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "#444444", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif", cursor: "pointer"
                    }}>Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 20px" }}>

                {/* Page title */}
                <h1 style={{
                    color: "#FFFFFF", fontSize: "26px",
                    fontWeight: "800", fontFamily: "Poppins, sans-serif",
                    marginBottom: "4px"
                }}>My Profile</h1>
                <p style={{
                    color: "#333333", fontSize: "13px",
                    fontFamily: "Inter, sans-serif", marginBottom: "28px"
                }}>Manage how others see you</p>

                {/* Messages */}
                {successMsg && (
                    <div style={{
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: "12px", padding: "12px 18px",
                        color: "#4ADE80", fontSize: "13px",
                        fontFamily: "Inter, sans-serif", marginBottom: "20px"
                    }}>✅ {successMsg}</div>
                )}
                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "12px", padding: "12px 18px",
                        color: "#F87171", fontSize: "13px",
                        fontFamily: "Inter, sans-serif", marginBottom: "20px"
                    }}>❌ {error}</div>
                )}

                {/* Photo section */}
                <div style={{
                    background: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    borderRadius: "20px", padding: "24px",
                    marginBottom: "20px",
                    display: "flex", alignItems: "center", gap: "20px"
                }}>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: "88px", height: "88px",
                            borderRadius: "50%", overflow: "hidden",
                            background: `linear-gradient(135deg, ${gradientColor})`,
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            border: "3px solid #1A1A1A"
                        }}>
                            {profileImage ? (
                                <img src={profileImage} alt="Profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{
                                    fontSize: "34px", fontWeight: "700",
                                    color: "white", fontFamily: "Poppins, sans-serif"
                                }}>{userData?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div onClick={() => fileInputRef.current.click()} style={{
                            position: "absolute", bottom: "0", right: "0",
                            width: "28px", height: "28px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: "12px",
                            border: "2px solid #000",
                            boxShadow: "0 0 10px rgba(245,158,11,0.4)"
                        }}>📷</div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*"
                        onChange={handleImageUpload} style={{ display: "none" }} />

                    <div>
                        <h2 style={{
                            color: "#FFFFFF", fontSize: "18px",
                            fontWeight: "700", fontFamily: "Poppins, sans-serif",
                            marginBottom: "4px"
                        }}>{userData?.name}</h2>
                        <p style={{
                            color: "#333333", fontSize: "12px",
                            fontFamily: "Inter, sans-serif", marginBottom: "12px"
                        }}>{userData?.email}</p>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            style={{
                                padding: "8px 18px",
                                background: "transparent",
                                border: "1px solid #1A1A1A",
                                borderRadius: "20px", color: "#444444",
                                fontSize: "12px", fontFamily: "Poppins, sans-serif",
                                cursor: "pointer", transition: "all 0.3s"
                            }}
                            onMouseEnter={e => {
                                e.target.style.borderColor = "#F59E0B"
                                e.target.style.color = "#F59E0B"
                            }}
                            onMouseLeave={e => {
                                e.target.style.borderColor = "#1A1A1A"
                                e.target.style.color = "#444444"
                            }}
                        >
                            {uploading ? "Uploading..." : "📷 Change Photo"}
                        </button>
                        <p style={{
                            color: "#222222", fontSize: "11px",
                            fontFamily: "Inter, sans-serif", marginTop: "6px"
                        }}>Max 5MB — JPG, PNG, WebP</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    {[
                        { id: "preview", label: "👁️ Preview" },
                        { id: "edit", label: "✏️ Edit" }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: "10px 24px",
                            background: activeTab === tab.id
                                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                : "transparent",
                            color: activeTab === tab.id ? "#000000" : "#333333",
                            border: activeTab === tab.id ? "none" : "1px solid #1A1A1A",
                            borderRadius: "25px", fontSize: "13px",
                            fontFamily: "Poppins, sans-serif",
                            cursor: "pointer", fontWeight: "700",
                            transition: "all 0.3s"
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* Preview Tab */}
                {activeTab === "preview" && (
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", overflow: "hidden"
                    }}>
                        <div style={{
                            height: "120px",
                            background: `linear-gradient(135deg, ${gradientColor})`
                        }} />
                        <div style={{ padding: "0 28px 28px" }}>
                            <div style={{
                                width: "72px", height: "72px",
                                borderRadius: "50%", overflow: "hidden",
                                background: `linear-gradient(135deg, ${gradientColor})`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center",
                                marginTop: "-36px",
                                border: "3px solid #0A0A0A"
                            }}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{
                                        fontSize: "28px", fontWeight: "700",
                                        color: "white", fontFamily: "Poppins, sans-serif"
                                    }}>{userData?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>

                            <h2 style={{
                                color: "#FFFFFF", fontSize: "20px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginTop: "12px", marginBottom: "4px"
                            }}>{userData?.name}</h2>
                            <p style={{
                                color: "#333333", fontSize: "13px",
                                fontFamily: "Inter, sans-serif", marginBottom: "20px"
                            }}>
                                🎓 {college || "No college"} &nbsp;•&nbsp; 📍 {city?.split(",")[0] || "No city"}
                            </p>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px", marginBottom: "16px"
                            }}>
                                {[
                                    { label: "Budget", value: budget ? `₹${Number(budget).toLocaleString()}/mo` : "Not set" },
                                    { label: "Gender", value: gender || "Not set" },
                                    { label: "Looking For", value: lookingFor || "Not set" },
                                    { label: "Sleep", value: sleepSchedule?.split(" ")[0] || "Not set" },
                                    { label: "Cleanliness", value: cleanliness || "Not set" }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: "12px 14px",
                                        background: "#111111",
                                        borderRadius: "12px"
                                    }}>
                                        <p style={{
                                            color: "#222222", fontSize: "10px",
                                            fontFamily: "Inter, sans-serif",
                                            textTransform: "uppercase", marginBottom: "4px"
                                        }}>{item.label}</p>
                                        <p style={{
                                            color: "#FFFFFF", fontSize: "13px",
                                            fontFamily: "Inter, sans-serif", fontWeight: "600"
                                        }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {bio && (
                                <div style={{
                                    padding: "16px", background: "#111111",
                                    borderRadius: "12px"
                                }}>
                                    <p style={{
                                        color: "#222222", fontSize: "10px",
                                        fontFamily: "Inter, sans-serif",
                                        textTransform: "uppercase", marginBottom: "8px"
                                    }}>About</p>
                                    <p style={{
                                        color: "#666666", fontSize: "14px",
                                        fontFamily: "Inter, sans-serif", lineHeight: "1.7"
                                    }}>{bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Tab */}
                {activeTab === "edit" && (
                    <div style={{
                        background: "#0A0A0A",
                        border: "1px solid #1A1A1A",
                        borderRadius: "20px", padding: "28px",
                        display: "flex", flexDirection: "column", gap: "20px"
                    }}>
                        <div>
                            <label style={labelStyle}>College Name *</label>
                            <input ref={collegeInputRef} type="text"
                                placeholder="Your college"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>City / Area *</label>
                            <input ref={cityInputRef} type="text"
                                placeholder="Your city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Monthly Budget (₹) *</label>
                            <input type="number" placeholder="e.g. 5000"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Gender *</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)}
                                    style={{ ...inputStyle, cursor: "pointer" }}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Looking For *</label>
                                <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)}
                                    style={{ ...inputStyle, cursor: "pointer" }}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Any">Any</option>
                                </select>
                            </div>
                        </div>

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

                        <div>
                            <label style={labelStyle}>Cleanliness</label>
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

                        <div>
                            <label style={labelStyle}>About Yourself</label>
                            <textarea
                                placeholder="Tell potential roommates about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
                                onBlur={e => e.target.style.borderColor = "#1A1A1A"}
                            />
                        </div>

                        <button onClick={handleSave} disabled={saving} style={{
                            width: "100%", padding: "15px",
                            background: saving
                                ? "rgba(245,158,11,0.3)"
                                : "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#000000", border: "none",
                            borderRadius: "12px", fontSize: "15px",
                            fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
                            fontFamily: "Poppins, sans-serif",
                            boxShadow: saving ? "none" : "0 0 25px rgba(245,158,11,0.3)",
                            transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                if(!saving) {
                                    e.target.style.transform = "translateY(-2px)"
                                    e.target.style.boxShadow = "0 0 35px rgba(245,158,11,0.5)"
                                }
                            }}
                            onMouseLeave={e => {
                                e.target.style.transform = "translateY(0)"
                                if(!saving) e.target.style.boxShadow = "0 0 25px rgba(245,158,11,0.3)"
                            }}
                        >
                            {saving ? "Saving..." : "Save Changes →"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyProfile