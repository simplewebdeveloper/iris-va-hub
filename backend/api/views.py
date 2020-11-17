import os
import shutil
import json
import stringcase
from collections import OrderedDict
from ast import literal_eval

from pathlib import Path
from django.core.validators import URLValidator

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
from .serializers import TransitionSerializer

# import models
from .models import Project
from .models import Intent
from .models import Svp
from .models import Va
from .models import Transition

# training imports
from test.test_query import TestQuery
from train.train_models import TrainClassifierModel
from train.train_models import TrainUpdateSenseClassifierModel
from train.train_models import TrainSvpModel


from .context_utils import MakeVaPath
from .context_utils import MakeProjectPath
from .context_utils import ResetState
from .context_utils import SetState
from .context_utils import Bls

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
this_folder = os.path.dirname(os.path.abspath(__file__))
handoff_context_json_file = os.path.join(this_folder, 'handoff_context.json')

# used to implement transition
transitions_json_file = os.path.join(this_folder, 'transitions.json')



# API views

# get projects
class get_projects(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            projects = Project.objects.all()
            project_serializer = ProjectSerializer(projects, many=True)
            user_message = 'Success getting projects'
            print(user_message)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting projects'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class get_last_five_projects(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            projects = Project.objects.all().order_by('-id')[:5:-1]
            project_serializer = ProjectSerializer(projects, many=True)
            user_message = 'Success getting projects'
            print(user_message)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting projects'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# create project
class create_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
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
        except:
            user_message = 'Error creating project'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# delete a single project
class delete_single_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            project_id = request.data['project_id']

            project = Project.objects.get(id=project_id)
            project_serializer = ProjectSerializer(project, many=False)

            path_of_project_to_delete = MakeProjectPath(project_id, project_name="").make_project_path_from_project_name_or_project_id()
            
            project.delete()
            # delete the va folder
            if os.path.exists(path_of_project_to_delete):
                shutil.rmtree(path_of_project_to_delete)
            else:
                print('Project path does not exist')
            user_message = 'Success deleting project'
            print(user_message)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error deleting bot'
            print(user_message)
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# get a single project
class get_single_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            project_id = request.data['project_id']
            project = Project.objects.get(id=project_id)
            project_serializer = ProjectSerializer(project, many=False)
            user_message = 'Success getting project'
            print(user_message)
            print(project_serializer.data)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting project'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)



# update a single project
class update_single_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            print(request.data)
            project_id = request.data['project_id']
            instance = Project.objects.get(id=project_id)
            project_serializer_from_post = ProjectSerializer(instance, data=request.data)

            project_serializer = ProjectSerializer(instance, many=False)

            project_id = project_serializer.data['id']
            old_project_name = project_serializer.data['project_name']

            old_project_name_new = MakeProjectPath(project_id, old_project_name).make_project_path_name()


            if project_serializer_from_post.is_valid():
                project_serializer_from_post.save()

                updated_project_instance = Project.objects.get(id=project_id)
                updated_project_serializer = ProjectSerializer(updated_project_instance, many=False)

                new_project_name = updated_project_serializer.data['project_name']

                new_project_name_new = MakeProjectPath(project_id, new_project_name).make_project_path_name()


            old_project_path = os.path.join(project_dir_core, old_project_name_new)
            new_project_path = os.path.join(project_dir_core, new_project_name_new)

            if (new_project_path != old_project_path):
                    os.rename(old_project_path, new_project_path)
            else:
                pass


            user_message = 'Success updating project'
            print(user_message)
            return Response(project_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error updating project'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class create_transition(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            # print(request.data)
            transition_serializer = TransitionSerializer(data=request.data)
            if transition_serializer.is_valid():
                transition_serializer.save()
                transition_id = transition_serializer.data['id']
                project_id = transition_serializer.data['project']
                transition_name = transition_serializer.data['transition_name']
                source_va_id = transition_serializer.data['source_va_id']
                source_va_intent = transition_serializer.data['source_va_intent']
                dest_va = transition_serializer.data['dest_va']
                # build a dictionary
                transition_dict = {
                    transition_id: {
                        "transition_id": transition_id,
                        "transition_name": transition_name,
                        "source_va_id": source_va_id,
                        "source_va_intent": source_va_intent,
                        "dest_va": dest_va
                    }
                }
                with open(transitions_json_file) as f:
                    d = json.load(f)
                    d.append(transition_dict)
                    update_file = open(transitions_json_file, 'w')
                    json.dump(d, update_file, indent=4)

                user_message = 'Success creating transition'
                print(user_message)
                return Response(transition_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error creating transition'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)
 
 # Business Logic Server config view

class save_bls(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:

            url = request.data['bls_url']
            validate = URLValidator()
            validate(url)
            if url:
                bls_config_json_file_data = Bls(bls_url=url).save_bls_url()
                user_message = 'Success saving bls'
                print(user_message)
                return Response(bls_config_json_file_data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error saving bls'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)  


class get_current_bls_url(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:

            current_bls_info = Bls().get_bls_url()

            user_message = 'Success getting bls'
            print(user_message)
            return Response(current_bls_info, status=status.HTTP_200_OK)

        except:
            user_message = 'Error getting bls'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)  

# ------------------------------------------------------------------------


# create va
class create_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        try:
            va_serializer = VaSerializer(data=request.data)
            
            if va_serializer.is_valid():
                va_serializer.save()
                latest_va = Va.objects.last()
                va_serializer = VaSerializer(latest_va, many=False)
                project_id = request.data['project']
                va_id = va_serializer.data['id']
                va_name = va_serializer.data['va_name']
                va_tag = va_serializer.data['va_tag']
                user_message = 'Success creating va'
                print(user_message)

                project_dir = project_dir_core

                project = Project.objects.get(id=project_id)
                project_serializer = ProjectSerializer(project, many=False)

                project_id = project_serializer.data['id']
                project_name = project_serializer.data['project_name']

                project_name_new = MakeProjectPath(project_id, project_name).make_project_path_name()

                path_of_project_to_add_va_to = os.path.join(project_dir, project_name_new)

                # create va folder structure
                with open(va_folder_structure) as f:
                    d = json.load(f)
                    d_dict = d[0]

                    va_name_new = MakeVaPath(va_id, va_name).make_va_path_name()

                    d_dict[va_name_new] = d_dict.pop('id')
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
        except:
            user_message = 'Error creating va'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get vas for project
class get_vas_for_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            project_id = request.data['project_id']
            project = Project.objects.get(id=project_id)
            vas = Va.objects.filter(project=project).order_by('-id')
            bot_serializer = VaSerializer(vas, many=True)
            user_message = 'Success getting vas'
            print(user_message)
            return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting vas'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get vas for project
class get_transitions_for_project(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            project_id = request.data['project_id']
            project = Project.objects.get(id=project_id)
            transitions = Transition.objects.filter(project=project).order_by('-id')
            transition_serializer = TransitionSerializer(transitions, many=True)
            user_message = 'Success getting transitions'
            print(user_message)
            return Response(transition_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting transitions'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# delete a single transition
class delete_single_transition(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        # try:
        transition_id = str(request.data['transition_id'])
        # project_dir = project_dir_core

        transition = Transition.objects.get(id=transition_id)
        transition_serializer = TransitionSerializer(transition, many=False)

        if transition_serializer:
        
            transition.delete()

            # check the transition json file and delete the transition from there as well
            with open(transitions_json_file) as f:
                    transitions = json.load(f)
                    for i in range (len(transitions)):
                        print(i)
                        for transition in transitions:
                            for transition_id, transition in transition.items():
                                try:
                                    if transition_id == transition_id:
                                        del transitions[i]
                                        break
                                except:
                                    pass
                                
                        
                        # transition.pop(transition_id, None)
                    update_file = open(transitions_json_file, 'w')
                    json.dump(transitions, update_file, indent=4)
                        # for transition_id, transition in transition.items():
                        #     print(transition)

            # delete the va folder
            user_message = 'Success deleting transition'
            print(user_message)
            return Response(transition_serializer.data, status=status.HTTP_200_OK)
        
        else:
            print('Transition serializer not valid')
        # except:
        #     user_message = 'Error deleting transition'
        #     print(user_message)
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# get vas for project based on va_tag
class get_vas_for_project_based_on_tag(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            project_id = request.data['project_id']
            va_tag = request.data['va_tag']
            project = Project.objects.get(id=project_id)
            vas = Va.objects.filter(project=project, va_tag=va_tag).order_by('-id')
            bot_serializer = VaSerializer(vas, many=True)
            user_message = 'Success getting vas'
            print(user_message)
            return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting vas'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# get a single va
class get_single_va(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
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
            # print(request.data)
            va_id = request.data['va_id']
            instance = Va.objects.get(id=va_id)
            va_serializer_from_post_req = VaSerializer(instance, data=request.data)

            va_serializer = VaSerializer(instance, many=False)
            va_id = str(va_serializer.data['id'])
            old_va_tag = va_serializer.data['va_tag']
            old_va_name = va_serializer.data['va_name']
            old_project_id = va_serializer.data['project']

            # -------------------------------------------------- #
            # Old paths
            va_old_instance = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va_old_instance)
            va_id = str(va_serializer.data['id'])
            old_va_tag = va_serializer.data['va_tag']
            old_va_name = va_serializer.data['va_name']
            old_project_id = va_serializer.data['project']

            project_dir = project_dir_core

            project = Project.objects.get(id=old_project_id)
            project_serializer = ProjectSerializer(project, many=False)

            project_id = str(project_serializer.data['id'])
            project_name = project_serializer.data['project_name']

            project_name_new = MakeProjectPath(project_id, project_name).make_project_path_name()

            path_of_project_to_update_va_from = os.path.join(project_dir, project_name_new)

            va_path_temp = os.path.join(path_of_project_to_update_va_from, old_va_tag)

            va_name_new = MakeVaPath(va_id, old_va_name).make_va_path_name()

            old_va_path = os.path.join(va_path_temp, va_name_new)


            if va_serializer_from_post_req.is_valid():
                va_serializer_from_post_req.save()
                # -------------------------------------------------- #
                # New paths
                va_updated_instance = Va.objects.get(id=va_id)
                va_serializer = VaSerializer(va_updated_instance)
                va_id = str(va_serializer.data['id'])
                new_va_tag = va_serializer.data['va_tag']
                new_va_name = va_serializer.data['va_name']
                new_project_id = va_serializer.data['project']

                project_dir = project_dir_core

                project = Project.objects.get(id=new_project_id)
                project_serializer = ProjectSerializer(project, many=False)

                project_id = str(project_serializer.data['id'])
                project_name = project_serializer.data['project_name']

                project_name_new = MakeProjectPath(project_id, project_name).make_project_path_name();

                path_of_project_to_update_va_from = os.path.join(project_dir, project_name_new)

                va_path_temp = os.path.join(path_of_project_to_update_va_from, new_va_tag)

                va_name_new = MakeVaPath(va_id, new_va_name).make_va_path_name()

                new_va_path = os.path.join(va_path_temp, va_name_new)

                if (new_va_path != old_va_name):
                        os.rename(old_va_path, new_va_path)
                else:
                    pass

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
        try:
            va_id = str(request.data['va_id'])
            va_tag = request.data['va_tag']

            va = Va.objects.get(id=va_id)
            intents = Intent.objects.filter(va=va)
            svps = Svp.objects.filter(va=va)

            va_serializer = VaSerializer(va, many=False)

            va_id = va_serializer.data['id']

            va_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

            intents.delete()
            svps.delete()
            va.delete()
            # delete the va folder
            if os.path.exists(va_path):
                shutil.rmtree(va_path)
            else:
                print('VA Path does not exist')
            user_message = 'Success deleting va'
            print(user_message)
            return Response(va_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error deleting va'
            print(user_message)
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


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
            user_message = 'Success getting update intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting update intents'
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
        print('see the below')
        print(request.data)
        try:
            va_id = request.data['va_id']
            selected_update_intent = request.data['selected_update_intent']
            # check if the there is a folder in handoff_vas_core that matches the id
            
            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)

            va_id = str(va_serializer.data['id'])

            va_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()
                
            if selected_update_intent != 'none':
                # get update intent data for bot
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
                parent_dir = os.path.join(va_path, 'clf/clf_models/update_intents')
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
                intents = Intent.objects.filter(va=va).order_by('-id')

                intent_serializer = IntentSerializer(intents, many=True)
                serialized_intent_data = intent_serializer.data

                # print(serialized_intent_data)
                intent_data = json.dumps(serialized_intent_data)
                # print(intent_data)
                intent_data_list = json.loads(intent_data)
                # print(intent_data_list)
                new_intent_data_list = []

                for line in intent_data_list:
                    string = line['intent_data']
                    intent_data_dict = json.loads(string, strict=False)
                    new_intent_data_list.append(intent_data_dict)

                root_intent_data = json.dumps(new_intent_data_list, indent=4)

                handoff_va_clf_model_root_intents_json_file = os.path.join(va_path, 'clf/clf_models/root/root_intents.json')
                with open(handoff_va_clf_model_root_intents_json_file, 'w') as f:
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
            va_id = request.data['va_id']
            # get root intent data for bot

            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)

            va_id = str(va_serializer.data['id'])

            va_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

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
            parent_dir = os.path.join(va_path, 'clf/clf_models/update_intents')
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
                print(svps)
                if svps:
                    intents_that_has_svp_data_list.append(intent)
                else:
                    pass
            user_message = 'Success getting intents with svps'
            print(intents_that_has_svp_data_list)
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
            va_id = request.data['va_id']
            selected_intent = request.data['selected_intent']

            svp_model_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

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
                parent_dir = os.path.join(svp_model_path, 'svp/json')
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
        print(request.data)
        # try:
        utterance = request.data['query']['query']
        va_id = request.data['va_id']
        device = request.data['device']

        va = Va.objects.get(id=va_id)
        va_serializer = VaSerializer(va, many=False)

        va_id = str(va_serializer.data['id'])
        va_tag = str(va_serializer.data['va_tag'])

        va_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

        # check the state first
        with open(handoff_context_json_file) as f:
            d = json.load(f)
            try:
                state = d[0]['state']
                va_path_to_check = d[0]['va_path']
            except:
                pass

        if state != "root":

            # listen for reset type intents

            response = TestQuery(utterance, va_path_to_check, device).test_query()

            # add reset logic here --> Reset the state
            intent = response['intent']['name']

            # if the goodbye intent is hit while within the specialized va
            if intent == 'goodbye':
                ResetState('handoff_context.json').reset_state()

        
        else:
            response = TestQuery(utterance, va_path, device).test_query()
            # if the state is root
            # check what the intent is
            intent = response['intent']['name']
            # check our transitions

            with open(transitions_json_file) as f:
                transitions = json.load(f)
                for transition in transitions:
                    for project_id, transition in transition.items():
                        if transition['source_va_intent'] == intent:
                            dest_va = transition['dest_va']
                            va_path = MakeVaPath(va_name=dest_va, va_id=0).make_va_path_from_va_name_or_va_id()

                            SetState(handoff_context_json_file, va_tag, va_path, state='special').set_state()

                            response = TestQuery(utterance, va_path, device).test_query()
                        else:
                            pass


        bls_response = Bls(raw_response=response).get_bls_response()

        print(bls_response)


        dual_response = {
            "raw_response": response,
            "bls_response": bls_response

        }

        # response > make post to bls
        # 
        #
        # wait for response
        #
        # 
        # resp is received
        #
        # 
        # send to template parser | format for Desktop or Mobile
        # 
        # 
        # -> send to UI                 
        # 
        # 
        # 
        # 
        # 
        # 
        #    

        # SEND TO HANDOFF CONTEXT HERE TO DETERMINE WHICH VA TO GO TO


        # Add the response class will have to parse the below

          #  WITHOUT SLOTS

            #  {
            #   "time_stamp": 1604075651.306505,
            #   "time": {
            #     "time_stamp": 1604075651.306505,
            #     "time_format": "Fri Oct 30 16:34:11 2020"
            #   },
            #   "utterance": "hi",
            #   "intent": {
            #     "intent": "goodbye",
            #     "probability": 0.24814
            #   },
            #   "slots": []
            # }


            #  WITH SLOTS
            #  {
            #   "time_stamp": 1604075815.447497,
            #   "time": {
            #     "time_stamp": 1604075815.447497,
            #     "time_format": "Fri Oct 30 16:36:55 2020"
            #   },
            #   "utterance": "talk to a law",
            #   "intent": {
            #     "intent": "what_is_law",
            #     "probability": 0.1446
            #   },
            #   "slots": [
            #     {
            #       "slot": "term",
            #       "value": [
            #         "law"
            #       ],
            #     }
            #   ]
            # }


        # print(response)



        return Response(dual_response, status=status.HTTP_200_OK)
        # except:
        #     user_message = 'Error testing bot'
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

# train the base classifier model
class train_classifier_model(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            va_id = request.data['va_id']
            selected_update_intent = request.data['selected_update_intent']

            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)

            va_id = va_serializer.data['id']

            clf_model_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()  
                
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
            va_id = request.data['va_id']

            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)

            va_id = str(va_serializer.data['id'])

            clf_model_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

            TrainUpdateSenseClassifierModel(clf_model_path).train_update_sense_classifier_model()
            user_message = 'Success training update sense classifier model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training update sense classifier model'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class train_svp_model(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        
        try:
            # project_id = request.data['project_id']
            va_id = request.data['va_id']
            selected_intent = request.data['selected_intent']

            project_dir = project_dir_core


            va = Va.objects.get(id=va_id)
            va_serializer = VaSerializer(va, many=False)

            va_id = va_serializer.data['id']

            svp_model_path = MakeVaPath(va_id, va_name="").make_va_path_from_va_name_or_va_id()

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