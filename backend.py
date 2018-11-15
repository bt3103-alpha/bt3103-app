from flask import Blueprint, jsonify, request
from multiprocessing import Pool
import requests
import pandas as pd
import numpy as np
from io import StringIO
import re
import json
import threading, time

import data
import student
import faculty

backend = Blueprint('backend', __name__)
url_path = "/bt3103-app"

@backend.route(url_path+'/backend/prereqs/<module_code>')
def fetchPrereqsEndpoint(module_code):
    '''
    Endpoint to start fetching prerequisites for a module
    '''
    return jsonify(data.fetchPrereqs(module_code))


@backend.route(url_path+'/backend/fetch_data')
def callFetchData():
    '''
    Endpoint to start fetching data

    Called when server is started, or when the refresh data button is pressed in Faculty side.
    '''
    data.fetchData()
    return "{'ok': true}"

## below 2 functions generate tags firebase data
"""
def generateTagDB():
    global newData
    newData = {}
    temp = {'hello':{'count': 23, 'mods': ['w','r']}}

    for module, value in data.module_descriptions_DICT.items():
        if 'tags' in value:
            for tag in value['tags']:
                tag_lower = tag.lower()
                if tag_lower in newData:
                    newData[tag_lower]['modules'].append(module)
                else:
                    newData[tag_lower] = {'count': 0, 'modules': [module]}
    print()
    for tag, descr in newdata.items():
        print(1)
        resp = requests.put(url=url+tag+'.json',
                    data=json.dumps(descr)) # turn json (dict) to data format (string)
        #response code
        print(resp)

def putDB(item):
    url = "https://bt3103-jasminw.firebaseio.com/tags/"
    resp = requests.put(url=url+item[0]+'.json',
                data=json.dumps(item[1])) # turn json (dict) to data format (string)
    #response code
    print(resp)
"""

# General endpoints

@backend.route(url_path+'/backend/fetch_data/status')
def fetchDataStatus():
    '''
    Fetch the current status of data fetching (as an integer from 0 to 100)
    '''
    return jsonify({"progress": data.fetchProgress})

@backend.route(url_path+'/backend/module_description/<module_code>')
def fetchModuleDescription(module_code):
    '''
    Fetch module details of a module

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    string
        JSON object containing title, description and tags dictionary of a module
    '''
    try:
        result = data.module_descriptions.loc[module_code].to_dict()
    except:
        result = {'title': '', 'description': '', 'tags': []}
    if result['tags'] is np.nan:
        result['tags'] = []
    return jsonify(result)


# Faculty endpoints

@backend.route(url_path+'/backend/faculty/main/<module_code>')
def mainOverview(module_code):
    '''
    Fetch all relevant details to display on main page for a given module_code

    Parameters
    ----------
    module_code: string
        module code

    Returns
    -------
    string
        JSON object of module details. Contains number of students, unfinished webcast, unviewed forum posts, and tutorial attendance.
    '''
    row = data.main_mockup[data.main_mockup['module_code'] == module_code].to_dict('records')[0]

    return jsonify(row)


@backend.route(url_path+'/backend/faculty/demographics/<module_code>')
def moduleDemographics(module_code):
    '''
    Fetch information for the module demographics tab
    '''
    return jsonify(faculty.demographics(module_code))


@backend.route(url_path+'/backend/faculty/enrolment/<module_code>')
def moduleEnrolment(module_code):
    '''
    Fetch information for the module enrolment tab
    '''
    return jsonify(faculty.enrolment(module_code))


@backend.route(url_path+'/backend/faculty/academics/byfac/<module_code>')
def moduleAcademicsFac(module_code):
    '''
    Fetch information for the module academics tab
    '''
    return jsonify(faculty.academics(module_code))


@backend.route(url_path+'/backend/faculty/student/<token>')
def get_student_info(token):
    '''
    Fetch all information of a particular student
    '''
    return jsonify(faculty.student_info(token))


# Student endpoints

@backend.route(url_path+'/backend/student/view-module/<module_code>')
def getPrereqs(module_code):
    '''
    Fetch prerequisites of a module
    '''
    return jsonify(student.getPrereqs(module_code))


@backend.route(url_path+'/backend/student/view-module/feedbackT/<module_code>')
def getTeachingFeedback(module_code):
    '''
    Fetch students' review of a professor
    '''
    return jsonify(student.getTeachingFeedback(module_code))


@backend.route(url_path+'/backend/student/view-module/feedbackM/<module_code>')
def getModuleFeedback(module_code):
    '''
    Fetch students' review of a module
    '''
    return jsonify(student.getModuleFeedback(module_code))


@backend.route(url_path+'/backend/student/view-tag/<tag_name>')
def getTags(tag_name):
    '''
    Fetch information of a tag - number of clicks, modules with same tag, etc
    '''
    return jsonify(data.tags[tag_name])


@backend.route(url_path+'/backend/student/view-tag/count/<tag_name>', methods=["POST"])
def setCountTags(tag_name):
    '''
    Update local tag dictionary on number of times a specific tag is clicked

    Parameters
    ----------
    tag_name: string
        tag name

    Returns
    -------
    string
        name of tag whose count is updated
    '''
    content = request.get_json()
    data.tags[tag_name]['count'] = content['count']
    return tag_name


@backend.route(url_path+'/backend/student/SEP/<module_code>')
def getSEPUni(module_code):
    '''
    Fetch list of partner universities and their respective modules which can be mapped to this module
    '''
    return jsonify(student.getSEPUni(module_code))
