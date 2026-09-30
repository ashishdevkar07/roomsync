import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Landing() {
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Trigger entrance animations
        setTimeout(() => setVisible(true), 100)

        // Navbar scroll effect
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div style={{
            minHeight: "100vh",
            background: "#000000",
            color: "#FFFFFF",
            overflow: "hidden"
        }}>

            {/* ── ANIMATED BACKGROUND ── */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                {/* Gold glow top left */}
                <div style={{
                    position: "absolute",
                    width: "600px", height: "600px",
                    background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
                    top: "-200px", left: "-200px",
                    animation: "pulse 4s ease-in-out infinite"
                }} />
                {/* Gold glow bottom right */}
                <div style={{
                    position: "absolute",
                    width: "500px", height: "500px",
                    background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
                    bottom: "-100px", right: "-100px",
                    animation: "pulse 4s ease-in-out infinite 2s"
                }} />
                {/* Grid pattern */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }} />
            </div>

            {/* ── NAVBAR ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0,
                zIndex: 100,
                padding: "20px 60px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: scrolled ? "rgba(0,0,0,0.9)" : "transparent",
                backdropFilter: scrolled ? "blur(20px)" : "none",
                borderBottom: scrolled ? "1px solid #222" : "none",
                transition: "all 0.4s ease"
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    cursor: "pointer",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(-20px)",
                    transition: "all 0.6s ease"
                }}>
                    <div style={{
                        width: "36px", height: "36px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "18px",
                        boxShadow: "0 0 20px rgba(245,158,11,0.4)"
                    }}>🏠</div>
                    <span style={{
                        fontSize: "20px", fontWeight: "800",
                        fontFamily: "Poppins, sans-serif",
                        background: "linear-gradient(135deg, #FFFFFF, #888888)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>RoomSync</span>
                </div>

                {/* Nav links */}
                <div style={{
                    display: "flex", gap: "8px", alignItems: "center",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(-20px)",
                    transition: "all 0.6s ease 0.1s"
                }}>
                    <button onClick={() => navigate("/login")} style={{
                        padding: "10px 24px",
                        background: "transparent",
                        color: "#888888",
                        border: "1px solid #222222",
                        borderRadius: "25px",
                        fontSize: "14px",
                        fontFamily: "Poppins, sans-serif",
                        cursor: "pointer",
                        transition: "all 0.3s"
                    }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = "#F59E0B"
                            e.target.style.color = "#F59E0B"
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = "#222222"
                            e.target.style.color = "#888888"
                        }}
                    >Login</button>
                    <button onClick={() => navigate("/admin-login")} style={{
                        padding: "10px 24px",
                        background: "transparent",
                        color: "#444444",
                        border: "none",
                        fontSize: "13px",
                        fontFamily: "Poppins, sans-serif",
                        cursor: "pointer"
                    }}>Admin</button>
                </div>
            </nav>

            {/* ── HERO SECTION ── */}
            <div style={{
                position: "relative", zIndex: 1,
                minHeight: "100vh",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center",
                padding: "120px 20px 80px"
            }}>
                {/* Badge */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: "25px", padding: "8px 20px",
                    marginBottom: "40px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s ease 0.2s"
                }}>
                    <span style={{
                        width: "6px", height: "6px",
                        background: "#F59E0B",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite"
                    }} />
                    <span style={{
                        color: "#F59E0B", fontSize: "13px",
                        fontWeight: "500", fontFamily: "Inter, sans-serif"
                    }}>India's smartest roommate finder</span>
                </div>

                {/* Main heading */}
                <h1 style={{
                    fontSize: "80px", fontWeight: "800",
                    fontFamily: "Poppins, sans-serif",
                    lineHeight: "1.05", marginBottom: "24px",
                    maxWidth: "900px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease 0.3s"
                }}>
                    Find your people.
                    <br />
                    <span style={{
                        background: "linear-gradient(135deg, #F59E0B, #FCD34D, #D97706)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block"
                    }}>
                        Find your place.
                    </span>
                </h1>

                {/* Subtext */}
                <p style={{
                    fontSize: "18px", color: "#888888",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: "1.8", marginBottom: "52px",
                    maxWidth: "560px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease 0.4s"
                }}>
                    Connect with compatible roommates near your college.
                    Smart matching. Real profiles. Zero hassle.
                </p>

                {/* CTA Buttons */}
                <div style={{
                    display: "flex", gap: "16px",
                    flexWrap: "wrap", justifyContent: "center",
                    marginBottom: "80px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease 0.5s"
                }}>
                    <button onClick={() => navigate("/register")} style={{
                        padding: "18px 44px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        color: "#000000",
                        border: "none",
                        borderRadius: "30px",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                        boxShadow: "0 0 40px rgba(245,158,11,0.4)",
                        transition: "all 0.3s"
                    }}
                        onMouseEnter={e => {
                            e.target.style.transform = "translateY(-3px) scale(1.02)"
                            e.target.style.boxShadow = "0 0 60px rgba(245,158,11,0.6)"
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0) scale(1)"
                            e.target.style.boxShadow = "0 0 40px rgba(245,158,11,0.4)"
                        }}
                    >
                        Find a Roommate →
                    </button>

                    <button onClick={() => navigate("/register")} style={{
                        padding: "18px 44px",
                        background: "transparent",
                        color: "#FFFFFF",
                        border: "1px solid #333333",
                        borderRadius: "30px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                        transition: "all 0.3s"
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#F59E0B"
                            e.currentTarget.style.color = "#F59E0B"
                            e.currentTarget.style.transform = "translateY(-3px)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#333333"
                            e.currentTarget.style.color = "#FFFFFF"
                            e.currentTarget.style.transform = "translateY(0)"
                        }}
                    >
                        List Your Room
                    </button>
                </div>

                {/* Stats */}
                <div style={{
                    display: "flex", gap: "60px",
                    flexWrap: "wrap", justifyContent: "center",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease 0.6s"
                }}>
                    {[
                        { number: "2,400+", label: "Active Listings" },
                        { number: "180+", label: "Colleges" },
                        { number: "94%", label: "Match Rate" },
                        { number: "4.9★", label: "Rating" }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <p style={{
                                fontSize: "32px", fontWeight: "800",
                                fontFamily: "Poppins, sans-serif",
                                background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "4px"
                            }}>{stat.number}</p>
                            <p style={{
                                fontSize: "13px", color: "#555555",
                                fontFamily: "Inter, sans-serif"
                            }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <div style={{
                position: "relative", zIndex: 1,
                padding: "100px 60px",
                borderTop: "1px solid #111111"
            }}>
                <div style={{ textAlign: "center", marginBottom: "70px" }}>
                    <p style={{
                        color: "#F59E0B", fontSize: "12px",
                        fontWeight: "600", letterSpacing: "3px",
                        fontFamily: "Inter, sans-serif",
                        textTransform: "uppercase", marginBottom: "16px"
                    }}>HOW IT WORKS</p>
                    <h2 style={{
                        fontSize: "44px", fontWeight: "800",
                        fontFamily: "Poppins, sans-serif", color: "#FFFFFF",
                        marginBottom: "16px"
                    }}>Three steps to your<br />perfect match</h2>
                    <p style={{
                        color: "#555555", fontSize: "16px",
                        fontFamily: "Inter, sans-serif"
                    }}>Simple, fast, and secure</p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px", maxWidth: "1000px", margin: "0 auto"
                }}>
                    {[
                        {
                            step: "01",
                            icon: "📝",
                            title: "Create your profile",
                            desc: "Fill in your preferences — budget, location, habits and college. Takes less than 2 minutes."
                        },
                        {
                            step: "02",
                            icon: "🔍",
                            title: "Browse and filter",
                            desc: "Search verified profiles. Filter by budget, area, gender and use our AI to find perfect matches."
                        },
                        {
                            step: "03",
                            icon: "🤝",
                            title: "Connect and move in",
                            desc: "Send interest, connect, confirm compatibility and find your perfect place."
                        }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "24px",
                            padding: "36px 30px",
                            transition: "all 0.4s ease",
                            cursor: "default",
                            position: "relative",
                            overflow: "hidden"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#F59E0B"
                                e.currentTarget.style.transform = "translateY(-8px)"
                                e.currentTarget.style.boxShadow = "0 20px 60px rgba(245,158,11,0.1)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1A1A1A"
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "none"
                            }}
                        >
                            {/* Step number */}
                            <p style={{
                                position: "absolute", top: "20px", right: "24px",
                                fontSize: "48px", fontWeight: "900",
                                color: "#1A1A1A", fontFamily: "Poppins, sans-serif"
                            }}>{item.step}</p>

                            <div style={{ fontSize: "40px", marginBottom: "20px" }}>{item.icon}</div>
                            <h3 style={{
                                color: "#FFFFFF", fontSize: "20px",
                                fontWeight: "700", fontFamily: "Poppins, sans-serif",
                                marginBottom: "12px"
                            }}>{item.title}</h3>
                            <p style={{
                                color: "#555555", fontSize: "14px",
                                fontFamily: "Inter, sans-serif", lineHeight: "1.8"
                            }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FEATURES SECTION ── */}
            <div style={{
                position: "relative", zIndex: 1,
                padding: "100px 60px",
                borderTop: "1px solid #111111"
            }}>
                <div style={{ textAlign: "center", marginBottom: "70px" }}>
                    <p style={{
                        color: "#F59E0B", fontSize: "12px",
                        fontWeight: "600", letterSpacing: "3px",
                        fontFamily: "Inter, sans-serif",
                        textTransform: "uppercase", marginBottom: "16px"
                    }}>WHY ROOMSYNC</p>
                    <h2 style={{
                        fontSize: "44px", fontWeight: "800",
                        fontFamily: "Poppins, sans-serif", color: "#FFFFFF"
                    }}>Everything you need<br />to find the right fit</h2>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px", maxWidth: "1000px", margin: "0 auto"
                }}>
                    {[
                        { icon: "📍", title: "Location Based", desc: "Find roommates near your college or workplace" },
                        { icon: "✅", title: "Verified Profiles", desc: "All profiles are student verified" },
                        { icon: "💰", title: "Budget Filter", desc: "Filter by monthly budget that works for you" },
                        { icon: "🔒", title: "Safe & Secure", desc: "Your data is protected and private" },
                        { icon: "💜", title: "Send Interest", desc: "Express interest without sharing contact directly" },
                        { icon: "🗺️", title: "Map View", desc: "See roommates on map near your location" }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: "#0A0A0A",
                            border: "1px solid #1A1A1A",
                            borderRadius: "20px", padding: "28px",
                            transition: "all 0.3s"
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
                                e.currentTarget.style.background = "#0F0F0F"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1A1A1A"
                                e.currentTarget.style.background = "#0A0A0A"
                            }}
                        >
                            <div style={{ fontSize: "28px", marginBottom: "14px" }}>{item.icon}</div>
                            <h3 style={{
                                color: "#FFFFFF", fontSize: "16px",
                                fontWeight: "600", fontFamily: "Poppins, sans-serif",
                                marginBottom: "8px"
                            }}>{item.title}</h3>
                            <p style={{
                                color: "#555555", fontSize: "13px",
                                fontFamily: "Inter, sans-serif", lineHeight: "1.7"
                            }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA SECTION ── */}
            <div style={{
                position: "relative", zIndex: 1,
                padding: "100px 60px",
                borderTop: "1px solid #111111",
                textAlign: "center"
            }}>
                <div style={{
                    maxWidth: "700px", margin: "0 auto",
                    background: "linear-gradient(135deg, #0A0A0A, #111111)",
                    border: "1px solid #222222",
                    borderRadius: "32px", padding: "60px",
                    position: "relative", overflow: "hidden"
                }}>
                    {/* Gold glow */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "400px", height: "400px",
                        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
                        pointerEvents: "none"
                    }} />

                    <h2 style={{
                        fontSize: "40px", fontWeight: "800",
                        fontFamily: "Poppins, sans-serif",
                        color: "#FFFFFF", marginBottom: "16px",
                        position: "relative"
                    }}>
                        Ready to find your<br />
                        <span style={{
                            background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>perfect roommate?</span>
                    </h2>
                    <p style={{
                        color: "#555555", fontSize: "16px",
                        fontFamily: "Inter, sans-serif",
                        marginBottom: "36px", position: "relative"
                    }}>
                        Join thousands of students who found their ideal living partner
                    </p>
                    <button onClick={() => navigate("/register")} style={{
                        padding: "18px 48px",
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        color: "#000000", border: "none",
                        borderRadius: "30px", fontSize: "16px",
                        fontWeight: "700", cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                        boxShadow: "0 0 40px rgba(245,158,11,0.3)",
                        transition: "all 0.3s",
                        position: "relative"
                    }}
                        onMouseEnter={e => {
                            e.target.style.transform = "translateY(-3px)"
                            e.target.style.boxShadow = "0 0 60px rgba(245,158,11,0.5)"
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "0 0 40px rgba(245,158,11,0.3)"
                        }}
                    >Get Started Free →</button>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{
                position: "relative", zIndex: 1,
                padding: "24px 60px",
                borderTop: "1px solid #111111",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <span style={{
                    color: "#333333", fontSize: "13px",
                    fontFamily: "Inter, sans-serif"
                }}>© 2025 RoomSync. All rights reserved.</span>

                <span onClick={() => navigate("/serviceman-login")} style={{
                    color: "#333333", fontSize: "12px",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer"
                }}>Admin Access</span>
            </div>

            {/* ── CSS ANIMATIONS ── */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    )
}

export default Landing  