"""
Manim configuration and base classes for Module 3.1 Server Technologies
Based on master script 3-1.md with exact timing and content alignment
"""

from manim import *
import numpy as np
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Master script metadata and timing constants
@dataclass
class SegmentMetadata:
    id: str
    audience: List[str]
    duration: float  # in seconds
    dependency: Optional[str] = None
    can_skip_if: Optional[List[str]] = None
    prerequisite_knowledge: Optional[List[str]] = None
    learning_objective: Optional[str] = None
    quiz_checkpoint: bool = False
    background_music: Optional[str] = None
    volume_db: float = -18

# Script-aligned segment definitions
SEGMENT_METADATA = {
    "M3_1_INTRO_001": SegmentMetadata(
        id="M3.1_INTRO_001",
        audience=["ALL"],
        duration=30,
        dependency="M2_COMPLETE",
        can_skip_if=["RETURNING_VIEWER"],
        background_music="tech_ambient_01.mp3",
        volume_db=-18
    ),
    "M3_1_BASICS_001": SegmentMetadata(
        id="M3.1_BASICS_001",
        audience=["BEGINNER", "IT_SUPPORT"],
        duration=60,
        dependency="M3.1_INTRO_001",
        can_skip_if=["SOFTWARE_ENGINEER", "NETWORK_ENGINEER", "DEVOPS"],
        prerequisite_knowledge=["computer_basics"],
        learning_objective="Define what a server is and its purpose",
        quiz_checkpoint=True
    )
}

# Color scheme - Module 3 theme from master script
class Colors:
    PRIMARY = "#0066CC"      # Module 3 blues
    SECONDARY = "#4A90E2"
    ACCENT = "#F5A623"
    DARK = "#2C3E50"
    LIGHT = "#ECF0F1"
    SERVER = "#5DADE2"
    RACK = "#34495E"
    TEXT = "#FFFFFF"
    TEXT_DARK = "#2C3E50"
    CLIENT = "#9B59B6"
    CONNECTION = "#E74C3C"
    
    # Background gradients
    BG_PRIMARY = "#1a1a2e"
    BG_SECONDARY = "#16213e"
    
    # Server type colors
    COMPUTE = "#5DADE2"
    STORAGE = "#58D68D"
    NETWORK = "#F4D03F"

# Animation timing constants (aligned with master script)
class Timing:
    # Segment 1 timings (30 seconds total)
    INTRO_DURATION = 30
    TITLE_FADE_IN = 1.0
    TITLE_DISPLAY = 6.0
    RACK_APPEAR = 6.0
    SERVERS_SLIDE = 15.0
    NARRATION_1 = 2.0
    NARRATION_1_DURATION = 10.0
    NARRATION_2 = 15.0
    NARRATION_2_DURATION = 13.33
    TRANSITION_START = 25.0
    TRANSITION_DURATION = 5.0
    
    # Segment 2 timings (60 seconds total)
    BASICS_DURATION = 60
    TITLE_SHOW = [0, 1, 15, 16]  # fade in, hold, fade out
    SERVER_APPEAR = 1.0
    CLIENTS_START = 2.0
    CLIENTS_DELAYS = [2.0, 3.0, 4.0]
    CONNECTIONS_START = 5.0
    ACTIVITY_START = 8.0
    EXPLANATION_SHOW = [6.0, 7.0, 14.0, 15.0]
    FUN_FACT_TIMING = [10.0, 15.0]  # delay, duration
    COMPARISON_TIMING = [12.0, 8.0]  # from, duration
    ADVANTAGES_TIMING = [16.0, 17.0, 25.0, 26.0]
    ADVANTAGES_STAGGER = [18.0, 18.67, 19.33]  # stagger start times
    TRANSITION_TIMING = [24.0, 25.0]

class UserProfile:
    """User profile for personalization - matches Remotion implementation"""
    def __init__(
        self,
        audience: List[str] = None,
        skip_segments: List[str] = None,
        preferred_speed: float = 1.0,
        learning_path: str = "beginner",
        show_quizzes: bool = True,
        show_annotations: bool = True
    ):
        self.audience = audience or ["ALL"]
        self.skip_segments = skip_segments or []
        self.preferred_speed = preferred_speed
        self.learning_path = learning_path
        self.show_quizzes = show_quizzes
        self.show_annotations = show_annotations

# Predefined user profiles
DEFAULT_PROFILES = {
    "beginner": UserProfile(
        audience=["BEGINNER"],
        learning_path="beginner",
        show_quizzes=True,
        show_annotations=True
    ),
    "it_support": UserProfile(
        audience=["IT_SUPPORT"],
        learning_path="it_support",
        show_quizzes=True,
        show_annotations=True
    ),
    "software_engineer": UserProfile(
        audience=["SOFTWARE_ENGINEER"],
        learning_path="software_engineer",
        skip_segments=["M3.1_BASICS_001"],
        show_quizzes=False,
        show_annotations=False
    ),
    "manager": UserProfile(
        audience=["MANAGER", "CTO"],
        learning_path="manager",
        preferred_speed=1.5,
        show_quizzes=False,
        show_annotations=False
    ),
    "returning_viewer": UserProfile(
        audience=["ALL"],
        skip_segments=["M3.1_INTRO_001"],
        preferred_speed=1.2,
        show_quizzes=False,
        show_annotations=False
    )
}

