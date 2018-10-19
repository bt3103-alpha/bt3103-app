import requests
import spacy
import re
import math
from tqdm import tqdm

nlp = spacy.load('en_core_web_lg')

corpus = {}

modules = requests.get("https://api.nusmods.com/2018-2019/moduleInformation.json").json()

for module in modules:
    description = module.get('ModuleDescription', '')
    for word in re.findall(r'[a-z][a-z]*', description.lower()):
        if word not in corpus:
            corpus[word] = 1
        else:
            corpus[word] += 1 


def getModuleTags(description):
    start_pos = ['NN', 'NNS', 'JJ', 'VBG', 'NNP']
    contain_pos = start_pos + ['CCONJ', 'CC', 'DT', 'HYPH', 'POS', 'IN']
    end_pos = ['NN', 'NNS', 'JJ', 'NNP']
    skip_words = {'final', 'examination', 'examinations', 'term', 'papers', 'module', 'topics', 'focus', 'modules', 'emphasis'}
    
    tags = set()
    docs = {}
    
    i = 0
    start_index = None
    end_index = 0
    
    tokens = nlp(description.replace("'", '').replace("-", ' '))
    
    while i < len(tokens):
        if start_index is None and tokens[i].tag_ in start_pos and tokens[i].text not in skip_words:
            # Start a new phrase
            start_index = i
            end_index = i
            
            # Extend the end_index until we get an acceptable phrase
            while end_index+1 < len(tokens) and tokens[end_index+1].tag_ in contain_pos + end_pos:
                end_index += 1
                
                # If phrase contains, just jump to next phrase
                if tokens[end_index].text in skip_words:
                    i = end_index + 1
                    start_index = None
                    end_index = None
                    break
            if start_index is None:
                continue
                
            while tokens[end_index].tag_ not in end_pos and end_index > start_index:
                end_index -= 1
            
            # Add the tag in
            if tokens[end_index].tag_ in end_pos:
                phrase = ' '.join([x.text for x in tokens[start_index:end_index+1]])
                # Calculate score before adding
                score = 0
                for j in range(start_index, end_index + 1):
                    score += math.log(corpus.get(tokens[j].text.lower(), 10))
                if score / (end_index - start_index + 1) < 7 and phrase.lower() not in tags:
                    # To add phrase
                    doc = nlp(phrase)
                    groupToAddTo = len(docs)
                    for otherDoc, group in docs.items():
                        similarity = doc.similarity(otherDoc)
                        if similarity > 0.9:
                            groupToAddTo = group
                    docs[doc] = groupToAddTo
                    
            i = end_index + 1
            start_index = None
            end_index = None
        else:
            i += 1
    
    # Select only 1 phrase from similar ones
    tags = []
    groupsDone = set()
    for doc, group in docs.items():
        if group in groupsDone:
            continue
        # Check if it's in any other groups
        sameGroup = []
        for doc2, group2 in docs.items():
            if group == group2:
                sameGroup.append(doc2)
        # Now we have a list of similar docs
        # Compare them all and return the one with the highest similarity
        chosenDoc = None
        maxSimilarity = 0
        for doc2 in sameGroup:
            sumSimilarity = 0
            for doc3 in sameGroup:
                sumSimilarity += doc2.similarity(doc3)
            if sumSimilarity > maxSimilarity:
                maxSimilarity = sumSimilarity
                chosenDoc = doc2
        
        # Add chosenDoc to tags
        tags.append(chosenDoc.text)
        groupsDone.add(group)
    
    return tags

# Okay let's run on all modules
module_results = {}

for module in tqdm(modules):
    code = module['ModuleCode']
    title = module['ModuleTitle']
    description = module.get('ModuleDescription', '')
    tags = getModuleTags(description)
    module_results[code] = {
            'title': title,
            'description': description,
            'tags': tags
            }

# Save as json 
import json
with open("module_descriptions.json", "w") as f:
    json.dump(module_results, f)

import requests
requests.put("https://bt3103-alpha-student.firebaseio.com/module_descriptions.json", json=module_results)
