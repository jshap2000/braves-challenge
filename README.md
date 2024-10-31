# braves-challenge

**Setup**

1. Create a virtual environment

`python3 -m venv myenv`

2. tivate your virtual environment

`source myenv/bin/activate`

3. Get the necessary packages/imports

`pip install -r requirements.txt`

4. Run the python server

`python3 app.py`

5. Start the application. Click on `visualization.html`, this is the application.

Note: If the application isn't working, try using incognito or firefox. Flask can run into CORS issues occasionally when running a server locally.

**Project Explanation**

First, I derived a formula for estimating the probability of singles, doubles, triples, and home runs given the exit velocity and launch angle data. This data is used to feed xwOBACON.
The project data is managed through a flask app with 2 endpoints, one for retrieving batter names and another for retrieving individualized batter information. The visualization includes 4 components.
The first is a table of advanced stats, some derived and others just plain averages. I add "league averages" (derived from the data I was provided) to give some context. The second has a chart of all the batted ball outcomes mapped to a baseball field. You can move your mouse over each batted ball to see both the outcome and expected outcome. Then I provide 2 1-D charts of exit velocity and launch angles with "hot zones" and "cold zones".

Some improvements I would like to add if I had more time include xBA, as well as a pitcher filter to show each batters results against a particular pitcher. Please let me know if you have any questions and thank you for your time!