class PersonalizationEngine:
    """Handles user personalization logic - matches Remotion implementation"""
    
    def __init__(self, user_profile: UserProfile):
        self.user_profile = user_profile
    
    def should_show_segment(self, segment_meta: SegmentMetadata) -> bool:
        """Determine if a segment should be shown"""
        # Check explicit skip list
        if segment_meta.id in self.user_profile.skip_segments:
            return False
        
        # Check canSkipIf conditions
        if (segment_meta.can_skip_if and 
            any(role in self.user_profile.audience for role in segment_meta.can_skip_if)):
            return False
        
        # Check audience targeting
        if (segment_meta.audience != ["ALL"] and 
            not any(audience in self.user_profile.audience for audience in segment_meta.audience)):
            return False
        
        return True
    
    def get_personalized_duration(self, base_duration: float, segment_meta: SegmentMetadata) -> float:
        """Get personalized duration based on user profile"""
        multiplier = 1.0
        
        # Adjust based on learning path
        if self.user_profile.learning_path == "beginner":
            multiplier = 1.2  # 20% longer
        elif self.user_profile.learning_path == "manager":
            multiplier = 0.7  # 30% shorter
        elif self.user_profile.learning_path == "software_engineer":
            multiplier = 0.8  # 20% shorter
        
        # Apply user's preferred speed
        multiplier /= self.user_profile.preferred_speed
        
        return base_duration * multiplier
    
    def should_show_quiz(self, segment_meta: SegmentMetadata) -> bool:
        """Determine if quiz checkpoints should be shown"""
        return (segment_meta.quiz_checkpoint and 
                self.user_profile.show_quizzes and
                not (self.user_profile.learning_path == "software_engineer"))

# Base scene class with common functionality
class ServerEducationScene(Scene):
    """Base scene class with shared functionality for all segments"""
    
    def __init__(self, user_profile: UserProfile = None, **kwargs):
        super().__init__(**kwargs)
        self.user_profile = user_profile or DEFAULT_PROFILES["beginner"]
        self.personalization = PersonalizationEngine(self.user_profile)
        self.background_color = Colors.BG_PRIMARY
    
    def setup_background(self):
        """Setup animated background matching Remotion implementation"""
        # Create gradient background
        background = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=[Colors.BG_PRIMARY, Colors.BG_SECONDARY],
            fill_opacity=1.0,
            stroke_width=0
        )
        self.add(background)
        
        # Add subtle ambient animation
        ambient_circle = Circle(
            radius=3.0,
            fill_color=Colors.PRIMARY,
            fill_opacity=0.1,
            stroke_width=0
        )
        ambient_circle.move_to(ORIGIN)
        self.add(ambient_circle)
        
        # Animate ambient effect
        self.play(
            ambient_circle.animate.scale(2).set_opacity(0.05),
            rate_func=there_and_back,
            run_time=10,
            remover=False
        )
    
    def create_title_animation(self, title: str, subtitle: str = None) -> VGroup:
        """Create animated title matching script timing"""
        title_group = VGroup()
        
        # Main title
        title_text = Text(
            title,
            font_size=48,
            color=Colors.TEXT,
            weight=BOLD
        )
        title_text.move_to(UP * 1.5)
        title_group.add(title_text)
        
        # Subtitle if provided
        if subtitle:
            subtitle_text = Text(
                subtitle,
                font_size=24,
                color=Colors.LIGHT,
                weight=NORMAL
            )
            subtitle_text.next_to(title_text, DOWN, buff=0.5)
            title_group.add(subtitle_text)
        
        return title_group
    
    def create_narration_overlay(self, text: str, position: np.ndarray = DOWN * 2.5) -> VGroup:
        """Create narration text overlay matching script content"""
        # Background box
        text_obj = Text(
            text,
            font_size=18,
            color=Colors.TEXT,
            line_spacing=1.6
        )
        text_obj.scale(0.8)
        
        # Calculate background size
        bg_width = min(text_obj.width + 2, config.frame_width * 0.8)
        bg_height = text_obj.height + 1
        
        background = RoundedRectangle(
            width=bg_width,
            height=bg_height,
            corner_radius=0.2,
            fill_color=Colors.DARK,
            fill_opacity=0.9,
            stroke_color=Colors.LIGHT,
            stroke_width=1,
            stroke_opacity=0.3
        )
        
        overlay_group = VGroup(background, text_obj)
        overlay_group.move_to(position)
        
        return overlay_group
    
    def wait_for_narration(self, duration: float):
        """Wait for narration timing - can be sped up based on user profile"""
        actual_duration = duration / self.user_profile.preferred_speed
        self.wait(actual_duration)

# Animation utility functions
def create_server_rack(show_servers: bool = False) -> VGroup:
    """Create animated server rack matching Remotion implementation"""
    rack_group = VGroup()
    
    # Rack frame
    rack_frame = RoundedRectangle(
        width=4,
        height=6,
        corner_radius=0.1,
        fill_color=Colors.RACK,
        fill_opacity=0.1,
        stroke_color=Colors.RACK,
        stroke_width=3
    )
    rack_group.add(rack_frame)
    
    # Rack units (horizontal lines)
    for i in range(10):
        y_pos = 2.5 - (i * 0.5)
        unit_line = Line(
            start=LEFT * 1.8,
            end=RIGHT * 1.8,
            stroke_color=Colors.LIGHT,
            stroke_width=1,
            stroke_opacity=0.2
        )
        unit_line.move_to(UP * y_pos)
        rack_group.add(unit_line)
    
    # Add servers if requested
    if show_servers:
        server_types = ["compute", "storage", "network"]
        server_colors = [Colors.COMPUTE, Colors.STORAGE, Colors.NETWORK]
        
        for i, (server_type, color) in enumerate(zip(server_types, server_colors)):
            server = create_server_unit(server_type, color)
            server.move_to(UP * (1.5 - i * 2))
            rack_group.add(server)
    
    return rack_group

def create_server_unit(server_type: str, color: str) -> VGroup:
    """Create individual server unit"""
    server_group = VGroup()
    
    # Server body
    server_body = RoundedRectangle(
        width=3.4,
        height=0.8,
        corner_radius=0.05,
        fill_color=color,
        fill_opacity=0.8,
        stroke_color=Colors.DARK,
        stroke_width=2
    )
    server_group.add(server_body)
    
    # LED indicators
    led_positions = [-1.4, -1.2, -1.0]
    led_colors = [Colors.PRIMARY, Colors.ACCENT, Colors.PRIMARY]
    
    for pos, led_color in zip(led_positions, led_colors):
        led = Circle(
            radius=0.05,
            fill_color=led_color,
            fill_opacity=1.0,
            stroke_width=0
        )
        led.move_to(LEFT * pos)
        server_group.add(led)
    
    # Server type label
    label = Text(
        server_type.upper(),
        font_size=14,
        color=Colors.TEXT_DARK,
        weight=BOLD
    )
    label.move_to(RIGHT * 0.5)
    server_group.add(label)
    
    return server_group

def create_client_device(device_type: str) -> VGroup:
    """Create client device (laptop/phone/desktop)"""
    device_group = VGroup()
    
    # Device body
    if device_type == "laptop":
        device_body = RoundedRectangle(
            width=1.2,
            height=0.8,
            corner_radius=0.1,
            fill_color=Colors.CLIENT,
            fill_opacity=0.8,
            stroke_color=Colors.DARK,
            stroke_width=2
        )
        icon = Text("💻", font_size=24)
    elif device_type == "phone":
        device_body = RoundedRectangle(
            width=0.6,
            height=1.0,
            corner_radius=0.1,
            fill_color=Colors.CLIENT,
            fill_opacity=0.8,
            stroke_color=Colors.DARK,
            stroke_width=2
        )
        icon = Text("📱", font_size=24)
    else:  # desktop
        device_body = RoundedRectangle(
            width=1.0,
            height=0.8,
            corner_radius=0.1,
            fill_color=Colors.CLIENT,
            fill_opacity=0.8,
            stroke_color=Colors.DARK,
            stroke_width=2
        )
        icon = Text("🖥️", font_size=24)
    
    device_group.add(device_body, icon)
    
    # Client label
    label = Text(
        "CLIENT",
        font_size=12,
        color=Colors.CLIENT,
        weight=BOLD
    )
    label.next_to(device_group, DOWN, buff=0.2)
    device_group.add(label)
    
    return device_group

def create_server_component(label: str = "Powerful Server") -> VGroup:
    """Create server component matching script specifications"""
    server_group = VGroup()
    
    # Server body
    server_body = RoundedRectangle(
        width=2.0,
        height=1.6,
        corner_radius=0.1,
        fill_color=Colors.SERVER,
        fill_opacity=0.8,
        stroke_color=Colors.DARK,
        stroke_width=2
    )
    server_group.add(server_body)
    
    # Server icon
    icon = Text("🖥️", font_size=32)
    icon.move_to(server_body.get_center() + UP * 0.2)
    server_group.add(icon)
    
    # LED indicators
    led_group = VGroup()
    led_colors = [Colors.PRIMARY, Colors.ACCENT, Colors.PRIMARY]
    
    for i, color in enumerate(led_colors):
        led = Circle(
            radius=0.04,
            fill_color=color,
            fill_opacity=1.0,
            stroke_width=0
        )
        led.move_to(LEFT * (0.3 - i * 0.15) + DOWN * 0.3)
        led_group.add(led)
    
    server_group.add(led_group)
    
    # Server label
    server_label = Text(
        label,
        font_size=14,
        color=Colors.SERVER,
        weight=BOLD
    )
    server_label.next_to(server_group, DOWN, buff=0.3)
    server_group.add(server_label)
    
    return server_group