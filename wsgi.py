from server import app
from backend import backend, callFetchData

if __name__ == "__main__":
    callFetchData()
    app.run(threaded=True)