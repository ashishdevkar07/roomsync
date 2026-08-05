import { useNavigate } from "react-router-dom"

function Landing() {
    const navigate = useNavigate()

    return (
        // Main container with dark background
        <div style={{
            minHeight: "100vh",
            background: "#0F0A1E",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>

            {/* Background gradient blobs for premium feel */}
            <div style={{
                position: "absolute",
                width: "600px",
                height: "600px",
                background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                top: "-100px",
                left: "-100px",
                pointerEvents: "none"
            }} />
            <div style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                background: "radial-gradient(circle, rgba(45,27,105,0.2) 0%, transparent 70%)",
                bottom: "-50px",
                right: "-50px",
                pointerEvents: "none"
            }} />

            {/* Navbar */}
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "24px 60px",
                position: "relative",
                zIndex: 10,
                borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <div style={{
                        width: "38px",
                        height: "38px",
                        background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px"
                    }}>🏠</div>
                    <span style={{
                        color: "#F9FAFB",
                        fontSize: "20px",
                        fontWeight: "700",
                        fontFamily: "Poppins, sans-serif"
                    }}>RoomSync</span>
                </div>

                {/*  Nav buttons */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            padding: "10px 24px",
                            background: "transparent",
                            color: "rgba(249,250,251,0.8)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "25px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            transition: "all 0.3s"
                        }}
                    >
                        Login
                    </button>
                    <span
                        onClick={() => navigate("/admin")}
                        style={{
                            color: "rgba(249,250,251,0.2)",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif"
                        }}
                    >
                        Admin
                    </span>
                </div>
            </nav>

            {/* Hero section */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "80px 20px",
                position: "relative",
                zIndex: 10
            }}>
                {/*Badge */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "25px",
                    padding: "8px 20px",
                    marginBottom: "32px"
                }}>
                    <span style={{ fontSize: "14px" }}>✨</span>
                    <span style={{
                        color: "#A78BFA",
                        fontSize: "13px",
                        fontWeight: "500",
                        fontFamily: "Poppins, sans-serif"
                    }}>
                        The smartest way to find your roommate
                    </span>
                </div>

                {/*Main heading */}
                <h1 style={{
                    fontSize: "72px",
                    fontWeight: "800",
                    color: "#F9FAFB",
                    fontFamily: "Poppins, sans-serif",
                    lineHeight: "1.1",
                    marginBottom: "24px",
                    maxWidth: "850px"
                }}>
                    Find your people.{" "}
                    <span style={{
                        background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Find your place.
                    </span>
                </h1>

                {/* Subheading */}
                <p style={{
                    fontSize: "18px",
                    color: "rgba(249,250,251,0.6)",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: "1.8",
                    marginBottom: "48px",
                    maxWidth: "560px"
                }}>
                    Connect with compatible roommates near your college.
                    Filter by budget, habits, location and more.
                </p>

                {/*CTA Buttons */}
                <div style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: "80px"
                }}>
                    {/* Primary button */}
                    <button
                        onClick={() => navigate("/register")}
                        style={{
                            padding: "16px 40px",
                            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                            color: "white",
                            border: "none",
                            borderRadius: "30px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            boxShadow: "0 8px 25px rgba(124,58,237,0.4)",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 12px 30px rgba(124,58,237,0.6)"
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "0 8px 25px rgba(124,58,237,0.4)"
                        }}
                    >
                        Find a Roommate →
                    </button>

                    {/* Secondary button */}
                    <button
                        onClick={() => navigate("/browse")}
                        style={{
                            padding: "16px 40px",
                            background: "transparent",
                            color: "#F9FAFB",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "30px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                            transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = "#7C3AED"
                            e.target.style.color = "#A78BFA"
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = "rgba(255,255,255,0.2)"
                            e.target.style.color = "#F9FAFB"
                        }}
                    >
                        Browse Listings
                    </button>
                </div>

                {/* Stats row */}
                <div style={{
                    display: "flex",
                    gap: "60px",
                    flexWrap: "wrap",
                    justifyContent: "center"
                }}>
                    {[
                        { number: "2,400+", label: "Active Listings" },
                        { number: "180+", label: "Colleges Covered" },
                        { number: "94%", label: "Match Success Rate" },
                        { number: "4.8★", label: "User Rating" }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <p style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#A78BFA",
                                fontFamily: "Poppins, sans-serif",
                                marginBottom: "4px"
                            }}>{stat.number}</p>
                            <p style={{
                                fontSize: "13px",
                                color: "rgba(249,250,251,0.5)",
                                fontFamily: "Inter, sans-serif"
                            }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/*How it works section */}
            <div style={{
                background: "rgba(255,255,255,0.03)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "80px 60px",
                position: "relative",
                zIndex: 10
            }}>
                <h2 style={{
                    textAlign: "center",
                    color: "#F9FAFB",
                    fontSize: "36px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    fontFamily: "Poppins, sans-serif"
                }}>How it works</h2>
                <p style={{
                    textAlign: "center",
                    color: "rgba(249,250,251,0.5)",
                    marginBottom: "60px",
                    fontFamily: "Inter, sans-serif"
                }}>
                    Find your perfect roommate in 3 simple steps
                </p>

                {/* steps cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "24px",
                    maxWidth: "900px",
                    margin: "0 auto"
                }}>
                    {[
                        {
                            step: "01",
                            icon: "📝",
                            title: "Create your profile",
                            desc: "Fill in your preferences — budget, location, habits, college and what you're looking for."
                        },
                        {
                            step: "02",
                            icon: "🔍",
                            title: "Browse and filter",
                            desc: "Search through verified profiles. Filter by budget, area, gender and compatibility."
                        },
                        {
                            step: "03",
                            icon: "🤝",
                            title: "Connect and move in",
                            desc: "Send a connection request. Chat, confirm compatibility, and find your perfect place."
                        }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "20px",
                            padding: "32px 28px",
                            transition: "all 0.3s"
                        }}>
                            <div style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#7C3AED",
                                letterSpacing: "2px",
                                marginBottom: "16px",
                                fontFamily: "Poppins, sans-serif"
                            }}>STEP {item.step}</div>
                            <div style={{ fontSize: "36px", marginBottom: "16px" }}>{item.icon}</div>
                            <h3 style={{
                                color: "#F9FAFB",
                                fontSize: "18px",
                                fontWeight: "600",
                                marginBottom: "10px",
                                fontFamily: "Poppins, sans-serif"
                            }}>{item.title}</h3>
                            <p style={{
                                color: "rgba(249,250,251,0.5)",
                                fontSize: "14px",
                                lineHeight: "1.7",
                                fontFamily: "Inter, sans-serif"
                            }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "24px 60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 10
            }}>
                <span style={{
                    color: "rgba(249,250,251,0.4)",
                    fontSize: "14px",
                    fontFamily: "Inter, sans-serif",

                }}>
                    © 2025 RoomSync. All rights reserved.
                </span>
            </div>
        </div>
    )
}

export default Landing