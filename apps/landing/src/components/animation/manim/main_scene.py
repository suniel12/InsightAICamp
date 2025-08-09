"""
Main scene orchestrator for Module 3.1 Server Technologies
Combines all segments with personalization support
"""

from manim import *
import numpy as np
from base_config import *
from segment1_intro import ModuleIntroductionScene, ModuleIntroductionWithPersonalization
from segment2_what_is_server import WhatIsServerScene, WhatIsServerWithPersonalization

class ServerTechnologiesComplete(Scene):
    """
    Complete Module 3.1 with all segments and personalization
    
    Usage:
    manim main_scene.py ServerTechnologiesComplete -p --user_profile=beginner
    """
    
    def __init__(self, user_profile_key: str = "beginner", **kwargs):
        super().__init__(**kwargs)
        self.user_profile_key = user_profile_key
        self.user_profile = DEFAULT_PROFILES.get(user_profile_key, DEFAULT_PROFILES["beginner"])
        self.personalization = PersonalizationEngine(self.user_profile)
        
        # Track segment completion for analytics
        self.segment_analytics = {
            "segments_shown": [],
            "segments_skipped": [], 
            "quiz_results": {},
            "total_duration": 0
        }
    
    def construct(self):
        """Main orchestration of all segments"""
        
        # Show personalization intro if in preview mode
        if config.preview:
            self.show_personalization_intro()
        
        # Execute segments based on user profile
        self.execute_segment_1()
        self.execute_segment_2()
        
        # Show completion summary
        self.show_completion_summary()
        
        # Analytics summary (development only)
        if config.preview:
            self.show_analytics()
    
    def show_personalization_intro(self):
        """Show user profile information at start"""
        intro_text = VGroup(
            Text("Module 3.1: Server Technologies", font_size=36, color=Colors.TEXT, weight=BOLD),
            Text(f"Personalized for: {self.user_profile.learning_path.title()}", font_size=24, color=Colors.PRIMARY),
            Text(f"Audience: {', '.join(self.user_profile.audience)}", font_size=18, color=Colors.LIGHT),
            Text(f"Speed: {self.user_profile.preferred_speed}x", font_size=18, color=Colors.LIGHT)
        )
        intro_text.arrange(DOWN, buff=0.4)
        
        self.play(FadeIn(intro_text), run_time=1)
        self.wait(3)
        self.play(FadeOut(intro_text), run_time=1)
    
    def execute_segment_1(self):
        """Execute Segment 1: Module Introduction"""
        segment_meta = SEGMENT_METADATA["M3_1_INTRO_001"]
        
        if not self.personalization.should_show_segment(segment_meta):
            self.segment_analytics["segments_skipped"].append("M3_1_INTRO_001")
            return
        
        self.segment_analytics["segments_shown"].append("M3_1_INTRO_001")
        
        # Setup background
        self.setup_background()
        
        # SEGMENT 1: Module Introduction - matches script exactly
        # Title sequence
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
        
        # Infrastructure recap narration
        narration_text = (
            "You've successfully learned about the physical infrastructure that keeps "
            "data centers running - the power systems that ensure continuous operation "
            "and the cooling systems that prevent equipment from overheating."
        )
        
        narration_overlay = self.create_narration_overlay(
            narration_text,
            position=DOWN * 2.5
        )
        
        self.play(
            FadeIn(narration_overlay),
            run_time=0.5
        )
        
        self.wait_for_narration(Timing.NARRATION_1_DURATION - 1.0)
        
        self.play(
            FadeOut(narration_overlay),
            run_time=0.5
        )
        
        # Create empty rack
        empty_rack = create_server_rack(show_servers=False)
        empty_rack.scale(0.6)
        empty_rack.move_to(ORIGIN)
        
        self.play(
            empty_rack.animate.scale(1.0).set_opacity(1.0),
            rate_func=smooth,
            run_time=2.0
        )
        
        # Second narration
        narration_text2 = (
            "Now, it's time to explore what goes INSIDE those carefully cooled racks: "
            "the servers themselves. Think of servers as the actual workers in your data center."
        )
        
        narration_overlay2 = self.create_narration_overlay(
            narration_text2,
            position=DOWN * 3.0
        )
        
        self.play(
            FadeIn(narration_overlay2),
            run_time=0.5
        )
        
        self.wait_for_narration(Timing.NARRATION_2_DURATION - 1.0)
        
        self.play(
            FadeOut(narration_overlay2),
            run_time=0.5
        )
        
        # Servers sliding in animation
        server_types = ["compute", "storage", "network"]
        server_colors = [Colors.COMPUTE, Colors.STORAGE, Colors.NETWORK]
        server_positions = [UP * 1.5, ORIGIN, DOWN * 1.5]
        
        servers = []
        for i, (server_type, color, position) in enumerate(zip(server_types, server_colors, server_positions)):
            server = create_server_unit(server_type, color)
            server.move_to(position + RIGHT * 8)  # Start off-screen
            servers.append(server)
        
        # Animate servers sliding in with staggered timing
        for i, server in enumerate(servers):
            target_pos = server_positions[i]
            self.play(
                server.animate.move_to(target_pos),
                run_time=1.5, 
                rate_func=smooth
            )
        
        # Hold to show completed rack
        self.wait(2.0)
        
        # Transition text
        transition_text = (
            "They're the computers doing all the processing,\n"
            "storing, and serving of data..."
        )
        
        text = Text(
            transition_text,
            font_size=32,
            color=Colors.TEXT,
            weight=MEDIUM
        )
        text.move_to(ORIGIN)
        
        self.play(
            FadeIn(text),
            run_time=1.0
        )
        
        self.wait(Timing.TRANSITION_DURATION - 2.0)
        
        self.play(
            FadeOut(text),
            FadeOut(empty_rack),
            *[FadeOut(server) for server in servers],
            run_time=1.0
        )
        
        # Add to total duration
        duration = self.personalization.get_personalized_duration(
            segment_meta.duration, segment_meta
        )
        self.segment_analytics["total_duration"] += duration
    
    def execute_segment_2(self):
        """Execute Segment 2: What Is a Server?"""
        segment_meta = SEGMENT_METADATA["M3_1_BASICS_001"]
        
        if not self.personalization.should_show_segment(segment_meta):
            self.segment_analytics["segments_skipped"].append("M3_1_BASICS_001")
            return
        
        self.segment_analytics["segments_shown"].append("M3_1_BASICS_001")
        
        # SEGMENT 2: What Is a Server? - matches script exactly
        # Title sequence
        title_group = self.create_title_animation(
            "What Is a Server?",
            "A powerful computer designed to provide services to other computers"
        )
        
        self.play(
            FadeIn(title_group, shift=UP * 0.5),
            run_time=1.0
        )
        
        self.wait(3.0)  # Hold time from script
        
        self.play(
            FadeOut(title_group),
            run_time=1.0
        )
        
        # Definition explanation
        definition_text = (
            "Simply put, a server is a powerful computer designed to\n"
            "provide services to other computers, called clients."
        )
        
        definition_overlay = self.create_narration_overlay(
            definition_text,
            position=UP * 2.0
        )
        
        self.play(
            FadeIn(definition_overlay),
            run_time=0.5
        )
        
        self.wait_for_narration(5.0)
        
        self.play(
            FadeOut(definition_overlay),
            run_time=0.5
        )
        
        # Client-server demonstration
        server = create_server_component("Powerful Server")
        server.scale(0.8)
        server.move_to(RIGHT * 3.5)
        
        clients = []
        client_types = ["laptop", "phone", "desktop"] 
        client_positions = [UP * 1.5 + LEFT * 3.5, LEFT * 3.5, DOWN * 1.5 + LEFT * 3.5]
        
        for device_type, position in zip(client_types, client_positions):
            client = create_client_device(device_type)
            client.scale(0.7)
            client.move_to(position)
            clients.append(client)
        
        # Animate server appearance
        self.play(
            FadeIn(server, scale=0.8),
            run_time=1.0
        )
        
        # Clients appear staggered
        for i, client in enumerate(clients):
            self.wait(1.0)  # Stagger delay
            self.play(
                FadeIn(client, shift=RIGHT * 0.5),
                run_time=0.8
            )
        
        # Create connection lines
        self.wait(1.0)
        connection_lines = []
        
        for client in clients:
            line = Line(
                start=client.get_right() + RIGHT * 0.2,
                end=server.get_left() + LEFT * 0.2,
                stroke_color=Colors.CONNECTION,
                stroke_width=3
            )
            connection_lines.append(line)
        
        # Animate connections appearing
        for line in connection_lines:
            self.play(
                Create(line),
                run_time=0.6
            )
        
        # Show data flow animation
        self.wait(1.0)
        for _ in range(2):  # 2 data packets
            for line in connection_lines:
                data_dot = Dot(
                    point=line.get_start(),
                    radius=0.1,
                    color=Colors.CONNECTION
                )
                self.add(data_dot)
                
                self.play(
                    MoveAlongPath(data_dot, line),
                    rate_func=smooth,
                    run_time=1.5
                )
                self.remove(data_dot)
        
        # Usage examples narration
        examples_text = (
            "When you check your email, stream a video, or visit a website,\n"
            "you're connecting to servers in data centers around the world."
        )
        
        examples_overlay = self.create_narration_overlay(
            examples_text,
            position=DOWN * 3.0
        )
        
        self.play(
            FadeIn(examples_overlay),
            run_time=0.5
        )
        
        self.wait_for_narration(4.0)
        
        # Fun fact popup
        fun_fact = self.create_fun_fact_popup(
            "A single server can handle over 1,000 concurrent users!",
            position=RIGHT * 4.5 + UP * 2.0
        )
        
        self.play(
            FadeIn(fun_fact, scale=0.8),
            run_time=0.5
        )
        
        self.wait(2.0)  # Hold fun fact
        
        self.play(
            FadeOut(examples_overlay),
            FadeOut(fun_fact),
            run_time=0.5
        )
        
        # Clear demonstration
        demo_group = VGroup(server, *clients, *connection_lines)
        self.play(
            FadeOut(demo_group),
            run_time=1.0
        )
        
        # Three advantages section
        title = Text(
            "Three Key Server Advantages",
            font_size=32,
            color=Colors.TEXT,
            weight=BOLD
        )
        title.move_to(UP * 2.5)
        
        self.play(
            FadeIn(title),
            run_time=1.0
        )
        
        # Create advantage cards
        advantages = [
            {"icon": "🔒", "title": "Reliability", "desc": "24/7 operation with\nredundant components"},
            {"icon": "⚡", "title": "Performance", "desc": "Handle thousands of\nconcurrent requests"},
            {"icon": "🛠️", "title": "Manageability", "desc": "Remote monitoring\nand management"}
        ]
        
        advantage_cards = []
        positions = [LEFT * 4, ORIGIN, RIGHT * 4]
        
        for i, (advantage, position) in enumerate(zip(advantages, positions)):
            card = self.create_advantage_card(advantage)
            card.move_to(position)
            advantage_cards.append(card)
        
        # Staggered appearance
        for i, card in enumerate(advantage_cards):
            self.wait(0.67)  # Stagger delay
            self.play(
                FadeIn(card, shift=UP * 0.3),
                run_time=0.8
            )
        
        # Hold advantages display
        self.wait(3.0)
        
        # Quiz checkpoint if enabled
        if self.personalization.should_show_quiz(segment_meta):
            self.play(
                FadeOut(title),
                *[FadeOut(card) for card in advantage_cards],
                run_time=1.0
            )
            
            quiz_data = {
                "question": "What is the main difference between a server and a personal computer?",
                "options": [
                    "Servers are more expensive",
                    "Servers are designed to handle requests from multiple users simultaneously",
                    "Servers have better graphics cards", 
                    "Servers are smaller in size"
                ],
                "correct": 1,
                "explanation": (
                    "Servers are built to handle requests from hundreds, thousands, "
                    "or millions of users simultaneously, while personal computers "
                    "are designed for one user at a time."
                )
            }
            
            quiz_scene = self.create_quiz_scene(quiz_data)
            
            self.play(
                FadeIn(quiz_scene),
                run_time=1.0
            )
            
            self.wait(5.0)  # Quiz interaction time
            
            self.play(
                FadeOut(quiz_scene),
                run_time=1.0
            )
            
            self.segment_analytics["quiz_results"]["M3_1_BASICS_001"] = "completed"
        else:
            # Clear advantages
            self.play(
                FadeOut(title),
                *[FadeOut(card) for card in advantage_cards],
                run_time=1.0
            )
        
        # Transition to next
        transition_text = Text(
            "Next: The Pizza Box - Rack Servers",
            font_size=20,
            color=Colors.SERVER,
            weight=BOLD
        )
        
        arrow = Text("→", font_size=24, color=Colors.SERVER)
        arrow.next_to(transition_text, RIGHT, buff=0.3)
        
        transition_group = VGroup(transition_text, arrow)
        transition_group.to_corner(DR, buff=0.5)
        
        self.play(
            FadeIn(transition_group),
            run_time=1.0
        )
        
        self.wait(2.0)
        
        self.play(
            FadeOut(transition_group),
            run_time=1.0
        )
        
        # Add to total duration
        duration = self.personalization.get_personalized_duration(
            segment_meta.duration, segment_meta
        )
        self.segment_analytics["total_duration"] += duration
    
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
    
    def create_fun_fact_popup(self, text: str, position: np.ndarray) -> VGroup:
        """Create fun fact popup matching script annotation"""
        popup_group = VGroup()
        
        # Fact text
        fact_text = Text(
            f"💡 Fun Fact\n{text}",
            font_size=16,
            color=Colors.TEXT,
            line_spacing=1.2
        )
        
        # Background bubble
        bubble = RoundedRectangle(
            width=fact_text.width + 1.0,
            height=fact_text.height + 0.6,
            corner_radius=0.2,
            fill_color=Colors.SERVER,
            fill_opacity=0.9,
            stroke_color=Colors.LIGHT,
            stroke_width=2
        )
        
        popup_group.add(bubble, fact_text)
        popup_group.move_to(position)
        
        return popup_group
    
    def create_advantage_card(self, advantage_data: dict) -> VGroup:
        """Create individual advantage card"""
        card_group = VGroup()
        
        # Icon
        icon = Text(
            advantage_data["icon"],
            font_size=40
        )
        
        # Title  
        title = Text(
            advantage_data["title"],
            font_size=20,
            color=Colors.SERVER,
            weight=BOLD
        )
        
        # Description
        description = Text(
            advantage_data["desc"],
            font_size=14,
            color=Colors.LIGHT,
            line_spacing=1.2
        )
        
        # Arrange vertically
        content = VGroup(icon, title, description)
        content.arrange(DOWN, buff=0.3)
        
        # Card background
        card_bg = RoundedRectangle(
            width=content.width + 1.0,
            height=content.height + 0.8,
            corner_radius=0.2,
            fill_color=Colors.PRIMARY,
            fill_opacity=0.2,
            stroke_color=Colors.PRIMARY,
            stroke_width=2
        )
        
        card_group.add(card_bg, content)
        
        return card_group
    
    def create_quiz_scene(self, quiz_data: dict) -> VGroup:
        """Create interactive quiz checkpoint"""
        quiz_group = VGroup()
        
        # Quiz title
        quiz_title = Text(
            "📝 Knowledge Check",
            font_size=24,
            color=Colors.TEXT,
            weight=BOLD
        )
        
        # Question
        question = Text(
            quiz_data["question"],
            font_size=18,
            color=Colors.LIGHT,
            line_spacing=1.4
        ).scale(0.8)
        
        # Options
        options_group = VGroup()
        for i, option in enumerate(quiz_data["options"]):
            option_text = Text(
                f"{chr(65 + i)}. {option}",
                font_size=16,
                color=Colors.TEXT if i != quiz_data["correct"] else Colors.PRIMARY
            )
            
            # Highlight correct answer
            if i == quiz_data["correct"]:
                option_bg = RoundedRectangle(
                    width=option_text.width + 0.4,
                    height=option_text.height + 0.2,
                    corner_radius=0.1,
                    fill_color=Colors.PRIMARY,
                    fill_opacity=0.3,
                    stroke_width=0
                )
                option_with_bg = VGroup(option_bg, option_text)
                options_group.add(option_with_bg)
            else:
                options_group.add(option_text)
        
        options_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        
        # Explanation
        explanation = Text(
            f"Explanation: {quiz_data['explanation']}",
            font_size=14,
            color=Colors.ACCENT,
            line_spacing=1.3
        ).scale(0.9)
        
        # Arrange quiz content
        quiz_content = VGroup(quiz_title, question, options_group, explanation)
        quiz_content.arrange(DOWN, buff=0.5)
        
        # Quiz background
        quiz_bg = RoundedRectangle(
            width=quiz_content.width + 1.5,
            height=quiz_content.height + 1.0,
            corner_radius=0.3,
            fill_color=Colors.DARK,
            fill_opacity=0.95,
            stroke_color=Colors.PRIMARY,
            stroke_width=2
        )
        
        quiz_group.add(quiz_bg, quiz_content)
        
        return quiz_group

    def show_completion_summary(self):
        """Show module completion summary"""
        completion_group = VGroup()
        
        # Achievement badge
        badge = Text("🏆", font_size=64)
        completion_group.add(badge)
        
        # Completion text
        completion_text = Text(
            "Module 3.1 Complete!",
            font_size=36,
            color=Colors.PRIMARY,
            weight=BOLD
        )
        completion_text.next_to(badge, DOWN, buff=0.5)
        completion_group.add(completion_text)
        
        # Summary stats
        stats_text = VGroup(
            Text(f"Segments Completed: {len(self.segment_analytics['segments_shown'])}", 
                 font_size=18, color=Colors.TEXT),
            Text(f"Total Duration: {self.segment_analytics['total_duration']:.1f} seconds",
                 font_size=18, color=Colors.TEXT),
            Text(f"Personalized for: {self.user_profile.learning_path.title()}",
                 font_size=18, color=Colors.ACCENT)
        )
        stats_text.arrange(DOWN, buff=0.3)
        stats_text.next_to(completion_text, DOWN, buff=0.8)
        completion_group.add(stats_text)
        
        # Next module preview
        next_preview = Text(
            "Next: Virtualization - The Real Magic Begins! →",
            font_size=20,
            color=Colors.SERVER
        )
        next_preview.next_to(stats_text, DOWN, buff=0.8)
        completion_group.add(next_preview)
        
        self.play(FadeIn(completion_group, shift=UP * 0.5), run_time=1.5)
        self.wait(4)
        self.play(FadeOut(completion_group), run_time=1)
    
    def show_analytics(self):
        """Show analytics for development purposes"""
        analytics_text = VGroup(
            Text("📊 Session Analytics", font_size=24, color=Colors.ACCENT, weight=BOLD),
            Text(f"User Profile: {self.user_profile_key}", font_size=16, color=Colors.TEXT),
            Text(f"Segments Shown: {', '.join(self.segment_analytics['segments_shown'])}", 
                 font_size=14, color=Colors.TEXT),
            Text(f"Segments Skipped: {', '.join(self.segment_analytics['segments_skipped'])}", 
                 font_size=14, color=Colors.TEXT),
            Text(f"Quiz Results: {len(self.segment_analytics['quiz_results'])} completed", 
                 font_size=14, color=Colors.TEXT),
            Text(f"Total Personalized Duration: {self.segment_analytics['total_duration']:.1f}s",
                 font_size=14, color=Colors.TEXT)
        )
        analytics_text.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        
        # Background
        bg = RoundedRectangle(
            width=analytics_text.width + 1.0,
            height=analytics_text.height + 0.6,
            corner_radius=0.2,
            fill_color=Colors.DARK,
            fill_opacity=0.9,
            stroke_color=Colors.ACCENT,
            stroke_width=1
        )
        
        analytics_group = VGroup(bg, analytics_text)
        analytics_group.to_corner(UL, buff=0.5)
        
        self.add(analytics_group)
        self.wait(3)

