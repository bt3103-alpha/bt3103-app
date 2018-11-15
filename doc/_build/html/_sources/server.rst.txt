Server
======

The Flask code is split into five files:

1. :ref:`server_page` -- Entry point for the Flask app, handles serving the static files
2. :ref:`backend_page` -- Foundation for the backend endpoints
3. :ref:`data_page` -- Handles the fetching of data from external sources, and processing them
4. :ref:`student_page` -- Functions called by student endpoints
5. :ref:`faculty_page` -- Functions called by faculty endpoints

.. _server_page: 

Server Entry Point (``server.py``)
----------------------------------

The *server.py* file serves the static pages, and expects Vue (on the static pages)
to poll the backend for information. 

.. automodule:: server
    :members:

.. _backend_page: 

Backend (``backend.py``)
------------------------

The *backend.py* file fetches the data needed (by calling :func:`data.fetchData()`) and exposes the data to the 
frontend via REST endpoints. 

.. automodule:: backend
    :members:

.. _data_page:

Data Downloading & Processing (``data.py``)
-------------------------------------------

.. automodule:: data
    :members:

.. _student_page:

Student Functions (``student.py``)
----------------------------------

.. automodule:: student
    :members:

.. _faculty_page:

Faculty Functions (``faculty.py``)
-----------------------------------

.. automodule:: faculty
    :members:

