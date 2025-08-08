"""
Segment 1: Module Introduction (M3.1_INTRO_001)
Manim implementation matching master script exactly
Duration: 30 seconds
"""

from manim import *
import numpy as np
from base_config import *

class ModuleIntroductionScene(ServerEducationScene):
    """
    SEGMENT 1: Module Introduction
    [SEGMENT_ID: M3.1_INTRO_001]
    [AUDIENCE: ALL]
    [DURATION: 30s]
    [DEPENDENCY: M2_COMPLETE] 
    [CAN_SKIP_IF: RETURNING_VIEWER]
    """
    
    def construct(self):
        # Check if segment should be shown based on user profile
        segment_meta = SEGMENT_METADATA["M3_1_INTRO_001"]
        
        if not self.personalization.should_show_segment(segment_meta):
            # Show skip indicator
            skip_text = Text(
                "Segment skipped based on user profile",
                font_size=24,
                color=Colors.TEXT
            )
            self.add(skip_text)
            self.wait(1)
            return
        
        # Get personalized duration
        total_duration = self.personalization.get_personalized_duration(
            segment_meta.duration, segment_meta
        )
        
        # Setup background
        self.setup_background()
        
        # MASTER SCRIPT ALIGNMENT:
        # "Welcome back to Module 3 of our Data Center Fundamentals course."
        self.create_welcome_sequence()
        
        # "You've successfully learned about the physical infrastructure..."
        self.create_infrastructure_recap()
        
        # "Now, it's time to explore what goes INSIDE those carefully cooled racks..."
        self.create_rack_transition()
        
        # [VISUAL_CUE: Animated transition from empty rack to servers sliding in]
        self.create_server_animation()
        
        # Transition to next segment
        self.create_segment_transition()
    
    def create_welcome_sequence(self):
        """Title sequence - exact script timing"""
        # Title: "Welcome Back to Module 3"
        title_group = self.create_title_animation(
            "Welcome Back to Module 3",
            "Data Center Fundamentals: Server Technologies"
        )
        
        # Animate title appearance - matches TIMING.TITLE_FADE_IN
        self.play(
            FadeIn(title_group, shift=UP * 0.5),
            run_time=Timing.TITLE_FADE_IN
        )
        
        # Hold title - matches TIMING.TITLE_DISPLAY
        self.wait(Timing.TITLE_DISPLAY - Timing.TITLE_FADE_IN)
        
        # Fade out title
        self.play(
            FadeOut(title_group),
            run_time=1.0
        )
    
    def create_infrastructure_recap(self):
        """Infrastructure recap narration - matches script exactly"""
        # Script text: "You've successfully learned about the physical infrastructure 
        # that keeps data centers running - the power systems that ensure continuous 
        # operation and the cooling systems that prevent equipment from overheating."
        
        narration_text = (
            "You've successfully learned about the physical infrastructure that keeps "
            "data centers running - the power systems that ensure continuous operation "
            "and the cooling systems that prevent equipment from overheating."
        )
        
        narration_overlay = self.create_narration_overlay(
            narration_text,
            position=DOWN * 2.5
        )
        
        # Show narration - matches TIMING.NARRATION_1
        self.play(
            FadeIn(narration_overlay),
            run_time=0.5
        )
        
        # Hold for narration duration - matches TIMING.NARRATION_1_DURATION
        self.wait_for_narration(Timing.NARRATION_1_DURATION - 1.0)
        
        # Fade out
        self.play(
            FadeOut(narration_overlay),
            run_time=0.5
        )
    
    def create_rack_transition(self):
        """Rack appearance and second narration"""
        # Create empty rack - matches TIMING.RACK_APPEAR
        empty_rack = create_server_rack(show_servers=False)
        empty_rack.scale(0.6)
        empty_rack.move_to(ORIGIN)
        
        # Animate rack appearance with spring-like effect
        self.play(
            empty_rack.animate.scale(1.0).set_opacity(1.0),
            rate_func=smooth,
            run_time=2.0
        )
        
        # Second narration - matches script timing
        narration_text = (
            "Now, it's time to explore what goes INSIDE those carefully cooled racks: "
            "the servers themselves. Think of servers as the actual workers in your data center."
        )
        
        narration_overlay = self.create_narration_overlay(
            narration_text,
            position=DOWN * 3.0
        )
        
        # Start second narration at TIMING.NARRATION_2
        self.play(
            FadeIn(narration_overlay),
            run_time=0.5
        )
        
        self.wait_for_narration(Timing.NARRATION_2_DURATION - 1.0)
        
        # Keep rack for server animation
        self.current_rack = empty_rack
        
        self.play(
            FadeOut(narration_overlay),
            run_time=0.5
        )
    
    def create_server_animation(self):
        """
        [VISUAL_CUE: Animated transition from empty rack to servers sliding in]
        Matches exact script specification
        """
        # Create servers to slide in
        server_types = ["compute", "storage", "network"]
        server_colors = [Colors.COMPUTE, Colors.STORAGE, Colors.NETWORK]
        server_positions = [UP * 1.5, ORIGIN, DOWN * 1.5]
        
        servers = []
        for i, (server_type, color, position) in enumerate(zip(server_types, server_colors, server_positions)):
            server = create_server_unit(server_type, color)
            server.move_to(position + RIGHT * 8)  # Start off-screen
            servers.append(server)
        
        # Animate servers sliding in with staggered timing
        # Matches TIMING.SERVERS_SLIDE timing from script
        animations = []
        for i, server in enumerate(servers):
            target_pos = server_positions[i]
            slide_animation = server.animate.move_to(target_pos)
            
            # Stagger the animations (delay increases for each server)
            if i == 0:
                animations.append(slide_animation)
            else:
                # Use succession to create staggered effect
                self.play(slide_animation, run_time=1.5, rate_func=smooth)
        
        if animations:
            self.play(animations[0], run_time=1.5, rate_func=smooth)
        
        # Add servers to the scene
        for server in servers:
            self.add(server)
        
        # Hold to show completed rack
        self.wait(2.0)
    
    def create_segment_transition(self):
        """Smooth bridge to next segment - matches TIMING.TRANSITION_START"""
        # Transition text from script
        transition_text = (
            "They're the computers doing all the processing,\n"
            "storing, and serving of data..."
        )
        
        transition_group = VGroup()
        
        # Create transition text
        text = Text(
            transition_text,
            font_size=32,
            color=Colors.TEXT,
            weight=MEDIUM
        )
        text.move_to(ORIGIN)
        
        transition_group.add(text)
        
        # Animate transition - matches TIMING.TRANSITION_DURATION
        self.play(
            FadeIn(transition_group),
            run_time=1.0
        )
        
        self.wait(Timing.TRANSITION_DURATION - 2.0)
        
        self.play(
            FadeOut(transition_group),
            FadeOut(*self.mobjects),  # Fade out everything
            run_time=1.0
        )

