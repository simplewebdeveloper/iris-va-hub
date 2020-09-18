from django.urls import path
from .views import *

urlpatterns = [
    # Bot paths
    path('create_bot', CreateBotView.as_view()),
    path('get_bots', GetBotsView.as_view()),
    path('get_bot', GetSingleBotView.as_view()),
    path('delete_bot', DeleteSingleBotView.as_view()),
    path('update', UpdateSingleBotView.as_view()),

    # Intent paths
    path('create_intent', CreateIntentView.as_view()),
    path('get_intents', GetIntentsView.as_view()),
    path('delete_intent', DeleteSingleIntentView.as_view()),
    path('feed_intents', FeedIntentsView.as_view()),
    path('feed_update_sense', FeedUpdateSenseView.as_view()),

    # SVPs paths
    path('create_svp', CreateSvpView.as_view()),
    path('get_svps', GetSvpsView.as_view()),
    path('delete_svp', DeleteSingleSvpView.as_view()),
    path('feed_svps', FeedSvpsView.as_view()),
    path('get_intents_with_svp_data', GetIntentsWithSvpData.as_view()),

    # Test paths
    path('test_query', TestQueryView.as_view()),

    # Train path
    path('train_classifier_model', TrainClassifierModelView.as_view()),
    path('train_svp_model', TrainSvpModelView.as_view()),
    path('train_update_sense_classifier_model', TrainUpdateSenseClassifierModelView.as_view()),
    path('get_training_intents', GetTrainingIntentsView.as_view()),
    path('get_update_sense_data', GetUpdateSenseDataView.as_view()),

    path('get_update_intents', GetUpdateIntentsView.as_view()),

    # Danger paths
    path('wipe_and_reset_models', WipeAndResetModelsView.as_view()),

]
