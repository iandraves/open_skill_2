// Timeline data for Big Bang
const timelineData = [
    {
        name: "Planck Epoch",
        start: 0,
        end: 1e-43,
        description: "From zero to approximately 10^-43 seconds: This is the closest that current physics can get to the absolute beginning of time."
    },
    {
        name: "Grand Unification Epoch",
        start: 1e-43,
        end: 1e-36,
        description: "From 10^-43 seconds to 10^-36 seconds: The force of gravity separates from the other fundamental forces."
    },
    {
        name: "Inflationary Epoch",
        start: 1e-36,
        end: 1e-32,
        description: "From 10^-36 seconds to 10^-32 seconds: The universe undergoes an extremely rapid exponential expansion."
    },
    {
        name: "Electroweak Epoch",
        start: 1e-32,
        end: 1e-12,
        description: "From 10^-32 seconds to 10^-12 seconds: Particle interactions create large numbers of exotic particles."
    },
    {
        name: "Quark Epoch",
        start: 1e-12,
        end: 1e-6,
        description: "From 10^-12 seconds to 10^-6 seconds: Quarks, electrons, and neutrinos form in large numbers."
    },
    {
        name: "Hadron Epoch",
        start: 1e-6,
        end: 1,
        description: "From 10^-6 seconds to 1 second: Quarks combine to form hadrons."
    },
    {
        name: "Lepton Epoch",
        start: 1,
        end: 180,
        description: "From 1 second to 3 minutes: Leptons and antileptons dominate the mass of the universe."
    },
    {
        name: "Nucleosynthesis",
        start: 180,
        end: 1200,
        description: "From 3 minutes to 20 minutes: Atomic nuclei begin to form."
    },
    {
        name: "Photon Epoch",
        start: 1200,
        end: 7.573824e12,
        description: "From 20 minutes to 240,000 years: The universe is filled with plasma."
    },
    {
        name: "Recombination/Decoupling",
        start: 7.573824e12,
        end: 9.46728e12,
        description: "From 240,000 to 300,000 years: Atoms capture electrons, and the universe becomes transparent."
    },
    {
        name: "Dark Age",
        start: 9.46728e12,
        end: 4.73364e15,
        description: "From 300,000 to 150 million years: The period after the formation of the first atoms and before the first stars."
    },
    {
        name: "Reionization",
        start: 4.73364e15,
        end: 3.15576e16,
        description: "From 150 million to 1 billion years: The first quasars form, reionizing the surrounding universe."
    },
    {
        name: "Star and Galaxy Formation",
        start: 3.15576e16,
        end: 2.682396e17,
        description: "From 1 billion to 8.5 billion years: Stars and galaxies begin to form."
    },
    {
        name: "Solar System Formation",
        start: 2.682396e17,
        end: 2.83998e17,
        description: "From 8.5 to 9 billion years: Our Solar System forms."
    },
    {
        name: "Today",
        start: 4.324e17,
        end: 4.324e17,
        description: "13.7 billion years: The current state of the universe."
    }
];


// Set up the dimensions and margins
const margin = { top: 60, right: 220, bottom: 60, left: 80 };
const width = 900 - margin.left - margin.right;
let height = 1200 - margin.top - margin.bottom;

// Define the time scale
const timeScale = d3.scaleLog()
    .domain([1e-44, 4.321e17]) // From Planck Epoch to Today
    .range([0, height]);

// Calculate initial positions
timelineData.forEach(d => {
    d.initialY = timeScale((d.start + d.end) / 2);
});

// Adjust positions to prevent overlap
function adjustPositions(data) {
    const circleSpacing = 25; // Minimum spacing between circles
    const labelSpacing = 30; // Minimum spacing between labels
    let lastCircleY = -Infinity;
    let lastLabelY = -Infinity;

    data.forEach(d => {
        let y = d.initialY;

        // Adjust circle positions
        if (y - lastCircleY < circleSpacing) {
            y = lastCircleY + circleSpacing;
        }
        d.circleY = y;
        lastCircleY = y;

        // Adjust label positions
        let labelY = y;
        if (labelY - lastLabelY < labelSpacing) {
            labelY = lastLabelY + labelSpacing;
        }
        d.labelY = labelY;
        lastLabelY = labelY;
    });

    // Update height if necessary
    const maxY = data[data.length - 1].labelY + margin.bottom + 50;
    if (maxY > height) {
        height = maxY;
    }
}

adjustPositions(timelineData);

// Create SVG element with updated height
const svg = d3.select("#timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left},${margin.top})`);

// Update the time scale range since height has changed
timeScale.range([0, height]);

// Create an expanding timeline gradient background
const widthScale = d3.scaleLinear()
    .domain([0, height])
    .range([9, 40]);

// Define a color scale for the timeline gradient
const colorScale = d3.scaleSequential(d3.interpolateCool)
    .domain([0, height]);

// Create a path for the expanding timeline
const areaGenerator = d3.area()
    .x0(d => width / 2 - widthScale(d))
    .x1(d => width / 2 + widthScale(d))
    .y(d => d);

const yValues = d3.range(0, height + 1, 1);
const timelinePathData = areaGenerator(yValues);

svg.append("path")
    .attr("d", timelinePathData)
    .attr("fill", "url(#timeline-gradient)")
    .attr("class", "timeline-path");

// Define the gradient for the timeline
const defs = svg.append("defs");

const gradient = defs.append("linearGradient")
    .attr("id", "timeline-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", height);

gradient.selectAll("stop")
    .data(d3.range(0, height + 1, height / 10))
    .enter()
    .append("stop")
    .attr("offset", d => d / height)
    .attr("stop-color", d => colorScale(d));

// Tooltip div for showing epoch descriptions
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Add events to the timeline
svg.selectAll(".event-circle")
    .data(timelineData)
    .enter()
    .append("circle")
    .attr("class", "event-circle")
    .attr("cx", width / 2)
    .attr("cy", d => d.circleY)
    .attr("r", 8)
    .on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .95);

        tooltip.html(`<strong>${d.name}</strong><br/>${d.description}`)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function () {
        tooltip.transition()
            .duration(300)
            .style("opacity", 0);
    });

// Add labels for each event
svg.selectAll(".event-label")
    .data(timelineData)
    .enter()
    .append("text")
    .attr("class", "event-label")
    .attr("x", width / 2 + 60)
    .attr("y", d => d.labelY)
    .attr("dy", ".35em")
    .text(d => d.name)
    .on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .95);

        tooltip.html(`<strong>${d.name}</strong><br/>${d.description}`)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function () {
        tooltip.transition()
            .duration(300)
            .style("opacity", 0);
    });

// Draw lines connecting circles to labels
svg.selectAll(".label-line")
    .data(timelineData)
    .enter()
    .append("line")
    .attr("class", "label-line")
    .attr("x1", width / 2 + 10)
    .attr("y1", d => d.circleY)
    .attr("x2", width / 2 + 60)
    .attr("y2", d => d.labelY)
    .attr("stroke", "#c5c6c7")
    .attr("stroke-width", 1);

// Add y-axis
const yAxis = d3.axisLeft(timeScale)
    .ticks(10)
    .tickFormat(d => {
        if (d <= 0) return "";
        const log = Math.log10(d);
        if (log % 1 === 0) return `10^${log.toFixed(0)} s`;
        if (d < 1e-2) return d.toExponential(1) + " s";
        else if (d < 60) return d.toFixed(1) + " s";
    })
    .tickSizeOuter(0);

svg.append("g")
    .attr("transform", `translate(${width / 2 - widthScale(height) - 40}, 0)`)
    .attr("class", "axis")
    .call(yAxis);