from flask import Blueprint, jsonify
import requests
import pandas as pd
import numpy as np
from io import StringIO
import asyncio
import re

backend = Blueprint('backend', __name__)

module_enrolment = None
program_enrolment = None
mockedup_data = None
student_attention = None
student_attention_cap = None
cap = None
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
        url = "14dZQ5XLFG5-1NNGYTgclrTXlkEUiSWWiOCdkjNZaAfQ"
    elif url_num == 2:
        # Part 2
        url = "1lFR0Og8mFUzJNZkzC1Lr9Z7KHaG_X8bV--VfV-FH64Y"
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
    global fetchProgress, module_enrolment, program_enrolment, mockedup_data, student_attention #, cap, student_attention_cap

    print("Fetching data")
    fetchProgress = 0

    # Each row = 1 student taking 1 module
    module_enrolment = await fetchGoogleSheet(1, "module_enrolment")
    fetchProgress = 20

    cap = module_enrolment[['module_credits', 'final_grade', 'token']].copy()
    cap['grade'] = cap['final_grade'].apply(getScore)
    cap['module_credits'] = cap['module_credits'].apply(
        lambda x: 4 if x == 0 else x)
    cap = cap.dropna().drop('final_grade', axis=1)
    cap['score'] = cap['grade'] * cap['module_credits']
    cap = cap.groupby('token').sum()

    cap['CAP'] = cap['score'] / cap['module_credits']
    cap = cap[['CAP']]
    fetchProgress = 30

    # Each row = 1 student in 1 semester
    program_enrolment = await fetchGoogleSheet(1, 'program_enrolment')
    fetchProgress = 50

    student_attention = await fetchGoogleSheet(3, 'Sheet1')
    fetchProgress = 75

    program_enrolment = program_enrolment.join(cap, on='Token').join(student_attention.set_index('token'), on='Token')

    # student_attention_cap = student_attention.join(
    #     cap, on='token', how='inner')

    # mockedup_data = await fetchFirebase(
    #     "https://bt3103-mockup.firebaseio.com/.json")
    fetchProgress = 100
    print("Done fetching data")


@backend.route('/backend/fetch_data')
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


@backend.route('/backend/fetch_data/status')
def fetchDataStatus():
    '''
    Fetches the current status of data fetching (as an integer from 0 to 100)
    '''
    return jsonify({"progress": fetchProgress})


def countsAsDict(x):
    '''
    Takes in a column, does a value count, and returns a dict

    E.g. {"A": 1, "B": 2}

    Parameters:
    x - Pandas Series 
    '''
    counts = x.value_counts()
    labels = [str(x) for x in counts.index]
    counts = [int(x) for x in counts]
    return {'labels': labels, 'counts': counts}


def countsAsLists(x):
    '''
    Takes in a column, does a value count, returns as nested lists

    E.g. [["A", 1], ["B", 2]]

    Parameters: 
    x - Pandas Series
    '''
    counts = x.value_counts()
    result = []
    for key, value in counts.items():
        result.append([key, value])
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
    return module_subset[module_subset.term == max(module_subset.term)]

def program_current_term(module_code):
    '''
    Returns the program_enrolment for students currently taking a particular module
    '''
    module_current = module_current_term(module_code)
    program_current = program_enrolment[program_enrolment.term == max(
        program_enrolment.term)]
    program_current = module_current[['token']].join(
        program_current.set_index('Token'), on='token', how='inner')
    return program_current

@backend.route('/backend/faculty/demographics/<module_code>')
def moduleDemographics(module_code):
    '''
    Fetches all demographic data to be displayed for a given module_code. 

    Parameters: 
    module_code - string
    '''
    results = {}

    module_current = module_current_term(module_code)
    program_current = program_current_term(module_code)

    # Fetch program information about current students
    results["degrees"] = countsAsLists(program_current.degree_descr)
    results["academic_career"] = countsAsDict(program_current.academic_career)
    results["faculty"] = countsAsDict(program_current.faculty_descr)
    results["academic_load"] = countsAsDict(
        program_current.academic_load_descr)

    # Count of years of current students
    results["years"] = [0, 0, 0, 0]
    years = (18.1 - (program_current.admit_term / 100)
             ).astype(int).value_counts().to_dict()
    for year, count in years.items():
        results["years"][min(year-1, 3)] += count

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

    return jsonify(results)


@backend.route('/backend/faculty/enrolment/<module_code>')
def moduleEnrolment(module_code):
    program_current = program_current_term(module_code).fillna(0)

    program_current['attendance'] = program_current['attendance'].apply(lambda x: format(x, '.2f'))
    program_current['webcast'] = program_current['webcast'].apply(lambda x: format(x, '.2f'))
    program_current['CAP'] = program_current['CAP'].apply(lambda x: format(x, '.2f'))

    return jsonify(program_current.to_dict('records'))


def getModuleGrades(module_code):
    module_subset = module_all_terms(module_code)
    subset_grades = module_subset.final_grade.value_counts()
    result = []
    for grade in grades.keys():
        result.append(int(subset_grades.get(grade, 0)))
    return result


@backend.route('/backend/faculty/academics/<module_code>')
def moduleAcademics(module_code):
    program_current = program_current_term(module_code)

    results = {}

    # Fetch a count of past grades
    results['grades'] = getModuleGrades(module_code)

    results['attendance_cap'] = []
    results['webcast_cap'] = []

    for i in range(program_current.shape[0]):
        student = program_current.iloc[i]
        results['attendance_cap'].append({
            'x': float(student['attendance']),
            'y': float(student['CAP'])
        })
        results['webcast_cap'].append({
            'x': float(student['webcast']),
            'y': float(student['CAP'])
        })

    prereqs = fetchPrereqs(module_code)
    results['prereqs'] = []
    for prereq in prereqs:
        prereq_data = {
            'module_code': prereq,
            'grades': getModuleGrades(prereq)
        }
        if sum(prereq_data['grades']) > 0:
            results['prereqs'].append(prereq_data)

    return jsonify(results)
