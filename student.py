import data

def getPrereqs(module_code):
    '''
    Fetch prerequisites of a module

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    dict
        A nested dictionary with keys ``name``, ``parent``, and ``children``. Value of ``children`` is a list.
    '''
    prereqs = data.fetchPrereqs(module_code)
    # name parent children
    final_list = {'name': module_code, 'parent': None, 'children': []}
    for prereq in prereqs:
        toAdd = {'name': prereq, 'parent': module_code}
        final_list['children'].append(toAdd)

    return final_list

def getTeachingFeedback(module_code):
    '''
    Fetch student reviews (teaching) of a professor

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    dict
        A dictionary with keys ``data``, ``tAbility``, ``tTimely``, and ``tInterest``. Values of ``tAbility``, ``tTimely``, and ``tInterest`` are lists.
    '''
    subset_student_fb_teaching = data.student_fb_teaching.loc[data.student_fb_teaching["mod_class_id"] == module_code]
    results = {'data':False, 'tAbility':0, 'tTimely':0, 'tInterest':0}
    results['tAbility'] = [0,0,0,0,0]
    results['tTimely'] = [0,0,0,0,0]
    results['tInterest'] = [0,0,0,0,0]
    for x in range(len(subset_student_fb_teaching.index)):
        row = subset_student_fb_teaching.iloc[x]
        results['tAbility'][row['t1']-1] += 1
        results['tTimely'][row['t2']-1] += 1
        results['tInterest'][row['t3']-1] += 1
    if sum(results['tAbility']) > 0:
        results['data'] = True

    return results

def getModuleFeedback(module_code):
    '''
    Fetch student reviews of a module

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    dict
        A dictionary with keys ``data``, ``mRating``, ``goodText``, and ``badText``. Values of ``mRating``, ``goodText``, and ``badText`` are lists.
    '''
    subset_student_fb_module = data.student_fb_module.loc[data.student_fb_module["mod_class_id"] == module_code]
    results = {'data':False, 'mRating':{}, 'goodText':[], 'badText':[]}
    results['mRating'] = {'num_feedback':0, 'total':0, 'average':0, 'array':[0,0,0,0,0]}

    if subset_student_fb_module.size != 0:
        goodTextTemp = {}
        badTextTemp = {}
        for x in range(len(subset_student_fb_module.index)):
            row = subset_student_fb_module.iloc[x]
            results['mRating']['array'][row['m1']-1] += 1
            if row['m4c'] in goodTextTemp:
                goodTextTemp[row['m4c']] += 1
            else:
                goodTextTemp[row['m4c']] = 1
            if row['m5c'] in badTextTemp:
                badTextTemp[row['m5c']] += 1
            else:
                badTextTemp[row['m5c']] = 1

        totalRating = 0
        counter = 0
        for i in range(5):
            counter += results['mRating']['array'][i-1]
            totalRating += results['mRating']['array'][i-1] * (i+1)

        if counter>0:
            results['data'] = True
            results['mRating']['num_feedback'] = len(subset_student_fb_module.index)
            results['mRating']['total'] = totalRating
            results['mRating']['average'] = totalRating/counter

        for key, value in goodTextTemp.items():
            tempObj = {'text':key, 'size':value}
            results['goodText'].append(tempObj)
        for key, value in badTextTemp.items():
            tempObj = {'text':key, 'size':value}
            results['badText'].append(tempObj)
    return results

def getSEPUni(module_code):
    '''
    Fetch list of partner universities which can map particular module to

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    list
        A list of objects with name of partner university as key, and module code of mapped module as value.
    '''
    result = []
    for i in range(len(data.SEP)):
        row = data.SEP.iloc[i]
        if row["NUS Module Code"] == module_code:
            curr = {}
            curr["PU"] = row["Partner University"]
            curr["MC"] = row["Partner University Module Code"]
            result.append(curr)
    sortedlist = sorted(result, key=lambda elem:(elem['PU'], elem['MC']))
    return sortedlist
