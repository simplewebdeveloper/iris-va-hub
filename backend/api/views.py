import os
import shutil
import json
import stringcase
from collections import OrderedDict
from ast import literal_eval

from pathlib import Path

# rest_framework resources
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# JWT Auth
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.permissions import IsAuthenticated

# import serializers
from .serializers import ProjectSerializer
from .serializers import VaSerializer
from .serializers import IntentSerializer
from .serializers import SvpSerializer

# import models
from .models import Project
from .models import Intent
from .models import Svp
from .models import Va

# training imports
from test.test_query import TestQuery
from train.train_models import TrainClassifierModel
from train.train_models import TrainUpdateSenseClassifierModel
from train.train_models import TrainSvpModel

# reset import -> leave disabled
# from train.wipe_reset import WipeReset

# Wipe and Reset VA is disabled -> not implemented for current va structure
# wipe_clf_model_path = config.wipe_clf_model_path
# wipe_svp_model_path = config.wipe_svp_model_path

# this import contains the folder structure configurations
from ai_core import config

# used to populate the project folder structure when user creates a VA
project_folder_structure = config.project_folder_structure
# used to populate the va folder structure when user creates a VA
va_folder_structure = config.va_folder_structure
ai_core = config.ai_core
project_dir_core = config.project_dir_core
handoff_vas_core = config.handoff_vas_core
specialized_vas_core = config.specialized_vas_core

# used to implement the va context handover
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
handoff_context = os.path.join(THIS_FOLDER, 'handoff_context.json')

def set_va_to_go_to(va_to_go_to):
    with open(handoff_context) as f:
        d = json.load(f)
        d[0]['va_to_go_to'] = va_to_go_to
        update_file = open(handoff_context, "w")
        json.dump(d, update_file, indent=4)
        update_file.close()

def get_va_to_go_to():
    with open(handoff_context) as f:
        d = json.load(f)
        va_to_go_to = d[0]['va_to_go_to']
        return va_to_go_to

# API views