class ModuleIntroductionWithPersonalization(ModuleIntroductionScene):
    """Enhanced version with full personalization support"""
    
    def __init__(self, user_profile_key: str = "beginner", **kwargs):
        user_profile = DEFAULT_PROFILES.get(user_profile_key, DEFAULT_PROFILES["beginner"])
        super().__init__(user_profile=user_profile, **kwargs)
        
        # Add development debug info
        if config.preview:  # Show debug info in preview mode
            self.show_debug_info = True
        else:
            self.show_debug_info = False
    
    def construct(self):
        if self.show_debug_info:
            self.add_debug_overlay()
        
        super().construct()
    
    def add_debug_overlay(self):
        """Add debug information overlay for development"""
        debug_info = VGroup()
        
        # User profile info
        profile_text = Text(
            f"Profile: {self.user_profile.learning_path}\n"
            f"Audience: {', '.join(self.user_profile.audience)}\n"
            f"Speed: {self.user_profile.preferred_speed}x",
            font_size=16,
            color=Colors.TEXT
        ).to_corner(UL, buff=0.2)
        
        # Background for readability
        bg = Rectangle(
            width=profile_text.width + 0.4,
            height=profile_text.height + 0.4,
            fill_color=Colors.DARK,
            fill_opacity=0.8,
            stroke_width=1,
            stroke_color=Colors.LIGHT,
            stroke_opacity=0.5
        ).move_to(profile_text.get_center())
        
        debug_info.add(bg, profile_text)
        self.add(debug_info)

# Command-line interface for different user profiles
if __name__ == "__main__":
    import sys
    
    # Check for profile argument
    profile = "beginner"  # default
    if len(sys.argv) > 1:
        profile = sys.argv[1]
        if profile not in DEFAULT_PROFILES:
            print(f"Unknown profile: {profile}")
            print(f"Available profiles: {', '.join(DEFAULT_PROFILES.keys())}")
            profile = "beginner"
    
    # Configure scene based on profile
    scene_class = ModuleIntroductionWithPersonalization
    
    # This would be used with manim command line:
    # manim segment1_intro.py ModuleIntroductionWithPersonalization -p --profile=manager