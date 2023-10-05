# AI-Integrated-Molecule-Recognition-Platform
An interacted platform for molecular prediction using React and Python Flask API along with user authentication and multi-model-integration.

Generating organic molecules using JSME Editor, as well as harnessing the power of RDKit to view and join molecules together. Using adjacency matrices and matrix manipulation to join together different molecules by converting the input molecule sets into a graph structure and implementing an intricate breath first search level-order iteration that takes in the molecules and the connection/fusion positions and recursively joins the molecules together along with shifting the indexes of the graph nodes via backtracking. 

By using a set of multiple functions, the matrix manipulation is achieved that eventually generates final molecules.

All user input data, including user-inputted molecules as well as user-designated connections/fusions, are passed into a combinatorial enumeration algorithm that generates all possible joined, completed molecules using the BFS-Algorithm-System mentioned above.

A dataset of real molecules are generated that are cross-checked for validity using RDKit and then passed in the Graph Convolutional Netowrk model.

Using Graph Convolutional Neural Networks, molecule integrity is predicted using graph matrices.

# More information and an updated README File will be available soon.


