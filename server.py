from flask import Flask, render_template, send_from_directory
from backend import backend, callFetchData

app = Flask(__name__)

url_path = "/bt3103-app"

@app.route(url_path+"/")
def index():
    '''Serves the welcome page'''
    return render_template("welcome.html")

@app.route(url_path+"/faculty/<path:path>")
def facultyIndex(path):
    '''Serves the faculty portal '''
    return send_from_directory('faculty', path)

@app.route(url_path+"/student/<path:path>")
def studentIndex(path):
    '''Serves the student portal'''
    return send_from_directory('student', path)
    
@app.route(url_path+"/help/<path:path>")
def helpIndex(path):
    '''Serves the Sphinx documentation'''
    return send_from_directory('doc/_build/html', path)

@app.after_request
def add_header(r):
    """
    Add headers to force the browser to not cache static files. 
    To make it easier for development, can be safely removed 
    in production. 
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

app.register_blueprint(backend)

if __name__ == "__main__":
    callFetchData()
    app.run(debug=True, threaded=True)