import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import scipy.stats as stats

# Define wOBA coefficients for each outcome. Sourced from Fangraphs 2018.
woba_coefficients = {
    'Single': 0.880,
    'Double': 1.247,
    'Triple': 1.578,
    'HomeRun': 2.031,
    'Out': 0.00
}

data = pd.read_csv("BattedBallData.csv")

# I drop rows where the outcome is undefined since I can't map it to a result
data = data[data['PLAY_OUTCOME'] != 'UNDEFINED']

# We should classify anything that should have been an out as an out.
data['PLAY_OUTCOME'] = data['PLAY_OUTCOME'].replace(['FieldersChoice', 'Error', 'Sacrifice'], 'Out')

X = data[['EXIT_SPEED', 'LAUNCH_ANGLE']]
y = data['PLAY_OUTCOME']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

probabilities = rf.predict_proba(X)
class_indices = {label: idx for idx, label in enumerate(rf.classes_)}

# calculating wOBA using the 2018 coefficients from fangraphs
def get_woba(single_probability, double_probability, triple_probability, home_run_probability):
    return woba_coefficients["Single"] * single_probability + woba_coefficients["Double"] * double_probability  + woba_coefficients["Triple"] * triple_probability + woba_coefficients["HomeRun"] * home_run_probability

# Calculate xwOBACon for each row and add it to our new DataFrame
data['xwOBACon'] = [
    get_woba(
        probabilities[i][class_indices.get('Single', 0)],
        probabilities[i][class_indices.get('Double', 0)],
        probabilities[i][class_indices.get('Triple', 0)],
        probabilities[i][class_indices.get('HomeRun', 0)]
    )
    for i in range(len(data))
]

# I want to know the percentile of each hit.
data['xwOBAContactPercentile'] = data["xwOBACon"].apply(lambda x: stats.percentileofscore(data["xwOBACon"], x, kind='rank') / 100)

# We also want regular wOBACon data to compare this to
data['wOBACon'] = data['PLAY_OUTCOME'].map(woba_coefficients) 

# Adding this to a new CSV file
data.to_csv("BattedBallData_with_xwOBACon.csv", index=False)