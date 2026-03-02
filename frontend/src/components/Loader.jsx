import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#f8fafc",
            fontFamily: "'Inter', sans-serif",
            padding: "20px"
        }}>
            <motion.div
                style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid rgba(99, 102, 241, 0.2)",
                    borderTop: "3px solid #6366f1", // Indigo
                    borderRadius: "50%",
                    marginBottom: "16px"
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
                style={{ fontSize: "14px", fontWeight: 500, color: "#94a3b8" }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Processing Request...
            </motion.p>
        </div>
    );
}
