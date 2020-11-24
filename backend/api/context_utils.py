# handoff_context.py
import os
import json
import requests

from ai_core import config


project_dir_core = config.project_dir_core

from .models import Va, Project, BlsModel
from .serializers import VaSerializer, ProjectSerializer, BlsSerializer

from test.test_query import TestQuery

# import response parsers
from response.parser import ResponseParser
from response.models import ResponseTemplate, ResponseValue

# the current folder path we are in
this_folder = os.path.dirname(os.path.abspath(__file__))

# used to implement bls server
bls_config_json_file = os.path.join(this_folder, 'bls_config.json')

context_response = ""

def set_response(response):
    global context_response 
    context_response = response

def get_response(response):
    global context_response 
    return context_response

class SetState():

    def __init__(self, va_id, handoff_context_json_file, va_tag, va_path, state):
        self.self = self
        self.va_id = va_id
        self.handoff_context_json_file = handoff_context_json_file
        self.va_tag = va_tag
        self.va_path = va_path
        self.state = state

    def set_state(self):
        this_folder = os.path.dirname(os.path.abspath(__file__))
        handoff_context = os.path.join(this_folder, self.handoff_context_json_file)
        with open(handoff_context) as f:
            d = json.load(f)
            # 0. set the va_id
            d[0]['va_id'] = self.va_id
            # 1. set the va_tag
            d[0]['va_tag'] = self.va_tag
            # 2. set the va_path
            d[0]['va_path'] = self.va_path
            # 3. set the state
            d[0]['state'] = self.state
            update_file = open(handoff_context, 'w')
            json.dump(d, update_file, indent=4)

class ResetState():

    def __init__(self, handoff_context_json_file):
        self.self = self
        self.handoff_context_json_file = handoff_context_json_file

    def reset_state(self):
        this_folder = os.path.dirname(os.path.abspath(__file__))
        handoff_context = os.path.join(this_folder, self.handoff_context_json_file)
        with open(handoff_context) as f:
            d = json.load(f)
            # 0. set the va_id
            d[0]['va_id'] = 0
            # 1. set the va_tag
            d[0]['va_tag'] = ""
            # 2. set the va_path
            d[0]['va_path'] = ""
            # 3. set the state
            d[0]['state'] = 'root'
            update_file = open(handoff_context, 'w')
            json.dump(d, update_file, indent=4)


class MakeVaPath:

    def __init__(self, va_id, va_name):
        self.va_id = va_id
        self.va_name = va_name

    def make_va_path_from_va_name_or_va_id(self):
        if self.va_id != 0:
            va = Va.objects.get(id=self.va_id)
        elif self.va_name != "":
            va = Va.objects.get(va_name=self.va_name)

        va_serializer = VaSerializer(va, many=False)
        va_id = str(va_serializer.data['id'])
        va_name = str(va_serializer.data['va_name'])
        va_tag = str(va_serializer.data['va_tag'])
        project_id = str(va_serializer.data['project'])

        project_dir = project_dir_core

        project = Project.objects.get(id=project_id)
        project_serializer = ProjectSerializer(project, many=False)

        project_id = project_serializer.data['id']
        project_name = project_serializer.data['project_name']

        string_lst = []
        string_lst.append(str(project_id))
        string_lst.append('_')
        string_lst.append(project_name)
        project_name_new = ''.join(string_lst)

        project_path_to_va = os.path.join(project_dir, project_name_new)

        # now create va path
        string_lst = []
        string_lst.append(str(va_id))
        string_lst.append('_')
        string_lst.append(va_name)
        va_name_new = ''.join(string_lst)

        temp_path = os.path.join(project_path_to_va, va_tag)

        va_path = os.path.join(temp_path, va_name_new)

        return va_path
    
    def make_va_path_name(self):
        string_lst = []
        string_lst.append(str(self.va_id))
        string_lst.append('_')
        string_lst.append(self.va_name)
        va_name = ''.join(string_lst)

        return va_name


class MakeProjectPath:

    def __init__(self, project_id, project_name):
        self.project_id = project_id
        self.project_name = project_name

    def make_project_path_from_project_name_or_project_id(self):
        if self.project_id != 0:
            project = Project.objects.get(id=self.project_id)
        elif self.project_name != "":
            project = Project.objects.get(project_name=self.project_name)

        project_dir = project_dir_core

        project_serializer = ProjectSerializer(project, many=False)

        project_id = project_serializer.data['id']
        project_name = project_serializer.data['project_name']

        string_lst = []
        string_lst.append(str(project_id))
        string_lst.append('_')
        string_lst.append(project_name)
        project_name_new = ''.join(string_lst)

        project_path = os.path.join(project_dir, project_name_new)

        return project_path

    def make_project_path_name(self):
        string_lst = []
        string_lst.append(str(self.project_id))
        string_lst.append('_')
        string_lst.append(self.project_name)
        project_name = ''.join(string_lst)

        return project_name


class Bls:

    def __init__(self, raw_response='', va_id=''):
        self.va_id = va_id
        self.raw_response = raw_response

    def get_bls_url(self):

        # lookup va by id
        va = Va.objects.get(id=self.va_id)
        bls = BlsModel.objects.get(va=va)

        bls_serializer = BlsSerializer(bls, many=False)

        bls_url = bls_serializer.data['bls_url']

        return bls_url

    def get_bls_response(self):
        data = self.raw_response
        
        bls_url = self.get_bls_url()
        
        # bls_response = requests.post(url=bls_url,json=data)
        # json_bls_response = json.loads(bls_response.text)

        bls_response = {
            "bls_url": bls_url,
            "data": data
        }

        intent = self.raw_response['intent']['name']
        slots = self.raw_response['slots']
        device = self.raw_response['device']

        # values = response['values']

        try:
            va = Va.objects.get(id=self.va_id)
            template = ResponseTemplate.objects.filter(va=va, intent=intent, device=device).values()[0]
            template_content = template['template']
            parsed_response = ResponseParser(intent, slots, template_content, self.raw_response)
            parsed_response = parsed_response.render()
            parsed_response = parsed_response.replace('\n',' ')
            processed_response = {
            'bls_response': bls_response,
            'parsed_response': parsed_response,
            }

        except:
            va = Va.objects.get(id=self.va_id)
            template = ResponseTemplate.objects.filter(va=va, device='default').values()[0]
            template_content = template['template']
            parsed_response = ResponseParser('default', slots, template_content, self.raw_response)

            parsed_response = parsed_response.render()
    
            parsed_response = parsed_response.replace('\n',' ')

            processed_response = {
                'bls_response': bls_response,
                'parsed_response': parsed_response,
            }
            
        
        return processed_response













        # return bls_response
        


        # except:
        #     try:
        #         template = ResponseTemplate.objects.filter(va=va_instance, device=device).values()[0]

        #     except:
        #         response['response'] = 'Error with ORM'

        # try:
        #     template_id = template['id']
        #     template = template['template']

        #     response_value = ResponseValue.objects.filter(response=template_id).values()
        #     parser = ResponseParser(intent, slots, template, response_value, values)

        #     response['response'] = parser.render()

        # except:
        #     response['response'] = 'No Responses Model In DB'

        # parsed_response = ResponseParser(response=json_bls_response).render()