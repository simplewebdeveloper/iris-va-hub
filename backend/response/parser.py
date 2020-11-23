from jinja2 import Template

class ResponseParser:

    def __init__(self, intent, slots, template, response, values=[]):
        self.intent = intent
        self.slots = slots
        # self.values = values
        self.response = response

        self.template = template


    def render(self):
        response = Template(self.template).render(intent=self.intent, slots= self.slots, response=self.response) 

        result = Template(response.strip()).render()

        return result