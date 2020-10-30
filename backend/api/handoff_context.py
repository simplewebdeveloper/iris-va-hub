# handoff_context.py
import os
import json

from .models import Va, Project
from .serializers import VaSerializer, ProjectSerializer

from test.test_query import TestQuery

context_response = ""

def set_response(response):
    global context_response 
    context_response = response

def get_response(response):
    global context_response 
    return context_response


def reset_state():
    this_folder = os.path.dirname(os.path.abspath(__file__))
    handoff_context = os.path.join(this_folder, 'handoff_context.json')
    with open(handoff_context) as f:
        d = json.load(f)
        # 1. set the va_tag
        d[0]['va_tag'] = ""
        # 2. set the va_path
        d[0]['va_path'] = ""
        # 3. set the state
        d[0]['state'] = 'root'
        update_file = open(handoff_context, 'w')
        json.dump(d, update_file, indent=4)

class HandoffContext:

    def __init__(self, response, project_dir):
        self.response = response
        self.project_dir = project_dir
        

    def context(self):
        global context_response
        this_folder = os.path.dirname(os.path.abspath(__file__))
        handoff_context = os.path.join(this_folder, 'handoff_context.json')
        # check flag in json file
        # if the flag is set to the specialized
        # checking json file --- if we change the va_tag from handoff then we want to continue 
        # with the rest of the function
        project_dir = self.project_dir

        # actually check the file
        with open(handoff_context) as f:
            d = json.load(f)
            try:
                state = d[0]['state']
                va_path = d[0]['va_path'][0]
            except:
                pass
        
        if state != 'root':

            print('THIS STATE IS NOT EQUAL TO ROOT')
            print(self.response['intent']['intent'])

            if self.response['intent']['intent'] == 'goodbye':
                reset_state()
            
            # get utterance
            utterance = self.response['utterance']
            # print(va_path)

            # reclassify the utterance
            response = TestQuery(utterance, va_path).test_query()
            set_response(response)

            return response

            # print('see below from handoff_context.py')
            # print(self.response['intent']['intent'])

        if state == 'root':

            if self.response['intent']['intent'] == 'law_va':
                va_name = 'law_va'
                # look up va from db
                va = Va.objects.get(va_name=va_name)
                va_serializer = VaSerializer(va, many=False)

                va_id = str(va_serializer.data['id'])
                va_tag = str(va_serializer.data['va_tag'])

                va_project = va_serializer.data['project']

                project = Project.objects.get(id=va_project)
                project_serializer = ProjectSerializer(project, many=False)

                project_id = str(project_serializer.data['id'])
                project_name = str(project_serializer.data['project_name'])

                string_lst = []
                string_lst.append(str(project_id))
                string_lst.append('_')
                string_lst.append(project_name)
                project_name_new = ''.join(string_lst)

                path_of_project_to_test_va_from = os.path.join(project_dir, project_name_new)

                path = os.path.join(path_of_project_to_test_va_from, va_tag)

                va_path = os.path.join(path, va_id)

                # 0. open the handoff_context json file

                with open(handoff_context) as f:
                    d = json.load(f)
                    # 1. set the va_tag
                    d[0]['va_tag'] = va_tag
                    # 2. set the va_path
                    d[0]['va_path'] = str(va_path),
                    # 3. set the state
                    d[0]['state'] = 'special'
                    update_file = open(handoff_context, 'w')
                    json.dump(d, update_file, indent=4)

                # get utterance
                utterance = self.response['utterance']

                # reclassify the utterance
                response = TestQuery(utterance, va_path).test_query()

                set_response(response)

                # return the new path
                # WELCOME TO LAW VA

                return response

            else:
                return self.response