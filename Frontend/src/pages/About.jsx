import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <img
          src="4530381_19368.jpg"
          alt="Inventory Management System"
          className="about-image"
        />
        <div className="about-text">
          <h2>About Our Inventory Management System</h2>
          <p>
            Our Inventory Management System is designed to streamline and
            simplify the process of tracking, managing, and controlling stock
            for businesses of all sizes. From small shops to large enterprises,
            our platform offers real-time inventory updates, automated stock
            alerts, and comprehensive reporting to help you make smarter
            decisions.
          </p>
          <p>
            With an intuitive interface, secure data storage, and seamless
            integration options, you can manage your products, suppliers, and
            orders all in one place — anytime, anywhere. Say goodbye to manual
            spreadsheets and hello to efficient, accurate, and stress-free
            inventory management.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h3>Why Choose Our System?</h3>
        <div className="feature-list">
          <div className="feature-card">
            <h4>Real-Time Tracking</h4>
            <p>
              Monitor your stock levels live and get instant alerts when items
              are running low or out of stock.
            </p>
          </div>
          <div className="feature-card">
            <h4>Detailed Reports</h4>
            <p>
              Gain insights into sales trends, product performance, and supplier
              efficiency with detailed analytics.
            </p>
          </div>
          <div className="feature-card">
            <h4>User-Friendly Interface</h4>
            <p>
              Manage your inventory with ease thanks to our clean, simple, and
              intuitive design.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Inventory Management System. All
          rights reserved.
        </p>
        <p>Built to make your business run smoother.</p>
      </footer>
    </div>
  );
};

export default About;
