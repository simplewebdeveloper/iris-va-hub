import os
import shutil
import json
from collections import OrderedDict
from ast import literal_eval

# rest_framework resources
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# JWT Auth
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.permissions import IsAuthenticated

# import serializers
from .serializers import BotSerializer
from .serializers import IntentSerializer
from .serializers import SvpSerializer

# import models
from .models import Intent
from .models import Svp
from .models import Bot

# custom imports
from test.test_query_salon import TestQuery
from train.train_models import TrainClassifierModel
from train.train_models import TrainSvpModel
from train.train_models import TrainUpdateSenseClassifierModel
from train.wipe_reset import WipeReset

from ai_core import config

# Model Specific
base_dir = config.base_dir
root_clf_model_dir = config.clf_model_dir
clf_model_root_intents_json_file = config.clf_model_root_intents_json_file
svp_model_dir = config.svp_model_dir
svp_model_dir_core = config.svp_model_dir_core
svp_model_json_file = config.svp_model_json_file

update_clf_model_dir = config.update_clf_model_dir

wipe_clf_model_path = config.wipe_clf_model_path
wipe_svp_model_path = config.wipe_svp_model_path


# API Views

class CreateBotView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_serializer = BotSerializer(data=request.data)
            if bot_serializer.is_valid():
                bot_serializer.save()
                latest_bot = Bot.objects.last()
                bot_serializer = BotSerializer(latest_bot, many=False)
                user_message = 'Success creating bot'
                print(user_message)
                return Response(bot_serializer.data, status=status.HTTP_201_CREATED)
        except:
            user_message = 'Error creating bot'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class GetBotsView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            bots = Bot.objects.all()
            bot_serializer = BotSerializer(bots, many=True)
            user_message = 'Success getting bots'
            print(user_message)
            return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting bots'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class GetSingleBotView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            bot = Bot.objects.get(id=bot_id)
            bot_serializer = BotSerializer(bot, many=False)
            user_message = 'Success getting bot'
            print(user_message)
            return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting bot'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class UpdateSingleBotView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data['id']
            instance = Bot.objects.get(id=bot_id)
            bot_serializer = BotSerializer(instance, data=request.data)
            if bot_serializer.is_valid():
                bot_serializer.save()
                user_message = 'Success updating bot'
                print(user_message)
                return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error updating bot'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class DeleteSingleBotView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot)
            svps = Intent.objects.filter(bot=bot)
            bot_serializer = BotSerializer(bot, many=False)
            intents.delete()
            svps.delete()
            bot.delete()
            user_message = 'Success deleting bot'
            print(user_message)
            return Response(bot_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error deleting bot'
            print(user_message)
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


# Intents

class CreateIntentView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data['bot_id']
            bot = Bot.objects.get(id=bot_id)

            intent = request.data['intent']
            utterance = request.data['utterance']
            intent_data = request.data['intent_data']

            if bot and intent and utterance:
                model = Intent(bot=bot, intent=intent, utterance=utterance, intent_data=intent_data)
                model.save()
                latest_intent = Intent.objects.last()
                intent_serializer = IntentSerializer(latest_intent, many=False)
                user_message = 'Success creating intent'
                print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error creating intent'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class GetIntentsView(APIView):
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

class GetTrainingIntentsView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot).order_by('-id').exclude(intent__contains="update")
            # .exclude(intent__contains="update")
            intent_serializer = IntentSerializer(intents, many=True)
            user_message = 'Success getting intents'
            print(user_message)
            return Response(intent_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting intents'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class GetUpdateSenseDataView(APIView):
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

class GetUpdateIntentsView(APIView):
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


class DeleteSingleIntentView(APIView):
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


class FeedIntentsView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        # try:
        selected_update_intent = request.data['selectedUpdateIntent']
        bot_id = request.data['botId']
        
        if selected_update_intent != 'none':
            # get update intent data for bot
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot, intent=selected_update_intent).order_by('-id')
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
            parent_dir = update_clf_model_dir
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

            with open(clf_model_root_intents_json_file, 'w') as f:
                f.write(root_intent_data)
        
        user_message = 'Success feeding intents'
        print(user_message)
        return Response(user_message, status=status.HTTP_202_ACCEPTED)
        # except:
        #     user_message = 'Error feeding intents'
        #     return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class FeedUpdateSenseView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data
            # get root intent data for bot
            bot = Bot.objects.get(id=bot_id)
            intents = Intent.objects.filter(bot=bot).order_by('-id')
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
            parent_dir = update_clf_model_dir
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

