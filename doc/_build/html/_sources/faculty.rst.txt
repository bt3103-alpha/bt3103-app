Faculty Portal
==============

Module
------
.. js:autoclass:: module.Module

    Main placeholder for all faculty-related data. 

    .. js:autofunction:: module.Module.methods.updateModuleInfo

    
ModuleDemographics
------------------
.. js:autoclass:: module.ModuleDemographics
    
    Calls :js:func:`barChart`,:js:func:`scatterChart` and :js:func:`donutChart`

    .. js:autofunction:: ModuleDemographics.methods.updateChart
    .. js:autofunction:: ModuleDemographics.methods.showStudents

ModuleAcademics
------------------
.. js:autoclass:: module.ModuleAcademics
    
    Calls :js:func:`barChart` and :js:func:`scatterChart` 

    .. js:autofunction:: ModuleAcademics.methods.showStudents
    .. js:autofunction:: ModuleAcademics.methods.updatePrereqsTags
    .. js:autofunction:: module.ModuleAcademics.methods.updateCurrentGrades
    .. js:autofunction:: module.ModuleAcademics.methods.updatePastGrades
    .. js:autofunction:: module.ModuleAcademics.methods.updateSemesterWorkload
    .. js:autofunction:: module.ModuleAcademics.methods.updatePredictedStudents
    .. js:autofunction:: module.ModuleAcademics.methods.updateAttnWeb
    .. js:autofunction:: module.ModuleAcademics.methods.updatePrereqCharts
    .. js:autofunction:: module.ModuleAcademics.methods.buildCharts

ModuleEnrolment
------------------
.. js:autoclass:: module.ModuleEnrolment
    
    


Charts
------

.. js:autofunction:: barChart
.. js:autofunction:: scatterChart
.. js:autofunction:: donutChart