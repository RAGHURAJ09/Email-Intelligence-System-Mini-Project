import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#00ff41",
            fontFamily: "'Courier New', monospace",
            padding: "20px"
        }}>
            <motion.div
                style={{
                    width: "50px",
                    height: "50px",
                    border: "4px solid rgba(0, 255, 65, 0.3)",
                    borderTop: "4px solid #00ff41",
                    borderRadius: "50%",
                    marginBottom: "15px"
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                ANALYZING NEURAL PATTERNS...
            </motion.p>
        </div>
    );
}
