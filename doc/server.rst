Server
======

The Flask code is split into 2 files:

* ``server.py`` -- Entry point for the Flask app, handles serving the static files
* ``backend.py`` -- Serves endpoints for dynamic data

server.py
---------

The ``server.py`` file serves the static pages, and expects Vue (on the static pages)
to poll the backend for information. 

.. automodule:: server
    :members:

backend.py
----------

The ``backend.py`` file prepares the data needed and exposes the data to the 
frontend via REST endpoints. 

.. automodule:: backend
    :members: