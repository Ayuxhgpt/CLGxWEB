'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }, []);

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section id="home" className="hero" aria-labelledby="hero-heading">
        <div className="hero-bg" aria-hidden="true">
          <svg className="molecules" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
            <circle cx="60" cy="60" r="14" />
            <circle cx="720" cy="120" r="8" />
            <circle cx="420" cy="30" r="10" />
            <circle cx="320" cy="340" r="18" />
            <circle cx="680" cy="320" r="12" />
          </svg>
        </div>

        <div className="hero-inner container">
          <h1 id="hero-heading" className="hero-title" aria-live="polite">
            <span className="anim-word">Discover</span>
            <span className="anim-word">Learn</span>
            <span className="anim-word">Elevate</span>
          </h1>

          <p className="hero-sub">A student-led portal combining pharmacy fundamentals, research summaries, and practical resources — built for learners and future pharmacists.</p>

          <div className="hero-ctas">
            <a href="#knowledge" className="btn btn-primary">Explore Knowledge</a>
            <a href="#resources" className="btn btn-ghost">Student Resources</a>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE */}
      <section className="section highlights" id="knowledge" aria-labelledby="knowledge-heading">
        <div className="container">
          <h2 id="knowledge-heading" className="section-heading">Pharma Knowledge</h2>
          <p className="lead center muted">Foundational & modern topics — concise, reliable, and student-friendly.</p>

          <div className="cards-grid">
            <article className="card hover-float reveal">
              <div className="card-icon"><i className="fa-solid fa-book-medical"></i></div>
              <h3>Clinical Pharmacy</h3>
              <p>Medication therapy management, patient counselling, ADR management, and collaborative care.</p>
              <Link href="/resources" className="card-link">Read more →</Link>
            </article>

            <article className="card hover-float reveal">
              <div className="card-icon"><i className="fa-solid fa-industry"></i></div>
              <h3>Industrial Pharmacy</h3>
              <p>Formulation science, GMP, scale-up processes, quality control, and regulatory affairs.</p>
              <Link href="/resources" className="card-link">Read more →</Link>
            </article>

            <article className="card hover-float reveal">
              <div className="card-icon"><i className="fa-solid fa-flask"></i></div>
              <h3>Pharmacovigilance</h3>
              <p>Signal detection, reporting ADRs, PvPI (India), causality assessment and risk minimization.</p>
              <Link href="/resources" className="card-link">Explore research →</Link>
            </article>

            <article className="card hover-float reveal">
              <div className="card-icon"><i className="fa-solid fa-robot"></i></div>
              <h3>AI & Digital Pharma</h3>
              <p>AI in drug discovery, telepharmacy implementation, and digital therapeutics.</p>
              <Link href="/resources" className="card-link">Discover →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="section resources" id="resources" aria-labelledby="resources-heading">
        <div className="container">
          <h2 id="resources-heading" className="section-heading">Student Resources</h2>
          <p className="lead center muted">Practical tools for study & exam preparation.</p>

          <div className="cards-grid">
            <article className="card hover-float reveal">
              <h3>Notes & Past Papers</h3>
              <p>Download GPAT tips, PCI syllabus summaries, and curated past exam papers.</p>
              <Link href="/resources" className="card-link">Download →</Link>
            </article>

            <article className="card hover-float reveal">
              <h3>Flashcards & MCQs</h3>
              <p>Interactive flashcards and sample MCQs for quick revision.</p>
              <Link href="/resources" className="card-link">Try →</Link>
            </article>

            <article className="card hover-float reveal">
              <h3>Video Lectures</h3>
              <p>Curated playlists on pharmacy topics, AI in pharma, and research methodology.</p>
              <a href="https://www.youtube.com/results?search_query=pharmacy+lectures" target="_blank" className="card-link">Watch →</a>
            </article>
          </div>
        </div>
      </section>

      {/* DEVELOPERS */}
      <section className="section developers" id="developers" aria-labelledby="developers-heading">
        <div className="container narrow">
          <h2 id="developers-heading" className="section-heading">Meet the Developers</h2>
          <div className="dev-grid">
            <div className="dev-card reveal">
              <img className="dev-img" src="/assists/ayupfp.jpg" alt="Ayush Gupta" />
              <h4>Ayush Gupta</h4>
              <p className="muted">Lead Developer & Designer</p>
              <div className="socials">
                <a href="https://github.com/2025xsukoon" target="_blank"><i className="fa-brands fa-github"></i></a>
              </div>
            </div>

            <div className="dev-card reveal">
              <img className="dev-img" src="/assists/sakpfp.jpg" alt="Saksham Gupta" />
              <h4>Saksham Gupta</h4>
              <p className="muted">Research Contributor</p>
              <div className="socials">
                <a href="https://www.instagram.com/sakshamguptax" target="_blank"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <img src="/assists/scp.jpg" alt="Logo" className="foot-logo" />
            <div className="footer-brand">
              <h3>PharmaElevate</h3>
              <p>Satyadev College of Pharmacy</p>
            </div>
          </div>
          <div className="footer-right">
            <p className="copyright">© 2025 PharmaElevate</p>
            <p className="dev-credit">Crafted with ❤️ by <strong>Ayush & Saksham</strong></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
