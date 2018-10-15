from flask import Blueprint, jsonify
import requests
import pandas as pd
import numpy as np
from io import StringIO
import asyncio

backend = Blueprint('backend', __name__)

module_enrolment = None
program_enrolment = None
mockedup_data = None
fetchProgress = 0

grades = {"A+": 5.0, "A": 5.0, "A-": 4.5, "B+": 4.0, "B": 3.5,
          "B-": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0}


async def fetchGoogleSheet(url_num, sheet_name):
    '''
    Reads in the Google spreadsheet, returning it as a Pandas dataframe.

    Parameters:
    url_num: integer, representing which 'part' (1 or 2) the sheet belongs to
    sheet_name: string, name of sheet to pull data from

    References https://docs.google.com/document/d/1lWEWGZBM1sSIAHUDIcIhfo9MJQUjao3v52Qp5VRyEZM/
    '''
    if url_num == 1:
        url = "14dZQ5XLFG5-1NNGYTgclrTXlkEUiSWWiOCdkjNZaAfQ"
    else:
        url = "1lFR0Og8mFUzJNZkzC1Lr9Z7KHaG_X8bV--VfV-FH64Y"
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


async def fetchData():
    '''
    Fetch and process all the data that we need.

    We use asyncio to free the server up to respond to other requests
    while running this function. 
    '''
    global fetchProgress, module_enrolment, program_enrolment, mockedup_data

    fetchProgress = 0
    module_enrolment = await fetchGoogleSheet(1, "module_enrolment")
    fetchProgress = 30
    program_enrolment = await fetchGoogleSheet(1, 'program_enrolment')
    fetchProgress = 60
    mockedup_data = await fetchFirebase(
        "https://bt3103-mockup.firebaseio.com/.json")
    fetchProgress = 100


@backend.route('/backend/fetch_data')
def callFetchData():
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(fetchData())
    loop.close()
    return jsonify({"ok": True})


@backend.route('/backend/fetch_data/status')
def fetchDataStatus():
    return jsonify({"progress": fetchProgress})


@backend.route('/backend/faculty/demographics/<module_code>')
def moduleDemographics(module_code):
    results = {}

    module_subset = module_enrolment[module_enrolment.module_code == module_code]
    mock_subset = mockedup_data[mockedup_data.module_code_json == module_code]

    #module_current = module_subset[module_subset.term == max(module_subset.term)]
    mock_current = mock_subset[mock_subset.term_json == max(
        mock_subset.term_json)]

    # Fetch a count of past grades
    subset_grades = module_subset.original_letter_grade.value_counts()
    results["grades"] = []
    for grade in grades.keys():
        results["grades"].append([grade, int(subset_grades.get(grade, 0))])

    # Fetch list of degrees of students
    degrees = mock_current.degrees.value_counts()
    results["degrees"] = []
    for key, value in degrees.items():
        results["degrees"].append([key, int(value)])

    # Count of years of current students
    results["years"] = {}
    years = (18.1 - (mock_current.admit_term / 100)).value_counts().to_dict()
    for key, value in years.items():
        results["years"]["Year " + str(int(key))] = int(value)

    return jsonify(results)