# get projects
class get_projects(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        # try:
        projects = Project.objects.all()
        project_serializer = ProjectSerializer(projects, many=True)
        user_message = 'Success getting projects'
        print(user_message)
        return Response(project_serializer.data, status=status.HTTP_200_OK)
        # except:
            # user_message = 'Error getting bots'
            # return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# create project
class create_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        # try:
        project_serializer = ProjectSerializer(data=request.data)
        
        if project_serializer.is_valid():
            project_serializer.save()
            latest_project = Project.objects.last()
            project_serializer = ProjectSerializer(latest_project, many=False)
            project_id = project_serializer.data['id']
            project_name = project_serializer.data['project_name']
            # print()
            user_message = 'Success creating project'
            print(user_message)
            # create va folder structure
            with open(project_folder_structure) as f:
                d = json.load(f)
                d_dict = d[0]
                # replaces the id key with the bot id key
                string_lst = []
                string_lst.append(str(project_id))
                string_lst.append('_')
                string_lst.append(project_name)
                project_name_new = ''.join(string_lst)
                d_dict[project_name_new] = d_dict.pop('id')
                structure = d_dict

                parent_dir = project_dir_core
                
                # parse the json file and build va folder structure
                def recursive_path(data, path=''):
                    path_list = []
                    for key in data:
                        temp_path = f"{path}/{key}"
                        if isinstance(data[key], list):
                            path_list.append(temp_path) 
                        else:
                            path_list.extend(recursive_path(data[key],temp_path))
                    
                    return path_list
                            
                list_of_path = recursive_path(structure) 

                for sub_path in list_of_path:
                    Path(parent_dir+sub_path).mkdir(parents=True, exist_ok=True)

                return Response(project_serializer.data, status=status.HTTP_201_CREATED)
    
        else:
            print('serializer data not valid')
        # except:
        #     user_message = 'Error creating bot'
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# delete a single project
class delete_single_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        # try:
        project_id = str(request.data['project_id'])
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

        path_of_project_to_delete = os.path.join(project_dir, project_name_new)
        
        project.delete()
        # delete the va folder
        if os.path.exists(path_of_project_to_delete):
            shutil.rmtree(path_of_project_to_delete)
        else:
            print('Project path does not exist')
        user_message = 'Success deleting project'
        print(user_message)
        return Response(project_serializer.data, status=status.HTTP_200_OK)
        # except:
        #     user_message = 'Error deleting bot'
        #     print(user_message)
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# get a single project
class get_single_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            project_id = request.data['project_id']
            project = Project.objects.get(id=project_id)
            project_serializer = ProjectSerializer(project, many=False)
            user_message = 'Success getting project'
            print(user_message)
            print(project_serializer.data)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting va'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)
# ------------------------------------------------------------------------


# create va
class create_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        # try:
        va_serializer = VaSerializer(data=request.data)
        
        if va_serializer.is_valid():
            va_serializer.save()
            latest_va = Va.objects.last()
            va_serializer = VaSerializer(latest_va, many=False)
            project_id = request.data['project'];
            va_id = va_serializer.data['id']
            va_tag = va_serializer.data['va_tag']
            user_message = 'Success creating bot'
            print(user_message)

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

            path_of_project_to_add_va_to = os.path.join(project_dir, project_name_new)

            # create va folder structure
            with open(va_folder_structure) as f:
                d = json.load(f)
                d_dict = d[0]
                # replaces the id key with the bot id key
                d_dict[va_id] = d_dict.pop('id')
                structure = d_dict

                parent_dir = ""

                parent_dir = os.path.join(path_of_project_to_add_va_to, va_tag)
                
                
                # parse the json file and build va folder structure
                def recursive_path(data, path=''):
                    path_list = []
                    for key in data:
                        temp_path = f"{path}/{key}"
                        if isinstance(data[key], list):
                            path_list.append(temp_path) 
                        else:
                            path_list.extend(recursive_path(data[key],temp_path))
                    
                    return path_list
                            
                list_of_path = recursive_path(structure) 

                for sub_path in list_of_path:
                    Path(parent_dir+sub_path).mkdir(parents=True, exist_ok=True)

                return Response(va_serializer.data, status=status.HTTP_201_CREATED)
    
        else:
            print('serializer data not valid') 
        # except:
        #     user_message = 'Error creating bot'
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get vas
class get_vas_for_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        # try:
        project_id = request.data['project_id']
        project = Project.objects.get(id=project_id)
        vas = Va.objects.filter(project=project).order_by('-id')
        bot_serializer = VaSerializer(vas, many=True)
        user_message = 'Success getting vas'
        print(user_message)
        return Response(bot_serializer.data, status=status.HTTP_200_OK)
        # except:
            # user_message = 'Error getting bots'
            # return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get a single va
class get_single_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_id = request.data['va_id']
            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)
            user_message = 'Success getting va'
            print(user_message)
            print(va_serializer.data)
            return Response(va_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting va'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# update a single va
class update_single_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            print(request.data)
            va_id = request.data['va_id']
            instance = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(instance, data=request.data)
            if va_serializer.is_valid():
                va_serializer.save()
                user_message = 'Success updating va'
                print(user_message)
                return Response(va_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error updating va'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# delete a single va
class delete_single_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        # try:
        va_id = str(request.data['va_id'])
        va_tag = request.data['va_tag']

        if va_tag == 'handoff':
            va_path = os.path.join(handoff_vas_core, va_id)
        elif va_tag == 'specialized':
            va_path = os.path.join(specialized_vas_core, va_id)

        va = Va.objects.get(id=va_id)
        intents = Intent.objects.filter(va=va)
        svps = Svp.objects.filter(va=va)
        va_serializer = VaSerializer(va, many=False)
        intents.delete()
        svps.delete()
        va.delete()
        # delete the va folder
        if os.path.exists(va_path):
            shutil.rmtree(va_path)
        else:
            print('VA Path does not exist')
        user_message = 'Success deleting bot'
        print(user_message)
        return Response(va_serializer.data, status=status.HTTP_200_OK)
        # except:
        #     user_message = 'Error deleting bot'
        #     print(user_message)
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# intents

# create an single intent
class create_intent(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_id = request.data['va_id']
            va = Va.objects.get(id=va_id)

            intent = request.data['intent']
            utterance = request.data['utterance']
            intent_data = request.data['intent_data']

            if va and intent and utterance:
                model = Intent(va=va, intent=intent, utterance=utterance, intent_data=intent_data)
                model.save()
                latest_intent = Intent.objects.last()
                intent_serializer = IntentSerializer(latest_intent, many=False)
                user_message = 'Success creating intent'
                print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error creating intent'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get intents
class get_intents(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_id = request.data['va_id']
            selected_intent = request.data['selected_intent']
            va = Va.objects.get(id=va_id)
            intents = Intent.objects.filter(va=va, intent=selected_intent).order_by('-id')
            intent_serializer = IntentSerializer(intents, many=True)
            user_message = 'Success getting intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# -->> get all intents
class get_training_intents(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot).order_by('-id').exclude(intent__contains="update")
            intent_serializer = IntentSerializer(intents, many=True)
            user_message = 'Success getting intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# gets update sense data
class get_update_sense_data(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot).order_by('-id')
            intent_serializer = IntentSerializer(intents, many=True)
            user_message = 'Success getting intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# gets update intents
class get_update_intents(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data['botId']
            selected_intent = request.data['selectedIntent']
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot, intent=selected_intent).order_by('-id')
            intent_serializer = IntentSerializer(intents, many=True)
            user_message = 'Success getting intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# delete a single intent
class delete_single_intent(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            intent_id = request.data
            intent_to_del = Intent.objects.get(id=intent_id)
            intent_serializer = IntentSerializer(intent_to_del, many=False)
            intent_to_del.delete()
            user_message = 'Success deleting intent'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error deleting intent'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# feed intents
class feed_intents(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_id = str(request.data['va_id'])
            va_tag = request.data['va_tag']
            selected_update_intent = request.data['selected_update_intent']
            # check if the there is a folder in handoff_vas_core that matches the id
            path = os.path.join(handoff_vas_core, va_id)
            # if the va_tag == handoff
            if va_tag == 'handoff':
                # check if the there is a folder in handoff_vas_core that matches the id
                handoff_path = os.path.join(handoff_vas_core, va_id)
                
                if selected_update_intent != 'none':
                    # get update intent data for bot
                    va = Va.objects.get(id=va_id)
                    va_serializer = VaSerializer(va, many=False)
                    intents = Intent.objects.filter(va=va, intent=selected_update_intent).order_by('-id')
                    # print(intents)
                    intent_serializer = IntentSerializer(intents, many=True)
                    serialized_intent_data = intent_serializer.data
                    intent_data = json.dumps(serialized_intent_data)

                    intent_data_list = json.loads(intent_data)

                    new_intent_data_list = []

                    for line in intent_data_list:
                        string = line['intent_data']
                        intent_data_dict = json.loads(string)
                        intent_data_dict['text'] = intent_data_dict.pop('utterance')
                        intent_data_dict['label'] = intent_data_dict.pop('intent')
                        new_intent_data_list.append(intent_data_dict)

                    update_intent_data = json.dumps(new_intent_data_list, indent=4)

                    dir_to_create = selected_update_intent
                    parent_dir = os.path.join(handoff_path, 'clf/clf_models/update_intents')
                    path = os.path.join(parent_dir, dir_to_create)
                    temp_update_intents_json_file = selected_update_intent+'.json'
                    clf_model_update_intents_json_file = os.path.join(path, temp_update_intents_json_file)
                    if not os.path.exists(path):
                        os.mkdir(path)
                        with open(clf_model_update_intents_json_file, 'w') as f:
                            f.write(update_intent_data)

                    else:
                        shutil.rmtree(path)
                        os.mkdir(path)
                        with open(clf_model_update_intents_json_file, 'w') as f:
                            f.write(update_intent_data)

                else:
                    # get root intent data for bot
                    va = Va.objects.get(id=va_id)
                    intents = Intent.objects.filter(va=va).order_by('-id')

                    intent_serializer = IntentSerializer(intents, many=True)
                    serialized_intent_data = intent_serializer.data

                    # print(serialized_intent_data)
                    intent_data = json.dumps(serialized_intent_data)
                    intent_data_list = json.loads(intent_data)
                    new_intent_data_list = []

                    for line in intent_data_list:
                        string = line['intent_data']
                        intent_data_dict = json.loads(string)
                        new_intent_data_list.append(intent_data_dict)

                    root_intent_data = json.dumps(new_intent_data_list, indent=4)

                    handoff_va_clf_model_root_intents_json_file = os.path.join(handoff_path, 'clf/clf_models/root/root_intents.json')
                    with open(handoff_va_clf_model_root_intents_json_file, 'w') as f:
                        f.write(root_intent_data)
                
                user_message = 'Success feeding intents'
                print(user_message)
                return Response(user_message, status=status.HTTP_202_ACCEPTED)
            

            # if the va_tag == specialized
            elif va_tag == 'specialized':
                specialized_path = os.path.join(specialized_vas_core, va_id)
                if selected_update_intent != 'none':
                    # get update intent data for bot
                    va = Va.objects.get(id=va_id)
                    intents = Intent.objects.filter(va=va, intent=selected_update_intent).order_by('-id')
                    # print(intents)
                    intent_serializer = IntentSerializer(intents, many=True)
                    serialized_intent_data = intent_serializer.data
                    intent_data = json.dumps(serialized_intent_data)

                    intent_data_list = json.loads(intent_data)

                    new_intent_data_list = []

                    for line in intent_data_list:
                        string = line['intent_data']
                        intent_data_dict = json.loads(string)
                        intent_data_dict['text'] = intent_data_dict.pop('utterance')
                        intent_data_dict['label'] = intent_data_dict.pop('intent')
                        new_intent_data_list.append(intent_data_dict)

                    update_intent_data = json.dumps(new_intent_data_list, indent=4)


                    dir_to_create = selected_update_intent
                    parent_dir = os.path.join(specialized_path, 'clf/clf_models/update_intents')
                    path = os.path.join(parent_dir, dir_to_create)
                    temp_update_intents_json_file = selected_update_intent+'.json'
                    clf_model_update_intents_json_file = os.path.join(path, temp_update_intents_json_file)
                    if not os.path.exists(path):
                        os.mkdir(path)
                        with open(clf_model_update_intents_json_file, 'w') as f:
                            f.write(update_intent_data)

                    else:
                        shutil.rmtree(path)
                        os.mkdir(path)
                        with open(clf_model_update_intents_json_file, 'w') as f:
                            f.write(update_intent_data)

                else:
                    # get root intent data for bot
                    bot = Bot.objects.get(id=bot_id)
                    intents = Intent.objects.filter(bot=bot).order_by('-id')

                    intent_serializer = IntentSerializer(intents, many=True)
                    serialized_intent_data = intent_serializer.data

                    # print(serialized_intent_data)
                    intent_data = json.dumps(serialized_intent_data)
                    intent_data_list = json.loads(intent_data)
                    new_intent_data_list = []

                    for line in intent_data_list:
                        string = line['intent_data']
                        intent_data_dict = json.loads(string)
                        new_intent_data_list.append(intent_data_dict)

                    root_intent_data = json.dumps(new_intent_data_list, indent=4)

                    specialized_va_clf_model_root_intents_json_file = os.path.join(specialized_path, 'clf/clf_models/root/root_intents.json')
                    with open(specialized_va_clf_model_root_intents_json_file, 'w') as f:
                        f.write(root_intent_data)
                
                user_message = 'Success feeding intents'
                print(user_message)
                return Response(user_message, status=status.HTTP_202_ACCEPTED)
        except:
            user_message = 'Error feeding intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

            

class feed_update_sense(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            
            va_id = str(request.data['va_id'])
            va_tag = request.data['va_tag']
            # get root intent data for bot

            if va_tag == 'handoff':
                handoff_path = os.path.join(handoff_vas_core, va_id)
                va = Va.objects.get(id=va_id)
                intents = Intent.objects.filter(va=va).order_by('-id')
                intent_serializer = IntentSerializer(intents, many=True)
                serialized_intent_data = intent_serializer.data
                intent_data = json.dumps(serialized_intent_data)

                intent_data_list = json.loads(intent_data)

                new_intent_data_list = []

                for line in intent_data_list:
                    # print(line)
                    string = line['intent_data']
                    intent_data_dict = json.loads(string)
                    if 'update' in intent_data_dict['intent']:
                        intent_data_dict['intent'] = 'update'
                    else:
                        intent_data_dict['intent'] = 'not_update'

                    new_intent_data_list.append(intent_data_dict)

                update_sense_data = json.dumps(new_intent_data_list, indent=4)

                dir_to_create = 'update_sense'
                parent_dir = os.path.join(handoff_path, 'clf/clf_models/update_intents')
                path = os.path.join(parent_dir, dir_to_create)
                temp_update_sense_json_file = 'update_sense.json'
                update_sense_json_file = os.path.join(path, temp_update_sense_json_file)
                if not os.path.exists(path):
                    os.mkdir(path)
                    with open(update_sense_json_file, 'w') as f:
                        f.write(update_sense_data)
                    
                else:
                    shutil.rmtree(path)
                    os.mkdir(path)
                    with open(update_sense_json_file, 'w') as f:
                        f.write(update_sense_data)
                
                user_message = 'Success feeding intents'
                print(user_message)
                return Response(user_message, status=status.HTTP_202_ACCEPTED)
            
            elif va_tag == 'specialized':
                specialized_path = os.path.join(specialized_vas_core, va_id)
                va = Va.objects.get(id=va_id)
                intents = Intent.objects.filter(va=va).order_by('-id')
                intent_serializer = IntentSerializer(intents, many=True)
                serialized_intent_data = intent_serializer.data
                intent_data = json.dumps(serialized_intent_data)

                intent_data_list = json.loads(intent_data)

                new_intent_data_list = []

                for line in intent_data_list:
                    # print(line)
                    string = line['intent_data']
                    intent_data_dict = json.loads(string)
                    if 'update' in intent_data_dict['intent']:
                        intent_data_dict['intent'] = 'update'
                    else:
                        intent_data_dict['intent'] = 'not_update'

                    new_intent_data_list.append(intent_data_dict)

                update_sense_data = json.dumps(new_intent_data_list, indent=4)

                dir_to_create = 'update_sense'
                parent_dir = os.path.join(specialized_path, 'clf/clf_models/update_intents')
                path = os.path.join(parent_dir, dir_to_create)
                temp_update_sense_json_file = 'update_sense.json'
                update_sense_json_file = os.path.join(path, temp_update_sense_json_file)
                if not os.path.exists(path):
                    os.mkdir(path)
                    with open(update_sense_json_file, 'w') as f:
                        f.write(update_sense_data)
                    
                else:
                    shutil.rmtree(path)
                    os.mkdir(path)
                    with open(update_sense_json_file, 'w') as f:
                        f.write(update_sense_data)
                
                user_message = 'Success feeding intents'
                print(user_message)
                return Response(user_message, status=status.HTTP_202_ACCEPTED)
        except:
            user_message = 'Error feeding intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)
# svps
# create svp
class create_svp(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_id = request.data['va_id']
            va = Va.objects.get(id=va_id)

            slots = request.data['slots']
            utterance = request.data['utterance']
            svp_data = request.data['svp_data']
            intent = request.data['intent']

            if va and svp_data:
                model = Svp(va=va, slots=slots, utterance=utterance, svp_data=svp_data, intent=intent)
                model.save()
                latest_svp = Svp.objects.last()
                svp_serializer = SvpSerializer(latest_svp, many=False)
                user_message = 'Success creating svp'
                print(user_message)
            return Response(svp_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error creating svp'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get svps
class get_svps(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_id = request.data['va_id']
            selected_intent = request.data['selected_intent']
            va = Va.objects.get(id=va_id)
            svps = Svp.objects.filter(va=va, intent=selected_intent).order_by('-id')
            svp_serializer = SvpSerializer(svps, many=True)
            user_message = 'Success getting svps'
            print(user_message)
            return Response(svp_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting svps'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get intents with svp data
class get_intents_with_svp_data(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_id = request.data['va_id']
            va = Va.objects.get(id=va_id)
            va_intents = va.va_intents
            va_intents_tmp_list = va_intents.split()
            va_intents_lst = []
            for intent in va_intents_tmp_list:
                formatted_intent = intent.replace(',','')
                va_intents_lst.append(formatted_intent)
            
            # check if each intent has svp data
            intents_that_has_svp_data_list = []
            for intent in va_intents_lst:
                svps = Svp.objects.filter(va=va, intent=intent).order_by('-id')
                if svps:
                    intents_that_has_svp_data_list.append(intent)
                else:
                    pass
            # intents_that_has_svp_data_dict = {
            #     "intents_with_svp_data": intents_that_has_svp_data_list
            # }
            user_message = 'Success getting intents with svps'
            print(user_message)
            return Response(intents_that_has_svp_data_list, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting svps'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# delete single utterance with svp
class delete_single_svp(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            svp_id = request.data
            svp_to_del = Svp.objects.get(id=svp_id)
            svp_serializer = SvpSerializer(svp_to_del, many=False)
            svp_to_del.delete()
            user_message = 'Success deleting svp'
            print(user_message)
            return Response(svp_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error deleting svp'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# feed svps
class feed_svps(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_id = str(request.data['va_id'])
            va_tag = request.data['va_tag']
            selected_intent = request.data['selected_intent']

            # if the va_tag == handoff
            if va_tag == 'handoff':
                handoff_path = os.path.join(handoff_vas_core, va_id)
                if selected_intent:
                    # get svp data for bot
                    va = Va.objects.get(id=va_id)
                    svps = Svp.objects.filter(va=va, intent=selected_intent).order_by('-id')
                    svp_serializer = SvpSerializer(svps, many=True)
                    serialized_svp_data = svp_serializer.data
                    svp_data = json.dumps(serialized_svp_data)
                    svp_data_list = json.loads(svp_data)
                    new_svp_data_list = []

                    for item in svp_data_list:
                        temp_one = item['svp_data']
                        python_dict = literal_eval(temp_one)
                        new_svp_data_list.append(python_dict)

                    svp_data = json.dumps(new_svp_data_list, indent=4)

                    temp_svp_json_file_to_create = selected_intent+'.json'
                    parent_dir = os.path.join(handoff_path, 'svp/json')
                    svp_json_file_to_create = os.path.join(parent_dir, temp_svp_json_file_to_create)
                    with open(svp_json_file_to_create, 'w') as f:
                        f.write(svp_data)
                        print('SVP data written')
                    user_message = 'Success feeding svps'
                    print(user_message)
                    return Response(user_message, status=status.HTTP_202_ACCEPTED)
            elif va_tag == 'specialized':
                specialized_path = os.path.join(specialized_vas_core, bot_id)

                if selected_intent:
                    # get svp data for bot
                    va = Va.objects.get(id=va_id)
                    svps = Svp.objects.filter(va=va, intent=selected_intent).order_by('-id')
                    svp_serializer = SvpSerializer(svps, many=True)
                    serialized_svp_data = svp_serializer.data
                    svp_data = json.dumps(serialized_svp_data)
                    svp_data_list = json.loads(svp_data)
                    new_svp_data_list = []

                    for item in svp_data_list:
                        temp_one = item['svp_data']
                        python_dict = literal_eval(temp_one)
                        new_svp_data_list.append(python_dict)

                    svp_data = json.dumps(new_svp_data_list, indent=4)

                    temp_svp_json_file_to_create = selected_intent+'.json'
                    parent_dir = os.path.join(specialized_path, 'svp/json')
                    svp_json_file_to_create = os.path.join(parent_dir, temp_svp_json_file_to_create)
                    with open(svp_json_file_to_create, 'w') as f:
                        f.write(svp_data)
                        print('SVP data written')
                    user_message = 'Success feeding svps'
                    print(user_message)
                    return Response(user_message, status=status.HTTP_202_ACCEPTED)

        except:
            user_message = 'Error feeding svps'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# test a query
class test_query(APIView):
    # authentication_classes = [JSONWebTokenAuthentication]
    # permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        # try:
        utterance = request.data['query']['query']
        va_tag = request.data['va_tag']
        va_id = str(request.data['va_id'])

        # -->> todo: handoff context

        if va_tag == 'handoff':
            va_path = os.path.join(handoff_vas_core, va_id)
        elif va_tag == 'specialized':
            va_path = os.path.join(specialized_vas_core, va_id)

        response = TestQuery(utterance, va_path).test_query()

        # print(response)

        return Response(response, status=status.HTTP_200_OK)
        # except:
        #     user_message = 'Error testing bot'
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# train the base classifier model
class train_classifier_model(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_tag = request.data['va_tag']
            va_id = str(request.data['va_id'])
            selected_update_intent = request.data['selected_update_intent']
            if va_tag == 'handoff':
                clf_model_path = os.path.join(handoff_vas_core, va_id)
            elif va_tag == 'specialized':
                clf_model_path = os.path.join(specialized_vas_core, va_id)    
                
            TrainClassifierModel(selected_update_intent, clf_model_path).train_classifier_model()
            user_message = 'Success training classifier model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training classifier model'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# train the update sense classifier model
class train_update_sense_classifier_model(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_tag = request.data['va_tag']
            va_id = str(request.data['va_id'])

            if va_tag == 'handoff':
                clf_model_path = os.path.join(handoff_vas_core, va_id)
            elif va_tag == 'specialized':
                clf_model_path = os.path.join(specialized_vas_core, va_id)

            TrainUpdateSenseClassifierModel(clf_model_path).train_update_sense_classifier_model()
            user_message = 'Success training update sense classifier model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training classifier model'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class train_svp_model(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        
        try:
            va_tag = request.data['va_tag']
            bot_id = str(request.data['va_id'])
            selected_intent = request.data['selected_intent']
            if va_tag == 'handoff':
                svp_model_path = os.path.join(handoff_vas_core, bot_id)
                
                
            elif va_tag == 'specialized':
                svp_model_path = os.path.join(specialized_vas_core, bot_id)

            TrainSvpModel(selected_intent, svp_model_path).train_svp_model()
            user_message = 'Success training svp model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training bot'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# wipe data from va - does not remove the va -->> not implemented
class wipe_and_reset_models(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            WipeReset.wipe_clf_model(self)
            WipeReset.wipe_svp_model(self)
            
            user_message = 'Success wiping and resetting models'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error wiping and resetting models'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)