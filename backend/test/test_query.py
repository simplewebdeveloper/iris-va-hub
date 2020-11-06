# Core imports
import os
import time
from datetime import datetime
import re

# Model imports

from process.utterance import CollectUtterance, RemovePunctuation, SvmClassification, NbClassification, csv_word_replacer
# from process.character import RemoveRepeatedChars
from process.word import LemmatizeWords, CheckSpelling, StopWords, Svps
from context.default.context import UpdateContext
from context.default.context import GetContext
from context.default.context import GetLastIntent
from context.default.salon_response_context import ConversationContext
from context.default.salon_response_context import UpdateResponseContext
from context.default.salon_response_context import GetResponse
from context.default.salon_response_context import ClearContext

from ai_core import config

# Model Specific
base_dir = config.base_dir
handoff_va_clf_model_dir = config.handoff_va_clf_model_dir
handoff_va_clf_model_root_intents_json_file = config.handoff_va_clf_model_root_intents_json_file
handoff_va_root_clf_model_vectorizer = config.handoff_va_root_clf_model_vectorizer
handoff_va_root_clf_model = config.handoff_va_root_clf_model
handoff_va_update_clf_model_dir = config.handoff_va_update_clf_model_dir
handoff_va_update_sense_clf_model_dir = config.handoff_va_update_sense_clf_model_dir
handoff_va_svp_model_dir = config.handoff_va_svp_model_dir
handoff_va_svp_model_dir_core = config.handoff_va_svp_model_dir_core
handoff_va_svp_model_json_file = config.handoff_va_svp_model_json_file

wipe_clf_model_path = config.wipe_clf_model_path
wipe_svp_model_path = config.wipe_svp_model_path

handoff_va_slot_mapper_csv_file = config.handoff_va_slot_mapper_csv_file

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
    def __init__(self, utterance, va_path, device):
        self.utterance = utterance
        self.va_path = va_path
        self.device = device

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
        path_to_update_sense = os.path.join(self.va_path, 'clf/clf_models/update_intents/update_sense')
        
        update_sense_clf_model = os.path.join(path_to_update_sense, 'update_sense.model')
        update_sense_clf_vectorizer = os.path.join(path_to_update_sense, 'update_sense.pickle')

        # Classify the utterance
        path_to_root_clf_model = os.path.join(self.va_path, 'clf/clf_models/root/clf.model')
        path_to_root_clf_vectorizer = os.path.join(self.va_path, 'clf/clf_models/root/vectorizer.pickle')
        intent_response = SvmClassification(utterance, path_to_root_clf_vectorizer, path_to_root_clf_model).classify_intent()
        current_intent = intent_response['intent']

        print(current_intent)

        try:
            is_it_update = SvmClassification(utterance, update_sense_clf_vectorizer, update_sense_clf_model).classify_intent()
            is_it_update = is_it_update['intent']
        except:
            is_it_update = 'none'


        if is_it_update == "update":
            if '_update' in the_last_intent['intent']:
                temp_intent = the_last_intent['intent'].replace('_update','')
                matching_update_path_to_last_intent = temp_intent+'_update'
            else:
                matching_update_path_to_last_intent = the_last_intent['intent']+'_update'
                update_clf_model_dir = os.path.join(self.va_path, 'clf/clf_models/update_intents')
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

        # add device
        device_dict = {
            "device": self.device
        }

        # Get time stamp
        now = datetime.now()
        time_stamp = datetime.timestamp(now)
        time_formated = time.ctime()

        time_dict = {
            "time_stamp": time_stamp,
            "time_format": time_formated,
        }

        # Check for out_of_scope (in beta)
        # if intent_response['probability'] < 0.1:
        #     intent_response['intent'] = 'out_of_scope'

        intent_response = intent_response
        print(intent_response)

        svp_model_dir = os.path.join(self.va_path, 'svp/svp_models')
        svp_path_to_look_for = os.path.join(svp_model_dir, intent_response['intent'])
        if os.path.exists(svp_path_to_look_for):
            intent_svp_path = svp_path_to_look_for
            svps = Svps(utterance, intent_svp_path).extract_svps()
            if len(svps) > 0:
                response = {
                    "time_stamp": time_stamp,
                    "device": device_dict,
                    "time": time_dict,
                    "utterance": utterance,
                    "intent": intent_response,
                    "slots": svps,
                }
            else:
                response = {
                "time_stamp": time_stamp,
                "device": device_dict,
                "time": time_dict,
                "utterance": utterance,
                "intent": intent_response,
                "slots": []
                }
        else:
            response = {
            "time_stamp": time_stamp,
            "agent": device_dict,
            "time": time_dict,
            "utterance": utterance,
            "intent": intent_response,
            "slots": []
        } 

        # Look for synonyms
        # words = csv_word_replacer(words, 'synonyms.csv')

        # Post processing

        # UpdateResponseContext(response).update_response_context()
        # UpdateContext(response).update_context()
        # context = GetContext().get_context()
        # last_intent = get_last_intent()
        # current_intent = get_current_intent()
        # ConversationContext(current_intent, last_intent, response).maintain_context()
        # last_intent = GetLastIntent(context).get_last_intent()
        # update_last_intent(last_intent)
        
        final_response = response

        # CONFIGURE HAND OFF CONTEXT HERE

        # Example Slot mapping for service
        # if len(response['slots']) > 0:
            # if response['intent'] == 'ask_about_service':
                # try to slot map the service
                # service_slot = list(response['slots'])
                # print(service_slot)
                # service_slot = service_slot[0]['slot']
                # service = service_slot[0]['value'][0]
                # before_service_map = service
                # run the csv word replacer on the name of the service
                # word = csv_word_replacer(service, handoff_va_slot_mapper_csv_file)
                # after_service_map = word[0]

                # if before_service_map == after_service_map:
                    # service_slot[0]['value'][0] = None
                # else:
                    # service_slot[0]['value'][0] = after_service_map
            
                # response['slots'] = service_slot

        # print(final_response)

        return final_response   
        
        # except:
        #     user_message = 'Error testing bot'
        #     print(user_message)