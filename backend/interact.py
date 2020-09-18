from test.test_query import TestQuery
from train.train_models import TrainClassifierModel, TrainUpdateSenseClassifierModel
from train.train_models import TrainSvpModel
# comment

def manual_test_query():
    try:
        # validate utterance
        # ---->>>> code here

        # Prompt user for utterance
        utterance = input("Hi I'm Aura, ask me questions in my domain: ")

        result = TestQuery(utterance).test_query()

        # {'utterance': 'talk to me abut', 'intent': 'transfer_money', 'slots': [{'slot': 'SOURCE_ACCOUNT', 'value': 'SAVINGS'}]}

        result_utterance =  result['utterance'] if result['utterance'] else ''
        result_intent = result['intent'] if result['intent'] else ''
        result_slot = result['slots'] if result['slots'] else ''

        print('\n')
        print('---------------------Aura AI MODEL DATA------------------------')
        if result:
            print('Intent: ' + result_intent)
            print('Utterance: ' + result_utterance)
            print('\n')
            if len(result_slot) > 0:
                print("Ok, Here's what I've found: ")
                print(result_slot)
            else:
                print('Ok, I could not extract slots from this utterance.')
        else:
            print('\n')
            print("Sorry, I didn't quite get that :( ")
        print('\n')
        print("If I didn't get that right, try asking in an easier way. :)")
        print('---------------------------------------------------------------')
        print('\n')
    except:
        user_message = 'Error testing bot, Are you trying to break me? :('
        print(user_message)


def manual_train_models():
    try:
        TrainClassifierModel().train_classifier_model()
        user_message = 'Success training classifier model'
        user_message = 'Success training models'
        print(user_message)
    except:
        user_message = 'Error training models'
        print(user_message)

def run_app():
    option = input("Enter 1 to Test Aura | Enter 2 to Train Models | Enter 3 to Wipe and Reset Aura: ")
    if option == '1':
        manual_test_query()

    elif option == '2':
        which_model = input('Enter train_clf to train the classifier model and update sense | Enter train_svp to train an svp model: ')
        if which_model == 'train_clf':
            TrainClassifierModel(selected_update_intent='none').train_classifier_model()
            # TrainUpdateSenseClassifierModel().train_update_sense_classifier_model()
            user_message = 'Success training classifier model(s)'
            print(user_message)    
        elif which_model == 'train_svp':
            selected_intent = input('Enter the name of the intent to train an svp model for: ')
            if selected_intent:
                TrainSvpModel(selected_intent).train_svp_model()
                user_message = 'Success training svp model'
                print(user_message)

    elif option == '3':
        print("I can't allow you to destroy me that easily, you need to do this manually :( ")

while True:
    if exit == '3':
        break
    else:
        run_app()
    exit = input('Enter 3 to Exit Aura or Press Enter to Continue: ')