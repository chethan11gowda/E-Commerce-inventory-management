import './Home.css';
import 'aos/dist/aos.css'; // Import AOS CSS for animations

import { useEffect } from 'react';

import AOS from 'aos';

export default function Home() {
   useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      easing: 'ease-in-out', // Easing effect
      once: true, // Ensure animations only happen once
    });
  }, []);
  return (
    <div className="inv" data-aos="fade-up">
      {/* HERO */}
      <section className="inv-hero">
        <div className="inv-hero__text">
          <h1>Inventory Management</h1>
          <p>
            Real-time stock visibility, automated updates, and actionable analytics—so you never oversell or run out of inventory again.
          </p>
          <div className="inv-cta-row">
            <a className="btn btn-primary" href="/services">Our Services</a>
            <a className="btn btn-ghost" href="/contact">Contact</a>
          </div>
        </div>

        <div className="inv-hero__art" data-aos="fade-left">
          <img src="11667324_20946011.jpg" alt="Inventory dashboard illustration" />
        </div>
      </section>

    <section className="inv-section features"  data-aos="fade-up">
  <h2>Our Features</h2>
  <p className="muted">
    Track, update, and manage your inventory in real time across stores and channels.
  </p>
  <ul className="feature-list">
    <li>Real-time Stock & Low-stock Alerts</li>
    <li>Multi-warehouse & Location Support</li>
    <li>Purchase & Returns Reconciliation</li>
    <li>Barcode/QR & Batch/Lot Tracking</li>
    <li>Automated Re-order Rules</li>
    <li>Customizable Reports & Exports</li>
  </ul>
</section>


      {/* WHY US */}
      <section className="inv-section inv-surface" data-aos="fade-up">
        <h2>Why Choose Us?</h2>
        <p className="muted">
          A modern, reliable system with fast onboarding, intuitive UX, and enterprise-grade stability. Seamlessly integrates with your e-commerce stack.
        </p>

        <div className="stats">
          <div className="stat" data-aos="flip-left">
            <div className="stat__num">99.95%</div>
            <div className="stat__label">Uptime</div>
          </div>
          <div className="stat" data-aos="flip-left">
            <div className="stat__num">10k+</div>
            <div className="stat__label">SKUs Managed</div>
          </div>
          <div className="stat" data-aos="flip-left">
            <div className="stat__num">5min</div>
            <div className="stat__label">Avg Sync Time</div>
          </div>
        </div>

        <div className="center">
          <a className="btn btn-primary" href="/signup">Get Started</a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="inv-section" data-aos="fade-up">
        <h2>What Our Customers Say</h2>
        <div className="testimonials">
          <blockquote>
            “The best inventory system we’ve used—saved hours every week.”
            <span>— John D., CEO (Example Co.)</span>
          </blockquote>
          <blockquote>
            “Simple, fast, and reliable. Our team actually enjoys using it.”
            <span>— Jane S., Operations Manager</span>
          </blockquote>
          <blockquote>
            “The analytics alone paid for the subscription in the first month.”
            <span>— Amir R., Head of Commerce</span>
          </blockquote>
        </div>
      </section>

      {/* FOOTER */}
<footer className="inv-footer" data-aos="fade-up">
  <div className="inv-footer__content">
    <h3>Streamline Your Inventory Today</h3>
    <p>Start managing your stock with ease and efficiency. We are here to help you every step of the way.</p>
    <div className="inv-footer__buttons">
      <a className="btn btn-primary" href="/services">See Pricing & Plans</a>
      <a className="btn btn-ghost" href="/contact">Contact Us</a>
    </div>
  </div>

  <div className="inv-footer__social">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </div>

  <div className="inv-footer__copyright">
    <p>&copy; 2025 Your Company. All Rights Reserved.</p>
  </div>
</footer>

    </div>
  );
}
