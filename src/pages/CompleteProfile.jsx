// Step 1 — Import dependencies
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Step 2 — Import Firebase
import { db } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"

// Step 3 — CompleteProfile component
function CompleteProfile() {
    // Step 4 — Get userId from localStorage
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const navigate = useNavigate()

    // Step 5 — Form state
    const [college, setCollege] = useState("")
    const [city, setCity] = useState("")
    const [budget, setBudget] = useState("")
    const [gender, setGender] = useState("")
    const [lookingFor, setLookingFor] = useState("")
    const [sleepSchedule, setSleepSchedule] = useState("")
    const [cleanliness, setCleanliness] = useState("")
    const [bio, setBio] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Step 6 — Handle submit
    async function handleSubmit() {
        // Step 7 — Validation
        if(!college || !city || !budget || !gender || !lookingFor) {
            setError("Please fill all required fields")
            return
        }

        try {
            setLoading(true)
            setError("")

            // Step 8 — Update user document in Firestore
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

            // Step 9 — Redirect to browse page
            navigate("/browse")

        } catch(err) {
            setError("Something went wrong. Please try again.")
            console.log("Profile update error:", err)
        } finally {
            setLoading(false)
        }
    }

    // Step 10 — Input style reused
    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        color: "#F9FAFB",
        fontSize: "15px",
        fontFamily: "Inter, sans-serif",
        outline: "none"
    }

    const labelStyle = {
        color: "rgba(249,250,251,0.6)",
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
        display: "block",
        marginBottom: "8px"
    }

    const selectStyle = {
        ...inputStyle,
        cursor: "pointer"
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            padding: "40px 20px"
        }}>
            <div style={{
                maxWidth: "640px",
                margin: "0 auto"
            }}>
                {/* Step 11 — Header */}
                <div style={{ marginBottom: "40px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "24px",
                        cursor: "pointer"
                    }}
                        onClick={() => navigate("/")}
                    >
                        <span style={{ fontSize: "20px" }}>🏠</span>
                        <span style={{
                            color: "#F9FAFB",
                            fontSize: "18px",
                            fontWeight: "700",
                            fontFamily: "Poppins, sans-serif"
                        }}>RoomSync</span>
                    </div>

                    <h1 style={{
                        color: "#F9FAFB",
                        fontSize: "28px",
                        fontWeight: "700",
                        fontFamily: "Poppins, sans-serif",
                        marginBottom: "8px"
                    }}>Complete your profile</h1>

                    <p style={{
                        color: "rgba(249,250,251,0.5)",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif"
                    }}>
                        Hey {userName}! Tell others about yourself so they can find you.
                    </p>
                </div>

                {/* Step 12 — Progress indicator */}
                <div style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "40px"
                }}>
                    {["Basic Info", "Preferences", "About"].map((step, i) => (
                        <div key={i} style={{
                            flex: 1,
                            height: "4px",
                            borderRadius: "2px",
                            background: i === 0
                                ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                                : "rgba(255,255,255,0.1)"
                        }} />
                    ))}
                </div>

                {error && (
                    <p style={{
                        color: "#F87171",
                        fontSize: "13px",
                        marginBottom: "20px",
                        fontFamily: "Inter, sans-serif"
                    }}>{error}</p>
                )}

                {/* Step 13 — Form */}
                <div style={{
                    background: "#13102B",
                    borderRadius: "20px",
                    padding: "40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                }}>

                    {/* College */}
                    <div>
                        <label style={labelStyle}>College Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Ajinkya DY Patil University"
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
                            placeholder="e.g. Pune, Lohagaon"
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

                    {/* Gender and Looking for — side by side */}
                    <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Your Gender *</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                style={selectStyle}
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
                                style={selectStyle}
                            >
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
                                <button
                                    key={option}
                                    onClick={() => setSleepSchedule(option)}
                                    style={{
                                        flex: 1,
                                        padding: "10px 8px",
                                        background: sleepSchedule === option
                                            ? "rgba(124,58,237,0.3)"
                                            : "rgba(255,255,255,0.04)",
                                        border: sleepSchedule === option
                                            ? "1px solid #7C3AED"
                                            : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: sleepSchedule === option ? "#A78BFA" : "rgba(249,250,251,0.5)",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                        cursor: "pointer",
                                        textAlign: "center"
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cleanliness */}
                    <div>
                        <label style={labelStyle}>Cleanliness Level</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {["Very Clean", "Moderate", "Relaxed"].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setCleanliness(option)}
                                    style={{
                                        flex: 1,
                                        padding: "10px 8px",
                                        background: cleanliness === option
                                            ? "rgba(124,58,237,0.3)"
                                            : "rgba(255,255,255,0.04)",
                                        border: cleanliness === option
                                            ? "1px solid #7C3AED"
                                            : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: cleanliness === option ? "#A78BFA" : "rgba(249,250,251,0.5)",
                                        fontSize: "13px",
                                        fontFamily: "Inter, sans-serif",
                                        cursor: "pointer"
                                    }}
                                >
                                    {option}
                                </button>
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
                                ...inputStyle,
                                resize: "none",
                                lineHeight: "1.6"
                            }}
                        />
                    </div>

                    {/* Step 14 — Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: loading
                                ? "rgba(124,58,237,0.5)"
                                : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "Poppins, sans-serif",
                            boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
                            marginTop: "8px"
                        }}
                    >
                        {loading ? "Saving..." : "Save Profile & Browse →"}
                    </button>

                    <p style={{
                        textAlign: "center",
                        color: "rgba(249,250,251,0.3)",
                        fontSize: "12px",
                        fontFamily: "Inter, sans-serif"
                    }}>
                        You can update your profile anytime from settings
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CompleteProfile