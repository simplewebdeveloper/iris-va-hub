from collections import Counter
response_context = []
slots_context = []
response = ''

class ConversationContext:
    def __init__(self, current_intent, last_intent, response):
        self.current_intent = current_intent
        self.last_intent = last_intent
        self.response = response

    def maintain_context(self):
        global response
        global slots_context

        if self.current_intent == 'book_appointments_update' or 'book_appointments':
            if len(self.response['slots']) > 0:
                slots_in_response = self.response['slots'][0]
                slots_context.append(slots_in_response)
                update_response(self.response)
                new_response = removeDuplicateSlots()
                return new_response
            else:
                pass
        if self.last_intent == 'book_appointments_confirm' and self.current_intent == 'yes':
            self.response['intent'] = 'book_appointments_confirmed'

        if self.last_intent == 'book_appointments_confirmed' and self.current_intent == 'no':
            self.response['intent'] = 'book_appointments_cancel'

        if self.current_intent == 'book_appointments_clear':
            self.response['intent'] = 'greeting'
            self.response['slots'] = []
            ClearContext().clear_context()

        if self.last_intent == 'ask_about_service' and self.current_intent == 'yes':
            response_context_sorted = sorted(response_context, key = lambda i: i['time_stamp'], reverse=True)
            # print(sorted_response)
            if len(response['slots']) > 0:
                self.response['slots'] = response_context_sorted[1]['slots']
                self.response['intent'] = 'book_appointments'
                update_response(self.response)
                new_response = removeDuplicateSlots()
                return new_response

        elif self.last_intent == 'ask_about_service' and self.current_intent == 'no':
            response_context_sorted = sorted(response_context, key = lambda i: i['time_stamp'], reverse=True)
            # print(sorted_response)
            self.response['intent'] = 'book_appointments_cancel'
            update_response(self.response)
            new_response = removeDuplicateSlots()
            return new_response

# To move into its own separate files
class UpdateResponseContext:
    def __init__(self, response):
        self.response = response

    def update_response_context(self):
        global response_context
        response_context.append(self.response)
        # print(response)
        return response_context


class GetResponse:
    def get_response(self):
        global response_context
        return response_context


class ClearContext:
    def clear_context(self):
        global slots_context
        slots_context = []
        return slots_context


def removeDuplicateSlots():
    global response
    # Remove duplicate values
    global slots_context
    l = slots_context
    # print(type(slots_context))
    if len(l) > 0:
        no_duplicate_slots = dict((v['slot'],v) for v in l).values()
        if len(no_duplicate_slots) == 3:
            response['intent'] = 'book_appointments_confirm'
        response['slots'] = no_duplicate_slots
        # determine remaining slots
        if response['intent'] == 'book_appointment' or 'book_appointments_update':
            slots_captured_lst = []
            remaining_slots_to_be_captured = []
            if len(no_duplicate_slots) < 3:
                slots_captured = no_duplicate_slots
                all_slots_lst = ['service', 'time', 'day']
                for slot in slots_captured:
                    for slot, value in slot.items():
                        if value in all_slots_lst:
                            slots_captured_lst.append(value)
                        # remaining_slots_lst.append(v[0])
                for slot in all_slots_lst:
                    if slot not in slots_captured_lst:
                        remaining_slots_to_be_captured.append(slot)
                response.update({'remaining_slots': remaining_slots_to_be_captured})

        return response

def get_response():
    global response
    return response


def update_response(new_response):
    global response
    response = new_response
    return new_response
