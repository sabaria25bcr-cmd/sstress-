const About = () => {
  return (
    <div className="fixed inset-0 z-0">
      <iframe
        src="/about.html"
        title="About - Stress Sharing Platform"
        className="w-full h-full border-0"
        style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
      />
    </div>
  )
}

export default About
