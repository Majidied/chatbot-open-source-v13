import sys
import random
import json
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration

# Load the Blenderbot model and tokenizer
model_name = "facebook/blenderbot-400M-distill"
tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
model = BlenderbotForConditionalGeneration.from_pretrained(model_name)

def generate_response(input_text):
    inputs = tokenizer(input_text, return_tensors="pt")
    reply_ids = model.generate(**inputs)
    response_text = tokenizer.decode(reply_ids[0], skip_special_tokens=True)
    
    # Customize: Add facial expression and animation
    facial_expressions = ["smile", "sad", "angry", "surprised", "funnyFace", "shocked", "thinking", "default"]
    animations = ["Talking_0", "Talking_1", "Talking_2", "Crying", "Laughing", "Rumba", "Idle", "Terrified", "Angry"]

    # Select a random facial expression and animation for each message
    messages = []
    for i in range(3):  # Max 3 messages
        message = {
            "text": response_text if i == 0 else "Follow-up message " + str(i),  # Use response only for first message
            "facialExpression": random.choice(facial_expressions),
            "animation": random.choice(animations)
        }
        messages.append(message)

    return json.dumps(messages)

if __name__ == "__main__":
    user_input = sys.argv[1]
    response = generate_response(user_input)
    print(response)
