import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function App() {
  const particlesRef = useRef(null);
  const bookingRef = useRef(null);
  const servicesRef = useRef(null);
  const portfolioRef = useRef(null);
  const contactRef = useRef(null);
  const contactBannerRef = useRef(null);

  const [introVisible, setIntroVisible] = useState(true);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [eventSelectOpen, setEventSelectOpen] = useState(false);
  const [eventType, setEventType] = useState('');
  const [sent, setSent] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authModal, setAuthModal] = useState('login');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const reviews = [
    { avatar: 'M', text: '"The show felt alive - lights, sound, and atmosphere all on point."', name: '- Maya' },
    { avatar: 'L', text: '"Every beat was timed perfect. I couldn\'t stop dancing."', name: '- Leo' },
    { avatar: 'A', text: '"Top tier night! Ecstasy made the party unforgettable."', name: '- Aria' },
  ];

  const eventTypes = ['standup', 'party (16+)', 'party (21+)', 'concert', 'cypher', 'corporate'];

  // ── Smooth Scroll Helper ────────────────────────────────────────────────────
  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Intro ───────────────────────────────────────────────────────────────────
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

  // ── Three.js particles ──────────────────────────────────────────────────────
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

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
    const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.03, transparent: true, opacity: 0.9 });
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

  // ── Review carousel ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((current) => (current + 1) % reviews.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  // ── Pointer glow ────────────────────────────────────────────────────────────
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
        root.style.setProperty('--pointer-glow', `${Math.round(x * 100)}% ${Math.round(y * 100)}%`);
        document.body.classList.add('page-pointer');
        pointerFrame = null;
      });
    }

    function clearPointer(event) {
      if (!event.relatedTarget) document.body.classList.remove('page-pointer');
    }

    document.addEventListener('mousemove', updatePointer);
    window.addEventListener('mouseout', clearPointer);
    return () => {
      document.removeEventListener('mousemove', updatePointer);
      window.removeEventListener('mouseout', clearPointer);
    };
  }, []);

  // ── Cursor aura ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cursorAura = document.querySelector('.cursor-aura');
    const hotTargets = 'a, button, .card, .review-banner, input, select, textarea, .portfolio-item';

    function moveAura(event) {
      if (!cursorAura) return;
      cursorAura.style.top = `${event.clientY}px`;
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.opacity = '1';
    }

    function hideAura() { if (cursorAura) cursorAura.style.opacity = '0.18'; }
    function showAura() { if (cursorAura) cursorAura.style.opacity = '1'; }

    function hotOn(event) {
      if (event.target.closest(hotTargets)) document.body.classList.add('cursor-hot');
    }
    function hotOff(event) {
      if (event.target.closest(hotTargets)) document.body.classList.remove('cursor-hot');
    }

    function spark(event) {
      if (!event.target.closest('a, button, .card, .portfolio-item')) return;
      const sparkEl = document.createElement('span');
      sparkEl.className = 'cursor-spark';
      sparkEl.style.left = `${event.clientX}px`;
      sparkEl.style.top = `${event.clientY}px`;
      document.body.appendChild(sparkEl);
      setTimeout(() => sparkEl.remove(), 650);
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

  // ── Scroll reveal ───────────────────────────────────────────────────────────
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
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
    return () => revealObserver.disconnect();
  }, [authUser]);

  // ── Booking modal escape ────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('modal-open', bookingOpen || (!authUser && authModal !== null));

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setBookingOpen(false);
        setEventSelectOpen(false);
        if (authUser) closeAuthModal();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [bookingOpen, authModal, authUser]);

  // ── Booking ─────────────────────────────────────────────────────────────────
  function openBooking(event) {
    event.preventDefault();
    setBookingOpen(true);
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!eventType) { setEventSelectOpen(true); return; }

    const formData = new FormData(event.currentTarget);
    const bookingData = {
      eventType,
      eventDate: formData.get('eventDate'),
      guestCount: formData.get('guestCount'),
      budgetRange: formData.get('budgetRange'),
      vision: formData.get('vision'),
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error('Booking failed');
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

  // ── Auth helpers ────────────────────────────────────────────────────────────
  function openAuthModal(mode) {
    setAuthModal(mode);
    setAuthError('');
    setAuthSuccess('');
  }

  function closeAuthModal() {
    setAuthModal(null);
    setAuthError('');
    setAuthSuccess('');
  }

  function logout() {
    setAuthUser(null);
    setAuthModal('login');
  }

  // ── FIX: was reading into `identifier` but sending `username` in JSON body ──
  async function handleRegister(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const username = formData.get('username'); // FIX: was `identifier`, must be `username`
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      setAuthSuccess('Account created! You can now sign in.');
      event.target.reset();
      setTimeout(() => openAuthModal('login'), 1400);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get('username');
    const password = formData.get('password');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      setAuthUser({ username: data.username, email: data.email });
      closeAuthModal();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
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
            <span></span><span></span><span></span>
          </div>
          <div className="intro-content">
            <p className="intro-kicker">Events that don't fade away</p>
            <h1>ECSTASY</h1>
            <div className="intro-line">
              <span></span>
              <strong>ONE HIGH TO ANOTHER</strong>
              <span></span>
            </div>
            <div className="intro-loader" aria-hidden="true"><span></span></div>
          </div>
        </div>
      )}

      <div className="cursor-aura" aria-hidden="true"></div>

      {/* ── AUTH WALL GUARD ── */}
      {!authUser ? (
        <div className="auth-wall-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#000' }}>
          <div id="particles" ref={particlesRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}></div>

          <div className="booking-dialog auth-dialog structural-wall" style={{ position: 'relative', zIndex: 10, background: 'rgba(10, 10, 10, 0.85)', border: '1px solid #ff000033', padding: '40px', borderRadius: '12px', maxWidth: '420px', width: '90%', backdropFilter: 'blur(10px)' }}>
            {authModal === 'register' ? (
              <>
                <p className="modal-kicker">Join Ecstasy</p>
                <h2>Create Account</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                  <label>
                    Name
                    <input type="text" name="name" placeholder="Your Full Name" required autoComplete="name" />
                  </label>
                  <label>
                    Username
                    <input type="text" name="username" placeholder="your_username" required autoComplete="username" />
                  </label>
                  <label>
                    Email Address
                    {/* FIX: added autoComplete="email" to silence the DOM warning */}
                    <input type="email" name="email" placeholder="name@domain.com" required autoComplete="email" />
                  </label>
                  <label>
                    Password
                    <input type="password" name="password" placeholder="••••••••" required autoComplete="new-password" minLength={6} />
                  </label>
                  <label>
                    Confirm Password
                    <input type="password" name="confirmPassword" placeholder="••••••••" required autoComplete="new-password" />
                  </label>
                  {authError && <p className="auth-error" style={{ color: '#ff3333', fontSize: '14px', margin: '10px 0' }}>{authError}</p>}
                  {authSuccess && <p className="auth-success" style={{ color: '#34A853', fontSize: '14px', margin: '10px 0' }}>{authSuccess}</p>}
                  <button type="submit" className="btn red-btn auth-submit" disabled={authLoading} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                    {authLoading ? 'Creating…' : 'Create Account'}
                  </button>
                </form>
                <p className="auth-switch" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <button type="button" className="auth-link" onClick={() => openAuthModal('login')} style={{ background: 'none', border: 'none', color: '#ff0000', cursor: 'pointer', textDecoration: 'underline' }}>Sign In</button>
                </p>
              </>
            ) : (
              <>
                <p className="modal-kicker">Welcome Back</p>
                <h2>Sign In</h2>
                <form className="auth-form" onSubmit={handleLogin}>
                  <label>
                    Username or Email
                    <input type="text" name="username" placeholder="your_username or name@domain.com" required autoComplete="username" />
                  </label>
                  <label>
                    Password
                    <input type="password" name="password" placeholder="••••••••" required autoComplete="current-password" />
                  </label>
                  {authError && <p className="auth-error" style={{ color: '#ff3333', fontSize: '14px', margin: '10px 0' }}>{authError}</p>}
                  {authSuccess && <p className="auth-success" style={{ color: '#34A853', fontSize: '14px', margin: '10px 0' }}>{authSuccess}</p>}
                  <button type="submit" className="btn red-btn auth-submit" disabled={authLoading} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                    {authLoading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
                <p className="auth-switch" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                  New here?{' '}
                  <button type="button" className="auth-link" onClick={() => openAuthModal('register')} style={{ background: 'none', border: 'none', color: '#ff0000', cursor: 'pointer', textDecoration: 'underline' }}>Create an account</button>
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Navbar ── */}
          <nav>
            <div className="logo">ECSTASY</div>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection(servicesRef); }}>Services</a></li>
              <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection(portfolioRef); }}>Portfolio</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection(contactBannerRef); }}>Contact</a></li>
            </ul>
            <div className="nav-auth">
              <div className="nav-user">
                <span className="nav-username">{authUser.username}</span>
                <button className="btn nav-logout-btn" onClick={logout}>Sign Out</button>
              </div>
            </div>
          </nav>

          {/* ── Hero ── */}
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
                <button type="button" className="btn red-btn" onClick={() => scrollToSection(servicesRef)}>Book Now</button>
                <button type="button" className="btn dark-btn" onClick={() => scrollToSection(portfolioRef)}>Portfolio</button>
              </div>
              <div className="review-banner reveal-item" aria-label="party reviews">
                <div className="review-label">Party Reviews</div>
                <div className="review-slider">
                  {reviews.map((review, index) => (
                    <div className={`review-slide ${index === reviewIndex ? 'active' : ''}`} key={review.name}>
                      <div className="review-profile">
                        <span className="review-avatar">{review.avatar}</span>
                        <span className="review-stars" aria-label="5 star rating">★★★★★</span>
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

          {/* ── Services ── */}
          <section id="services" ref={servicesRef} className="reveal-zone">
            <h2 className="reveal-item">What We Produce</h2>
            <div className="services">
              <div className="card service-card reveal-item" style={{ '--delay': '0ms' }}>
                <div className="service-visual live-visual" aria-hidden="true"><span></span><span></span><span></span></div>
                <div className="service-icon" aria-hidden="true">LIVE</div>
                <h3>Live Experiences</h3>
                <p>Immersive productions, stages and crowd experiences.</p>
                <a href="#booking" className="service-link" onClick={openBooking}>Plan a show</a>
              </div>
              <div className="card service-card reveal-item" style={{ '--delay': '90ms' }}>
                <div className="service-visual party-visual" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                <div className="service-icon" aria-hidden="true">VIP</div>
                <h3>Parties</h3>
                <p>High-energy private parties and nightlife events.</p>
                <a href="#booking" className="service-link" onClick={openBooking}>Start the night</a>
              </div>
              <div className="card service-card reveal-item" style={{ '--delay': '180ms' }}>
                <div className="service-visual event-visual" aria-hidden="true"><span></span><span></span><span></span></div>
                <div className="service-icon" aria-hidden="true">360</div>
                <h3>Events</h3>
                <p>Corporate showcases, launches and productions.</p>
                <a href="#booking" className="service-link" onClick={openBooking}>Build an event</a>
              </div>
            </div>
          </section>

          {/* ── Portfolio ── */}
          <section id="portfolio" ref={portfolioRef} className="portfolio-section reveal-zone">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 className="reveal-item">OUR PAST PRODUCTIONS</h2>
              <p className="reveal-item" style={{ textAlign: 'center', color: '#888', marginBottom: '50px' }}>
                A glimpse inside engineered crowd experiences and structural stages.
              </p>
              <div className="portfolio-grid">
                <div className="portfolio-card reveal-item" style={{ '--delay': '0ms' }}>
                  <div className="portfolio-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" alt="Neon Rave Showcase" className="portfolio-img" />
                  </div>
                  <div className="portfolio-card-info">
                    <span className="portfolio-tag">LIVE EXPERIENCES</span>
                    <h3>Neon Warehouse Rave</h3>
                    <p>Complete 360 sound engineering, spatial design, and custom laser arrays synchronized for 2,500 sub-bass enthusiasts.</p>
                  </div>
                </div>
                <div className="portfolio-card reveal-item" style={{ '--delay': '90ms' }}>
                  <div className="portfolio-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" alt="Vip Club Launch" className="portfolio-img" />
                  </div>
                  <div className="portfolio-card-info">
                    <span className="portfolio-tag">PARTIES</span>
                    <h3>Sub-Zero Private Nightlife</h3>
                    <p>High-end club staging featuring responsive kinetic structures, personalized geometric VIP booths, and projection-mapped art installations.</p>
                  </div>
                </div>
                <div className="portfolio-card reveal-item" style={{ '--delay': '180ms' }}>
                  <div className="portfolio-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" alt="Corporate Showcase" className="portfolio-img" />
                  </div>
                  <div className="portfolio-card-info">
                    <span className="portfolio-tag">EVENTS</span>
                    <h3>AeroTech Tech Summit</h3>
                    <p>Corporate projection mapping environments and immersive multi-tiered stages built to deliver a stunning modern presentation flow.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Contact Banner ── */}
          <section id="contact" ref={contactBannerRef} className="contact reveal-zone">
            <div className="contact-decor" aria-hidden="true"></div>
            <div className="contact-panel reveal-item">
              <h2>We Create Obsessions.</h2>
              <p>Every light cue. Every sound wave. Every moment engineered for impact.</p>
              <button type="button" className="btn red-btn" onClick={() => setContactModalOpen(true)}>Contact Us</button>
            </div>
          </section>

          {/* ── Contact Modal ── */}
          {contactModalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div onClick={() => setContactModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}></div>
              <div style={{ position: 'relative', zIndex: 10, background: 'rgba(10,10,10,0.95)', border: '1px solid #ff000033', borderRadius: '16px', padding: '44px 40px', maxWidth: '460px', width: '90%' }}>
                <button onClick={() => setContactModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                <p className="modal-kicker">Get in touch</p>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Contact Us</h2>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>Reach out directly — we'd love to hear from you.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <a href="https://mail.google.com/mail/?view=cm&to=mujju7794@gmail.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff11', borderRadius: '12px', padding: '16px 20px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff000066'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff11'}>
                    <span style={{ fontSize: '1.4rem' }}>✉️</span>
                    <div>
                      <p style={{ color: '#888', fontSize: '11px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</p>
                      <p style={{ color: '#fff', fontSize: '15px' }}>mujju7794@gmail.com</p>
                    </div>
                  </a>

                  <a href="tel:+918179770342" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff11', borderRadius: '12px', padding: '16px 20px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff000066'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff11'}>
                    <span style={{ fontSize: '1.4rem' }}>📞</span>
                    <div>
                      <p style={{ color: '#888', fontSize: '11px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</p>
                      <p style={{ color: '#fff', fontSize: '15px' }}>+91 81797 70342</p>
                    </div>
                  </a>

                  <a href="https://wa.me/918179770342" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff11', borderRadius: '12px', padding: '16px 20px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff000066'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff11'}>
                    <span style={{ fontSize: '1.4rem' }}>💬</span>
                    <div>
                      <p style={{ color: '#888', fontSize: '11px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</p>
                      <p style={{ color: '#fff', fontSize: '15px' }}>+91 81797 70342</p>
                    </div>
                  </a>

                  <a href="https://www.instagram.com/mr._muzammil_885/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff11', borderRadius: '12px', padding: '16px 20px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff000066'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff11'}>
                    <span style={{ fontSize: '1.4rem' }}>📸</span>
                    <div>
                      <p style={{ color: '#888', fontSize: '11px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>Instagram</p>
                      <p style={{ color: '#fff', fontSize: '15px' }}>@mr._muzammil_885</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <footer>
            <div className="footer-content">
              <p>&copy; 2026 ECSTASY Event Production</p>
              <p>All rights reserved. Designed for immersive event experiences.</p>
              <p>Terms of Service &bull; Privacy Policy &bull; Site Performance</p>
            </div>
          </footer>

          {/* ── Booking Modal ── */}
          <div
            className={`booking-modal ${bookingOpen ? 'is-open' : ''}`}
            id="booking"
            aria-hidden={!bookingOpen}
            ref={bookingRef}
          >
            <div className="booking-backdrop" onClick={() => setBookingOpen(false)}></div>
            <div className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
              <button className="modal-close" type="button" aria-label="Close booking form" onClick={() => setBookingOpen(false)}>&times;</button>
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
                          onClick={() => { setEventType(type); setEventSelectOpen(false); }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="eventType" value={eventType} readOnly />
                  </div>
                </label>
                <label>Event Date <input type="date" name="eventDate" required /></label>
                <label>Guest Count <input type="number" name="guestCount" min="20" placeholder="250" /></label>
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
                  <textarea name="vision" rows="4" placeholder="Tell us the mood, venue, music, and production style."></textarea>
                </label>
                <button type="submit" className="btn red-btn" disabled={sent}>
                  {sent ? 'Request Sent' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;