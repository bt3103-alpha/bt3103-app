from server import app
from backend import backend, callFetchData

if __name__ == "__main__":
    callFetchData()
    app.register_blueprint(backend)
    app.run(threaded=True)