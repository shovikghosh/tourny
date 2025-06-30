#!/bin/sh

# Start the backend
java -jar app.jar &

# Start the frontend
cd frontend
npm start &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $? 