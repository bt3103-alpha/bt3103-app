from flask import Blueprint, jsonify
import requests
import pandas as pd
import numpy as np
from io import StringIO
import asyncio
import re

backend = Blueprint('backend', __name__)
url_path = "/bt3103-app"

module_enrolment = None
program_enrolment = None
mockedup_data = None
main_mockup = None
student_attention = None
student_attention_cap = None
cap = None
module_descriptions = None
student_fb_module = None
student_fb_teaching = None
association_rules = None
module_names = {}
fetchProgress = 0


grades = {"A+": 5.0, "A": 5.0, "A-": 4.5, "B+": 4.0, "B": 3.5,
          "B-": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0}

def fetchPrereqs(module_code):
    '''
    Fetches a list of prerequisites for a given module_code.

    Uses nusmods' API. Returns an empty list of module is not found.

    Parameters:
    module_code -- string, module code
    '''
    results = []
    try:
        j = requests.get(
            "https://api.nusmods.com/2018-2019/modules/"+module_code+"/index.json").json()
        prereqs = j.get("Prerequisite", "")
        results = re.findall(r'[A-Z]{2,3}[0-9]{4}[A-Z]?', prereqs)
    except:
        pass
    return results

@backend.route(url_path+'/backend/prereqs/<module_code>')
def fetchPrereqsEndpoint(module_code):
    return jsonify(fetchPrereqs(module_code))

async def fetchGoogleSheet(url_num, sheet_name):
    '''
    Reads in the Google spreadsheet, returning it as a Pandas dataframe.

    Parameters:
    url_num: integer, representing which 'part' (1 or 2) the sheet belongs to
    sheet_name: string, name of sheet to pull data from

    References https://docs.google.com/document/d/1lWEWGZBM1sSIAHUDIcIhfo9MJQUjao3v52Qp5VRyEZM/
    '''
    if url_num == 1:
        # Part 1
        url = "1fODgXoBY44uq2B2KA-M-eWYv0LKOQ0To0etvAdHZhsc"
    elif url_num == 2:
        # Part 2
        url = "1arssfIN-m6i0575a9R2FBnwWQmYOcfTAUcJ2q6wodJQ"
    elif url_num ==3:
        # Vienna's mock up for main page (including module code, num of stu, num of webcasts watch halfway, unviewed forum, tut attendance)
        url = "16Sw9yRsyMrFZDXGKNQe3gG34Sj3Y_8jqOzjCXszJQB8"
    else:
        # Sam's mockup
        url = "15YQSuRO3TohlqFiF8v3oxFNpr9VoBxgOs6ihhUMCigU"
    r = requests.get("https://docs.google.com/spreadsheets/d/" +
                     url+"/gviz/tq?tqx=out:csv&sheet="+sheet_name)
    strio = StringIO(r.text)
    return pd.read_csv(strio)


async def fetchFirebase(url):
    '''
    Reads in a Firebase URL, and returns the data as a Pandas dataframe.

    Parameters:
    url: string, Firebase URL
    '''
    r = requests.get(url)
    return pd.DataFrame.from_records(r.json())


async def fetchFirebaseJSON(url):
    r = requests.get(url)
    return pd.DataFrame.from_dict(r.json(), orient='index')


def getScore(x):
    '''
    Returns the numeric grade of a grade.

    Returns nan if grade is not found (e.g. S/U)

    Parameters:
    x -- string, letter grade
    '''
    if x == 'A' or x == 'A+':
        return 5
    elif x == 'A-':
        return 4.5
    elif x == 'B+':
        return 4
    elif x == 'B':
        return 3.5
    elif x == 'B-':
        return 3
    elif x == 'C+':
        return 2.5
    elif x == 'C':
        return 2
    elif x == 'D+':
        return 1.5
    elif x == 'D':
        return 1
    elif x == 'F':
        return 0
    return np.nan


