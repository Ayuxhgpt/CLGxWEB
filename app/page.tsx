"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  BookOpen, FlaskConical, Stethoscope, CircuitBoard,
  Download, GraduationCap, PlayCircle, Github, Instagram,
  ArrowRight, ChevronRight
} from "lucide-react";
import Image from "next/image";

export default function Home() {

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        {/* Background Effects - Ladder1: subtle noise only */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium text-sm backdrop-blur-md">
              🚀 Elevating Pharmacy Education
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[var(--text-primary)] leading-tight">
              Discover. Learn. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[var(--accent-primary)] to-emerald-400 animate-gradient-x">
                Elevate.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
              A student-led portal combining pharmacy fundamentals, research summaries, and practical resources — built for the future of pharma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pharma">
                <Button size="lg" className="min-w-[180px]">
                  Explore Knowledge <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="secondary" size="lg" className="min-w-[180px]">
                  Student Resources
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)] text-sm"
        >
          <span className="uppercase tracking-widest text-[10px]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
        </motion.div>
      </section>

      {/* KNOWLEDGE SECTION */}
      <section id="knowledge" className="py-24 relative bg-[var(--bg-surface-2)]/30 border-y border-[var(--border-subtle)] backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Pharma Knowledge</h2>
              <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                Foundational & modern topics — concise, reliable, and student-friendly.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Clinical Pharmacy", icon: Stethoscope, desc: "Medication therapy management, patient counselling, and collaborative care.", color: "text-blue-400", link: "/pharma" },
                { title: "Industrial Pharmacy", icon: FlaskConical, desc: "Formulation science, GMP, scale-up processes, and quality control.", color: "text-emerald-400", link: "/pharma" },
                { title: "Pharmacovigilance", icon: ShieldCheck, desc: "Signal detection, reporting ADRs, and risk minimization strategies.", color: "text-orange-400", link: "/resources" },
                { title: "GPAT Prep (Coming Soon)", icon: CircuitBoard, desc: "AI-driven mock tests and study material.", color: "text-purple-400", link: "#" },
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Link href={item.link}>
                    <Card className="h-full group">
                      <div className={`mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:bg-white/10 transition-colors ${item.color}`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{item.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <div className="text-xs font-bold text-[var(--accent-primary)] flex items-center mt-auto">
                        Read More <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* RESOURCES SECTION */}
      <section id="resources" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 max-w-6xl mx-auto">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Student Resources</h2>
              <p className="text-[var(--text-secondary)]">Practical tools for study & exam preparation.</p>
            </div>
            <Link href="/resources">
              <Button variant="secondary">View All Resources</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-[var(--bg-surface)] to-blue-900/10 border-[var(--border-subtle)]">
              <div className="p-4 bg-blue-500/20 rounded-full w-fit mb-6">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Notes & Papers</h3>
              <p className="text-[var(--text-secondary)] mb-6">Download GPAT tips, PCI syllabus summaries, and curated past papers.</p>
              <Link href="/resources">
                <Button className="w-full" variant="secondary"><Download className="mr-2 h-4 w-4" /> Download</Button>
              </Link>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--bg-surface)] to-[var(--accent-primary)]/10 border-[var(--border-subtle)]">
              <div className="p-4 bg-[var(--accent-primary)]/20 rounded-full w-fit mb-6">
                <GraduationCap className="h-8 w-8 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Flashcards & MCQs</h3>
              <p className="text-[var(--text-secondary)] mb-6">Interactive flashcards and sample MCQs for quick revision.</p>
              <Link href="/resources">
                <Button className="w-full" variant="secondary">Start Practice</Button>
              </Link>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--bg-surface)] to-purple-900/10 border-[var(--border-subtle)]">
              <div className="p-4 bg-purple-500/20 rounded-full w-fit mb-6">
                <PlayCircle className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Video Lectures</h3>
              <p className="text-[var(--text-secondary)] mb-6">Curated playlists on pharmacy topics, AI in pharma, and research.</p>
              <a href="https://www.youtube.com/results?search_query=pharmacy+lectures" target="_blank">
                <Button className="w-full" variant="secondary">Watch Now</Button>
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* DEVELOPERS & FOOTER */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-[var(--accent-primary)] to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                <span className="text-2xl font-bold">Pharma<span className="text-[var(--accent-primary)]">Elevate</span></span>
              </div>
              <p className="text-[var(--text-secondary)] max-w-xs">
                Satyadev College of Pharmacy<br />
                Elevating education for the future.
              </p>
              <div className="flex gap-4 mt-4 text-sm font-medium text-[var(--primary)]">
                <Link href="/college" className="hover:underline">About College</Link>
                <Link href="/faculty" className="hover:underline">Faculty</Link>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center md:text-right">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] mb-4">
                  <Image src="https://res.cloudinary.com/dkapfpxc5/image/upload/v1768465257/pharmaelevate/system/ayupfp.jpg" alt="Ayush" width={80} height={80} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold">Ayush Gupta</h4>
                <p className="text-xs text-[var(--text-muted)] mb-2">Lead Developer</p>
                <div className="flex justify-center md:justify-end gap-2">
                  <a href="https://github.com/2025xsukoon" target="_blank" className="text-[var(--text-secondary)] hover:text-white"><Github className="h-4 w-4" /></a>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] mb-4">
                  <Image src="https://res.cloudinary.com/dkapfpxc5/image/upload/v1768465326/pharmaelevate/system/sakpfp.jpg" alt="Saksham" width={80} height={80} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold">Saksham Gupta</h4>
                <p className="text-xs text-[var(--text-muted)] mb-2">Research Lead</p>
                <div className="flex justify-center md:justify-end gap-2">
                  <a href="https://www.instagram.com/sakshamguptax" target="_blank" className="text-[var(--text-secondary)] hover:text-white"><Instagram className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[var(--text-muted)]">
            <p>© 2025 PharmaElevate. All rights reserved.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1">
              Crafted with <span className="text-red-500">❤️</span> by Ayush & Saksham
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icon helper
import { ShieldCheck } from "lucide-react";
