FROM python:3.9
WORKDIR /app

ENV POSTGRES_PASSWORD=''
ENV POSTGRES_USER=''
ENV POSTGRES_DB=''
ENV POSTGRES_PORT=''
ENV GET_ITEMS_ENDPOINT=''
ENV UPDATE_ITEMS_ENDPOINT=''

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
 