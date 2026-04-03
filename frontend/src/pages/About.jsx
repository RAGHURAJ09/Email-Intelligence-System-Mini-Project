import React from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";


export default function About() {
  return (
    <motion.main
      className="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Meet Our Team
      </motion.h1>

      <div className="team-container">

        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={2500} className="tilt-wrapper">
          <motion.div
            className="team-card"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <img src="/raghu.jpeg" className="team-img" alt="Raghuraj" />
            <h3>Raghuraj Rajpoot</h3>
            <p className="role">Full Stack Developer</p>
          </motion.div>
        </Tilt>

        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={2500} className="tilt-wrapper">
          <motion.div
            className="team-card"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <img src="/samridhi.jpeg" className="team-img" alt="Samridhi" />
            <h3>Samridhi Jaiswal</h3>
            <p className="role">Machine Learning Engineer</p>
          </motion.div>
        </Tilt>

        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={2500} className="tilt-wrapper">
          <motion.div
            className="team-card"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <img src="/yash.jpeg" className="team-img" alt="Yash" />
            <h3>Yash Shakya</h3>
            <p className="role">Machine Learning Engineer</p>
          </motion.div>
        </Tilt>

      </div>
    </motion.main>

  );
}
