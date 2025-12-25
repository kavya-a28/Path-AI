import React, { useEffect, useRef, useState } from 'react';
import { Brain, TrendingUp, Briefcase, Calendar, Target, ArrowRight, Sparkles, Award, BookOpen } from 'lucide-react';
import * as THREE from 'three';

// Accept onNavigate as a prop to handle screen switching
const LandingPage = ({ onNavigate }) => {
  const mountRef = useRef(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeSkill, setActiveSkill] = useState(0);

  const skills = [
    { name: 'Data Structures', icon: '📊', color: 'from-blue-500 to-blue-600' },
    { name: 'Web Development', icon: '🌐', color: 'from-cyan-500 to-cyan-600' },
    { name: 'Cybersecurity', icon: '🔐', color: 'from-teal-500 to-teal-600' },
    { name: 'Machine Learning', icon: '🤖', color: 'from-green-500 to-green-600' },
    { name: 'Cloud Computing', icon: '☁️', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Mobile Dev', icon: '📱', color: 'from-purple-500 to-purple-600' }
  ];

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Mentor",
      description: "Personal AI coach that understands your goals, schedule, and learning style.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "Track progress with detailed insights and adaptive scheduling.",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Career Advisor",
      description: "Get matched with opportunities aligned to your skills and roadmap.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Dynamic Rescheduling",
      description: "Fell sick or busy? AI automatically adjusts your entire roadmap in real-time.",
      color: "from-green-500 to-green-600"
    }
  ];

  // 1. THREE.JS ENGINE (Functional & Fixed)
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0x66ccff, 1.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Student Particles
    const studentGeometry = new THREE.BufferGeometry();
    const studentCount = 800;
    const positions = new Float32Array(studentCount * 3);
    for (let i = 0; i < studentCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    studentGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const studentMaterial = new THREE.PointsMaterial({ color: 0x66ccff, size: 0.04, transparent: true, opacity: 0.8 });
    const student = new THREE.Points(studentGeometry, studentMaterial);
    scene.add(student);

    // AI Core
    const aiCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.6, transparent: true, opacity: 0 })
    );
    aiCore.position.y = 2;
    scene.add(aiCore);

    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 + i * 0.3, 0.03, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(aiCore.position);
      scene.add(ring);
      rings.push(ring);
    }

    // Roadmap Path
    const pathPoints = [];
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      pathPoints.push(new THREE.Vector3(Math.sin(t * Math.PI * 3) * 5, t * 10 - 2, Math.cos(t * Math.PI * 2) * 3));
    }
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0 });
    const roadmap = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(roadmap);

    // Milestones
    const milestones = [];
    const milestoneColors = [0x3b82f6, 0x06b6d4, 0x10b981, 0xf59e0b, 0x22c55e];
    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 20, 20),
        new THREE.MeshStandardMaterial({ color: milestoneColors[i], emissive: milestoneColors[i], emissiveIntensity: 0.6, transparent: true, opacity: 0 })
      );
      mesh.position.copy(pathPoints[i * 12]);
      scene.add(mesh);
      milestones.push(mesh);
    }

    let time = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      time += 0.01;
      student.rotation.y += 0.002;

      if (time > 2) {
        studentMaterial.opacity = Math.max(0, 1 - (time - 2) * 0.5);
        aiCore.material.opacity = Math.min(1, (time - 2) * 0.4);
      }
      aiCore.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
      rings.forEach((r, i) => { r.rotation.z += 0.01 + i * 0.003; });
      
      if (time > 4) { pathMaterial.opacity = Math.min(1, (time - 4) * 0.3); }
      
      milestones.forEach((m, i) => {
        if (time > 5 + i * 0.6) {
          m.material.opacity = 1;
          const s = 1 + Math.sin(time * 3 + i) * 0.15;
          m.scale.set(s, s, s);
        }
      });
      
      camera.position.x = Math.sin(time * 0.2) * 1.5;
      camera.lookAt(0, 3, 0);
      renderer.render(scene, camera);
      return animationId;
    };
    const id = animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(id);
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  // 2. AUTO-SWITCH SKILLS LOGIC
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkill((prev) => (prev + 1) % skills.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [skills.length]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* BACKGROUND LAYER */}
      <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      <div className="relative z-10">
        {/* NAV */}
        <nav className="flex justify-between items-center px-10 py-6 bg-white/40 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">PathAI</span>
          </div>
          <div className="hidden md:flex space-x-8 font-bold text-slate-600">
            <button className="hover:text-blue-600 cursor-pointer transition-colors">Features</button>
            {/* Added onClick={onNavigate} here */}
            <button 
              onClick={onNavigate}
              className="bg-linear-to-r from-blue-500 to-cyan-500 text-white px-8 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg cursor-pointer"
            >
              Login
            </button>
          </div>
        </nav>

        {/* HERO */}
        <div className="max-w-7xl mx-auto px-8 pt-24 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-xs font-black uppercase tracking-widest">AI-Powered Roadmap</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
            Your Personalized <br/>
            <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Roadmap to Success</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium">
            AI that adapts to your <span className="text-blue-600">9-6 college schedule</span>, understands your <span className="text-cyan-600">energy patterns</span>, and fast-tracks your career.
          </p>

          <div className="flex justify-center gap-4 mb-24">
            <button 
              onClick={onNavigate} // Switch to Auth/Sign-up
              className="bg-linear-to-r from-blue-500 to-cyan-500 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
            >
              Start Journey <ArrowRight />
            </button>
            <button className="bg-white border-2 border-blue-500 text-blue-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-colors">Watch Demo</button>
          </div>

          {/* SKILLS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-32">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl transition-all duration-500 cursor-pointer shadow-xl ${
                  activeSkill === idx 
                  ? 'bg-linear-to-br ' + skill.color + ' scale-110 text-white ring-4 ring-white/50' 
                  : 'bg-white text-slate-700 border border-slate-100'
                }`}
                onMouseEnter={() => setActiveSkill(idx)}
              >
                <div className="text-4xl mb-3">{skill.icon}</div>
                <div className="font-black text-sm uppercase tracking-tight">{skill.name}</div>
              </div>
            ))}
          </div>

          {/* ROADMAP VISUAL */}
          <div className="bg-white/60 backdrop-blur-xl border border-white p-12 rounded-[40px] shadow-2xl mb-32">
            <h3 className="text-3xl font-black text-slate-800 mb-12 flex items-center justify-center gap-3">
              <Award className="w-10 h-10 text-blue-600" /> Your Learning Journey
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {['🎯 Start', '📚 Learn', '🛠️ Build', '💻 Project', '🚀 Career'].map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[24px] bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-blue-200">
                      {step.split(' ')[0]}
                    </div>
                    <span className="mt-4 font-black text-slate-700 uppercase tracking-widest text-xs">{step.split(' ')[1]}</span>
                  </div>
                  {i < 4 && <div className="hidden md:block flex-1 h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-400 w-1/2 animate-pulse" />
                  </div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="max-w-7xl mx-auto px-8 pb-32 grid md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-10 bg-white rounded-[32px] shadow-xl border border-slate-50 transition-all duration-300 ${hoveredCard === i ? 'translate-y-[-10px] shadow-2xl ring-2 ring-blue-400' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${f.color} flex items-center justify-center text-white mb-8 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">{f.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;