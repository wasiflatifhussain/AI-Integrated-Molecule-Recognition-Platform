# FROM continuumio/miniconda:latest

# # Create a Conda environment
# RUN conda create -n myenv python
# RUN echo "source activate myenv" >> ~/.bashrc
# ENV PATH /opt/conda/envs/myenv/bin:$PATH

# # Install additional system dependencies
# RUN apt-get update && apt-get install -y python

# # Set working directory and copy project files
# WORKDIR /
# COPY . /

# # Install Python dependencies using Conda 
# RUN conda install -c rdkit rdkit==2018.09.3

# # Install additional Python dependencies using pip
# RUN pip install torch torchvision torchaudio dgl dgllife Flask joblib matplotlib numpy pandas Pillow scikit_learn scipy torch tqdm

# # Set the entry point
# ENTRYPOINT ["python", "server.py"]

# FROM continuumio/miniconda:latest

# # Update the repository URLs
# RUN sed -i 's/deb.debian.org\/debian/deb.debian.org\/debian oldstable/g' /etc/apt/sources.list
# RUN sed -i 's/security.debian.org\/debian-security/security.debian.org\/debian-security oldstable\/updates/g' /etc/apt/sources.list

# # Create a Conda environment
# RUN conda create -n myenv python
# RUN echo "source activate myenv" >> ~/.bashrc
# ENV PATH /opt/conda/envs/myenv/bin:$PATH

# # Install additional system dependencies
# RUN apt-get update && apt-get install -y python

# # Set working directory and copy project files
# WORKDIR /
# COPY . /

# # Install Python dependencies using Conda 
# RUN conda install -c rdkit rdkit==2018.09.3

# # Install additional Python dependencies using pip
# RUN pip install torch torchvision torchaudio dgl dgllife Flask joblib matplotlib numpy pandas Pillow scikit_learn scipy torch tqdm

# # Set the entry point
# ENTRYPOINT ["python", "server.py"]

# EXPOSE 8000


FROM continuumio/miniconda:latest

# Update the repository URLs
RUN sed -i 's/deb.debian.org\/debian/deb.debian.org\/debian oldstable/g' /etc/apt/sources.list
RUN sed -i 's/security.debian.org\/debian-security/security.debian.org\/debian-security oldstable\/updates/g' /etc/apt/sources.list

# Create a Conda environment
RUN conda create -n myenv python=3.7
RUN echo "source activate myenv" >> ~/.bashrc
ENV PATH /opt/conda/envs/myenv/bin:$PATH

# Install additional system dependencies
RUN apt-get update && apt-get install -y python

# Set working directory and copy project files
WORKDIR /
COPY . /

# Install Python dependencies using Conda 
RUN /bin/bash -c "source activate myenv && conda install -c rdkit rdkit==2018.09.3"

# Install additional Python dependencies using pip
RUN /bin/bash -c "source activate myenv && pip install torch torchvision torchaudio dgl dgllife Flask joblib matplotlib numpy pandas Pillow scikit_learn scipy torch tqdm"

# Set the entry point
ENTRYPOINT ["/bin/bash", "-c", "source activate myenv && python server.py"]

EXPOSE 8000

