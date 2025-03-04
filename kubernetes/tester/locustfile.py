from locust import FastHttpUser, HttpUser, task, between

class MyLoadTest(FastHttpUser):
    # Set the wait time between requests (can be 0 for no wait time)
    wait_time = between(0, 0)
    
    # Set the base URL for the service you want to test
    host = "http://k8s-reqcount-ingressr-6a8455d7c5-1965819424.eu-central-1.elb.amazonaws.com"

    @task
    def post_request(self):
        # Hitting the base URL with a POST request and no body
        self.client.post(f"{self.host}/test")
