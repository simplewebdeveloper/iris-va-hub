import json
import os
from os import walk


# the current folder path we are in
this_folder = os.path.dirname(os.path.abspath(__file__))

input_folder = os.path.join(this_folder, 'input')
output_folder = os.path.join(this_folder, 'output')


list_of_json_files = []

# just for fun
list_of_intents = []


for (dirpath, dirnames, filenames) in walk(input_folder):
    list_of_json_files.extend(filenames)
    break


for json_file in list_of_json_files:
    # get the path for each file
    file_path = os.path.join(input_folder, json_file)
    intent_name = json_file.split(".", 1)[0]
    list_of_intents.append(intent_name)
    new_txt_file_name = intent_name+".txt"
    new_txt_file_path = os.path.join(output_folder, new_txt_file_name)
    new_txt_file = open(new_txt_file_path, "w+")
    
    with open(file_path) as f:
        data = json.load(f)
        for utterance in data['data'][intent_name]:
            new_txt_file.write(utterance+"\n")
    new_txt_file.close()
        
print(list_of_intents)


