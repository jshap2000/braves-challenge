from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

df = pd.read_csv('BattedBallData_with_xwOBACon.csv')
league_average_xwOBACON = df['xwOBACon'].mean()
average_wOBACon = df['wOBACon'].mean()
exit_velocity_mean = df['EXIT_SPEED'].mean()

league_sweet_spot_swing_percent_mean = df[(df['LAUNCH_ANGLE'] > 8) & (df['LAUNCH_ANGLE'] < 32)].shape[0]/df.shape[0]

@app.route('/get-baseball-data', methods=['GET'])
def get_baseball_data():
    batter_id = request.args.get('batter_id', type=int)

    if batter_id is None:
        return jsonify({"error": "Please provide a batter_id"}), 400

    filtered_df = df[df['BATTER_ID'] == batter_id]
    filtered_df = filtered_df.fillna(0)

    sweet_spot_swing_percent_mean = filtered_df[(filtered_df['LAUNCH_ANGLE'] > 8) & (filtered_df['LAUNCH_ANGLE'] < 32)].shape[0]/filtered_df.shape[0]

    batted_Balls = filtered_df.apply(lambda row: {
        "directionAngle": row["EXIT_DIRECTION"],
        "launchAngle": row["LAUNCH_ANGLE"],
        "exitVelocity": row["EXIT_SPEED"],
        "distance": row["HIT_DISTANCE"],
        "xwOBAPercentile": row["xwOBAContactPercentile"],
        "xwOBA": row["xwOBACon"],
        "wOBA": row["wOBACon"]
    }, axis=1).tolist()

    return jsonify({
        "xwOBACON": round(filtered_df['xwOBACon'].mean(), 3),
        "wOBACON": round(filtered_df['wOBACon'].mean(), 3),
        "Exit Velocity": round(filtered_df['EXIT_SPEED'].mean(), 1),
        "% Sweet Spot": round(sweet_spot_swing_percent_mean*100, 1),
        "leagueAveragewOBA": round(league_average_xwOBACON, 3),
        "leagueAveragexwOBA": round(league_average_xwOBACON, 3),
        "leagueAverageExitVelocity": round(exit_velocity_mean, 1),
        "leagueAverageSweetSpotPercent": round(league_sweet_spot_swing_percent_mean*100, 1),
        "BattedBalls": batted_Balls,
    })


@app.route('/get-players', methods=['GET'])
def get_players():
    selected_columns = df[['BATTER_ID', 'BATTER']]
    unique_rows = selected_columns.drop_duplicates()

    players = unique_rows.apply(lambda row: {
        "batterId": row["BATTER_ID"],
        "batter": row["BATTER"],
    }, axis=1).tolist()

    return jsonify(
        players
    )

if __name__ == '__main__':
    app.run(debug=True)