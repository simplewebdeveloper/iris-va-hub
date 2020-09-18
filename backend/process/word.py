import nltk
import spacy
from spellchecker import SpellChecker
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
import operator, itertools


class LemmatizeWords:
    def __init__(self, words):
        self.words = words

    def lemmatize_words(self):
        lemmatized_words_lst = []
        lemmatizer = WordNetLemmatizer()
        for word in self.words:
            lemmatized_words_lst.append(lemmatizer.lemmatize(word))
        return lemmatized_words_lst


class CheckSpelling:
    def __init__(self, words):
        self.words = words

    def check_spelling(self):
        check_spell_lst = []
        spell = SpellChecker()
        for word in self.words:
            if spell.correction(word):
                check_spell_lst.append(spell.correction(word))
            else:
                check_spell_lst.append(word)
        return check_spell_lst


class StopWords:
    def __init__(self, words):
        self.words = words
        self.stop_words = stopwords.words('english')

    def get_stop_words(self):
        return self.stop_words

    def remove_stop_words(self):
        words_wo_stop_words = [word for word in self.words if word not in self.stop_words]
        return words_wo_stop_words


class Svps:

    def __init__(self, utterance, svp_model_dir):
        self.utterance = utterance
        self.svp_model_dir = svp_model_dir

    def extract_svps(self):
        ner_list = []
        nlp = spacy.load(self.svp_model_dir)
        doc = nlp(u'{}'.format(self.utterance))
        for ent in doc.ents:
            # print(ent.text, ent.start_char, ent.end_char, ent.label_)
            # ner_list.append(ent.label_ + ' : ' + ent.text)
            if ent.label_ and ent.text:
                ner_list.append({
                    "slot": ent.label_,
                    "value": ent.text
                })
            else:
                pass

        key = operator.itemgetter('slot')

        temp = [{'slot': x, 'value': [d['value'] for d in y]} 
            for x, y in itertools.groupby(sorted(ner_list, key=key), key=key)]

        return temp
