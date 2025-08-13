import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { DataCenterRackEducation } from '../components/animation/DataCenterRackAnimation';
import { ServerModuleCombined } from '../components/animation/ServerModuleCombined';
import { DataCenterEducation3D } from '../components/animation/compositions/DataCenterEducation3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, RotateCcw, Download, Share2, BookOpen, Zap, Shield, Activity } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BRAND_COLORS } from '@/constants/styles';

const DemoPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerRef, setPlayerRef] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<'rack' | 'module' | 'education3d'>('rack');
  const [currentFrame, setCurrentFrame] = useState(0);
  const { id } = useParams<{ id?: string }>();

  const handlePlayPause = () => {
    if (playerRef) {
      if (isPlaying) {
        playerRef.pause();
      } else {
        playerRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (playerRef) {
      playerRef.seekTo(0);
      setIsPlaying(false);
    }
  };

  const handleVideoChange = (video: 'rack' | 'module' | 'education3d') => {
    setSelectedVideo(video);
    setIsPlaying(false);
    // Reset player to beginning when switching videos
    setTimeout(() => {
      if (playerRef) {
        playerRef.seekTo(0);
      }
    }, 100);
    setCurrentFrame(0);
  };

  // Allow deep-linking: /demo/:id -> preselect demo
  useEffect(() => {
    if (!id) return;
    const normalized = id.toLowerCase();
    if (normalized === 'rack') setSelectedVideo('rack');
    else if (normalized === 'module' || normalized === 'server-module') setSelectedVideo('module');
    else if (['education3d', '3d', 'datacenter-3d'].includes(normalized)) setSelectedVideo('education3d');
  }, [id]);

  // Total frames for the selected video (0-indexed max)
  // Declared after currentVideo to avoid temporal dead zone issues

  // Poll current frame from the PlayerRef to sync the scrubber position
  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (playerRef && typeof playerRef.getCurrentFrame === 'function') {
          const f = playerRef.getCurrentFrame();
          if (typeof f === 'number') {
            setCurrentFrame(f);
          }
        }
      } catch {}
    }, 100);
    return () => clearInterval(id);
  }, [playerRef]);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Interactive Learning",
      description: "Engage with professional-grade animations that break down complex infrastructure concepts into digestible segments."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Industry Standards",
      description: "Learn real-world data center configurations used by Fortune 500 companies and cloud providers."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Live Metrics",
      description: "Understand system performance monitoring with real-time visualizations and key performance indicators."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Comprehensive Guide",
      description: "Master server racks, networking, storage, and power distribution with detailed explanations."
    }
  ];

  const specifications = [
    { label: "Rack Standard", value: "42U Enterprise" },
    { label: "Network Switch", value: "48-Port Gigabit" },
    { label: "Storage Capacity", value: "96TB RAID 10" },
    { label: "Power Management", value: "Intelligent PDU" },
    { label: "Redundancy", value: "N+1 Configuration" },
    { label: "Monitoring", value: "Real-time Metrics" },
  ];

  const videos = {
    rack: {
      component: DataCenterRackEducation,
      duration: 600,
      title: "Data Center Rack Infrastructure",
      description: "Learn about physical rack components, power, cooling, and cable management in enterprise data centers.",
      timeline: [
        { time: "0-3s", title: "Introduction", desc: "Welcome and overview" },
        { time: "3-8s", title: "Rack Assembly", desc: "Components slide into position" },
        { time: "8-12s", title: "Network Connections", desc: "Cable animations show data flow" },
        { time: "12-20s", title: "System Overview", desc: "Performance metrics and summary" }
      ]
    },
    module: {
      component: ServerModuleCombined,
      duration: 2700,
      title: "Module 3.1: Server Technologies",
      description: "Complete educational module covering server fundamentals, from basic concepts to real-world applications.",
      timeline: [
        { time: "0-30s", title: "Module Introduction", desc: "Welcome to server technologies" },
        { time: "30-60s", title: "What Is a Server?", desc: "Define servers and client-server architecture" },
        { time: "60-90s", title: "Server vs Desktop", desc: "Key differences and advantages" },
      ]
    },
    education3d: {
      component: DataCenterEducation3D,
      duration: 3600,
      title: "3D Data Center Journey",
      description: "Full 3D walkthrough of modern data center infrastructure: IT, power, cooling, and networking.",
      timeline: [
        { time: "0-5s", title: "Title", desc: "Opening title card" },
        { time: "5-20s", title: "Overview", desc: "Data center floor layout" },
        { time: "20-35s", title: "IT Equipment", desc: "Server racks deep dive" },
        { time: "35-47s", title: "Networking", desc: "Topology visualized" },
        { time: "47-59s", title: "Power", desc: "UPS/PDUs redundancy" },
        { time: "59-71s", title: "Cooling", desc: "Airflow and precision cooling" },
      ]
    }
  };

  const currentVideo = videos[selectedVideo];
  // Total frames for the selected video (0-indexed max)
  const maxFrames = currentVideo.duration - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/favicon.png" 
                  alt="GigaWatt Academy Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold" style={{ color: BRAND_COLORS.PRIMARY }}>
                  GigaWatt Academy
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-lg hover:opacity-80 transition-opacity"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Home
              </Link>
              <Link 
                to="/application" 
                className="px-4 py-2 rounded-lg transition-colors text-white"
                style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge 
              className="mb-4 text-white border-2"
              style={{ 
                backgroundColor: `${BRAND_COLORS.PRIMARY}20`,
                borderColor: `${BRAND_COLORS.PRIMARY}40`,
                color: BRAND_COLORS.PRIMARY
              }}
            >
              Interactive Demo
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              {currentVideo.title}
              <span className="block text-transparent bg-clip-text" style={{ 
                backgroundImage: `linear-gradient(45deg, ${BRAND_COLORS.PRIMARY}, ${BRAND_COLORS.ACCENT})`,
                WebkitBackgroundClip: 'text'
              }}>
                Interactive Demo
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              {currentVideo.description}
            </p>

            {/* Video Selection Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => handleVideoChange('rack')}
                variant={selectedVideo === 'rack' ? 'default' : 'outline'}
                size="lg"
                className={`${
                  selectedVideo === 'rack' 
                    ? 'text-white' 
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
                style={selectedVideo === 'rack' ? { backgroundColor: BRAND_COLORS.PRIMARY } : {}}
              >
                <Shield className="h-5 w-5 mr-2" />
                Rack Infrastructure Demo
              </Button>
              <Button
                onClick={() => handleVideoChange('module')}
                variant={selectedVideo === 'module' ? 'default' : 'outline'}
                size="lg"
                className={`${
                  selectedVideo === 'module' 
                    ? 'text-white' 
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
                style={selectedVideo === 'module' ? { backgroundColor: BRAND_COLORS.PRIMARY } : {}}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Module 3.1: Server Technologies
              </Button>
              <Button
                onClick={() => handleVideoChange('education3d')}
                variant={selectedVideo === 'education3d' ? 'default' : 'outline'}
                size="lg"
                className={`${
                  selectedVideo === 'education3d' 
                    ? 'text-white' 
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
                style={selectedVideo === 'education3d' ? { backgroundColor: BRAND_COLORS.PRIMARY } : {}}
              >
                <Zap className="h-5 w-5 mr-2" />
                3D Data Center Journey
              </Button>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative max-w-6xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Player
                    ref={setPlayerRef}
                    component={currentVideo.component}
                    durationInFrames={currentVideo.duration}
                    compositionWidth={1920}
                    compositionHeight={1080}
                    fps={30}
                    controls={false}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    loop
                    autoPlay={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* External Controls: below the video frame */}
          <div className="max-w-6xl mx-auto mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handlePlayPause}
                        size="lg"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        {isPlaying ? (
                          <PauseCircle className="h-6 w-6 mr-2" />
                        ) : (
                          <PlayCircle className="h-6 w-6 mr-2" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button
                        onClick={handleRestart}
                        variant="outline"
                        size="lg"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Restart
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  {/* Scrubber */}
                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 text-sm w-16 text-right">
                      {Math.floor(currentFrame / 30)}s
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={maxFrames}
                      value={currentFrame}
                      onChange={(e) => {
                        const f = Number(e.target.value);
                        setCurrentFrame(f);
                        if (playerRef) playerRef.seekTo(f);
                      }}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-slate-300 text-sm w-16">
                      {Math.floor(currentVideo.duration / 30)}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Animation Timeline */}
          <div className="mt-8 max-w-4xl mx-auto">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  Animation Timeline
                </CardTitle>
                <CardDescription>
                  Key moments in the {selectedVideo === 'rack' ? '20-second' : selectedVideo === 'module' ? '90-second' : '120-second'} educational journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-1 ${currentVideo.timeline.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
                  {currentVideo.timeline.map((phase, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                      <Badge className="mb-2 bg-blue-600/20 text-blue-300">
                        {phase.time}
                      </Badge>
                      <h4 className="text-white font-semibold mb-1">{phase.title}</h4>
                      <p className="text-slate-400 text-sm">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Why This Animation Works
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built with industry best practices and educational psychology principles 
              to maximize learning outcomes and retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-blue-600/20 rounded-lg w-fit mb-4">
                    <div className="text-blue-400">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-600/10 text-green-400 border-green-600/20">
                Technical Details
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-6">
                Enterprise-Grade Configuration
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                This animation showcases a production-ready 42U rack configuration 
                that you'll encounter in real data centers. Every component follows 
                industry standards and best practices.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                    <span className="text-slate-400">{spec.label}</span>
                    <span className="text-white font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-400" />
                    Production Ready
                  </CardTitle>
                  <CardDescription>
                    Real-world deployment specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2">High Availability</h4>
                    <p className="text-slate-300 text-sm">
                      N+1 redundancy ensures 99.9% uptime with automatic failover capabilities.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-2">Performance Monitoring</h4>
                    <p className="text-slate-300 text-sm">
                      Real-time metrics for CPU, memory, network, and power consumption.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-2">Scalable Architecture</h4>
                    <p className="text-slate-300 text-sm">
                      Modular design allows easy expansion and component upgrades.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/10 to-green-600/10 border-y border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Launch Your Six-Figure Career?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            This animation represents the kind of professional infrastructure knowledge you'll master 
            at GigaWatt Academy. Join 1,000s of professionals powering the global AI revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-white"
              style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
            >
              <Link to="/application">
                Apply to Bootcamp
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link to="/">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src="/favicon.png" 
                alt="GigaWatt Academy Logo" 
                className="h-6 w-6 object-contain"
              />
              <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.PRIMARY }}>
                GigaWatt Academy
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 GigaWatt Academy. Professional Data Center Training.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;