
**A Deep Reinforcement Learning Approach for Traffic Signal Simulator**

**References** ^f587ea
1. [Challenges in Reward Design](https://www.youtube.com/watch?v=33klFWORcWs)
2. [Sumo Tuts](https://www.youtube.com/playlist?list=PLAk8GOoajG6tKI74YID0hwjXVg8KBxNAD)
3. [Using a Deep Reinforcement Learning Agent for Traffic Signal Control](https://arxiv.org/abs/1611.01142)
4. [sumoRL](https://lucasalegre.github.io/sumo-rl/)
5. [RL algorithms implementation](https://github.com/DLR-RM/stable-baselines3)
6. https://roadwayvr.com/
7. https://www.youtube.com/watch?v=kd4RrN-FTWY&list=PLkLkRYMy0OuAkaoXc-pvwNxVjJDq6M8CK&index=5



##### Imp
- Our agent was compared against one hidden layer neural network traffic signal control agent and reduces average cumulative delay by 82%, average queue length by 66% and average travel time by 20%.
- Discrete traffic state encoding(DTSE) - ref(3)
	- composed of three vectors
		- a = presence of the vehicle or not in the cell
		- b = speed of the vehicle - (extended work of this paper - ref(3))
		- c = current traffic signal phase
	- representation see ~ fig.1 in ref(3)
	- 
- Informativeness and Expressiveness for Alignment
- 


**Implementation**
- Tue 24 Feb
	- We have started using SUMO and have created some Networks.
	- Trying to become familiar with the UI and there in-built functions
	- Using Traci.py, collecting info about the vehicles present in network. for eg. Speed, Veh coordinates.
	-  <span style="color:deepskyblue">idea</span> = use a dashboard to show : 
		- the number of vehicle and current speed infront of them,
		- (X,Y) pos for the vehicle
		- Overall CO2 emission details
- Tue 3 Mar
	- Ran QL algo vs Fixed timing
	- only one signal junction was used, figure out adding more into the states
	- To tinker on - 
		- extend the lane-detection-area
		- lower the Car density
		- add CO2 deets
	- Results = QTable - First - [[Results]]
	- Graphs = [[FirstTraining Res(2).png]] [[First Training Res(1).png]]
- Wed 4 Mar
	- extended the LDA
	- Fixed Timed Junctions, Results = [[Fixed_timing_Res.png]]  [[Fixed_timing_Res2.png]]
		- Can easily distinguish QL vs FT by Cummulated_Reward
	- Added Node5 junction, Halfway to the new code.
- Thu 5 Mar
	- 






##### **Abstract**



##### **Objective**
- Minimizing CO2 emission at a signalized intersection. ref([[Major Proj#^f587ea|1]])
- 




**Methodology**





Images