class PersonalizationDemo(Scene):
    """
    Demo scene showing different personalization options
    """
    
    def construct(self):
        title = Text("Server Technologies Personalization Demo", 
                    font_size=32, color=Colors.TEXT, weight=BOLD)
        self.play(FadeIn(title), run_time=1)
        self.wait(2)
        
        # Show different profiles
        profiles = list(DEFAULT_PROFILES.keys())
        
        for profile_key in profiles:
            profile = DEFAULT_PROFILES[profile_key]
            
            profile_info = VGroup(
                Text(f"Profile: {profile_key.title()}", font_size=24, color=Colors.PRIMARY, weight=BOLD),
                Text(f"Audience: {', '.join(profile.audience)}", font_size=18, color=Colors.TEXT),
                Text(f"Learning Path: {profile.learning_path}", font_size=18, color=Colors.TEXT),
                Text(f"Speed: {profile.preferred_speed}x", font_size=18, color=Colors.TEXT),
                Text(f"Quizzes: {'Yes' if profile.show_quizzes else 'No'}", font_size=18, color=Colors.TEXT),
                Text(f"Skip Segments: {', '.join(profile.skip_segments) or 'None'}", 
                     font_size=18, color=Colors.TEXT)
            )
            profile_info.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
            
            # Show personalization engine decisions
            engine = PersonalizationEngine(profile)
            decisions = VGroup()
            
            for segment_id, segment_meta in SEGMENT_METADATA.items():
                show = engine.should_show_segment(segment_meta)
                quiz = engine.should_show_quiz(segment_meta)
                duration = engine.get_personalized_duration(segment_meta.duration, segment_meta)
                
                decision_text = Text(
                    f"{segment_id}: {'Show' if show else 'Skip'}, Quiz: {'Yes' if quiz else 'No'}, Duration: {duration:.1f}s",
                    font_size=14, color=Colors.LIGHT
                )
                decisions.add(decision_text)
            
            decisions.arrange(DOWN, buff=0.2, aligned_edge=LEFT)
            
            full_profile = VGroup(profile_info, decisions)
            full_profile.arrange(DOWN, buff=0.8)
            
            self.play(FadeOut(title) if title else Circumscribe(full_profile, fade_out=True), run_time=0.5)
            self.play(FadeIn(full_profile), run_time=1)
            self.wait(3)
            
            title = None  # Clear title after first iteration

class InteractiveQuizDemo(Scene):
    """Demo of interactive quiz system"""
    
    def construct(self):
        # Create sample quiz
        quiz_data = {
            "question": "What makes servers different from personal computers?",
            "options": [
                "They are more expensive",
                "They handle multiple users simultaneously",
                "They have better graphics",
                "They are physically smaller"
            ],
            "correct": 1,
            "explanation": "Servers are specifically designed to handle requests from multiple users at the same time, while personal computers typically serve one user."
        }
        
        # Use the quiz creation method from WhatIsServerScene
        scene_helper = WhatIsServerScene()
        quiz_display = scene_helper.create_quiz_scene(quiz_data)
        
        self.play(FadeIn(quiz_display), run_time=1)
        self.wait(5)
        
        # Highlight correct answer
        self.play(
            Circumscribe(quiz_display, color=Colors.PRIMARY),
            run_time=2
        )
        
        self.wait(3)
        self.play(FadeOut(quiz_display), run_time=1)

# CLI interface for easy testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        scene_arg = sys.argv[1]
        
        if scene_arg == "demo":
            print("Running personalization demo...")
            # manim main_scene.py PersonalizationDemo -p
        elif scene_arg == "quiz":
            print("Running quiz demo...")
            # manim main_scene.py InteractiveQuizDemo -p
        elif scene_arg in DEFAULT_PROFILES:
            print(f"Running complete module for {scene_arg} profile...")
            # manim main_scene.py ServerTechnologiesComplete -p --user_profile={scene_arg}
        else:
            print(f"Available options: demo, quiz, {', '.join(DEFAULT_PROFILES.keys())}")
    else:
        print("Usage examples:")
        print("  manim main_scene.py ServerTechnologiesComplete -p")
        print("  manim main_scene.py PersonalizationDemo -p") 
        print("  manim main_scene.py InteractiveQuizDemo -p")
        print(f"  Available profiles: {', '.join(DEFAULT_PROFILES.keys())}")