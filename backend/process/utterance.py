import string
import csv
from nltk import word_tokenize
import pickle
from textblob.classifiers import NaiveBayesClassifier
from ai_core import config

slot_mapper_csv_file = 'slot_mapper.csv'


class CollectUtterance:
    def __init__(self, utterance):
        self.utterance = utterance

    def collect_utterance(self):
        return word_tokenize(self.utterance.lower())


class RemovePunctuation:
    def __init__(self, utterance):
        self.utterance = utterance

    def remove_punctuation(self):
        utterance_wo_punctuation = [punc_mark for punc_mark in self.utterance if punc_mark not in string.punctuation]
        return utterance_wo_punctuation


class NbClassification:
    def __init__(self, utterance, file):
        self.utterance = utterance
        self.file = file

    def classify_intent(self):
        with open(self.file, 'r') as fp:
            cl = NaiveBayesClassifier(fp, format='json')
        intent = cl.classify(self.utterance)
        test = (self.utterance, intent),
        accuracy = cl.accuracy(test)
        # print(accuracy, '<< Accuracy')
        # nb_clf_result = {
        #     'intent': intent,
        #     'accuracy': accuracy
        # }
        return intent


class SvmClassification:
    def __init__(self, utterance, vectorizer, clf_model):
        self.utterance = str(utterance)
        self.vectorizer = vectorizer
        self.clf_model = clf_model

    def classify_intent(self):
        # load the vectorizer
        loaded_vectorizer = pickle.load(open(self.vectorizer, 'rb'))

        # load the model
        loaded_model = pickle.load(open(self.clf_model, 'rb'))

        # make a prediction
        temp_intent = loaded_model.predict(loaded_vectorizer.transform([self.utterance]))
        intent = str(temp_intent[0])

        return intent


# Replace synonyms
class WordReplacer(object):
    def __init__(self, word_map):
        self.word_map = word_map

    def replace(self, word):
        return self.word_map.get(word, word)


class CsvWordReplacer(WordReplacer):
    def __init__(self, word, filename):
        word_map = {}
        for line in csv.reader(open(filename)):
            word, syn = line
            word_map[word] = syn
        super(CsvWordReplacer, self).__init__(word_map)

def csv_word_replacer(word, filename):
    words_lst = []
    replacer = CsvWordReplacer(word, filename)
    # for word in words:
    words_lst.append(replacer.replace(word))
    return words_lst


# Takes a list of words as an argument
# def csv_word_replacer(words, filename):
#     words_lst = []
#     replacer = CsvWordReplacer(filename)
#     for word in words:
#         words_lst.append(replacer.replace(word))
#     return words_lst

# Takes a single word as argument




