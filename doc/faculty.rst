Faculty Portal
==============

There are three main 'views' for the Faculty portal:

1. :js:class:`dashboard.Dashboard`
2. :js:class:`module.Module`
3. :js:class:`student.Student`

Users are first presented with the Dashboard when they log in, 
following which they'll be able to view more information on a particular 
Module. From the Module page, they are also able to view more information 
on Students if they so wish. 

Overview (``dashboard.js``)
---------------------------

The :js:class:`dashboard.Dashboard` class provides the summary of the Professor's teaching modules.


.. js:autoclass:: dashboard.Dashboard



Module (``module.js``)
----------------------

The :js:class:`module.Module` class defines all module-related information for the faculty side. It uses 
:js:class:`module.ModuleDemographics`, :js:class:`module.ModuleAcademics` and :js:class:`module.ModuleEnrolment`
to display the relevant information for a given ``module_code``. 

.. js:autoclass:: module.Module

    Main placeholder for all faculty-related data. 

    .. js:autofunction:: module.Module.methods.updateModuleInfo

    
ModuleDemographics
..................
.. js:autoclass:: module.ModuleDemographics
    
    Calls :js:func:`barChart`, :js:func:`scatterChart` and :js:func:`donutChart`

    .. js:autofunction:: ModuleDemographics.methods.updateChart
    .. js:autofunction:: ModuleDemographics.methods.showStudents

ModuleAcademics
..................

.. js:autoclass:: module.ModuleAcademics
    
    Calls :js:func:`barChart` and :js:func:`scatterChart` 

    .. js:autofunction:: ModuleAcademics.methods.showStudents
    .. js:autofunction:: ModuleAcademics.methods.updatePrereqsTags
    .. js:autofunction:: ModuleAcademics.methods.updateCurrentGrades
    .. js:autofunction:: ModuleAcademics.methods.updatePastGrades
    .. js:autofunction:: ModuleAcademics.methods.updateSemesterWorkload
    .. js:autofunction:: ModuleAcademics.methods.updatePredictedStudents
    .. js:autofunction:: ModuleAcademics.methods.updateAttnWeb
    .. js:autofunction:: ModuleAcademics.methods.updatePrereqCharts
    .. js:autofunction:: ModuleAcademics.methods.buildCharts

ModuleEnrolment
..................
.. js:autoclass:: module.ModuleEnrolment
    

Student (``student.js``)
------------------------

The :js:class:`student.Student` class provides the drilldown view 
on a specific student. 

.. js:autoclass:: student.Student


Charts (``charts.js``)
----------------------

The ``charts.js`` file defines helper functions to 
easily create Chart.js charts. 

.. js:autofunction:: barChart
.. js:autofunction:: scatterChart
.. js:autofunction:: donutChart