async def fetchData():
    '''
    Fetch and process all the data that we need.

    We use asyncio to free the server up to respond to other requests
    while running this function.
    '''
    global fetchProgress, module_enrolment, program_enrolment, mockedup_data, student_attention, module_descriptions, main_mockup, association_rules, student_fb_module, student_fb_teaching

    print("Fetching data")
    fetchProgress = 0

    # Each row = 1 student taking 1 module
    module_enrolment = await fetchGoogleSheet(1, "module_enrolment")
    # Each row = 1 student in 1 semester
    program_enrolment = await fetchGoogleSheet(1, 'program_enrolment')
    program_enrolment.columns = [x.lower() for x in program_enrolment.columns]
    fetchProgress = 25
    print(fetchProgress)

    student_fb_module = await fetchGoogleSheet(2, 'student_feedback_module')
    student_fb_module = student_fb_module.dropna(axis=1, how='all').dropna()
    student_fb_teaching = await fetchGoogleSheet(2, 'student_feedback_teaching')
    student_fb_teaching = student_fb_teaching.dropna(axis=1, how='all').dropna()
    fetchProgress = 50
    print(fetchProgress)

    # Generated data on webcasts and attendance
    student_attention = await fetchGoogleSheet(4, 'Sheet1')

    # Generated data on webcasts/tutorial attendance/forum
    main_mockup = await fetchGoogleSheet(3, 'mockup_for_main')

    # market basket analysis mockup
    association_rules = await fetchGoogleSheet(4, 'Sheet4' )
    fetchProgress = 75
    print(fetchProgress)

    cap = module_enrolment[['module_credits', 'final_grade', 'token']].copy()
    cap['grade'] = cap['final_grade'].apply(getScore)
    cap['module_credits'] = cap['module_credits'].apply(
        lambda x: 4 if x == 0 else x)
    cap = cap.dropna().drop('final_grade', axis=1)
    cap['score'] = cap['grade'] * cap['module_credits']
    cap = cap.groupby('token').sum()

    cap['CAP'] = cap['score'] / cap['module_credits']
    cap = cap[['CAP']]

    fetchProgress = 85
    print(fetchProgress)

    program_enrolment = program_enrolment.join(cap, on='token').join(
        student_attention.set_index('token'), on='token')

    fetchProgress = 90
    print(fetchProgress)

    module_descriptions = await fetchFirebaseJSON("https://bt3103-alpha-student.firebaseio.com/module_descriptions.json")

    fetchProgress = 100
    print("Done fetching data")


@backend.route(url_path+'/backend/fetch_data')
def callFetchData():
    '''
    Endpoint to start fetching data

    Called when server is started, or when the
    Refresh data button is pressed in Faculty side.
    '''
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(fetchData())
    loop.close()
    return "{'ok': true}"


@backend.route(url_path+'/backend/fetch_data/status')
def fetchDataStatus():
    '''
    Fetches the current status of data fetching (as an integer from 0 to 100)
    '''
    return jsonify({"progress": fetchProgress})

@backend.route(url_path+'/backend/module_description/<module_code>')
def fetchModuleDescription(module_code):
    try:
        result = module_descriptions.loc[module_code].to_dict()
    except:
        result = {'title': '', 'description': '', 'tags': []}
    if result['tags'] is np.nan:
        result['tags'] = []
    return jsonify(result)

def countsAsDict(df, column_name):
    '''
    Takes in a column, does a value count, and returns a dict

    E.g. {'labels': ['A', 'B'], 'counts': [2, 4], 'tokens': ['Token1', 'Token2']}

    Parameters:
    x - Pandas Series
    '''
    counts = df[column_name].value_counts()
    labels = [x for x in counts.index]
    counts = [int(x) for x in counts]
    students = []
    for label in labels:
        tokens = df[df[column_name] == label]['token']
        students.append(list(tokens))
    return {'labels': labels, 'counts': counts, 'students': students}


def countsAsLists(df, column_name):
    '''
    Takes in a column, does a value count, returns as nested lists

    E.g. [["A", 1, ['Token1', 'Token2']], ["B", 2, ['Token3']]]

    Parameters:
    x - Pandas Series
    '''
    counts = df[column_name].value_counts()
    result = []
    for key, value in counts.items():
        tokens = df[df[column_name] == key]['token']
        result.append([key, value, list(tokens)])
    return result


def module_all_terms(module_code):
    '''
    Returns all module_enrolments for a given module_code
    '''
    return module_enrolment[module_enrolment.module_code == module_code]


def module_current_term(module_code):
    '''
    Returns the latest semester's module_enrolments for a given module_code
    '''
    module_subset = module_all_terms(module_code)
#    return module_subset
    return module_subset[module_subset.term == max(module_subset.term)]


def module_past_terms(module_code):
    '''
    Returns the previous semesters' module_enrolments for a given module_code
    '''
    module_subset = module_all_terms(module_code)
    return module_subset[module_subset.term != max(module_subset.term)]


def program_current_term(module_code):
    '''
    Returns the program_enrolment for students currently taking a particular module
    '''
    module_current = module_current_term(module_code)
    # program_current = program_enrolment[program_enrolment.term == max(
        # program_enrolment.term)]
    program_current = module_current[['token']].join(
        program_enrolment.set_index('token'), on='token', how='inner')
    return program_current


