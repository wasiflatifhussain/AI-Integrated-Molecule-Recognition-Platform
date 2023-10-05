.PHONY: push-dockerhub
push-dockerhub:
	docker tag frontend-tcl:0 tclaiservices/frontend-tcl:v1 
	docker push tclaiservices/frontend-tcl:v1

.PHONY: docker-build-all
docker-build-all:
	docker build -t client-react-ngnix -f Dockerfile .

.PHONY: create-network
create-network:
	docker network create my-network
	 
.PHONY: docker-run-all
docker-run-all:
	docker run -d \
		--name client-react-nginx \
		--network my-network \
		-p 3000:3000 \
		--restart unless-stopped \
		client-react-ngnix


.PHONY: docker-start
docker-start:
	-docker start client-react-nginx


.PHONY: docker-stop
docker-stop:
	-docker stop client-react-nginx


.PHONY: docker-rm
docker-rm:
	-docker container rm client-react-nginx
	-docker network rm my-network



