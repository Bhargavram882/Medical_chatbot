from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import csv
# import torch
import pickle
import nltk
import pandas as pd
# nltk.download("punkt")
# from nltk_utils import bag_of_words
# get all words
di_descr={}
di_prec={}
di_sev={}



diseases_description = pd.read_csv("data/symptom_Description.csv")
diseases_description['Disease'] = diseases_description['Disease'].apply(lambda x: x.lower().strip(" "))

disease_precaution = pd.read_csv("data/symptom_precaution.csv")
disease_precaution['Disease'] = disease_precaution['Disease'].apply(lambda x: x.lower().strip(" "))

symptom_severity = pd.read_csv("data/Symptom-severity.csv")
symptom_severity = symptom_severity.applymap(lambda s: s.lower().strip(" ").replace("_", " ") if type(s) == str else s)
print(symptom_severity)


with open('words.pickle', 'rb') as data_file:
    all_words = pickle.load(data_file)

with open('symptom.pickle', 'rb') as data_file:
    symptom_model = pickle.load(data_file)

with open('list_of_symptoms.pickle', 'rb') as data_file:
    symptoms_list = pickle.load(data_file)
    
with open("modellogi.pickle", 'rb') as data_file:
    disease_model = pickle.load(data_file)
    
    
from nltk.stem.porter import PorterStemmer
stemmer = PorterStemmer()
import numpy as np
def bag_of_words(tokenized_sentence, all_words):
    tokenized_sentence = [stemmer.stem(w.lower()) for w in tokenized_sentence]

    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bag[idx] = 1.0

    return bag

def get_symptom(sentence):
    sentence = nltk.word_tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    # X = torch.from_numpy(X)
    output = symptom_model.predict(X)
    prob=max(symptom_model.predict_proba(X)[0])
    oo={}
    oo["out"]=output
    oo["prob"]=prob
    return output,prob

def get_disease(symptom):
    sentence = nltk.word_tokenize(symptom)
    X = bag_of_words(symptom, all_words)
    x_test = np.asarray(X)
    X = X.reshape(1, X.shape[0])
    # X = torch.from_numpy(X)
    output2 = disease_model.predict(x_test.reshape(1,-1))[0]
    return output2


user_symptoms = set()

app = Flask(__name__)
CORS(app, support_credentials=True)

@cross_origin(supports_credentials=True)
@app.route("/symptom" ,methods=['GET','POST'])
def predict():
    # print()
    sentence=request.json['sentence']
    output,prob=get_symptom(sentence)
    #print(output)
    if(prob<0.00999999):
        return jsonify({"output":"I am sorry but I don't understand you!","flag":"1"})
    return jsonify({"output":symptoms_list[output[0]],"flag":"0"})

@cross_origin(supports_credentials=True)
@app.route("/disease",methods=['GET','POST'])
def predictdis():
     ll="1"
     print(int(ll))
     listsym=request.json['symptom']
     listsym=set(listsym)
     l=len(listsym)
     print(listsym)
     x_test=[]
     p=0
     severity=[]
     for each in symptoms_list:
         o=0
         if each in listsym:
        # print(int(o))
            x_test.append(1)
         else:
            x_test.append(0)
     
     for each in listsym:
         print(each,each.lower().strip(" ").replace(" ", "_"))
         severity.append(symptom_severity.loc[symptom_severity['Symptom'] == each.lower().strip(" ").replace("_"," "), 'weight'].iloc[0])
     print(severity)
     x_test=np.asarray(x_test)
     disease=disease_model.predict(x_test.reshape(1,-1))[0]
     print(disease)
     description = diseases_description.loc[diseases_description['Disease'] == disease.strip(" ").lower(), 'Description'].iloc[0]
     precaution = disease_precaution[disease_precaution['Disease'] == disease.strip(" ").lower()]
     precautions = 'PRECAUTIONS: ' + precaution.Precaution_1.iloc[0] + ", " + precaution.Precaution_2.iloc[0] + ", " + precaution.Precaution_3.iloc[0] + ", " + precaution.Precaution_4.iloc[0]
     response_sentence = disease + ". <br><br> <i>Description: " + description + "</i>" + "<br><br><b>"+ precautions + "</b>"
     if np.mean(severity) > 4 or np.max(severity) > 5:
        precautions=precautions+" "+ ":::::: Considering your symptoms are severe, and bot isn't a real doctor, you should consider talking to one🙂"
     #response_sentence = disease + ". <br><br> <i>Description: " + description + ":" + precautions
     print(response_sentence)
     disease="".join(disease.split())
     p=p/l
    
     return jsonify({"disease":disease,"description":description,"precaution":precautions})
