function HeroBanner({ config, onRegisterClick }) {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1 className="hero-title">{config.name}</h1>
        <div className="hero-details">
          <span className="hero-tag">{config.game}</span>
          <span className="hero-tag">{config.format}</span>
        </div>
        <p className="hero-date">{config.date}</p>
        <p className="hero-prize">Prize Pool: {config.prizePool}</p>
        <button className="hero-cta" onClick={onRegisterClick}>Register Now</button>
      </div>
    </section>
  );
}

export default HeroBanner;
