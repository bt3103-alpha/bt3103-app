import requests, re
import pandas as pd
from io import StringIO
import threading
import numpy as np
import time

module_enrolment = None
program_enrolment = None
mockedup_data = None
main_mockup = None
student_attention = None
student_attention_cap = None
cap = None
module_descriptions = None
module_descriptions_DICT = {}
newData = {}
student_fb_module = None
student_fb_teaching = None
SEP = None
column_descriptions = None
module_names = {}
fetchProgress = 0
tags = {}

grades = {"A+": 5.0, "A": 5.0, "A-": 4.5, "B+": 4.0, "B": 3.5,
          "B-": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0}

def fetchPrereqs(module_code):
    '''
    Fetches a list of prerequisites for a given module code. Uses nusmods' API.

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    list
        Prerequisities for a given module code, returns an empty list of module is not found
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

def fetchGoogleSheet(url_num, sheet_name):
    '''
    Query data from Google spreadsheet.
    Data obtained from https://docs.google.com/document/d/1lWEWGZBM1sSIAHUDIcIhfo9MJQUjao3v52Qp5VRyEZM/

    Parameters
    ----------
    url_num: integer
        Representing which 'part' (1 or 2) the sheet belongs to
    sheet_name: string
        Name of sheet to pull data from

    Returns
    -------
    Pandas dataframe
        Results from Google spreadsheet
    '''
    if url_num == 1:
        # Part 1
        ## Prof copy
        url = "14dZQ5XLFG5-1NNGYTgclrTXlkEUiSWWiOCdkjNZaAfQ"
        ## cloned copy
        ## url = "1fODgXoBY44uq2B2KA-M-eWYv0LKOQ0To0etvAdHZhsc"
    elif url_num == 2:
        # Part 2
        ## Prof copy
        url = "1lFR0Og8mFUzJNZkzC1Lr9Z7KHaG_X8bV--VfV-FH64Y"
        ## cloned copy
        ## url = "1arssfIN-m6i0575a9R2FBnwWQmYOcfTAUcJ2q6wodJQ"
    elif url_num ==3:
        # Vienna's mock up for main page (including module code, num of stu, num of webcasts watch halfway, unviewed forum, tut attendance)
        url = "16Sw9yRsyMrFZDXGKNQe3gG34Sj3Y_8jqOzjCXszJQB8"
    else:
        # Sam's mockup
        url = "15YQSuRO3TohlqFiF8v3oxFNpr9VoBxgOs6ihhUMCigU"
    r = requests.get("https://docs.google.com/spreadsheets/d/" +
                     url+"/gviz/tq?tqx=out:csv&sheet="+sheet_name)
    strio = StringIO(r.text)
    return pd.read_csv(strio).dropna(axis=1, how='all')


def fetchFirebase(url):
    '''
    Query data from Firebase.

    Parameters
    ----------
    url: string
        Firebase URL

    Returns
    -------
    Pandas dataframe
        Results from Firebase database
    '''
    r = requests.get(url)
    return pd.DataFrame.from_records(r.json())


def fetchFirebaseJSON(url):
    r = requests.get(url)
    return pd.DataFrame.from_dict(r.json(), orient='index')

def fetchFirebaseJSON_no(url):
    r = requests.get(url)
    return r.json()


counter = 0
total_fetch = 1

def update_fetch_progress():
    global counter
    counter += 1
    progress = int(counter / total_fetch * 100)
    print("Progress: " + str(progress) + "% done")

def fetch_module_enrolment():
    global module_enrolment
    module_enrolment = fetchGoogleSheet(1, "module_enrolment")
    calculate_cap()
    update_fetch_progress()

def fetch_program_enrolment():
    global program_enrolment
    program_enrolment = fetchGoogleSheet(1, 'program_enrolment')
    program_enrolment.columns = [x.lower() for x in program_enrolment.columns]
    update_fetch_progress()

def fetch_student_fb_module():
    global student_fb_module
    student_fb_module = fetchGoogleSheet(2, 'student_feedback_module')
    student_fb_module = student_fb_module.dropna(axis=1, how='all').dropna()
    update_fetch_progress()

def fetch_student_fb_teaching():
    global student_fb_teaching
    student_fb_teaching = fetchGoogleSheet(2, 'student_feedback_teaching')
    student_fb_teaching = student_fb_teaching.dropna(axis=1, how='all').dropna()
    update_fetch_progress()

def fetch_main_mockup():
    global main_mockup
    main_mockup = fetchGoogleSheet(3, 'mockup_for_main')
    update_fetch_progress()

def fetch_student_attention():
    global student_attention
    student_attention = fetchGoogleSheet(4, 'Sheet1')
    update_fetch_progress()

def fetch_SEP():
    global SEP
    SEP = fetchGoogleSheet(4, 'Sheet5' )
    update_fetch_progress()

def fetch_column_descriptions():
    global column_descriptions
    column_descriptions = fetchGoogleSheet(4, 'catalog').set_index('var_name')
    update_fetch_progress()

def fetch_module_descriptions():
    global module_descriptions
    module_descriptions = fetchFirebaseJSON("https://bt3103-alpha-student.firebaseio.com/module_descriptions.json")
    update_fetch_progress()

def fetch_tags():
    global tags
    tags = fetchFirebaseJSON_no("https://bt3103-jasminw.firebaseio.com/tags.json")
    update_fetch_progress()

def fetchData():
    '''
    Fetch and process all the data that we need.
    '''
    global total_fetch

    print("Fetching data...")
    functions = [
        fetch_module_enrolment, fetch_program_enrolment,
        fetch_student_fb_module, fetch_student_fb_teaching,
        fetch_main_mockup, fetch_student_attention,
        fetch_SEP, fetch_column_descriptions,
        fetch_module_descriptions, fetch_tags
    ]

    total_fetch = len(functions)

    threads = []
    for func in functions:
        threads.append(threading.Thread(target=func))
        threads[-1].start()

    for thread in threads:
        thread.join()

    print("Done fetching data")

def getScore(x):
    '''
    Maps letter grade to numeric score.

    Parameters
    ----------
    x: string
        Letter grade

    Returns
    -------
    float
        Numeric grade of a grade, nan is grade is not found (eg. S/U)
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

