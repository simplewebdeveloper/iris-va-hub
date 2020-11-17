# handoff_context.py
import os
import json
import requests

from ai_core import config


project_dir_core = config.project_dir_core

from .models import Va, Project
from .serializers import VaSerializer, ProjectSerializer

from test.test_query import TestQuery



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

    def __init__(self, handoff_context_json_file, va_tag, va_path, state):
        self.self = self
        self.handoff_context_json_file = handoff_context_json_file
        self.va_tag = va_tag
        self.va_path = va_path
        self.state = state

    def set_state(self):
        this_folder = os.path.dirname(os.path.abspath(__file__))
        handoff_context = os.path.join(this_folder, self.handoff_context_json_file)
        with open(handoff_context) as f:
            d = json.load(f)
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

    def __init__(self, bls_url='', raw_response=''):
        self.bls_url = bls_url
        self.raw_response = raw_response

    def save_bls_url(self):
        with open(bls_config_json_file) as f:
            pass
            d = json.load(f)
            d['bls_url'] = self.bls_url
            update_file = open(bls_config_json_file, 'w')
            json.dump(d, update_file, indent=4)
            bls_config_json_file_data = d
            f.close()
        
        return bls_config_json_file_data

    def get_bls_url(self):

        with open(bls_config_json_file) as f:
            pass
            d = json.load(f)
            current_bls_info = d
            f.close()

        return current_bls_info

    def get_bls_response(self):
        data = self.raw_response
        
        temp_url = self.get_bls_url()
        bls_url = temp_url['bls_url']
        
        bls_response = requests.post(url=bls_url,json=data)

        json_bls_response = json.loads(bls_response.text)

        print(json_bls_response)
        # bls_response = {
        #     "bls_url": bls_url,
        #     "data": data
        # }
        
        return json_bls_response
        