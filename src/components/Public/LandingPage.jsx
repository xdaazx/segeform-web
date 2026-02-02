import { Shield, BookOpen, Award, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import '../../App.css';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <nav className="navbar-segeform">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* ✅ LOGO EN NAVBAR */}
          <img 
            src="/logo_segeform.png" 
            alt="Logo SEGEFORM" 
            style={{ height: '40px', width: 'auto' }} 
          />
          <div className="logo-text">SEGEFORM</div>
        </div>
        <button onClick={() => navigate('/login')} className="btn-gold-admin">
          ACCESO ADMIN
        </button>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        {/* ✅ LOGO COMO INSIGNIA EN HERO */}
        <img 
          src="/logo_segeform.png" 
          alt="Insignia" 
          style={{ height: '100px', marginBottom: '20px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
        />
        <h1>Centro <span>de Capacitación</span></h1>
        <p>"Formando la élite de la seguridad integral en el Ecuador"</p>
      </header>

      {/* NIVELES DE FORMACIÓN: Tarjetas Flotantes */}
      <section className="levels-container">
        <div className="card">
          <BookOpen size={40} color="#b8860b" />
          <h3>Nivel I</h3>
          <p>Formación inicial para nuevos aspirantes.</p>
          <strong>120 HORAS ACADÉMICAS</strong>
        </div>
        <div className="card">
          <Shield size={40} color="#b8860b" />
          <h3>Nivel II</h3>
          <p>Tácticas avanzadas y especialización.</p>
          <strong>120 HORAS ACADÉMICAS</strong>
        </div>
        <div className="card">
          <Award size={40} color="#b8860b" />
          <h3>Reentrenamiento</h3>
          <p>Actualización de conocimientos y tácticas.</p>
          <strong>18 HORAS ACADÉMICAS</strong>
        </div>
      </section>

      {/* CARRUSEL DE TRAYECTORIA (Imágenes Rotativas) */}
      <section className="carousel-section">
        <div className="section-title">
          <Users size={32} color="#4b5320" />
          <h2 style={{color: '#4b5320', fontWeight: '900', marginLeft: '10px'}}>NUESTRA TRAYECTORIA</h2>
        </div>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="mySwiper"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <SwiperSlide key={i}>
              <div className="gallery-item">
                <img src={`https://images.unsplash.com/photo-1590044591223-4cd73a7e941c?auto=format&fit=crop&w=400`} alt="Entrenamiento" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* UBICACIÓN CON MAPA SEÑALADO */}
      <section className="location-container">
        <div className="location-card-info">
          <MapPin size={40} color="#b8860b" />
          <h2>Nuestra Ubicación</h2>
          <p><strong>Cámara de Industrias de Machala</strong></p>
          <p>Av. Las Palmeras 2101 y 13va Sur</p>
          <p>Machala, El Oro, Ecuador</p>
        </div>
        <div className="map-frame-wrapper">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.232334460515!2d-79.9657!3d-3.2688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x90330e7025816911%3A0x6436e2d832a76f25!2zQ8OhbWFyYSBkZSBJbmR1c3RyaWFzIGRlIE1hY2hhbGE!5e0!3m2!1ses-419!2sec!4v1700000000000" 
            width="100%" height="350" style={{ border: 0, borderRadius: '20px' }} allowFullScreen="" loading="lazy">
          </iframe>
        </div>
      </section>

      <footer className="footer-segeform">
        <p>© 2026 SEGEFORM CIA. LTDA. | Machala, El Oro</p>
      </footer>
    </div>
  );
};

export default LandingPage;