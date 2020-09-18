# Core imports
import os
import shutil

# Training resources for svp model
import plac
import random
from pathlib import Path
import spacy
from spacy.util import minibatch, compounding
import json

# Training resources for classification model
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.svm import LinearSVC
import pickle

from ai_core import config

# Model Specific
base_dir = config.base_dir
# Rename the below to clf_dir
clf_model_dir = config.clf_model_dir
clf_models_dir = config.clf_models_dir
clf_model_root_intents_json_file = config.clf_model_root_intents_json_file
update_clf_model_dir = config.update_clf_model_dir
update_sense_clf_model_dir = config.update_sense_clf_model_dir
svp_model_dir_core = config.svp_model_dir_core
svp_model_dir = config.svp_model_dir
svp_model_json_file = config.svp_model_json_file
root_clf_model_vectorizer = config.root_clf_model_vectorizer
root_clf_model = config.root_clf_model


class TrainSvpModel:
    def __init__(self, selected_intent, selected_intent_svp_json_file=''):
        self.selected_intent = selected_intent
        temp_svp_model_json_file = selected_intent+'.json'
        temp_svp_model_json_file_path = os.path.join(svp_model_dir_core, 'json')
        self.selected_intent_svp_json_file = os.path.join(temp_svp_model_json_file_path, temp_svp_model_json_file)
    def train_svp_model(self):
        try:
            with open(self.selected_intent_svp_json_file, encoding='utf8') as f:
                svp_data = json.load(f)

            # create a new directory name with selected intent
            intent = self.selected_intent
            intent_path = svp_model_dir + '/' + intent
            if os.path.exists(intent_path):
                shutil.rmtree(intent_path)
            os.mkdir(intent_path)

            svp_model_output_path = os.path.join(svp_model_dir, intent)
            # Without the init.py file, spacy will throw an error in locating the meta.json file
            init_py_file = os.path.join(svp_model_output_path, '__init__.py')
            with open(init_py_file, mode='a'): pass

            @plac.annotations(
                model=("model. Defaults to blank 'en' model.", "option", "m", str),
                output_dir=(svp_model_output_path, "option", "o", Path),
                n_iter=("Number of training iterations", "option", "n", int),
            )
            def main(model=None, output_dir=svp_model_output_path, n_iter=100):
                """Load the model, set up the pipeline and train the entity recognizer."""
                if model is not None:
                    nlp = spacy.load(model)  # load existing spaCy model
                    print("Loaded model '%s'" % model)
                else:
                    nlp = spacy.blank("en")  # create blank Language class
                    print("Created blank 'en' model")

                # create the built-in pipeline components and add them to the pipeline
                # nlp.create_pipe works for built-ins that are registered with spaCy
                if "ner" not in nlp.pipe_names:
                    ner = nlp.create_pipe("ner")
                    nlp.add_pipe(ner, last=True)
                # otherwise, get it so we can add labels
                else:
                    ner = nlp.get_pipe("ner")

                # add labels
                for _, annotations in svp_data:
                    for ent in annotations.get("entities"):
                        ner.add_label(ent[2])

                # get names of other pipes to disable them during training
                other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
                with nlp.disable_pipes(*other_pipes):  # only train NER
                    # reset and initialize the weights randomly – but only if we're
                    # training a new model
                    if model is None:
                        nlp.begin_training()
                    for itn in range(n_iter):
                        random.shuffle(svp_data)
                        losses = {}
                        # batch up the examples using spaCy's minibatch
                        batches = minibatch(svp_data, size=compounding(4.0, 32.0, 1.001))
                        for batch in batches:
                            texts, annotations = zip(*batch)
                            nlp.update(
                                texts,  # batch of texts
                                annotations,  # batch of annotations
                                drop=0.5,  # dropout - make it harder to memorise data
                                losses=losses,
                            )
                        print("Losses", losses)

                # save model to output directory
                if output_dir is not None:
                    output_dir = Path(svp_model_output_path)
                    if not output_dir.exists():
                        output_dir.mkdir()
                    nlp.to_disk(svp_model_output_path)
                    print('------SVP TRAINING COMPLETED------')
                    print("SVP model saved to: ", output_dir)

            main(model=None, output_dir=svp_model_output_path, n_iter=100)

        except:
            user_message = 'Error training svp model'
            print(user_message)


class TrainClassifierModel:
    def __init__(self, selected_update_intent):
        self.self = self
        self.selected_update_intent = selected_update_intent
    def train_classifier_model(self):
        # try:
        if self.selected_update_intent == 'none':
            df = pd.read_json(clf_model_root_intents_json_file)
            X_train, X_test, y_train, y_test = train_test_split(df['utterance'], df['intent'], random_state=0)

            count_vect = CountVectorizer()
            X_train_counts = count_vect.fit_transform(X_train)
            tfidf_transformer = TfidfTransformer()
            X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)

            model = LinearSVC().fit(X_train_tfidf, y_train)

            # Save the vectorizer
            # vec_file = 'vectorizer.pickle'
            pickle.dump(count_vect, open(root_clf_model_vectorizer, 'wb'))

            # Save the model
            # mod_file = 'classification.model'
            pickle.dump(model, open(root_clf_model, 'wb'))

            print('------SVC CLASSIFICATION TRAINING COMPLETED------')
            print("Vectorizer model saved to: ", root_clf_model_vectorizer)
            print("Classification model saved to: ", root_clf_model)
            # except:
            #     user_message = 'Error training classification model'
            #     print(user_message)

        elif self.selected_update_intent != 'none':
            print('------NB CLASSIFICATION TRAINING COMPLETED------')

class TrainUpdateSenseClassifierModel:
    def __init__(self):
        self.self = self
    def train_update_sense_classifier_model(self):
        # try:
        update_sense_json_file = 'update_sense.json'
        path_to_look_for = os.path.join(update_sense_clf_model_dir)
        if os.path.exists(path_to_look_for):
            update_sense_json_file = os.path.join(update_sense_clf_model_dir, 'update_sense.json') 
            update_sense_clf_model = os.path.join(update_sense_clf_model_dir, 'update_sense.model')
            update_sense_clf_vectorizer = os.path.join(update_sense_clf_model_dir, 'update_sense.pickle')

            df = pd.read_json(update_sense_json_file)
            X_train, X_test, y_train, y_test = train_test_split(df['utterance'], df['intent'], random_state=0)

            count_vect = CountVectorizer()
            X_train_counts = count_vect.fit_transform(X_train)
            tfidf_transformer = TfidfTransformer()
            X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)

            model = LinearSVC().fit(X_train_tfidf, y_train)

            # Save the vectorizer
            # vec_file = 'vectorizer.pickle'
            pickle.dump(count_vect, open(update_sense_clf_vectorizer, 'wb'))

            # Save the model
            # mod_file = 'classification.model'
            pickle.dump(model, open(update_sense_clf_model, 'wb'))

            print('------UPDATE SENSE CLASSIFICATION TRAINING COMPLETED------')
            print("Vectorizer model saved to: ", update_sense_clf_model_dir)
            print("Classification model saved to: ", update_sense_clf_model_dir)
            # except:
            #     user_message = 'Error training classification model'
            #     print(user_message)