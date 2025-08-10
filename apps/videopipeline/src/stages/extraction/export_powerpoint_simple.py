#!/usr/bin/env python3
"""
Simple PowerPoint export using direct save command
"""

import subprocess
import os
import sys
import json
import time
from pathlib import Path

def export_powerpoint_as_images(ppt_path, output_dir):
    """Export PowerPoint presentation as PNG images"""
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Get absolute paths
    ppt_path = os.path.abspath(ppt_path)
    output_base = os.path.abspath(output_dir)
    
    # PowerPoint exports with the presentation name as prefix
    ppt_name = Path(ppt_path).stem
    
    # Simple AppleScript that works with PowerPoint for Mac
    # This will create files like "intro to data centers.001.png", etc.
    applescript = f'''
    set pptFile to POSIX file "{ppt_path}"
    set outputFolder to POSIX file "{output_base}/"
    
    tell application "Microsoft PowerPoint"
        activate
        open pptFile
        
        delay 2
        
        -- Get the active presentation
        set thePresentation to active presentation
        
        -- Save as PNG (creates individual files for each slide)
        save thePresentation in outputFolder as save as PNG
        
        delay 2
        
        -- Close the presentation
        close thePresentation saving no
    end tell
    '''
    
    try:
        # Run AppleScript
        result = subprocess.run(
            ['osascript', '-e', applescript],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            print(f"AppleScript stderr: {result.stderr}", file=sys.stderr)
        
        # Wait a moment for files to be written
        time.sleep(2)
        
        # Look for PNG files
        png_files = []
        for root, dirs, files in os.walk(output_base):
            for file in files:
                if file.endswith('.png'):
                    png_files.append(os.path.relpath(os.path.join(root, file), output_base))
        
        # PowerPoint creates files like "presentation.001.png", "presentation.002.png"
        # Sort them numerically
        png_files.sort(key=lambda x: int(''.join(filter(str.isdigit, x)) or '0'))
        
        # Rename files to standard format "Slide1.png", "Slide2.png", etc.
        renamed_files = []
        for i, png_file in enumerate(png_files, 1):
            old_path = os.path.join(output_base, png_file)
            new_name = f"Slide{i}.png"
            new_path = os.path.join(output_base, new_name)
            
            try:
                os.rename(old_path, new_path)
                renamed_files.append(new_name)
                print(f"Renamed: {png_file} -> {new_name}", file=sys.stderr)
            except Exception as e:
                print(f"Could not rename {png_file}: {e}", file=sys.stderr)
                renamed_files.append(png_file)
        
        if renamed_files:
            return {
                "success": True,
                "count": len(renamed_files),
                "files": renamed_files,
                "output_dir": output_base
            }
        else:
            return {
                "success": False,
                "error": "No PNG files found after export"
            }
        
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Export timeout"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python export_powerpoint_simple.py <ppt_file> <output_dir>"}))
        sys.exit(1)
    
    ppt_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(ppt_file):
        print(json.dumps({"error": f"File not found: {ppt_file}"}))
        sys.exit(1)
    
    result = export_powerpoint_as_images(ppt_file, output_dir)
    print(json.dumps(result))