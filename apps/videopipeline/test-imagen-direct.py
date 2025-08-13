#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Get the GEMINI_API_KEY
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env")
    exit(1)

print(f"✅ Using GEMINI_API_KEY: {api_key[:10]}...")

# Set the environment variable
os.environ['GEMINI_API_KEY'] = api_key

try:
    # Initialize client
    print("🔧 Initializing client...")
    client = genai.Client()
    
    # Test with a simple prompt
    print("🎨 Attempting to generate image...")
    response = client.models.generate_images(
        model='imagen-4.0-generate-preview-06-06',
        prompt='A simple red circle on white background',
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="1:1"
        )
    )
    
    print("✅ Success! Image generated")
    
    # Save the image
    if response.generated_images:
        image = response.generated_images[0].image
        image.save('test-imagen-output.png')
        print("✅ Image saved as test-imagen-output.png")
    
except Exception as e:
    print(f"❌ Error: {e}")
    
    # Try with explicit API key
    print("\n🔧 Trying with explicit API key...")
    try:
        client2 = genai.Client(api_key=api_key)
        response2 = client2.models.generate_images(
            model='imagen-4.0-generate-preview-06-06',
            prompt='A simple red circle on white background',
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1"
            )
        )
        print("✅ Success with explicit API key!")
        if response2.generated_images:
            image = response2.generated_images[0].image
            image.save('test-imagen-output.png')
            print("✅ Image saved as test-imagen-output.png")
    except Exception as e2:
        print(f"❌ Still failed: {e2}")