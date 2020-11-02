from jinja2 import Template

class ResponseParser:

    def __init__(self, intent, slots, template):
        self.intent = intent
        self.slots = slots
        self.template = template


    def render(self):
        response = Template(self.template).render({'intent': self.intent, 'slots': self.slots}) 

        return response