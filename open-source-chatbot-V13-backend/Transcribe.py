import whisper
import torch
import os

# Load Whisper model with the smaller "medium" size for reduced memory usage
try:
    model = whisper.load_model("medium", device="cuda")  # Use 16-bit precision if supported
except Exception as e:
    print("Error loading model in half precision:", e)
    model = whisper.load_model("medium")

# Environment variable to manage GPU memory fragmentation
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

def transcribe_audio(file_path):
    # Clear any leftover GPU memory
    torch.cuda.empty_cache()
    
    # Perform the transcription
    result = model.transcribe(file_path)
    print("Multilingual Transcription:", result["text"])

# Provide your audio file path here
file_path = "test.mp3"
transcribe_audio(file_path)
