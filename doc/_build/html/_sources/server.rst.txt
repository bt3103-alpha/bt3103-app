Server
======

The Flask code is split into four files:

1. *server.py* -- Entry point for the Flask app, handles serving the static files
2. *backend.py* -- Foundation for the backend endpoints
3. *data.py* -- Handles the fetching of data from external sources, and processing them
4. *student.py* -- Functions called by student endpoints
5. *faculty.py* -- Functions called by faculty endpoints

Server Entry Point
------------------

The *server.py* file serves the static pages, and expects Vue (on the static pages)
to poll the backend for information. 

.. automodule:: server
    :members:

Backend
----------

The *backend.py* file prepares the data needed and exposes the data to the 
frontend via REST endpoints. 

.. automodule:: backend
    :members:

Data Downloading & Processing
-----------------------------

.. automodule:: data
    :members:


Student Functions
-----------------

.. automodule:: student
    :members:


Faculty Functions
-----------------

.. automodule:: faculty
    :members:

