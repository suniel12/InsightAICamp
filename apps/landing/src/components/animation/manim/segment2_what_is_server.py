"""
Segment 2: What Is a Server? (M3.1_BASICS_001)  
Manim implementation matching master script exactly
Duration: 60 seconds with quiz checkpoint
"""

from manim import *
import numpy as np
from base_config import *

class WhatIsServerScene(ServerEducationScene):
    """
    SEGMENT 2: What Is a Server?
    [SEGMENT_ID: M3.1_BASICS_001]
    [AUDIENCE: BEGINNER, IT_SUPPORT]
    [DURATION: 60s]
    [CAN_SKIP_IF: SOFTWARE_ENGINEER, NETWORK_ENGINEER, DEVOPS]
    [QUIZ_CHECKPOINT: true]
    """
    
    def construct(self):
        # Check if segment should be shown
        segment_meta = SEGMENT_METADATA["M3_1_BASICS_001"]
        
        if not self.personalization.should_show_segment(segment_meta):
            self.show_skip_message()
            return
        
        # Setup background
        self.setup_background()
        
        # Script sequence - matches master script exactly
        self.create_title_sequence()
        self.create_definition_explanation()
        self.create_client_server_demonstration()
        self.create_usage_examples()
        self.create_key_differences_section()
        self.create_three_advantages()
        
        # Quiz checkpoint if enabled
        if self.personalization.should_show_quiz(segment_meta):
            self.create_quiz_checkpoint()
        
        self.create_transition_to_next()
    
    def show_skip_message(self):
        """Show skip message for advanced users"""
        skip_text = Text(
            f"Segment skipped for {self.user_profile.learning_path} users\n"
            "Proceeding to advanced content...",
            font_size=24,
            color=Colors.TEXT
        )
        self.add(skip_text)
        self.wait(2)
    
    def create_title_sequence(self):
        """Title: 'What Is a Server?' - matches script timing"""
        title_group = self.create_title_animation(
            "What Is a Server?",
            "A powerful computer designed to provide services to other computers"
        )
        
        # Animate with script timing - TIMING.TITLE_SHOW
        self.play(
            FadeIn(title_group, shift=UP * 0.5),
            run_time=1.0
        )
        
        self.wait(14.0)  # Hold time from script
        
        self.play(
            FadeOut(title_group),
            run_time=1.0
        )
    
    def create_definition_explanation(self):
        """
        Script: 'Simply put, a server is a powerful computer designed to provide 
        services to other computers, called clients.'
        """
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
    
    def create_client_server_demonstration(self):
        """
        [VISUAL_CUE: Simple animation showing laptop connecting to server]
        Matches script specification exactly
        """
        # Create server - positioned right
        server = create_server_component("Powerful Server")
        server.scale(0.8)
        server.move_to(RIGHT * 3.5)
        
        # Create client devices - positioned left, staggered
        clients = []
        client_types = ["laptop", "phone", "desktop"] 
        client_positions = [UP * 1.5 + LEFT * 3.5, LEFT * 3.5, DOWN * 1.5 + LEFT * 3.5]
        
        for device_type, position in zip(client_types, client_positions):
            client = create_client_device(device_type)
            client.scale(0.7)
            client.move_to(position)
            clients.append(client)
        
        # Animate appearance with script timing
        # Server appears at TIMING.SERVER_APPEAR (1s)
        self.play(
            FadeIn(server, scale=0.8),
            run_time=1.0
        )
        
        # Clients appear staggered - TIMING.CLIENTS_DELAYS [2.0, 3.0, 4.0]
        for i, client in enumerate(clients):
            self.wait(1.0)  # Stagger delay
            self.play(
                FadeIn(client, shift=RIGHT * 0.5),
                run_time=0.8
            )
        
        # Create connection lines - TIMING.CONNECTIONS_START (5.0s)
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
        
        # Show activity - TIMING.ACTIVITY_START (8.0s)
        self.wait(3.0)
        
        # Add data flow animation
        for _ in range(3):  # 3 data packets
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
        
        # Keep elements for next section
        self.server_demo = VGroup(server, *clients, *connection_lines)
    
    def create_usage_examples(self):
        """
        Script: 'When you check your email, stream a video, or visit a website, 
        you're actually connecting to servers in data centers around the world.'
        """
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
        
        self.wait_for_narration(7.0)
        
        # Fun fact annotation - matches script [ANNOTATION_POPUP]
        fun_fact = self.create_fun_fact_popup(
            "A single server can handle over 1,000 concurrent users!",
            position=RIGHT * 4.5 + UP * 2.0
        )
        
        self.play(
            FadeIn(fun_fact, scale=0.8),
            run_time=0.5
        )
        
        self.wait(3.0)  # Hold fun fact
        
        self.play(
            FadeOut(examples_overlay),
            FadeOut(fun_fact),
            run_time=0.5
        )
    
    def create_key_differences_section(self):
        """Key differences explanation - matches TIMING.EXPLANATION_SHOW"""
        # Clear previous demo
        self.play(
            FadeOut(self.server_demo),
            run_time=1.0
        )
        
        differences_text = (
            "🔍 Key Differences\n\n"
            "Personal Computer: Designed for one user at a time\n\n"
            "Server: Built to handle requests from hundreds, thousands,\n"
            "or millions of users simultaneously\n\n"
            "\"When you check your email, stream a video, or visit a website,\n"
            "you're connecting to servers.\""
        )
        
        differences_box = self.create_explanation_box(differences_text)
        differences_box.move_to(LEFT * 2.5)
        
        # Show comparison table - matches TIMING.COMPARISON_TIMING
        comparison_table = self.create_comparison_table()
        comparison_table.move_to(RIGHT * 2.5)
        
        # Animate both appearing
        self.play(
            FadeIn(differences_box, shift=RIGHT * 0.5),
            FadeIn(comparison_table, shift=LEFT * 0.5),
            run_time=1.0
        )
        
        self.wait(8.0)  # Hold for comparison duration
        
        self.play(
            FadeOut(differences_box),
            FadeOut(comparison_table),
            run_time=1.0
        )
    
    def create_three_advantages(self):
        """
        Script: 'Three key things: reliability, performance, and manageability'
        Matches TIMING.ADVANTAGES_TIMING and TIMING.ADVANTAGES_STAGGER
        """
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
            {
                "icon": "🔒", 
                "title": "Reliability", 
                "desc": "24/7 operation with\nredundant components"
            },
            {
                "icon": "⚡", 
                "title": "Performance", 
                "desc": "Handle thousands of\nconcurrent requests"
            },
            {
                "icon": "🛠️", 
                "title": "Manageability", 
                "desc": "Remote monitoring\nand management"
            }
        ]
        
        advantage_cards = []
        positions = [LEFT * 4, ORIGIN, RIGHT * 4]
        
        for i, (advantage, position) in enumerate(zip(advantages, positions)):
            card = self.create_advantage_card(advantage)
            card.move_to(position)
            advantage_cards.append(card)
        
        # Staggered appearance - TIMING.ADVANTAGES_STAGGER [18.0, 18.67, 19.33]
        for i, card in enumerate(advantage_cards):
            self.wait(0.67)  # Stagger delay
            self.play(
                FadeIn(card, shift=UP * 0.3),
                run_time=0.8
            )
        
        # Hold advantages display
        self.wait(4.0)
        
        # Clear for next section
        self.play(
            FadeOut(title),
            *[FadeOut(card) for card in advantage_cards],
            run_time=1.0
        )
    
    def create_quiz_checkpoint(self):
        """Quiz checkpoint - matches script [QUIZ_CHECKPOINT: true]"""
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
        
        # Hold quiz for interaction time
        self.wait(8.0)
        
        self.play(
            FadeOut(quiz_scene),
            run_time=1.0
        )
    
    def create_transition_to_next(self):
        """Transition to next segment - matches TIMING.TRANSITION_TIMING"""
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
        
        # Animate arrow pulsing
        self.play(
            arrow.animate.scale(1.2).set_opacity(0.7),
            rate_func=there_and_back,
            run_time=1.0
        )
        
        self.wait(1.0)
        
        self.play(
            FadeOut(transition_group),
            run_time=1.0
        )
    
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
    
    def create_explanation_box(self, text: str) -> VGroup:
        """Create explanation box for key differences"""
        explanation_group = VGroup()
        
        # Text content
        explanation_text = Text(
            text,
            font_size=16,
            color=Colors.TEXT,
            line_spacing=1.4
        )
        
        # Background box
        box = RoundedRectangle(
            width=explanation_text.width + 0.8,
            height=explanation_text.height + 0.6,
            corner_radius=0.15,
            fill_color=Colors.DARK,
            fill_opacity=0.9,
            stroke_color=Colors.LIGHT,
            stroke_width=1,
            stroke_opacity=0.3
        )
        
        explanation_group.add(box, explanation_text)
        
        return explanation_group
    
    def create_comparison_table(self) -> VGroup:
        """Create desktop vs server comparison table"""
        table_group = VGroup()
        
        # Table header
        header = Text(
            "Desktop vs Server",
            font_size=18,
            color=Colors.SERVER,
            weight=BOLD
        )
        
        # Table rows
        rows = [
            ("CPU Cores", "4-16", "8-64"),
            ("Price Range", "$200-500", "$1,000-10,000"),
            ("Memory Type", "Standard RAM", "ECC Memory"),
            ("Uptime", "8-12 hours/day", "24/7/365"),
            ("Users", "1", "1,000+")
        ]
        
        table_content = VGroup()
        table_content.add(header)
        
        for category, desktop, server in rows:
            row = Text(
                f"{category:<12} {desktop:<15} {server}",
                font_size=12,
                color=Colors.TEXT,
                font="monospace"
            )
            table_content.add(row)
        
        # Arrange vertically
        table_content.arrange(DOWN, buff=0.3)
        
        # Background
        bg = RoundedRectangle(
            width=table_content.width + 0.6,
            height=table_content.height + 0.4,
            corner_radius=0.1,
            fill_color=Colors.DARK,
            fill_opacity=0.8,
            stroke_color=Colors.SERVER,
            stroke_width=1
        )
        
        table_group.add(bg, table_content)
        
        return table_group
    
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

# Personalized version with user profile support
class WhatIsServerWithPersonalization(WhatIsServerScene):
    """Enhanced version with full personalization"""
    
    def __init__(self, user_profile_key: str = "beginner", **kwargs):
        user_profile = DEFAULT_PROFILES.get(user_profile_key, DEFAULT_PROFILES["beginner"])
        super().__init__(user_profile=user_profile, **kwargs)

# Example usage and CLI
if __name__ == "__main__":
    import sys
    
    profile = "beginner"
    if len(sys.argv) > 1:
        profile = sys.argv[1]
        if profile not in DEFAULT_PROFILES:
            print(f"Unknown profile: {profile}")
            print(f"Available profiles: {', '.join(DEFAULT_PROFILES.keys())}")
            profile = "beginner"
    
    # Usage: manim segment2_what_is_server.py WhatIsServerWithPersonalization -p --profile=it_support