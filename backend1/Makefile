.PHONY: flask-run
flask-run:
	docker run -d \
		--platform linux/amd64 \
		--name flask \
		--network my-network \
		-p 8000:8000 \
		--restart unless-stopped \
		flask