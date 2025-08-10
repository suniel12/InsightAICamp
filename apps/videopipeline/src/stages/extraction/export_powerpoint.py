#!/usr/bin/env python3
"""
Export PowerPoint slides to high-resolution PNG images using AppleScript on macOS
"""

import subprocess
import os
import sys
import json
from pathlib import Path

def check_powerpoint_installed():
    """Check if PowerPoint is available on macOS"""
    # Check if PowerPoint app exists
    check_app = 'test -d "/Applications/Microsoft PowerPoint.app" && echo "exists"'
    result = subprocess.run(check_app, shell=True, capture_output=True, text=True)
    return result.stdout.strip() == "exists"

def export_slides_high_res(ppt_path, output_dir, width=1920, height=1080):
    """Export PowerPoint slides as high-resolution PNGs using AppleScript"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert to absolute paths
    ppt_path = os.path.abspath(ppt_path)
    output_dir = os.path.abspath(output_dir)
    
    # AppleScript to export slides
    # PowerPoint will create files named after the presentation
    applescript = f'''
    tell application "Microsoft PowerPoint"
        activate
        
        -- Open the presentation
        set thePresentation to open POSIX file "{ppt_path}"
        
        -- Export as PNG (this creates a folder with slide images)
        save thePresentation in "{output_dir}" as save as PNG
        
        -- Close without saving changes
        close thePresentation saving no
    end tell
    '''
    
    try:
        # Run the AppleScript
        result = subprocess.run(
            ['osascript', '-e', applescript],
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            return {"success": False, "error": f"AppleScript error: {result.stderr}"}
        
        # PowerPoint might create a subfolder or use different naming
        # Check for PNG files in output directory and subdirectories
        png_files = []
        
        # Check main directory
        if os.path.exists(output_dir):
            for item in os.listdir(output_dir):
                if item.endswith('.png'):
                    png_files.append(item)
                # Check if PowerPoint created a subfolder
                subfolder = os.path.join(output_dir, item)
                if os.path.isdir(subfolder):
                    for subitem in os.listdir(subfolder):
                        if subitem.endswith('.png'):
                            png_files.append(os.path.join(item, subitem))
        
        # Sort files numerically if they contain numbers
        png_files = sorted(png_files, key=lambda x: int(''.join(filter(str.isdigit, x)) or '0'))
        
        if not png_files:
            return {"success": False, "error": "No PNG files were exported. PowerPoint may not be responding."}
        
        # Optionally resize images to exact dimensions using sips
        if width != 1920 or height != 1080:
            print(f"Resizing images to {width}x{height}...", file=sys.stderr)
            for png_file in png_files:
                file_path = os.path.join(output_dir, png_file)
                # Use sips to resize while maintaining aspect ratio
                subprocess.run([
                    'sips',
                    '--resampleHeightWidth', str(height), str(width),
                    file_path
                ], capture_output=True)
        
        return {
            "success": True,
            "count": len(png_files),
            "files": png_files,
            "output_dir": output_dir
        }
            
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Export timeout - presentation may be too large"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def enhance_image_quality(image_path, target_dpi=300):
    """Use sips to enhance image quality if needed"""
    try:
        # Get current image info
        result = subprocess.run(
            ['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'dpiWidth', '-g', 'dpiHeight', image_path],
            capture_output=True,
            text=True
        )
        
        # Set DPI if needed (for print quality)
        subprocess.run([
            'sips', '-s', 'dpiWidth', str(target_dpi),
            '-s', 'dpiHeight', str(target_dpi), image_path
        ], capture_output=True)
        
        return True
    except:
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python export_powerpoint.py <ppt_file> <output_dir> [width] [height]"
        }))
        sys.exit(1)
    
    ppt_file = sys.argv[1]
    output_dir = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 1920
    height = int(sys.argv[4]) if len(sys.argv) > 4 else 1080
    
    # Check if PowerPoint is installed
    if not check_powerpoint_installed():
        print(json.dumps({
            "error": "PowerPoint not installed",
            "suggestion": "Please install Microsoft PowerPoint or provide pre-exported images"
        }))
        sys.exit(1)
    
    # Check if input file exists
    if not os.path.exists(ppt_file):
        print(json.dumps({"error": f"File not found: {ppt_file}"}))
        sys.exit(1)
    
    # Export slides
    result = export_slides_high_res(ppt_file, output_dir, width, height)
    
    # Enhance quality for each exported image
    if result.get("success") and result.get("files"):
        for img_file in result["files"]:
            img_path = os.path.join(output_dir, img_file)
            enhance_image_quality(img_path)
    
    print(json.dumps(result))