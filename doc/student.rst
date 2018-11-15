Student Portal
==============
The student portal is made up of four HTML pages:

* :ref:`Home Page` -- 4-Year Module Plan
* :ref:`View Module Page` -- Module Information
* :ref:`Module by Tags Page` -- Search for Modules by Tags
* :ref:`Graduation Progress Page` -- Track the modules that an individual has cleared in relation to his graduation requirements


Home Page
---------

.. js:autofunction:: script.searchModules

.. js:autofunction:: script.methods.sumMCs

.. js:autofunction:: script.methods.changeGrade

.. js:autofunction:: script.methods.calcCAP

.. js:autofunction:: script.methods.resetInfo

.. js:autofunction:: script.methods.syncModules

.. js:autofunction:: script.methods.selectElective

.. js:autofunction:: script.methods.remove

.. js:autofunction:: script.methods.addRecommendation

.. js:autofunction:: script.methods.swapGeneralMod


View Module Page
----------------

.. js:autofunction:: search.search

.. js:autofunction:: view-module.getModuleInfo

.. js:autofunction:: view-module.getPrereqs

    Calls :js:func:`treeStuff`

.. js:autofunction::view-module.getTags

.. js:autofunction:: view-module.getSEPUni

    Calls :js:func:`searchUni`

.. js:autofunction:: view-module.searchModules


Charts and Diagrams
^^^^^^^^^^^^^^^^^^^^

These functions are used to display charts & diagrams 
in the View Module page:

.. js:autofunction:: view-module.treeStuff

.. js:autofunction:: view-module.wordcloud

.. js:autofunction:: view-module.barReviewChart


Module by Tags Page
-------------------
.. js:autofunction:: search-tag.searchtagjs

.. js:autofunction:: view-tag.searchTags

.. js:autofunction:: view-tag.searchMod

.. js:autofunction:: view-tag.methods.increment


Graduation Progress Page
------------------------

The Graduation Progress Page syncs with the :ref:`Home Page` to 
automatically update the student's progress. 

.. js:autoclass:: grad.Requirement

.. js:autofunction:: grad.displayRequirements