# SVPs

class CreateSvpView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            bot_id = request.data['bot_id']
            bot = Bot.objects.get(id=bot_id)

            slots = request.data['slots']
            utterance = request.data['utterance']
            svp_data = request.data['svp_data']
            intent = request.data['intent']

            if bot and svp_data:
                model = Svp(bot=bot, slots=slots, utterance=utterance, svp_data=svp_data, intent=intent)
                model.save()
                latest_svp = Svp.objects.last()
                svp_serializer = SvpSerializer(latest_svp, many=False)
                user_message = 'Success creating svp'
                print(user_message)
            return Response(svp_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error creating svp'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class GetSvpsView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            print(request.data)
            bot_id = request.data['botId']
            selected_intent = request.data['selectedIntent']
            bot = Bot.objects.get(id=bot_id)
            svps = Svp.objects.filter(bot=bot, intent=selected_intent).order_by('-id')
            svp_serializer = SvpSerializer(svps, many=True)
            user_message = 'Success getting svps'
            print(user_message)
            return Response(svp_serializer.data, status=status.HTTP_200_OK)
        except:
            user_message = 'Error getting svps'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class GetIntentsWithSvpData(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        # try:
        bot_id = request.data
        bot = Bot.objects.get(id=bot_id)
        bot_intents = bot.bot_intents
        bot_intents_tmp_list = bot_intents.split()
        bot_intents_lst = []
        for intent in bot_intents_tmp_list:
            formatted_intent = intent.replace(',','')
            bot_intents_lst.append(formatted_intent)
        
        # check if each intent has svp data
        intents_that_has_svp_data_list = []
        for intent in bot_intents_lst:
            svps = Svp.objects.filter(bot=bot, intent=intent).order_by('-id')
            if svps:
                intents_that_has_svp_data_list.append(intent)
            else:
                pass
        intents_that_has_svp_data_dict = {
            "intents_with_svp_data": intents_that_has_svp_data_list
        }
        user_message = 'Success getting intents with svps'
        print(user_message)
        return Response(intents_that_has_svp_data_list, status=status.HTTP_200_OK)
        # except:
            # user_message = 'Error getting svps'
            # return Response(user_message, status=status.HTTP_400_BAD_REQUEST)


class DeleteSingleSvpView(APIView):
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


class FeedSvpsView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            selected_intent = request.data['selectedIntent']
            bot_id = request.data['botId']

            if selected_intent:
                # get svp data for bot
                bot = Bot.objects.get(id=bot_id)
                svps = Svp.objects.filter(bot=bot, intent=selected_intent).order_by('-id')
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
                parent_dir = os.path.join(svp_model_dir_core, 'json')
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


class TestQueryView(APIView):
    # authentication_classes = [JSONWebTokenAuthentication]
    # permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
    # try:
        utterance = request.data['query']
        response = TestQuery(utterance).test_query()
        return Response(response, status=status.HTTP_200_OK)
    # except:
        # user_message = 'Error testing bot'
        # return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class TrainClassifierModelView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            selected_update_intent = request.data['selectedUpdateIntent']
            TrainClassifierModel(selected_update_intent).train_classifier_model()
            user_message = 'Success training classifier model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training classifier model'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class TrainUpdateSenseClassifierModelView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        try:
            TrainUpdateSenseClassifierModel().train_update_sense_classifier_model()
            user_message = 'Success training classifier model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training classifier model'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class TrainSvpModelView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        selected_intent = request.data['selectedIntent']
        try:
            TrainSvpModel(selected_intent).train_svp_model()
            user_message = 'Success training svp model'
            return Response(user_message, status=status.HTTP_200_OK)
        except:
            user_message = 'Error training bot'
            return Response(user_message, status=status.HTTP_400_BAD_REQUEST)

class WipeAndResetModelsView(APIView):
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