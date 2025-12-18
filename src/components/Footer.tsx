import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-bg-900 text-white py-16 border-t border-cyan-accent/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-cyan-accent to-teal-accent bg-clip-text text-transparent">
              cmoxpert
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Tech-enabled fractional CMO services for growing companies
            </p>
          </div>
          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-lg text-white">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/packages" className="hover:text-cyan-accent transition-colors">Pricing</Link></li>
              <li><Link to="/audit" className="hover:text-cyan-accent transition-colors">Free Audit</Link></li>
              <li><Link to="/beta" className="hover:text-cyan-accent transition-colors">Platform Demo</Link></li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-lg text-white">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/contact" className="hover:text-cyan-accent transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-cyan-accent transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-accent transition-colors">Terms</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg text-white">Get Started</h4>
            <Link
              to="/audit"
              className="inline-block bg-gradient-to-r from-cyan-accent to-teal-accent hover:from-cyan-accent/90 hover:to-teal-accent/90 text-dark-bg-500 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              Free Audit
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>© 2024 cmoxpert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
