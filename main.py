from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/result", methods=['POST'])
def result():
    return render_template('result.html', words=['hoge1', 'hoge2', 'hoge3'])

@app.route("/ai/document")
def document_index():
    pass

@app.route("/ai/document/register")
def document_register():
    pass

@app.route("/ai/teacher")
def teacher_index():
    pass

@app.route("/ai/teacher/register")
def teacher_register():
    pass

if __name__ == "__main__":
    app.run(debug=False)
