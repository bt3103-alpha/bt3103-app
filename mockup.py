#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Oct 20 12:24:30 2018

@author: viennawong
"""

from flask import Blueprint, jsonify
import requests
import pandas as pd
import numpy as np
from io import StringIO
import asyncio
import re

r = requests.get("https://docs.google.com/spreadsheets/d/14dZQ5XLFG5-1NNGYTgclrTXlkEUiSWWiOCdkjNZaAfQ/gviz/tq?tqx=out:csv&sheet=module_enrolment")
strio = StringIO(r.text)
module_enrolment = pd.read_csv(strio)

module_codes = module_enrolment['module_code'].unique().tolist()
number_of_students = module_enrolment.groupby('module_code').size()
number_of_webcasts_unfinished = []
unviewed_forum = []
tutorial_attendance = []


for num in number_of_students:
    number_of_webcasts_unfinished.append(np.random.randint(1, num))
    unviewed_forum.append(np.random.randint(0,num))
    tutorial_attendance.append(np.random.randint(0,100))
    
    

new_df = {'modules': module_codes, 'number of students': number_of_students, 
          'number of webcasts unfinished':number_of_webcasts_unfinished, 
          'unviewed forum': unviewed_forum, 'tutorial attendance': tutorial_attendance}
df = pd.DataFrame(new_df, columns = ['modules', 'number of students', 
                                     'number of webcasts unfinished',
                                     'unviewed forum', 'tutorial attendance'])
df.to_csv('mockup_for_main.csv')