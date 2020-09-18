# Core imports
import os
import time
from datetime import datetime
import re

# Model imports

from process.utterance import CollectUtterance, RemovePunctuation, SvmClassification, NbClassification, csv_word_replacer
# from process.character import RemoveRepeatedChars
from process.word import LemmatizeWords, CheckSpelling, StopWords, Svps
from context.context import UpdateContext
from context.context import GetContext
from context.context import GetLastIntent
from context.salon_response_context import ConversationContext
from context.salon_response_context import UpdateResponseContext
from context.salon_response_context import GetResponse
from context.salon_response_context import ClearContext

from ai_core import config

# Model Specific
base_dir = config.base_dir
clf_model_dir = config.clf_model_dir
clf_model_root_intents_json_file = config.clf_model_root_intents_json_file
root_clf_model_vectorizer = config.root_clf_model_vectorizer
root_clf_model = config.root_clf_model
update_clf_model_dir = config.update_clf_model_dir
update_sense_clf_model_dir = config.update_sense_clf_model_dir
svp_model_dir = config.svp_model_dir
svp_model_dir_core = config.svp_model_dir_core
svp_model_json_file = config.svp_model_json_file

wipe_clf_model_path = config.wipe_clf_model_path
wipe_svp_model_path = config.wipe_svp_model_path

slot_mapper_csv_file = config.slot_mapper_csv_file

last_intent = ''
current_intent = ''

def update_last_intent(new_value):
    global last_intent
    last_intent = new_value
    return last_intent

def get_last_intent():
    global last_intent
    return last_intent

def update_current_intent(new_value):
    global current_intent
    current_intent = new_value
    return current_intent

def get_current_intent():
    global current_intent
    return current_intent

conversation_context = []


class TestQuery:
    def __init__(self, utterance):
        self.utterance = utterance    

    def test_query(self):
        # try:
        # validate utterance
        # ---->>>> code here
        if len(self.utterance) > 200:
            raise Exception 

        # if not re.match("^[A-Za-z0-9_-]*$", self.utterance):
        #     raise Exception

        # Remove punctuation from utterance and create a list of words
        utterance = (RemovePunctuation(self.utterance).remove_punctuation())

        # Join the words together
        utterance = ''.join(utterance)

        # get last intent
        the_last_intent = get_last_intent()
        print(the_last_intent, '<<< Last Intent')

        # Update Sense Path
        update_sense_clf_model = os.path.join(update_sense_clf_model_dir, 'update_sense.model')
        update_sense_clf_vectorizer = os.path.join(update_sense_clf_model_dir, 'update_sense.pickle')

        # Classify the utterance
        current_intent = SvmClassification(utterance, root_clf_model_vectorizer, root_clf_model).classify_intent()

        try:
            is_it_update = SvmClassification(utterance, update_sense_clf_vectorizer, update_sense_clf_model).classify_intent()
        except:
            is_it_update = 'none'


        if is_it_update == "update":
            if '_update' in the_last_intent:
                temp_intent = the_last_intent.replace('_update','')
                matching_update_path_to_last_intent = temp_intent+'_update'
            else:
                matching_update_path_to_last_intent = the_last_intent+'_update'
            path_to_look_for = os.path.join(update_clf_model_dir, matching_update_path_to_last_intent)
            if os.path.exists(path_to_look_for):
                # try:
                temp_update_intents_json_file = os.path.join(path_to_look_for, matching_update_path_to_last_intent+'.json') 
                intent = NbClassification(utterance, temp_update_intents_json_file).classify_intent()
                update_current_intent(intent)
            else:
                pass
                # intent = current_intent
                # update_current_intent(intent)
                # intent = NbClassification(utterance, temp_update_intents_json_file).classify_intent()
                # update_current_intent(intent)

        elif is_it_update == "not_update":
            intent = current_intent
            update_current_intent(intent)

        else:
            intent = current_intent
            update_current_intent(intent)

        #  Remove repeated characters
        # utterance = (RemoveRepeatedChars(utterance).remove_repeated_chars())

        utterance = ''.join(utterance)

        # Get time stamp
        now = datetime.now()
        time_stamp = datetime.timestamp(now)
        time_formated = time.ctime()

        time_dict = {
            "time_stamp": time_stamp,
            "time_format": time_formated,
        }

        final_intent = get_current_intent()

        svp_path_to_look_for = os.path.join(svp_model_dir, final_intent)
        if os.path.exists(svp_path_to_look_for):
            intent_svp_path = svp_path_to_look_for
            svps = Svps(utterance, intent_svp_path).extract_svps()
            if len(svps) > 0:
                response = {
                    "time_stamp": time_stamp,
                    "time": time_dict,
                    "utterance": utterance,
                    "intent": final_intent,
                    "slots": svps,
                }
            else:
                response = {
                "time_stamp": time_stamp,
                "time": time_dict,
                "utterance": utterance,
                "intent": final_intent,
                "slots": []
                }
        else:
            response = {
            "time_stamp": time_stamp,
            "time": time_dict,
            "utterance": utterance,
            "intent": final_intent,
            "slots": []
        } 

        # Look for synonyms
        # words = csv_word_replacer(words, 'synonyms.csv')

        # Post processing

        UpdateResponseContext(response).update_response_context()
        UpdateContext(response).update_context()
        context = GetContext().get_context()
        last_intent = get_last_intent()
        current_intent = get_current_intent()
        ConversationContext(current_intent, last_intent, response).maintain_context()
        last_intent = GetLastIntent(context).get_last_intent()
        update_last_intent(last_intent)
        
        final_response = response

        # Slot mapping for service
        if len(response['slots']) > 0:
            if response['intent'] == 'ask_about_service':
                # try to slot map the service
                service_slot = list(response['slots'])
                # print(service_slot)
                # service_slot = service_slot[0]['slot']
                service = service_slot[0]['value'][0]
                before_service_map = service
                # run the csv word replacer on the name of the service
                word = csv_word_replacer(service, slot_mapper_csv_file)
                after_service_map = word[0]

                if before_service_map == after_service_map:
                    service_slot[0]['value'][0] = None
                else:
                    service_slot[0]['value'][0] = after_service_map
            
                response['slots'] = service_slot

        # print(final_response)

        return final_response   
        
        # except:
        #     user_message = 'Error testing bot'
        #     print(user_message)