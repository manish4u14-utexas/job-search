import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Target, Rocket, Brain } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'var(--neon-cyan)', overflow: 'hidden', position: 'relative' }} className="scanlines">
      {/* Animated background grid */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--neon-cyan), var(--neon-pink))' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '80rem', margin: '0 auto', padding: '1rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--neon-pink)', fontFamily: 'Orbitron, sans-serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            JOB SEARCH
          </h1>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            COMMAND CENTER
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', fontFamily: 'monospace', color: 'var(--neon-purple)' }}>
            AI-Powered Job Discovery & Application Management
          </p>
          <div style={{ width: '6rem', height: '0.25rem', margin: '0 auto 2rem', background: 'linear-gradient(to right, var(--neon-pink), var(--neon-cyan))' }} />
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
          {[
            {
              icon: Brain,
              title: "AI Matching",
              desc: "Intelligent job-to-profile matching",
            },
            {
              icon: Zap,
              title: "Real-Time Alerts",
              desc: "Instant notifications for top jobs",
            },
            {
              icon: Target,
              title: "Smart Tracking",
              desc: "Manage your application pipeline",
            },
            {
              icon: Rocket,
              title: "Auto-Apply",
              desc: "One-click job applications",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="hud-container"
              style={{ borderColor: 'var(--neon-cyan)', transition: 'all 0.3s' }}
            >
              <feature.icon style={{ width: '2rem', height: '2rem', marginBottom: '1rem', color: 'var(--neon-cyan)', transition: 'color 0.3s' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--neon-cyan)', transition: 'color 0.3s', fontFamily: 'Orbitron, sans-serif' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto' }} className="hud-container">
          <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>
            READY TO REVOLUTIONIZE YOUR JOB SEARCH?
          </h3>
          <p style={{ marginBottom: '2rem', color: '#d1d5db' }}>
            Connect your profile and let our AI find the perfect opportunities
            tailored to your skills and experience.
          </p>
          <Button 
            className="btn-neon"
            onClick={() => navigate("/dashboard")}
          >
            ENTER THE SYSTEM
          </Button>
        </div>

        {/* Footer Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', marginTop: '5rem', paddingTop: '5rem', borderTop: '1px solid rgba(0, 245, 255, 0.2)' }}>
          {[
            { label: "Jobs Tracked", value: "10K+" },
            { label: "Avg Match Score", value: "87%" },
            { label: "Applications", value: "1000+" },
          ].map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--neon-pink)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#9ca3af' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