def program_past_terms(module_code):
    '''
    Returns the program_enrolment for students who previously took the module
    '''
    module_subset = module_all_terms(module_code)
    program_subset = program_enrolment[program_enrolment.term != max(
        program_enrolment.term)]
    program_subset = module_subset[['token']].join(
        program_subset.set_index('token'), on='token', how='inner')
    return program_subset

@backend.route(url_path+'/backend/faculty/main/<module_code>')
def mainOverview(module_code):
    '''
    Fetches all relevant details to display on main page for a given module_code

    Parameters:
    module_code - string
    '''
    #results = {}
    #print(main_mockup.head())
    row = main_mockup[main_mockup['module_code'] == module_code].to_dict('records')[0]

    #results[module_code] = [row['number of students'],
    #row['number of webcasts unfinished'],
    #row['unviewed forum'],
    #row['tutorial attendance']]
    return jsonify(row)




@backend.route(url_path+'/backend/faculty/demographics/<module_code>')
def moduleDemographics(module_code):
    '''
    Fetches all demographic data to be displayed for a given module_code.

    Parameters:
    module_code - string
    '''
    results = {}

    program_current = program_current_term(module_code)

    # Fetch program information about current students
    results["degrees"] = countsAsLists(program_current, 'academic_plan_descr')
    results["academic_career"] = countsAsDict(program_current, 'academic_career')
    results["faculty"] = countsAsDict(program_current, 'faculty_descr')
    results["academic_load"] = countsAsDict(program_current, 'academic_load_descr')

    # Count of years of current students
    results["years"] = [0, 0, 0, 0]
    years = (18.1 - (program_current.admit_term / 100)
             ).astype(int).value_counts().to_dict()
    for year, count in years.items():
        results["years"][min(year-1, 3)] += count

    return jsonify(results)


@backend.route(url_path+'/backend/faculty/enrolment/<module_code>')
def moduleEnrolment(module_code):
    program_current = program_current_term(module_code).fillna(0)

    program_current['attendance'] = program_current['attendance'].apply(
        lambda x: format(x, '.2f'))
    program_current['webcast'] = program_current['webcast'].apply(
        lambda x: format(x, '.2f'))
    program_current['CAP'] = program_current['CAP'].apply(
        lambda x: format(x, '.2f'))

    # For each student token, check which of the prereqs they have done
    # and their grades for it
    prereqs = fetchPrereqs(module_code)
    def getPrereqGrades(token):
        output = ""

        modules_taken = module_enrolment[(module_enrolment.token == token) & (module_enrolment.module_code.isin(prereqs))]
        for i in range(modules_taken.shape[0]):
            code = modules_taken.iloc[i]['module_code']
            grade = modules_taken.iloc[i]['original_letter_grade']
            if str(grade) == 'nan':
                grade = "-"
            text = str(code) + " (" + grade + ")"

            if len(output) == 0:
                output = text
            else:
                output += ", " + text

        if len(output) == 0:
            output = "-"

        return output

    program_current['prereqs'] = program_current.token.apply(getPrereqGrades)
    program_current.drop_duplicates(inplace=True)

    return jsonify(program_current.to_dict('records'))


def getModuleGrades(module_code = None, program_subset=None):
    '''
    Returns grades. Can filter by module_code and/or a list of tokens

    Parameters:
    module_code - optional string, return only grades with this module_code
    program_subset - optional Pandas DataFrame, return only grades belonging to those who are in this dataframe
    '''
    if module_code is not None:
        module_subset = module_all_terms(module_code)
    else:
        module_subset = module_enrolment

    # Filter to a specific subset of tokens, if specified
    if program_subset is not None:
        module_subset = module_subset.join(
            program_subset[['token']].set_index("token"), on='token', how='inner')

    subset_grades = module_subset.final_grade.value_counts()
    counts = []
    students = []
    for grade in grades.keys():
        counts.append(int(subset_grades.get(grade, 0)))
        students.append(list(module_subset[module_subset.final_grade == grade]['token']))
    return {"counts": counts, "students": students}


