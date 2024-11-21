
from flask import Flask, render_template

app = Flask(__name__)

app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/panel/<panel_name>")
def serve_panel(panel_name):
    return render_template(f'{panel_name}.html')