import React from "react";



const containerStyle = {
    minHeight: "100vh",  
    boxSizing: "border-box",
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    alignItems: "center",
    justifyItems: "stretch",
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    background: "#f6fff6",
    marginTop: 0
};

const cardStyle = {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "8px",
    minHeight: "0" // allow flex children to shrink
};

const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px"
};

const titleStyle = {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0b7a3f" // green accent
};

const metaStyle = {
    margin: 0,
    fontSize: "12px",
    color: "#444"
};

const biosStyle = {
    display: "flex",
    gap: "10px",
    alignItems: "center"
};

const avatarStyle = {
    width: "64px",
    height: "64px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid #e6f5ea"
};

const linksListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "6px"
};

const linkStyle = {
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: "6px",
    background: "#eef8ef",
    color: "#0b7a3f",
    fontWeight: 600,
    fontSize: "13px",
    width: "100%",
    textAlign: "center"
};

export default function About() {
    return (
        <div style={containerStyle}>
            {/* Left column: Project summary */}
            <section style={cardStyle} aria-label="Project summary">
                <div>
                    <div style={headerStyle}>
                        <div style={{ width: 58, height: 58, borderRadius: 8, background: "#0b7a3f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                            SP-14
                        </div>
                        <div>
                            <h1 style={titleStyle}>Green Chess AI</h1>
                            <p style={metaStyle}>Project ID: SP-14 • Color: Green</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#333" }}>
                            A public web project demonstrating a chess AI with visual board, engine, and analysis features.
                        </p>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                            Course: CS 4850 • Semester: Fall • Year: 2025
                            {/* Replace the above course/semester/year values with your actual course info */}
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <a
                            href="https://github.com/SP-14-Green-Chess-AI/SP-14-Green-Chess-AI/tree/main"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...linkStyle, background: "#e8f7ff", color: "#0366d6" }}
                        >
                            View project on GitHub
                        </a>
                        <a
                            href="https://www.youtube.com/watch?v=BHeyaBdQ_v4"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...linkStyle, background: "#fff5e6", color: "#a35b00" }}
                        >
                            Final Presentation (video)
                        </a>
                    </div>
                </div>
            </section>

            {/* Right column: Team bios and documents */}
            <aside style={cardStyle} aria-label="Team and documents">
                <div>
                    <h2 style={{ margin: 0, fontSize: 14, color: "#0b7a3f", fontWeight: 700 }}>Team</h2>

                    <div style={biosStyle}>
                        <img
                            src="src/docs/M.png"
                            alt="Jason Nguyen"
                            style={avatarStyle}
                        />
                        <div style={{ fontSize: 13 }}>
                            <div style={{ fontWeight: 700 }}>Matt Staats</div>
                            <div style={{ color: "#666", fontSize: 12 }}>Team Lead</div>
                        </div>
                    </div>                    <div style={biosStyle}>
                        <img
                            src="src/docs/J.png"
                            alt="Jason Nguyen"
                            style={avatarStyle}
                        />
                        <div style={{ fontSize: 13 }}>
                            <div style={{ fontWeight: 700 }}>Jason Nguyen</div>
                            <div style={{ color: "#666", fontSize: 12 }}>Frontend & AI integration</div>
                        </div>
                    </div>                    <div style={biosStyle}>
                        <img
                            src="src/docs/C.png"
                            alt="Jason Nguyen"
                            style={avatarStyle}
                        />
                        <div style={{ fontSize: 13 }}>
                            <div style={{ fontWeight: 700 }}>Carlos Pena</div>
                            <div style={{ color: "#666", fontSize: 12 }}>Documentation</div>
                        </div>
                    </div>

                    <div style={{ ...biosStyle, marginTop: 8 }}>
                        <img
                            src="src/docs/ch.png"
                            alt="Jason Nguyen"
                            style={avatarStyle}
                        />
                        <div style={{ fontSize: 13 }}>
                            <div style={{ fontWeight: 700 }}>Chiagoziem Iteogu</div>
                            <div style={{ color: "#666", fontSize: 12 }}>AI generalist</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ margin: "10px 0 6px 0", fontSize: 13, color: "#0b7a3f" }}>Project Documents (PDF)</h3>

                    <div style={linksListStyle}>
                        <a
                            href="src/docs/Project_Report.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Project Report (PDF)
                        </a>
                        <a 
                            href="src/docs/SP-14-Green-Chess-AI-Project-Plan-03.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Project Plan Document (PDF)
                        </a>
                        <a
                            href="src/docs/SP-14-Green-Chess-Ai-Design.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Design Document (PDF)
                        </a>

                        <a
                            href="src/docs/Requirements_and_Testplan.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Requirements Document (PDF)
                        </a>

                        <a
                            href="src/docs/Final_Presentation_Slides.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Presentation Slides (PDF)
                        </a>
                        <a
                            href="src/docs/STR-14-Green-Chess-AI-Requirements-and-Testplan.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                        >
                            Test Plan and Report Document (PDF)
                        </a>
                    </div>
                </div>
            </aside>

            {/* Footer row spanning two columns (keeps everything visible without scroll) */}
            <div style={{ gridColumn: "1 / span 2", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: "#444" }}>
                    All files linked above should be placed in your public folder:
                    <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "#888" }}>
                        /public/docs/*.pdf • /public/videos/*.mp4 • /public/images/*
                    </span>
                </div>

                <div style={{ textAlign: "right", fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: "#0b7a3f" }}>Green Chess AI</div>
                    <div style={{ color: "#666" }}>Public project — ready for grading</div>
                </div>
            </div>
        </div>
    
    );
}