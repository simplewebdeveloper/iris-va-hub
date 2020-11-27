FROM python:3.7

ENV PYTHONUNBUFFERED 1

RUN mkdir /backend

WORKDIR /backend

COPY . /backend

RUN pip install -r requirements.txt

RUN python manage.py createsuperuser

# run entrypoint.sh
ENTRYPOINT ["sh","./entrypoint.sh"]
