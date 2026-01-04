
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-zinc-900 dark:to-black font-sans">
      <header className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">Webhook Delivery</span>
        </div>
        <nav className="hidden md:flex gap-8 text-blue-900 dark:text-blue-200 font-medium">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="/docs" className="hover:text-blue-600 transition-colors">Docs</a>
        </nav>
           <div className="hidden md:flex gap-4">
             <a href="/login" className="px-6 py-2 bg-white text-blue-700 border border-blue-700 rounded-full font-semibold shadow hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-200 dark:border-blue-300 dark:hover:bg-zinc-800 transition-colors">Login</a>
             <a href="/signup" className="hidden md:inline-block px-6 py-2 bg-blue-700 text-white rounded-full font-semibold shadow hover:bg-blue-800 transition-colors">Sign Up</a>
           </div>
      </header>

      <main className="flex flex-col items-center justify-center px-4 py-20 max-w-4xl mx-auto">
        <section className="w-full flex flex-col items-center text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-800 dark:text-blue-200 mb-6 leading-tight">
            Reliable Webhook Delivery for Modern Apps
          </h1>
          <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-8 max-w-2xl">
            Effortlessly manage, deliver, and monitor your webhooks with enterprise-grade reliability, security, and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="px-8 py-3 bg-blue-700 text-white rounded-full font-semibold shadow hover:bg-blue-800 transition-colors text-lg">Get Started</a>
            <a href="/docs" className="px-8 py-3 bg-white/80 dark:bg-zinc-900/80 border border-blue-700 dark:border-blue-300 text-blue-700 dark:text-blue-200 rounded-full font-semibold shadow hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors text-lg">View Docs</a>
          </div>
        </section>

        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 className="text-xl font-bold mb-2">Guaranteed Delivery</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Never miss an event. Our retry logic and monitoring ensure your webhooks always reach their destination.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 className="text-xl font-bold mb-2">Real-Time Analytics</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Track delivery, failures, and performance with beautiful dashboards and instant notifications.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 7h20"/></svg>
            <h3 className="text-xl font-bold mb-2">Secure & Scalable</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Enterprise-grade security, encryption, and horizontal scaling for peace of mind at any volume.</p>
          </div>
        </section>

        <section id="about" className="w-full flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">Why Webhook Delivery?</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-2xl mb-4">
            Webhook Delivery is trusted by developers and companies to power mission-critical integrations. Our platform is built for reliability, transparency, and developer happiness.
          </p>
        </section>

        <footer className="w-full text-center text-zinc-500 dark:text-zinc-400 py-8 border-t border-zinc-200 dark:border-zinc-800 mt-12">
             {/* ...existing code... */}
        </footer>
      </main>
    </div>
  );
}
