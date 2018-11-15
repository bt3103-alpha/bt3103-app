Student Portal
==============
The student portal is made up of various html pages:

* Home Page - 4 Year Module Plan
* View Module Page - Module Information
* Module by Tags - Search for Modules by Tags
* Graduation Progress - Track the modules that an individual has cleared in relation to his graduation requirements


View Module Page
----------------

.. js:autofunction:: view-module.getModuleInfo

.. js:autofunction:: view-module.getPrereqs

    Calls :js:func:`treeStuff`

.. js:autofunction::view-module.getTags

.. js:autofunction:: view-module.getSEPUni

    Calls :js:func:`searchUni`

.. js:autofunction:: view-module.searchModules


**Charts and Diagrams used include:**
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. js:autofunction:: view-module.treeStuff

.. js:autofunction:: view-module.wordcloud

.. js:autofunction:: view-module.donutChart



Graduation Progress Page
------------------------

.. js:autoclass:: grad.Requirement

.. js:autofunction:: grad.displayRequirements
