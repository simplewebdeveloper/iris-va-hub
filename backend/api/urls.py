from django.urls import path
from .views import *

urlpatterns = [

    # Project paths
    path('create_project', create_project.as_view()),
    path('get_projects', get_projects.as_view()),
    path('get_last_five_projects', get_last_five_projects.as_view()),
    path('get_project', get_single_project.as_view()),
    path('delete_project', delete_single_project.as_view()),
    path('update_project', update_single_project.as_view()),
    path('create_transition', create_transition.as_view()),

    # Transition paths
    path('get_transitions_for_project', get_transitions_for_project.as_view()),
    path('delete_single_transition', delete_single_transition.as_view()),

    # Va paths
    path('create_va', create_va.as_view()),
    path('get_vas_for_project', get_vas_for_project.as_view()),
    path('get_vas_for_project_by_tag', get_vas_for_project_based_on_tag.as_view()),
    path('get_va', get_single_va.as_view()),
    path('delete_va', delete_single_va.as_view()),
    path('update_va', update_single_va.as_view()),
    # add response path here
    # path('add_response', update_single_va.as_view()),

    # Intent paths
    path('create_intent', create_intent.as_view()),
    path('get_intents', get_intents.as_view()),
    path('delete_intent', delete_single_intent.as_view()),
    path('feed_intents', feed_intents.as_view()),
    path('feed_update_sense', feed_update_sense.as_view()),

    # SVPs paths
    path('create_svp', create_svp.as_view()),
    path('get_svps', get_svps.as_view()),
    path('delete_svp', delete_single_svp.as_view()),
    path('feed_svps', feed_svps.as_view()),
    path('get_intents_with_svp_data', get_intents_with_svp_data.as_view()),

    # Test paths
    path('test_query', test_query.as_view()),

    # Train path
    path('train_classifier_model', train_classifier_model.as_view()),
    path('train_svp_model', train_svp_model.as_view()),
    path('train_update_sense_classifier_model', train_update_sense_classifier_model.as_view()),
    path('get_training_intents', get_training_intents.as_view()),
    path('get_update_sense_data', get_update_sense_data.as_view()),
    path('get_update_intents', get_update_intents.as_view()),

    # Danger paths
    path('wipe_and_reset_models', wipe_and_reset_models.as_view()),

]
