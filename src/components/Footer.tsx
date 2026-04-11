const Footer = () => {
  const links = {
    About: ["Contact Us", "About Us", "Careers", "Press"],
    Help: ["Payments", "Shipping", "Returns", "FAQ"],
    Policy: ["Return Policy", "Terms of Use", "Security", "Privacy"],
    Social: ["Facebook", "Twitter", "YouTube", "Instagram"],
  };

  return (
    <footer className="hero-gradient mt-8">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-sm text-primary-foreground/60">© 2026 Ecommerce Platform. All rights reserved.</span>
          <span className="text-sm text-primary-foreground/60">🔒 100% Secure Payments</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