def calculate_cap():
    '''
    Calculate CAP score for each student in the database after fetching module enrolment.
    '''
    # Calculate cap
    global program_enrolment

    while module_enrolment is None or program_enrolment is None or student_attention is None:
        # Try again later
        time.sleep(2)

    cap = module_enrolment[['module_credits', 'final_grade', 'token']].copy()
    cap['grade'] = cap['final_grade'].apply(getScore)
    cap['module_credits'] = cap['module_credits'].apply(
        lambda x: 4 if x == 0 else x)
    cap = cap.dropna().drop('final_grade', axis=1)
    cap['score'] = cap['grade'] * cap['module_credits']
    cap = cap.groupby('token').sum()

    cap['CAP'] = cap['score'] / cap['module_credits']
    cap = cap[['CAP']]

    program_enrolment = program_enrolment.join(cap, on='token').join(
        student_attention.set_index('token'), on='token')


def countsAsDict(df, column_name):
    '''
    Takes in a column, does a value count, and returns a dict.

    Parameters
    ----------
    df: Pandas dataframe
        Dataframe that contains the data to be counted
    column_name: string
        Name of the column to be counted

    Returns
    -------
    dict
        A dictionary with keys 'labels', 'counts', and 'students' with each value being a list.

    Examples
    --------
    >>> countsAsDict(df, column_name)
    >>> {'labels': ['A', 'B'], 'counts': [2, 4], 'tokens': ['Token1', 'Token2']}

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
    Takes in a column, does a value count, returns as nested lists.

    Parameters
    ----------
    df: Pandas dataframe
        Dataframe that contains the data to be counted
    column_name: string
        Name of the column to be counted

    Returns
    -------
    Pandas series
        A nested list where each sublist includes details of a label. Sublist consist of label name, count, and a list of students.

    Examples
    --------
    >>> countsAsLists(df, column_name)
    >>> [["A", 1, ['Token1', 'Token2']], ["B", 2, ['Token3']]]
    '''
    counts = df[column_name].value_counts()
    result = []
    for key, value in counts.items():
        tokens = df[df[column_name] == key]['token']
        result.append([key, value, list(tokens)])
    return result


def module_all_terms(module_code):
    '''
    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    Pandas series
        All module enrolments for a given module code
    '''
    return module_enrolment[module_enrolment.module_code == module_code]


def module_current_term(module_code):
    '''
    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    Pandas series
        Latest semester's module enrolments for a given module code
    '''
    module_subset = module_all_terms(module_code)
#    return module_subset
    return module_subset[module_subset.term == max(module_subset.term)]


def module_past_terms(module_code):
    '''
    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    Pandas series
        Previous semesters' module enrolments for a given module code
    '''
    module_subset = module_all_terms(module_code)
    return module_subset[module_subset.term != max(module_subset.term)]


def program_current_term(module_code):
    '''
    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    Pandas series
        Program enrolment for students currently taking a particular module
    '''
    module_current = module_current_term(module_code)
    # program_current = program_enrolment[program_enrolment.term == max(
        # program_enrolment.term)]
    program_current = module_current[['token']].join(
        program_enrolment.set_index('token'), on='token', how='inner')
    return program_current


def program_past_terms(module_code):
    '''
    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    Pandas series
        Program enrolment for students who previously took the module
    '''
    module_subset = module_all_terms(module_code)
    program_subset = program_enrolment[program_enrolment.term != max(
        program_enrolment.term)]
    program_subset = module_subset[['token']].join(
        program_subset.set_index('token'), on='token', how='inner')
    return program_subset
