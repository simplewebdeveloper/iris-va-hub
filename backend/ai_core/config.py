import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# HANDOFF VIRTUAL ASSISTANT PATHS #

va_folder_structure = os.path.join(base_dir, 'ai_core/va_folder_structure.json')
ai_core = os.path.join(base_dir, 'ai_core')
handoff_vas_core = os.path.join(base_dir, 'ai_core/handoff_vas')
specialized_vas_core = os.path.join(base_dir, 'ai_core/specialized_vas')

# Handoff VA paths #
handoff_va_clf_model_dir = os.path.join(base_dir, 'ai_core/handoff_vas/clf')
handoff_va_clf_models_dir = os.path.join(base_dir, 'clf_models')
handoff_va_clf_model_root_intents_json_file = os.path.join(handoff_va_clf_model_dir, 'clf_models/root/root_intents.json')
handoff_va_root_clf_model_vectorizer = os.path.join(handoff_va_clf_model_dir, 'clf_models/root/vectorizer.pickle')
handoff_va_root_clf_model = os.path.join(handoff_va_clf_model_dir, 'clf_models/root/clf.model')

handoff_va_update_clf_model_dir = os.path.join(handoff_va_clf_model_dir, 'clf_models/update_intents')

handoff_va_update_sense_clf_model_dir = os.path.join(handoff_va_update_clf_model_dir, 'update_sense')

handoff_va_svp_model_dir = os.path.join(base_dir, 'ai_core/handoff_vas/svp/svp_models')

handoff_va_svp_model_dir_core = os.path.join(base_dir, 'ai_core/handoff_vas/svp')
handoff_va_svp_model_json_file = os.path.join(handoff_va_svp_model_dir_core, 'json/ai_svps.json')
# Slot mapper csv 
handoff_va_slot_mapper_csv_file = os.path.join(base_dir, 'process/slot_mapper.csv')

# Specialized VA paths #
specialized_va_clf_model_dir = os.path.join(base_dir, 'ai_core/specialized_vas/clf')
specialized_va_clf_models_dir = os.path.join(base_dir, 'clf_models')
specialized_va_clf_model_root_intents_json_file = os.path.join(specialized_va_clf_model_dir, 'clf_models/root/root_intents.json')
specialized_va_root_clf_model_vectorizer = os.path.join(specialized_va_clf_model_dir, 'clf_models/root/vectorizer.pickle')
specialized_va_root_clf_model = os.path.join(specialized_va_clf_model_dir, 'clf_models/root/clf.model')
specialized_va_update_clf_model_dir = os.path.join(specialized_va_clf_model_dir, 'clf_models/update_intents')
specialized_va_update_sense_clf_model_dir = os.path.join(specialized_va_update_clf_model_dir, 'update_sense')
specialized_va_svp_model_dir = os.path.join(base_dir, 'ai_core/specialized_vas/svp/svp_models')
specialized_va_svp_model_dir_core = os.path.join(base_dir, 'ai_core/specialized_vas/svp')
specialized_va_svp_model_json_file = os.path.join(specialized_va_svp_model_dir_core, 'json/ai_svps.json')
# Slot mapper csv 
specialized_va_slot_mapper_csv_file = os.path.join(base_dir, 'process/slot_mapper.csv')


# DANGER, PATHS TO WIPE
wipe_clf_model_path = os.path.join(handoff_va_clf_model_dir, 'clf_models')
wipe_svp_model_path = os.path.join(handoff_va_svp_model_dir, 'svp_models')

# Classification model paths
root_clf_path_to_wipe = os.path.join(handoff_va_clf_model_dir, 'clf_models/root')
update_clf_path_to_wipe = os.path.join(handoff_va_clf_model_dir, 'clf_models/update_intents')

# SVP model paths
svp_model_path_to_wipe = os.path.join(base_dir, 'ai_core/svp/svp_models')
svp_model_json_files_path_to_wipe = os.path.join(handoff_va_svp_model_dir, 'json')