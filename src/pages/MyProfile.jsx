// Step 1 — Import dependencies
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

function MyProfile() {
    const navigate = useNavigate()
    const userId = localStorage.getItem("userId")
    const fileInputRef = useRef(null)

    // Step 2 — State for user data
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState("preview")
    const [successMsg, setSuccessMsg] = useState("")
    const [error, setError] = useState("")

    // Step 3 — Edit form state
    const [college, setCollege] = useState("")
    const [city, setCity] = useState("")
    const [budget, setBudget] = useState("")
    const [gender, setGender] = useState("")
    const [lookingFor, setLookingFor] = useState("")
    const [sleepSchedule, setSleepSchedule] = useState("")
    const [cleanliness, setCleanliness] = useState("")
    const [bio, setBio] = useState("")
    const [profileImage, setProfileImage] = useState("")

    // Step 4 — Cloudinary config
    const CLOUD_NAME = "wgi3le8f"    
    const UPLOAD_PRESET = "roomsync"        

    // Step 5 — Fetch user data from Firestore
    useEffect(() => {
        async function fetchUser() {
            if(!userId) { navigate("/login"); return }
            try {
                const userRef = doc(db, "users", userId)
                const userSnap = await getDoc(userRef)
                if(userSnap.exists()) {
                    const data = userSnap.data()
                    setUserData(data)

                    // Step 6 — Pre-fill form with existing data
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

    // Step 7 — Handle image upload to Cloudinary
    async function handleImageUpload(e) {
        const file = e.target.files[0]
        if(!file) return

        // Check file size — max 5MB
        if(file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB")
            return
        }

        try {
            setUploading(true)
            setError("")

            // Step 8 — Create form data for Cloudinary
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", UPLOAD_PRESET)
            formData.append("folder", "roomsync/profiles")

            // Step 9 — Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            )

            const data = await response.json()

            if(data.secure_url) {
                setProfileImage(data.secure_url)

                // Step 10 — Save image URL to Firestore immediately
                const userRef = doc(db, "users", userId)
                await updateDoc(userRef, { profileImage: data.secure_url })
                setSuccessMsg("Profile image updated!")
                setTimeout(() => setSuccessMsg(""), 3000)
            }

        } catch(err) {
            setError("Image upload failed. Please try again.")
            console.log("Upload error:", err)
        } finally {
            setUploading(false)
        }
    }

    // Step 11 — Handle profile save
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
                college,
                city,
                budget: Number(budget),
                gender,
                lookingFor,
                sleepSchedule,
                cleanliness,
                bio,
                profileComplete: true,
                updatedAt: new Date().toISOString()
            })

            setSuccessMsg("Profile updated successfully!")
            setTimeout(() => setSuccessMsg(""), 3000)

        } catch(err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    // Step 12 — Reusable styles
    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
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

    if(loading) return (
        <div style={{
            minHeight: "100vh", background: "#0F0A1E",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <p style={{ color: "#A78BFA", fontFamily: "Poppins, sans-serif" }}>
                Loading your profile...
            </p>
        </div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#0F0A1E" }}>

            {/* ── NAVBAR ── */}
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
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "10px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "16px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB", fontSize: "18px",
                        fontWeight: "700", fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif",
                        cursor: "pointer"
                    }}>Dashboard</button>
                    <button onClick={() => navigate("/browse")} style={{
                        padding: "8px 16px", background: "transparent",
                        color: "rgba(249,250,251,0.6)", border: "none",
                        fontSize: "14px", fontFamily: "Poppins, sans-serif",
                        cursor: "pointer"
                    }}>Browse</button>
                </div>
            </nav>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

                {/* ── PAGE TITLE ── */}
                <h1 style={{
                    color: "#F9FAFB", fontSize: "26px",
                    fontWeight: "700", fontFamily: "Poppins, sans-serif",
                    marginBottom: "8px"
                }}>My Profile</h1>
                <p style={{
                    color: "rgba(249,250,251,0.4)",
                    fontSize: "14px", fontFamily: "Inter, sans-serif",
                    marginBottom: "32px"
                }}>Manage how others see you on RoomSync</p>

                {/* ── SUCCESS / ERROR MESSAGES ── */}
                {successMsg && (
                    <div style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "12px", padding: "12px 20px",
                        marginBottom: "20px", color: "#4ADE80",
                        fontFamily: "Inter, sans-serif", fontSize: "14px"
                    }}>✅ {successMsg}</div>
                )}
                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "12px", padding: "12px 20px",
                        marginBottom: "20px", color: "#F87171",
                        fontFamily: "Inter, sans-serif", fontSize: "14px"
                    }}>❌ {error}</div>
                )}

                {/* ── PROFILE IMAGE SECTION ── */}
                <div style={{
                    background: "#13102B",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "20px", padding: "28px",
                    marginBottom: "24px",
                    display: "flex", alignItems: "center", gap: "24px"
                }}>
                    {/* Profile image / avatar */}
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: "100px", height: "100px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: `linear-gradient(135deg, ${
                                gender === "Female" ? "#EC4899, #A855F7" :
                                gender === "Male" ? "#3B82F6, #6366F1" :
                                "#7C3AED, #4F46E5"
                            })`,
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            border: "3px solid rgba(124,58,237,0.4)"
                        }}>
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <span style={{
                                    fontSize: "40px", fontWeight: "700",
                                    color: "white", fontFamily: "Poppins, sans-serif"
                                }}>
                                    {userData?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Upload button overlay */}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                position: "absolute", bottom: "0", right: "0",
                                width: "32px", height: "32px",
                                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                borderRadius: "50%", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", fontSize: "14px",
                                border: "2px solid #0F0A1E"
                            }}
                        >📷</div>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                    />

                    {/* Info */}
                    <div>
                        <h2 style={{
                            color: "#F9FAFB", fontSize: "20px",
                            fontWeight: "700", fontFamily: "Poppins, sans-serif",
                            marginBottom: "4px"
                        }}>{userData?.name}</h2>
                        <p style={{
                            color: "rgba(249,250,251,0.4)",
                            fontSize: "13px", fontFamily: "Inter, sans-serif",
                            marginBottom: "12px"
                        }}>{userData?.email}</p>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            style={{
                                padding: "8px 20px",
                                background: "rgba(124,58,237,0.15)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                borderRadius: "20px", color: "#A78BFA",
                                fontSize: "13px", fontFamily: "Poppins, sans-serif",
                                cursor: "pointer"
                            }}
                        >
                            {uploading ? "Uploading..." : "📷 Change Photo"}
                        </button>
                        <p style={{
                            color: "rgba(249,250,251,0.3)",
                            fontSize: "11px", fontFamily: "Inter, sans-serif",
                            marginTop: "6px"
                        }}>Max 5MB — JPG, PNG, WebP</p>
                    </div>
                </div>

                {/* ── TABS ── */}
                <div style={{
                    display: "flex", gap: "8px", marginBottom: "24px"
                }}>
                    {[
                        { id: "preview", label: "👁️ Preview" },
                        { id: "edit", label: "✏️ Edit Profile" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 24px",
                                background: activeTab === tab.id
                                    ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                                    : "transparent",
                                color: activeTab === tab.id
                                    ? "white"
                                    : "rgba(249,250,251,0.5)",
                                border: activeTab === tab.id
                                    ? "none"
                                    : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "25px", fontSize: "14px",
                                fontFamily: "Poppins, sans-serif",
                                cursor: "pointer", fontWeight: "600"
                            }}
                        >{tab.label}</button>
                    ))}
                </div>

                {/* ── PREVIEW TAB ── */}
                {activeTab === "preview" && (
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px", overflow: "hidden"
                    }}>
                        {/* Cover */}
                        <div style={{
                            height: "120px",
                            background: `linear-gradient(135deg, ${
                                gender === "Female" ? "#EC4899, #A855F7" :
                                gender === "Male" ? "#3B82F6, #6366F1" :
                                "#7C3AED, #4F46E5"
                            })`
                        }} />

                        <div style={{ padding: "0 28px 28px" }}>
                            {/* Avatar on preview */}
                            <div style={{
                                width: "80px", height: "80px",
                                borderRadius: "50%", overflow: "hidden",
                                background: `linear-gradient(135deg, ${
                                    gender === "Female" ? "#EC4899, #A855F7" :
                                    gender === "Male" ? "#3B82F6, #6366F1" :
                                    "#7C3AED, #4F46E5"
                                })`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center",
                                marginTop: "-40px",
                                border: "3px solid #13102B"
                            }}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{
                                        fontSize: "32px", fontWeight: "700",
                                        color: "white", fontFamily: "Poppins, sans-serif"
                                    }}>{userData?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>

                            <h2 style={{
                                color: "#F9FAFB", fontSize: "22px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginTop: "12px", marginBottom: "4px"
                            }}>{userData?.name}</h2>

                            <p style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "13px", fontFamily: "Inter, sans-serif",
                                marginBottom: "16px"
                            }}>
                                🎓 {college || "No college added"} &nbsp;•&nbsp; 📍 {city || "No city added"}
                            </p>

                            {/* Details grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px", marginBottom: "16px"
                            }}>
                                {[
                                    { label: "Budget", value: budget ? `₹${Number(budget).toLocaleString()}/mo` : "Not set" },
                                    { label: "Gender", value: gender || "Not set" },
                                    { label: "Looking For", value: lookingFor || "Not set" },
                                    { label: "Sleep Schedule", value: sleepSchedule || "Not set" },
                                    { label: "Cleanliness", value: cleanliness || "Not set" }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: "12px 16px",
                                        background: "rgba(255,255,255,0.04)",
                                        borderRadius: "12px"
                                    }}>
                                        <p style={{
                                            color: "rgba(249,250,251,0.4)",
                                            fontSize: "11px", fontFamily: "Inter, sans-serif",
                                            marginBottom: "4px", textTransform: "uppercase"
                                        }}>{item.label}</p>
                                        <p style={{
                                            color: "#F9FAFB", fontSize: "14px",
                                            fontFamily: "Inter, sans-serif", fontWeight: "500"
                                        }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bio */}
                            {bio && (
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(255,255,255,0.04)",
                                    borderRadius: "12px"
                                }}>
                                    <p style={{
                                        color: "rgba(249,250,251,0.4)",
                                        fontSize: "11px", fontFamily: "Inter, sans-serif",
                                        marginBottom: "6px", textTransform: "uppercase"
                                    }}>About</p>
                                    <p style={{
                                        color: "rgba(249,250,251,0.7)",
                                        fontSize: "14px", fontFamily: "Inter, sans-serif",
                                        lineHeight: "1.7"
                                    }}>{bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── EDIT TAB ── */}
                {activeTab === "edit" && (
                    <div style={{
                        background: "#13102B",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px", padding: "28px",
                        display: "flex", flexDirection: "column", gap: "20px"
                    }}>
                        {/* College */}
                        <div>
                            <label style={labelStyle}>College Name *</label>
                            <input
                                type="text"
                                placeholder="Your college"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label style={labelStyle}>City / Area *</label>
                            <input
                                type="text"
                                placeholder="Your city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={inputStyle}
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
                            />
                        </div>

                        {/* Gender + Looking for */}
                        <div style={{ display: "flex", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Your Gender *</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Looking For *</label>
                                <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} style={inputStyle}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Any">Any</option>
                                </select>
                            </div>
                        </div>

                        {/* Sleep schedule */}
                        <div>
                            <label style={labelStyle}>Sleep Schedule</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {["Early Bird (Before 11pm)", "Night Owl (After 12am)", "Flexible"].map((option) => (
                                    <button key={option} onClick={() => setSleepSchedule(option)} style={{
                                        flex: 1, padding: "10px 8px",
                                        background: sleepSchedule === option
                                            ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                                        border: sleepSchedule === option
                                            ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: sleepSchedule === option ? "#A78BFA" : "rgba(249,250,251,0.5)",
                                        fontSize: "12px", fontFamily: "Inter, sans-serif",
                                        cursor: "pointer", textAlign: "center"
                                    }}>{option}</button>
                                ))}
                            </div>
                        </div>

                        {/* Cleanliness */}
                        <div>
                            <label style={labelStyle}>Cleanliness Level</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {["Very Clean", "Moderate", "Relaxed"].map((option) => (
                                    <button key={option} onClick={() => setCleanliness(option)} style={{
                                        flex: 1, padding: "10px 8px",
                                        background: cleanliness === option
                                            ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                                        border: cleanliness === option
                                            ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: cleanliness === option ? "#A78BFA" : "rgba(249,250,251,0.5)",
                                        fontSize: "13px", fontFamily: "Inter, sans-serif",
                                        cursor: "pointer"
                                    }}>{option}</button>
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={labelStyle}>About Yourself</label>
                            <textarea
                                placeholder="Tell potential roommates about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                            />
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: "100%", padding: "14px",
                                background: saving
                                    ? "rgba(124,58,237,0.5)"
                                    : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                                color: "white", border: "none",
                                borderRadius: "12px", fontSize: "16px",
                                fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                                fontFamily: "Poppins, sans-serif",
                                boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                            }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyProfile