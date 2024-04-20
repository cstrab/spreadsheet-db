# Use an official Ubuntu runtime as a parent image
FROM ubuntu:latest

# Update the system
RUN apt-get update -y

# Install make and jq
RUN apt-get install -y make jq

# Set the working directory to /app/setup
WORKDIR /app/setup

# Copy the current directory contents into the container at /app
COPY . /app

# Run the Makefile when the container launches
CMD ["make"]
