"""
Manim Implementation of Module 3.1: Server Technologies
InsightAI Camp Data Center Fundamentals Course

This package provides a complete Manim-based implementation of the server technologies
educational module, with full personalization support and interactive elements.

Usage:
    from manim_server_module import ServerTechnologiesComplete, DEFAULT_PROFILES
    
    # Basic usage
    scene = ServerTechnologiesComplete()
    
    # With personalization
    scene = ServerTechnologiesComplete(user_profile_key="software_engineer")

Classes:
    ServerEducationScene: Base scene class with common functionality
    PersonalizationEngine: Handles user-specific content adaptation
    ModuleIntroductionScene: Segment 1 implementation
    WhatIsServerScene: Segment 2 implementation  
    ServerTechnologiesComplete: Complete module orchestration

Constants:
    SEGMENT_METADATA: Master script timing and content specifications
    DEFAULT_PROFILES: Predefined user profiles for personalization
    Colors: Module 3 color scheme
    Timing: Script-synchronized timing constants
"""

from .base_config import (
    ServerEducationScene,
    PersonalizationEngine, 
    UserProfile,
    SegmentMetadata,
    SEGMENT_METADATA,
    DEFAULT_PROFILES,
    Colors,
    Timing,
    create_server_rack,
    create_server_unit,
    create_client_device,
    create_server_component
)

from .segment1_intro import (
    ModuleIntroductionScene,
    ModuleIntroductionWithPersonalization
)

from .segment2_what_is_server import (
    WhatIsServerScene,
    WhatIsServerWithPersonalization  
)

from .main_scene import (
    ServerTechnologiesComplete,
    PersonalizationDemo,
    InteractiveQuizDemo
)

__version__ = "1.0.0"
__author__ = "InsightAI Camp"
__description__ = "Manim implementation of Server Technologies educational module"

# Export main classes for easy import
__all__ = [
    # Base classes
    "ServerEducationScene",
    "PersonalizationEngine",
    "UserProfile", 
    "SegmentMetadata",
    
    # Scene implementations
    "ModuleIntroductionScene",
    "ModuleIntroductionWithPersonalization",
    "WhatIsServerScene", 
    "WhatIsServerWithPersonalization",
    "ServerTechnologiesComplete",
    "PersonalizationDemo",
    "InteractiveQuizDemo",
    
    # Configuration and utilities
    "SEGMENT_METADATA",
    "DEFAULT_PROFILES", 
    "Colors",
    "Timing",
    "create_server_rack",
    "create_server_unit", 
    "create_client_device",
    "create_server_component",
]

# Package metadata for setuptools
PACKAGE_INFO = {
    "name": "manim-server-technologies",
    "version": __version__,
    "description": __description__,
    "author": __author__,
    "python_requires": ">=3.8",
    "install_requires": [
        "manim>=0.18.0",
        "numpy>=1.21.0",
        "pydantic>=1.8.0",
    ],
    "classifiers": [
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Education",
        "Topic :: Education :: Computer Aided Instruction (CAI)",
        "Topic :: Multimedia :: Video :: Display",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9", 
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    "keywords": "manim education server technology data-center animation",
}