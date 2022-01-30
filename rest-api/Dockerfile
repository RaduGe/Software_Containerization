FROM python:3.7-alpine 
WORKDIR /code 
ENV FLASK_APP=app.py 
ENV FLASK_RUN_HOST=0.0.0.0 
COPY requirements.txt requirements.txt 
COPY key.pem key.pem
COPY cert.pem cert.pem 
RUN pip install -r requirements.txt 
EXPOSE 5000 
COPY . .
RUN apk add --no-cache bash
CMD ["flask", "run"] 
CMD ["python3", "app.py"]
