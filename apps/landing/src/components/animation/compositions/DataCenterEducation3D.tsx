import React from 'react';
import { Sequence, AbsoluteFill, Audio, staticFile, useVideoConfig } from 'remotion';
import { ServerRack3D } from '../3d/ServerRack3D';
import { DataCenterOverview3D } from '../3d/DataCenterOverview3D';
import { CoolingSystem3D } from '../3d/CoolingSystem3D';
import { PowerSystem3D } from '../3d/PowerSystem3D';
import { NetworkTopology3D } from '../3d/NetworkTopology3D';

interface TitleCardProps {
  title: string;
  subtitle?: string;
  background?: string;
}

const TitleCard: React.FC<TitleCardProps> = ({ title, subtitle, background = '#0a0a1a' }) => {
  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${background} 0%, #1a1a2e 100%)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '72px', 
        fontWeight: 'bold',
        margin: 0,
        textAlign: 'center',
        textShadow: '0 4px 6px rgba(0,0,0,0.5)'
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ 
          fontSize: '32px', 
          marginTop: '20px',
          opacity: 0.8,
          textAlign: 'center'
        }}>
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};

interface TransitionProps {
  text: string;
  color?: string;
}

const Transition: React.FC<TransitionProps> = ({ text, color = '#00ff88' }) => {
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: color,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '20px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        border: `2px solid ${color}`,
        boxShadow: `0 0 40px ${color}40`
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: 0,
          textAlign: 'center',
          textShadow: `0 0 20px ${color}`
        }}>
          {text}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

interface ChapterTitleProps {
  chapter: number;
  title: string;
  description: string;
}

const ChapterTitle: React.FC<ChapterTitleProps> = ({ chapter, title, description }) => {
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0a2a 0%, #2a1a3a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      padding: '60px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '60px 80px',
        backdropFilter: 'blur(10px)',
        maxWidth: '900px'
      }}>
        <p style={{
          fontSize: '24px',
          color: '#00ff88',
          margin: 0,
          fontWeight: '600',
          letterSpacing: '2px'
        }}>
          CHAPTER {chapter}
        </p>
        <h2 style={{
          fontSize: '56px',
          fontWeight: 'bold',
          margin: '20px 0',
          background: 'linear-gradient(90deg, #00ff88, #00aaff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '24px',
          opacity: 0.9,
          lineHeight: 1.6,
          marginTop: '20px'
        }}>
          {description}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const DataCenterEducation3D: React.FC = () => {
  const { fps } = useVideoConfig();
  
  // Duration for each section (in frames)
  const titleDuration = 150; // 5 seconds
  const overviewDuration = 450; // 15 seconds
  const chapterDuration = 90; // 3 seconds
  const serverRackDuration = 360; // 12 seconds
  const networkDuration = 360; // 12 seconds
  const coolingDuration = 360; // 12 seconds
  const powerDuration = 360; // 12 seconds
  const transitionDuration = 60; // 2 seconds
  const outroDuration = 150; // 5 seconds
  
  let currentFrame = 0;

  return (
    <>
      {/* Opening Title */}
      <Sequence from={currentFrame} durationInFrames={titleDuration}>
        <TitleCard 
          title="Data Center Infrastructure"
          subtitle="A Complete 3D Journey Through Modern Data Centers"
        />
      </Sequence>
      
      {/* Overview of Data Center */}
      <Sequence from={currentFrame += titleDuration} durationInFrames={overviewDuration}>
        <DataCenterOverview3D />
      </Sequence>
      
      {/* Chapter 1: IT Equipment */}
      <Sequence from={currentFrame += overviewDuration} durationInFrames={chapterDuration}>
        <ChapterTitle
          chapter={1}
          title="IT Equipment"
          description="The computational backbone of the data center - servers, storage, and networking equipment working in harmony."
        />
      </Sequence>
      
      {/* Server Rack Deep Dive */}
      <Sequence from={currentFrame += chapterDuration} durationInFrames={serverRackDuration}>
        <ServerRack3D />
      </Sequence>
      
      {/* Network Topology */}
      <Sequence from={currentFrame += serverRackDuration} durationInFrames={transitionDuration}>
        <Transition text="Network Architecture" color="#00aaff" />
      </Sequence>
      
      <Sequence from={currentFrame += transitionDuration} durationInFrames={networkDuration}>
        <NetworkTopology3D />
      </Sequence>
      
      {/* Chapter 2: Power Infrastructure */}
      <Sequence from={currentFrame += networkDuration} durationInFrames={chapterDuration}>
        <ChapterTitle
          chapter={2}
          title="Power Infrastructure"
          description="Ensuring uninterrupted power through multiple layers of redundancy and backup systems."
        />
      </Sequence>
      
      {/* Power System */}
      <Sequence from={currentFrame += chapterDuration} durationInFrames={powerDuration}>
        <PowerSystem3D />
      </Sequence>
      
      {/* Chapter 3: Cooling Systems */}
      <Sequence from={currentFrame += powerDuration} durationInFrames={chapterDuration}>
        <ChapterTitle
          chapter={3}
          title="Cooling Systems"
          description="Managing heat efficiently with precision cooling and airflow optimization."
        />
      </Sequence>
      
      {/* Cooling System */}
      <Sequence from={currentFrame += chapterDuration} durationInFrames={coolingDuration}>
        <CoolingSystem3D />
      </Sequence>
      
      {/* Final Overview */}
      <Sequence from={currentFrame += coolingDuration} durationInFrames={transitionDuration}>
        <Transition text="Complete Infrastructure" color="#00ff88" />
      </Sequence>
      
      <Sequence from={currentFrame += transitionDuration} durationInFrames={overviewDuration}>
        <DataCenterOverview3D />
      </Sequence>
      
      {/* Closing */}
      <Sequence from={currentFrame += overviewDuration} durationInFrames={outroDuration}>
        <AbsoluteFill style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          padding: '60px'
        }}>
          <h2 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            Thank You for Watching
          </h2>
          <p style={{
            fontSize: '24px',
            opacity: 0.8,
            marginTop: '20px',
            textAlign: 'center'
          }}>
            Understanding the infrastructure that powers our digital world
          </p>
          <div style={{
            marginTop: '60px',
            padding: '20px 40px',
            background: 'linear-gradient(90deg, #00ff88, #00aaff)',
            borderRadius: '50px'
          }}>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0,
              color: '#0a0a1a'
            }}>
              Learn More at datacenter.edu
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </>
  );
};