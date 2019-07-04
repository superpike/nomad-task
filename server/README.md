First (but only once):
You should have installed PostgreSQL and its service should be run at localhost. 

You should set up environment for backend working:
1. copy .env.example and rename it to .env
2. edit .env according your settings:
    - db settings
    - port for backend
    - secret key for token

To run backend (in backend folder):
1. npm i
2. node index

Backend starts at port you have set in .env file, so get sure that there won't be any collision with frontend.
Anyway you can see the port in backend console.