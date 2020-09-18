import os
import shutil

# Model Specific

from ai_core import config

base_dir = config.base_dir
clf_model_dir = config.clf_model_dir
svp_model_dir_core = config.svp_model_dir_core

# Classification model paths
root_clf_path_to_wipe = config.root_clf_path_to_wipe
update_clf_path_to_wipe = config.update_clf_path_to_wipe

# SVP model paths
svp_model_path_to_wipe = config.svp_model_path_to_wipe
svp_model_json_files_dir = config.svp_model_json_files_path_to_wipe

class WipeReset:
    def __init__(self):
        pass

    def wipe_clf_model(self):
        try:
            # Wipe root clf model
            if os.path.exists(root_clf_path_to_wipe):
                shutil.rmtree(root_clf_path_to_wipe)
                os.mkdir(root_clf_path_to_wipe)
            else:
                pass
            # Wipe update clf models
            if os.path.exists(update_clf_path_to_wipe):
                shutil.rmtree(update_clf_path_to_wipe)
                os.mkdir(update_clf_path_to_wipe)
            else:
                pass

            user_message = 'Success wiping and resetting classification model(s)'
            print(user_message)
        except:
            user_message = 'Error wiping and resetting classification model'
            print(user_message)

    def wipe_svp_model(self):
        try:
            # Wipe svp models
            if os.path.exists(svp_model_path_to_wipe):
                shutil.rmtree(svp_model_path_to_wipe)
                os.mkdir(svp_model_path_to_wipe)
            else:
                pass
            # Wipe svp json files
            if os.path.exists(svp_model_json_files_dir):
                shutil.rmtree(svp_model_json_files_dir)
                os.mkdir(svp_model_json_files_dir)
            else:
                pass
            
            user_message = 'Success wiping and resetting svp model(s)'
            print(user_message)
        except:
            user_message = 'Error wiping and resetting svp model'
            print(user_message)