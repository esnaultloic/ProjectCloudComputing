import os
from flask import Flask, jsonify, request
from transformers import pipeline

model_name = "deepset/roberta-base-squad2"
app = Flask(__name__)

@app.route("/")
def run():
    api_key = request.args.get('api_key')
    question = request.args.get('question')
    context = request.args.get('context')
    if question is None or api_key != "JLL_Team":
        return jsonify(code=403, message="Bad request")
    else:
        nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
        QA_input = {
            'question': question,
            'context': context_p
        }
        res = nlp(QA_input)
        return res

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))