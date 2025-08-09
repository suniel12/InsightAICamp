#!/usr/bin/env python3
"""
PowerPoint extraction script using python-pptx
"""

import sys
import json
from pptx import Presentation

def extract_text_from_shape(shape):
    """Extract text from a PowerPoint shape"""
    if hasattr(shape, "text"):
        return shape.text
    return ""

def extract_slide_content(slide):
    """Extract all content from a slide"""
    slide_data = {
        "title": "",
        "bullets": [],
        "notes": "",
        "images": []
    }
    
    # Extract title
    if slide.shapes.title:
        slide_data["title"] = slide.shapes.title.text
    
    # Extract text from all shapes
    for shape in slide.shapes:
        if shape.has_text_frame:
            text = shape.text.strip()
            if text and text != slide_data["title"]:
                # Split into bullets if it contains line breaks
                bullets = [b.strip() for b in text.split('\n') if b.strip()]
                slide_data["bullets"].extend(bullets)
        
        # Check for images
        if shape.shape_type == 13:  # Picture
            slide_data["images"].append({
                "type": "embedded",
                "position": {
                    "left": shape.left,
                    "top": shape.top,
                    "width": shape.width,
                    "height": shape.height
                }
            })
    
    # Extract speaker notes
    if slide.has_notes_slide:
        notes_text = slide.notes_slide.notes_text_frame.text
        slide_data["notes"] = notes_text
    
    return slide_data

def extract_presentation(pptx_path):
    """Extract all content from a PowerPoint presentation"""
    try:
        presentation = Presentation(pptx_path)
        
        extracted_data = {
            "title": "",
            "author": "",
            "slides": []
        }
        
        # Extract metadata
        if presentation.core_properties.title:
            extracted_data["title"] = presentation.core_properties.title
        if presentation.core_properties.author:
            extracted_data["author"] = presentation.core_properties.author
        
        # Extract slides
        for slide in presentation.slides:
            slide_content = extract_slide_content(slide)
            extracted_data["slides"].append(slide_content)
        
        # If no title found in metadata, use first slide title
        if not extracted_data["title"] and extracted_data["slides"]:
            extracted_data["title"] = extracted_data["slides"][0]["title"]
        
        return extracted_data
    
    except Exception as e:
        return {
            "error": str(e),
            "slides": []
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python extract_ppt.py <pptx_file>"}))
        sys.exit(1)
    
    pptx_file = sys.argv[1]
    result = extract_presentation(pptx_file)
    print(json.dumps(result, indent=2))