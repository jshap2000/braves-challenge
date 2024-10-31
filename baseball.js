/* This function retrieve the information for a player given their batter id. We then render all 4 tables/visualizations. */
function getPlayerStats(id) {
    url = 'http://127.0.0.1:5000/get-baseball-data?batter_id=' + id
    fetch(url)
    .then(response => response.json())
    .then(data => {
        createField(data["BattedBalls"])
        createLaunchAngleScatterPlot(data["BattedBalls"])
        createExitVelocityScatterPlot(data["BattedBalls"])
        createStatsTable(data)

    })
    .catch(error => console.error('Error:', error));
}

/* We create a scatter plot of the different launch angles the player's batted balls were hit at. We highlight
 the different ranges that mlb classifies batted balls into with color coding.
*/
function createLaunchAngleScatterPlot(launchAngleData) {
    const width = 500;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const angles = launchAngleData.map(item => ({
        x: Math.random() * (width - margin.left - margin.right) + margin.left,
        y: item["launchAngle"]
    }));

    const xScale = d3.scaleLinear()
        .domain([0, width])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#launch-angle");
    
    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(0))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(-90) - yScale(0))
        .attr("class", "range")
        .style("fill", "lightblue");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(8))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(0) - yScale(8))
        .attr("class", "range")
        .style("fill", "yellow");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(32))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(8) - yScale(32))
        .attr("class", "range")
        .style("fill", "red");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(40))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(32) - yScale(40))
        .attr("class", "range")
        .style("fill", "yellow");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(90))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(40) - yScale(90))
        .attr("class", "range")
        .style("fill", "lightblue");

    svg.selectAll("circle")
        .data(angles)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
}

/* We create a scatter plot of the different exit velocities the player's batted balls were hit at. Anything hit
 over 95 MPH is a hard-hit ball and is shaded in red.
*/
function createExitVelocityScatterPlot(battedBallData) {
    const width = 500;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const velocity = battedBallData.map(item => ({
        x: Math.random() * (width - margin.left - margin.right) + margin.left,
        y: item["exitVelocity"]
    }));

    const xScale = d3.scaleLinear()
        .domain([0, width])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([40, 120])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#exit-velocity");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(95))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(40) - yScale(95))
        .attr("class", "range")
        .style("fill", "blue");

    svg.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(120))
        .attr("width", xScale(width) - xScale(0))
        .attr("height", yScale(95) - yScale(120))
        .attr("class", "range")
        .style("fill", "red");

    svg.selectAll("circle")
        .data(velocity)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
}

/* We create a rough baseball field and map the balls onto the field based on their distance and batted direction. 
 I then shade the ball from blue to red based on it's xWOBACON, which I have calculated using the exit velocity and launch angle.
*/
function createField(battedBallData) {
    const svg = d3.select("#baseball-field");

    const homePlate = { x: 275, y: 415 };
    const leftFoulPole =  { x: 55, y: 195 };
    const rightFoulPole = { x: 495, y: 195 }; 

    const outfieldPoints = [];
    const center = { x: 275, y: 195 };
    const xRadius = 220;
    const yRadius = 180; 
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI; 
    const numPoints = 50;

    for (let i = 0; i <= numPoints; i++) {
        const angle = startAngle + (i / numPoints) * (endAngle - startAngle);
        const x = center.x + xRadius * Math.cos(angle);
        const y = center.y + yRadius * Math.sin(angle);
        outfieldPoints.push({ x, y });
    }

    const stadiumPoints = [homePlate, leftFoulPole, ...outfieldPoints, rightFoulPole];

    svg.append("polygon")
    .attr("class", "stadium")
    .attr("points", stadiumPoints.map(p => `${p.x},${p.y}`).join(" "))
    .style("fill", "lightgreen")
    .style("stroke", "black");

    const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["blue", "red"]);

    battedBallData.forEach(ball => {
    const newPosition = calculateNewPosition(homePlate.x, homePlate.y, ball.distance, ball.directionAngle);
        ball.x = newPosition.x;
        ball.y = newPosition.y;
    });

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

    svg.selectAll(".ball")
        .data(battedBallData)
        .enter()
        .append("circle")
        .attr("class", "ball")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5)
        .style("fill", d => colorScale(d.xwOBAPercentile))
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`xwOBACON: ${d.xwOBA}<br>wOBACON: ${d.wOBA}`);
        })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
        tooltip.style("display", "none");
    });

    function calculateNewPosition(x0, y0, distance, angleDegrees) {
        const angleRadians = angleDegrees * (Math.PI / 180);
        const deltaX = distance * Math.sin(angleRadians);
        const deltaY = -distance * Math.cos(angleRadians);
        const x = x0 + deltaX;
        const y = y0 + deltaY;
        return { x, y };
    }
}

/* 
 This table displays the players advanced stats for all the at bats we have in the given data.
*/
function createStatsTable(data) {
    const tableContainer = document.getElementById('table-container');

    const fillerStatsSummary = [
        { stat: "xwOBACON", player: 0, league: 0 },
        { stat: "wOBACON", player: 0, league: 0 },
        { stat: "Exit Velocity", player: 0, league: 0 },
        { stat: "LA-Sweet Spot %", player: 0, league: 0 }
    ];

    let playerStatsSummary;
    if(data == undefined) {
        playerStatsSummary = fillerStatsSummary
    } else {
        playerStatsSummary = [
            { stat: "xwOBACON", player: data["xwOBACON"], league: data["leagueAveragexwOBA"] },
            { stat: "wOBACON", player: data["wOBACON"], league: data["leagueAveragexwOBA"] },
            { stat: "Exit Velocity", player: data["Exit Velocity"], league: data["leagueAverageExitVelocity"] },
            { stat: "LA-Sweet Spot %", player: data["% Sweet Spot"], league: data["leagueAverageSweetSpotPercent"]}
        ];
    }

    const table = document.createElement('table');
    table.className = 'ui celled table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const columns = ['Stat', 'Player', 'League'];

    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    playerStatsSummary.forEach(item => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = item[col.toLowerCase()];
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

/* 
 Setup the player search and visuals. When the user click on a new player, trigger the  function that
 loads the visualizations and tables for that player.
*/
document.addEventListener('DOMContentLoaded', function() {
    createField([])
    createStatsTable(undefined)
    createExitVelocityScatterPlot([])
    createLaunchAngleScatterPlot([])

    const dropdown = document.getElementById('dropdown');
    const menu = dropdown.querySelector('.menu');
    const text = dropdown.querySelector('.default.text');
    const input = dropdown.querySelector('input[type="hidden"]');

    fetch('http://127.0.0.1:5000/get-players')
        .then(response => response.json())
        .then(data => {
        const options = data.map(item => ({
            value: item['batterId'],
            name: item["batter"]
        }));

        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'item';
            item.setAttribute('data-value', option.value);
            item.textContent = option.name;
            menu.appendChild(item);

            item.addEventListener('click', function(e) {
                e.stopPropagation();

                document.getElementById('baseball-field').innerHTML = ""
                document.getElementById('launch-angle').innerHTML = ""
                document.getElementById('table-container').innerHTML = ""
                document.getElementById('exit-velocity').innerHTML = ""

                getPlayerStats(option.value)
                text.textContent = this.textContent;
                input.value = this.getAttribute('data-value');
                menu.classList.remove('visible');
                dropdown.classList.remove('active');
            });
        });

        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('visible');
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', function(event) {
            if (!dropdown.contains(event.target)) {
                menu.classList.remove('visible');
                dropdown.classList.remove('active');
            }
        });
    })
    .catch(error => console.error('Error:', error));
});