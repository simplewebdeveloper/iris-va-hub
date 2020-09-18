import re
from nltk.corpus import wordnet

# Remove repeated words


class RepeatReplacer(object):
    '''
    Page 38.
    Augment the replace() function with a WordNet lookup. If WordNet recognizes
    the word, then we can stop replacing characters
    '''
    def __init__(self):
        self.repeat_regxp = re.compile(r'(\w*)(\w)\2(\w*)')
        self.repl = r'\1\2\3'

    def replace(self, word):
        if wordnet.synsets(word):
            return word
        repl_word = self.repeat_regxp.sub(self.repl, word)

        if repl_word != word:
            return self.replace(repl_word)
        else:
            return repl_word


class RemoveRepeatedChars:
    def __init__(self, words):
        self.words = words

    def remove_repeated_chars(self):
        rem_rep_chars_lst = []
        replacer = RepeatReplacer()
        for word in self.words:
            rem_rep_chars_lst.append(replacer.replace(word))
        return rem_rep_chars_lst