@backend.route(url_path+'/backend/faculty/academics/<module_code>')
def moduleAcademics(module_code):
    program_current = program_current_term(module_code)
    program_past = program_past_terms(module_code)[['attendance', 'CAP', 'webcast']].dropna()
    module_current = module_current_term(module_code)
    module_past = module_past_terms(module_code)

    results = {}

    # Calculate the grade distribution of current students

    results["curr_grades"] = [0, 0, 0, 0, 0, 0]
    results["curr_grades_students"] = [[], [], [], [], [], []]
    for i in range(program_current.shape[0]):
        grade = program_current.iloc[i]['CAP']
        token = program_current.iloc[i]['token']
        grade_index = 5
        if grade >= 4.5:
            grade_index = 0
        elif grade >= 4:
            grade_index = 1
        elif grade >= 3.5:
            grade_index = 2
        elif grade >= 3:
            grade_index = 3
        elif grade >= 2:
            grade_index = 4

        results["curr_grades"][grade_index] += 1
        results["curr_grades_students"][grade_index].append(str(token))

    # Fetch a count of past grades
    results['grades'] = getModuleGrades(program_subset=program_current)

    # Count number of modules that each student is doing this semester
    students = program_current[['token']]
    module_counts = students.join(module_enrolment[module_enrolment.term == max(module_enrolment.term)].set_index('token'), on='token', how='inner').groupby('token').size()
    module_counts = pd.DataFrame(module_counts).reset_index()
    results['semester_workload'] = countsAsDict(module_counts, 0)

    results['attendance_cap'] = []
    results['webcast_cap'] = []

    for i in range(program_past.shape[0]):
        student = program_past.iloc[i]
        results['attendance_cap'].append({
            'x': float(student['attendance']),
            'y': float(student['CAP'])
        })
        results['webcast_cap'].append({
            'x': float(student['webcast']),
            'y': float(student['CAP'])
        })

    # Fetch grades for prereqs
    prereqs = fetchPrereqs(module_code)
    results['prereqs'] = []
    for prereq in prereqs:
        prereq_data = {
            'module_code': prereq,
            'grades': getModuleGrades(prereq, program_current[['token']])
        }

        # Only append if we have found students who took this prereq
        if sum(prereq_data['grades']['counts']) > 0:
            results['prereqs'].append(prereq_data)

    # Some statistical analysis!

    module_influence_scores = {}

    for i in range(module_past.shape[0]):
        student = module_past.iloc[i]
        marks = student['final_marks'] - module_past['final_marks'].mean()
        if marks == 0:
            continue
        # For each student, we go through what modules they've taken, and assign the module their score
        modules_taken = module_enrolment[module_enrolment['token']
                                         == student['token']]
        for j in range(modules_taken.shape[0]):
            module = modules_taken.iloc[j]['module_code']
            if module == module_code:
                continue
            if module not in module_influence_scores:
                module_influence_scores[module] = []
            module_influence_scores[module].append(marks)

    for key, value in module_influence_scores.items():
        module_influence_scores[key] = np.mean(value)

    # Now for all prospective students, we look at what modules they have taken and calculate a score
    good_student_scores = []
    bad_student_scores = []
    for i in range(module_current.shape[0]):
        student = module_current.iloc[i]
        scores = []
        influencing_modules = []
        # Iterate through all modules this student has taken
        # If they are in the list, add to his 'score'
        modules_taken = module_enrolment[module_enrolment['token']
                                         == student['token']]
        for j in range(modules_taken.shape[0]):
            module = modules_taken.iloc[j]['module_code']
            if module in module_influence_scores:
                scores.append(module_influence_scores[module])
                influencing_modules.append({'code': module, 'score': format(module_influence_scores[module], ".2f")})
        if len(scores) == 0:
            score = 0
        else:
            score = np.mean(scores)
        if score > 0:
            good_student_scores.append([student['token'], score, influencing_modules])
        elif score < 0:
            bad_student_scores.append([student['token'], score, influencing_modules])

    results['pred_scores_good'] = sorted(good_student_scores, key = lambda x: -x[1])
    results['pred_scores_bad'] = sorted(bad_student_scores, key = lambda x: x[1])

    return jsonify(results)

@backend.route(url_path+'/backend/student/view-module/<module_code>')
def getPrereqs(module_code):
    prereqs = fetchPrereqs(module_code)
    # name parent children
    final_list = {'name': module_code, 'parent': None, 'children': []}
    for prereq in prereqs:
        toAdd = {'name': prereq, 'parent': module_code}
        final_list['children'].append(toAdd)
    return jsonify(final_list)

@backend.route(url_path+'/backend/student/view-module/feedbackT/<module_code>')
def getTeachingFeedback(module_code):
    subset_student_fb_teaching = student_fb_teaching.loc[student_fb_teaching["mod_class_id"] == module_code]
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
    return jsonify(results)

@backend.route(url_path+'/backend/student/view-module/feedbackM/<module_code>')
def getModuleFeedback(module_code):
    print(module_code)
    subset_student_fb_module = student_fb_module.loc[student_fb_module["mod_class_id"] == module_code]
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
    return jsonify(results)
