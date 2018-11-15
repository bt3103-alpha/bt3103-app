Getting Started
===============

.. highlight:: bash

System Requirements
-------------------

The frontend has only been tested using the latest version of Chrome, and 
should work in the latest version of all modern browsers. Internet Explorer may not work, 
due to the JavaScript functions being used. 

Installation
------------

1. Install Python_, if not yet installed.
2. Install packages required:
    * Make sure you're at the root folder of the project. 
    * Run the following in Terminal/PowerShell::
    
        $ pip install -r requirements.txt

Launching the server
--------------------

* Make sure you're at the root folder of the project. 
* Run the following in Terminal/PowerShell::

    $ python app.py

* If successful, you should see "Fetching data...", followed by a progress update as the server downloads the data required. 
* After the data has been fully loaded, point your browser to http://localhost:5000/bt3103-app/.

.. _Python: https://www.python.org/downloads/
