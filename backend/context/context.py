context = []
# response_context = []
# slots_context = []
# response = ''

class UpdateContext:
    def __init__(self, response):
        self.response = response

    def update_context(self):
        global context
        context.append(self.response)

class GetContext:
    def get_context(self):
        global context
        sorted_context = sorted(context, key = lambda i: i['time_stamp'], reverse=True)
        return sorted_context

class GetLastIntent:
    def __init__(self, context):
        self.context = context

    def get_last_intent(self):
        if len(self.context) > 0:
            last_intent = str(self.context[0]['intent'])
            return str(last_intent)
        else:
            pass




# class UpdateResponseContext:
#     def __init__(self, response):
#         self.response = response

#     def update_response_context(self):
#         global response_context
#         response_context.append(self.response)
#         # print(response)
#         return response_context


# class GetResponse:
#     def get_response(self):
#         global response_context
#         return response_context


# class ClearContext:
#     def clear_context(self):
#         global slots_context
#         slots_context = []
#         return slots_context


# def removeDuplicateSlots():
#     global response
#     global move_to_confirmed
#     # Remove duplicate values
#     global slots_context
#     l = slots_context
#     # print(type(slots_context))
#     if len(l) > 0:
#         no_duplicate_slots = dict((v['slot'],v) for v in l).values()
#         if len(no_duplicate_slots) == 3:
#             move_to_confirmed = True
#         response['slots'] = no_duplicate_slots
#     return response

# def get_response():
#     global response
#     return response


# def update_response(new_response):
#     global response
#     response = new_response
#     return new_response
