import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function App() {
  const particlesRef = useRef(null);
  const bookingRef = useRef(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [eventSelectOpen, setEventSelectOpen] = useState(false);
  const [eventType, setEventType] = useState('');
  const [sent, setSent] = useState(false);

  const reviews = [
    {
      avatar: 'M',
      text: '"The show felt alive - lights, sound, and atmosphere all on point."',
      name: '- Maya',
    },
    {
      avatar: 'L',
      text: '"Every beat was timed perfect. I couldn\'t stop dancing."',
      name: '- Leo',
    },
    {
      avatar: 'A',
      text: '"Top tier night! Ecstasy made the party unforgettable."',
      name: '- Aria',
    },
  ];

  const eventTypes = [
    'standup',
    'party (16+)',
    'party (21+)',
    'concert',
    'cypher',
    'corporate',
  ];

  useEffect(() => {
    document.body.classList.add('intro-running');

    const timer = setTimeout(() => {
      setIntroVisible(false);
      document.body.classList.remove('intro-running');
    }, 4300);

    const closeIntro = (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
        setIntroVisible(false);
        document.body.classList.remove('intro-running');
      }
    };

    document.addEventListener('keydown', closeIntro);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', closeIntro);
      document.body.classList.remove('intro-running');
    };
  }, []);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 1) {
      positions[i] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.03,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 5;

    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0007;
      particles.rotation.x += 0.0003;
      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((current) => (current + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    let pointerFrame = null;
    let pointerX = 0;
    let pointerY = 0;
    const root = document.documentElement;

    function updatePointer(event) {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (pointerFrame) return;

      pointerFrame = requestAnimationFrame(() => {
        const x = pointerX / window.innerWidth;
        const y = pointerY / window.innerHeight;
        root.style.setProperty(
          '--pointer-glow',
          `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
        );
        document.body.classList.add('page-pointer');
        pointerFrame = null;
      });
    }

    function clearPointer(event) {
      if (!event.relatedTarget) {
        document.body.classList.remove('page-pointer');
      }
    }

    document.addEventListener('mousemove', updatePointer);
    window.addEventListener('mouseout', clearPointer);

    return () => {
      document.removeEventListener('mousemove', updatePointer);
      window.removeEventListener('mouseout', clearPointer);
    };
  }, []);

  useEffect(() => {
    const cursorAura = document.querySelector('.cursor-aura');
    const hotTargets = 'a, button, .card, .review-banner, input, select, textarea';

    function moveAura(event) {
      if (!cursorAura) return;
      cursorAura.style.top = `${event.clientY}px`;
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.opacity = '1';
    }

    function hideAura() {
      if (!cursorAura) return;
      cursorAura.style.opacity = '0.18';
    }

    function showAura() {
      if (!cursorAura) return;
      cursorAura.style.opacity = '1';
    }

    function hotOn(event) {
      if (event.target.closest(hotTargets)) {
        document.body.classList.add('cursor-hot');
      }
    }

    function hotOff(event) {
      if (event.target.closest(hotTargets)) {
        document.body.classList.remove('cursor-hot');
      }
    }

    function spark(event) {
      if (!event.target.closest('a, button, .card')) return;

      const sparkEl = document.createElement('span');
      sparkEl.className = 'cursor-spark';
      sparkEl.style.left = `${event.clientX}px`;
      sparkEl.style.top = `${event.clientY}px`;
      document.body.appendChild(sparkEl);

      setTimeout(() => {
        sparkEl.remove();
      }, 650);
    }

    document.addEventListener('mousemove', moveAura);
    document.addEventListener('mouseleave', hideAura);
    document.addEventListener('mouseenter', showAura);
    document.addEventListener('mouseover', hotOn);
    document.addEventListener('mouseout', hotOff);
    document.addEventListener('click', spark);

    return () => {
      document.removeEventListener('mousemove', moveAura);
      document.removeEventListener('mouseleave', hideAura);
      document.removeEventListener('mouseenter', showAura);
      document.removeEventListener('mouseover', hotOn);
      document.removeEventListener('mouseout', hotOff);
      document.removeEventListener('click', spark);
    };
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-item');

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('modal-open', bookingOpen);

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setBookingOpen(false);
        setEventSelectOpen(false);
      }
    }

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [bookingOpen]);

  function openBooking(event) {
    event.preventDefault();
    setBookingOpen(true);
  }

  async function submitBooking(event) {
  event.preventDefault();

  if (!eventType) {
    setEventSelectOpen(true);
    return;
  }

  const formData = new FormData(event.currentTarget);

  const bookingData = {
    eventType,
    eventDate: formData.get('eventDate'),
    guestCount: formData.get('guestCount'),
    budgetRange: formData.get('budgetRange'),
    vision: formData.get('vision'),
  };

  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error('Booking failed');
    }

    setSent(true);

    setTimeout(() => {
      setSent(false);
      setBookingOpen(false);
      setEventType('');
      event.target.reset();
    }, 1200);
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
}

  return (
    <>
      {introVisible && (
        <div
          className="intro-screen"
          id="intro-screen"
          aria-label="Ecstasy opening intro"
          onClick={() => {
            setIntroVisible(false);
            document.body.classList.remove('intro-running');
          }}
        >
          <div className="intro-grid" aria-hidden="true"></div>
          <div className="intro-lights" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="intro-content">
            <p className="intro-kicker">Events that don't fade away</p>
            <h1>ECSTASY</h1>
            <div className="intro-line">
              <span></span>
              <strong>ONE HIGH TO ANOTHER</strong>
              <span></span>
            </div>
            <div className="intro-loader" aria-hidden="true">
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div className="cursor-aura" aria-hidden="true"></div>

      <nav>
        <div className="logo">ECSTASY</div>

        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <section className="hero reveal-zone" id="home">
        <div id="particles" ref={particlesRef}></div>

        <div className="hero-content reveal-item">
          <h1>
            CREATE THE
            <span>EXTRAORDINARY</span>
          </h1>

          <p>
            From private parties to large-scale productions,
            Ecstasy creates unforgettable experiences.
          </p>

          <div className="buttons">
            <a href="#booking" className="btn red-btn" onClick={openBooking}>Book Now</a>
            <a href="#services" className="btn dark-btn">Portfolio</a>
          </div>

          <div className="review-banner reveal-item" aria-label="party reviews">
            <div className="review-label">Party Reviews</div>

            <div className="review-slider">
              {reviews.map((review, index) => (
                <div
                  className={`review-slide ${index === reviewIndex ? 'active' : ''}`}
                  key={review.name}
                >
                  <div className="review-profile">
                    <span className="review-avatar">{review.avatar}</span>
                    <span className="review-stars" aria-label="5 star rating">
                      ★★★★★
                    </span>
                  </div>
                  {review.text}
                  <span>{review.name}</span>
                </div>
              ))}
            </div>

            <div className="review-dots" aria-label="review slide controls">
              {reviews.map((review, index) => (
                <button
                  key={review.name}
                  type="button"
                  className={`review-dot ${index === reviewIndex ? 'active' : ''}`}
                  aria-label={`Show review ${index + 1}`}
                  aria-pressed={index === reviewIndex}
                  onClick={() => setReviewIndex(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="reveal-zone">
        <h2 className="reveal-item">What We Produce</h2>

        <div className="services">
          <div className="card service-card reveal-item" style={{ '--delay': '0ms' }}>
            <div className="service-visual live-visual" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <div className="service-icon" aria-hidden="true">LIVE</div>
            <h3>Live Experiences</h3>
            <p>Immersive productions, stages and crowd experiences.</p>
            <a href="#booking" className="service-link" onClick={openBooking}>Plan a show</a>
          </div>

          <div className="card service-card reveal-item" style={{ '--delay': '90ms' }}>
            <div className="service-visual party-visual" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
            <div className="service-icon" aria-hidden="true">VIP</div>
            <h3>Parties</h3>
            <p>High-energy private parties and nightlife events.</p>
            <a href="#booking" className="service-link" onClick={openBooking}>Start the night</a>
          </div>

          <div className="card service-card reveal-item" style={{ '--delay': '180ms' }}>
            <div className="service-visual event-visual" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <div className="service-icon" aria-hidden="true">360</div>
            <h3>Events</h3>
            <p>Corporate showcases, launches and productions.</p>
            <a href="#booking" className="service-link" onClick={openBooking}>Build an event</a>
          </div>
        </div>
      </section>

      <section id="contact" className="contact reveal-zone">
        <div className="contact-decor" aria-hidden="true"></div>

        <div className="contact-panel reveal-item">
          <h2>We Create Obsessions.</h2>

          <p>
            Every light cue. Every sound wave.
            Every moment engineered for impact.
          </p>

          <a href="#booking" className="btn red-btn" onClick={openBooking}>Contact Us</a>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <p>&copy; 2026 ECSTASY Event Production</p>
          <p>All rights reserved. Designed for immersive event experiences.</p>
          <p>Terms of Service &bull; Privacy Policy &bull; Site Performance</p>
        </div>
      </footer>

      <div
        className={`booking-modal ${bookingOpen ? 'is-open' : ''}`}
        id="booking"
        aria-hidden={!bookingOpen}
        ref={bookingRef}
      >
        <div className="booking-backdrop" onClick={() => setBookingOpen(false)}></div>

        <div className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <button
            className="modal-close"
            type="button"
            aria-label="Close booking form"
            onClick={() => setBookingOpen(false)}
          >
            &times;
          </button>

          <p className="modal-kicker">Start production</p>
          <h2 id="booking-title">Book the Night</h2>

        <form className="booking-form" onSubmit={submitBooking}>
  <label>
    Event Type
    <div className={`event-select ${eventSelectOpen ? 'is-open' : ''} ${eventType ? 'has-value' : ''}`}>
      <button
        className="event-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={eventSelectOpen}
        onClick={() => setEventSelectOpen((open) => !open)}
      >
        <span>{eventType || 'Choose one'}</span>
        <span className="event-select-arrow" aria-hidden="true"></span>
      </button>

      <div className="event-select-menu" role="listbox" aria-label="Event type">
        {eventTypes.map((type) => (
          <button
            key={type}
            type="button"
            role="option"
            data-value={type}
            className={eventType === type ? 'is-selected' : ''}
            aria-selected={eventType === type}
            onClick={() => {
              setEventType(type);
              setEventSelectOpen(false);
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <input type="hidden" name="eventType" value={eventType} readOnly />
    </div>
  </label>

  <label>
    Event Date
    <input type="date" name="eventDate" required />
  </label>

  <label>
    Guest Count
    <input type="number" name="guestCount" min="20" placeholder="250" />
  </label>

  <label>
    Budget Range
    <select name="budgetRange" required defaultValue="">
      <option value="">Select range</option>
      <option>$2k - $5k</option>
      <option>$5k - $15k</option>
      <option>$15k - $40k</option>
      <option>$40k+</option>
    </select>
  </label>

  <label className="full">
    Vision
    <textarea
      name="vision"
      rows="4"
      placeholder="Tell us the mood, venue, music, and production style."
    ></textarea>
  </label>

  <button type="submit" className="btn red-btn" disabled={sent}>
    {sent ? 'Request Sent' : 'Send Request'}
  </button>
</form>
        </div>
      </div>
    </>
  );
}

export default App;