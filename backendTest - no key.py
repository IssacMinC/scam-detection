from flask import Flask, request, jsonify

app = Flask(__name__)

# Your existing classification logic
def classify(text, modelType: int) -> str:
	prompt = (
			f"Decide whether the following email is spam. "
			f"Email: \"{text}\"\n\n"
			f"Answer only with a double value between 0 and 1, where 0 is definitely not spam and 1 is definitely spam."
		 )

	if modelType == 0:
		from openai import OpenAI
		OpenAI.api_key = ""
		client = OpenAI(api_key=OpenAI.api_key)

		response = client.chat.completions.create(
			model="gpt-3.5-turbo",
			messages=[{"role": "user", "content": prompt}],
			temperature=0,
			)
		return response.choices[0].message.content.strip()

	elif modelType == 1:
		import anthropic
		client = anthropic.Anthropic(api_key="")

		response = client.messages.create(
			model="claude-3-7-sonnet-20250219",
			max_tokens=1024,
			temperature=0,
			messages=[{"role": "user", "content": prompt}]
			)
		return response.content[0].text.strip()

	elif modelType == 2:
		import google.generativeai as genai
		genai.configure(api_key="")
		model = genai.GenerativeModel("gemini-2.0-flash")
		chat = model.start_chat()

		response = chat.send_message(prompt)
		return response.text.strip()

	else:
		raise ValueError("Invalid modelType. Use 0 (GPT), 1 (Claude), or 2 (Gemini).")

@app.route('/api/classify_scam', methods=['POST'])
def classify_scam():
	data = request.get_json()
	scam_text = data.get("scam")
	model = data.get("model")

	if not scam_text:
		return jsonify({"error": "Missing 'scam' field."}), 400

	try:
		if model is not None:
			model = int(model)
			score_str = classify(scam_text, model)
			score = round(float(score_str), 2)
		else:
			scores = []
			for m in [0, 1, 2]:
				score_str = classify(scam_text, m)
				scores.append(float(score_str))
			score = round((sum(scores) / len(scores)), 2)

	except ValueError as e:
		return jsonify({"error": str(e)}), 400
	except Exception as e:
		return jsonify({"error": f"Classification failed: {str(e)}"}), 500

	return jsonify({"spam_score": score})

if __name__ == '__main__':
	app.run(host='0.0.0.0', port = 5000, debug=True)
