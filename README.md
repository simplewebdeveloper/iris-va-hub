(Aura) Beta Version 3.8 - Aura Now has the ability to maintain conversational context in this current release.

## Introduction

The Aura platform allows a developer to build and test custom chatbots, using Advanced AI Technology and Machine Learning, The bot you build and train is able determine the intention of a user and automatically extract keywords for further processing. It is up to the developer to use the response data returned from the bot and perform other custom logic like database lookups and making further API calls.

## Demo Video

https://www.youtube.com/watch?v=1Es05UapeM0&t=560s

## Setup Instructions

### General Instructions
#### 1. Clone this repo and cd into this repo:
cd open-bot

#### 2. Install virtualenv for Mac or Windows, and install node package manager
https://pypi.org/project/virtualenv/
######
npm: Install from https://www.npmjs.com/get-npm

#### 3. Once Installed, Create the virtual environment using the following command:
virtualenv venv  

#### 4. Activate the newly created virtual environment using the following command:
Mac:
source venv/bin/activate
######
Windows:
venv\Scripts\activate

#### 5. Once the virtual environment is activated, run the following command:
##### IMPORTANT: Make sure you are in the cloned repo folder.
pip install -r requirements.txt

#### 6. Once the packages are installed:
##### (a). cd into the backend folder 
##### (b). run:
 python interact.py
##### (c). select an option (Enter 1 to Test Aura | Enter 2 to Train Aura) e.g: 
##### (d). If you enter 1, you can ask Aura questions e.g:
I wanna know my account balance 

##### (d). If you enter 2, Aura will train from any classification and svp data it has (Sample data is included)

#### 7. Running the code in the browser

##### (a). Make sure you are still in the backend folder and run the following command:
python manage.py runserver

##### (b). cd back out to the frontend folder and run the following command:
npm install

##### (c). Once the npm install completes, run the following command:
ng serve -o

#### Show your support:
email: developer.chavezharris@gmail.com
######
buy my books:
######
Building an IOT Search Engine: https://www.amazon.com/dp/B086WQKWZK
######
Connecting Angular to Django: https://www.amazon.com/dp/B086JC4LHW




# Aura
