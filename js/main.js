const movieGenres = [
  "Family_01",
  "Romance_02",
  "Drama_03",
  "Horror_04",
  "Historical_05",
  "Crime_06",
  "Erotic_07",
  "Independent_08",
  "Biographical_09",
  "Musical_10",
  "SciFi_11",
  "Action_12",
  "Comedy_13",
  "Adventure_14",
  "Western_15",
  "Documentary_16",
  "War_17",
  "Thriller_18",
  "Classics_19",
  "Animation_20",
  "Mystery_21",
];
const bookGenres = [
  "Romance_01",
  "Horror_02",
  "Erotica_03",
  "Art_04",
  "Academic_05",
  "Mystery_06",
  "Crime_07",
  "History_08",
  "Philosophy_09",
  "Poetry_10",
  "Entertainment_11",
  "Comics_12",
  "Architecture_13",
  "Computers_14",
  "Sports_15",
  "News_16",
  "Reference_17",
  "Business_18",
  "Cooking_19",
  "Literature_20",
  "Thriller_21",
  "Adventure_22",
  "Nature_23",
  "Health_24",
  "SciFi_25",
  "Fantasy_26",
  "Medical_27",
];

let data, heatmap, oCircularBarplot, cCircularBarplot, eCircularBarplot, aCircularBarplot, nCircularBarplot;

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/data.csv")
  .then((_data) => {
    data = _data;
    // Convert columns to numerical values
    data.forEach((d) => {
      Object.keys(d).forEach((attr) => {
        if (
          attr != "IPIP_O_ordinal" &&
          attr != "IPIP_C_ordinal" &&
          attr != "IPIP_E_ordinal" &&
          attr != "IPIP_A_ordinal" &&
          attr != "IPIP_N_ordinal" &&
          attr != "Highest_Scoring_Trait"
        ) {
          d[attr] = +d[attr];
        }
      });
    });

    const movieGenresData = movieGenres.map((group) => {
      return {
        name: group,
        values: data.map((d) => {
          return {
            name: group,
            ipip_O: d.IPIP_O,
            ipip_C: d.IPIP_C,
            ipip_E: d.IPIP_E,
            ipip_A: d.IPIP_A,
            ipip_N: d.IPIP_N,
            pref: +d[group],
          };
        }),
      };
    });

    const bookGenresData = bookGenres.map((group) => {
      return {
        name: group,
        values: data.map((d) => {
          return {
            name: group,
            ipip_O: d.IPIP_O,
            ipip_C: d.IPIP_C,
            ipip_E: d.IPIP_E,
            ipip_A: d.IPIP_A,
            ipip_N: d.IPIP_N,
            maxTrait: d.Highest_Scoring_Trait,
            pref: +d[group],
          };
        }),
      };
    });
    
    // Group data by highest scoring trait
    const dataByHighestScoringTrait = d3.group(data, d => d.Highest_Scoring_Trait);

    // Initialize heatmap
    heatmap = new Heatmap(
      {
        parentElement: "#heatmap",
      },
      movieGenresData,
      "ipip_O"
    );

    // Initialize circular barplots
    oCircularBarplot = new CircularBarplot(
      {
        parentElement: "#o-circularbarplot",
      },
      getHighestScoringTrait("O", dataByHighestScoringTrait),
      "Openness"
    );

    cCircularBarplot = new CircularBarplot(
      {
        parentElement: "#c-circularbarplot",
      },
      getHighestScoringTrait("C", dataByHighestScoringTrait),
      "Conscientiousness"
    );

    eCircularBarplot = new CircularBarplot(
      {
        parentElement: "#e-circularbarplot",
      },
      getHighestScoringTrait("E", dataByHighestScoringTrait),
      "Extraversion"
    );

    aCircularBarplot = new CircularBarplot(
      {
        parentElement: "#a-circularbarplot",
      },
      getHighestScoringTrait("A", dataByHighestScoringTrait),
      "Agreeableness"
    );

    nCircularBarplot = new CircularBarplot(
      {
        parentElement: "#n-circularbarplot",
      },
      getHighestScoringTrait("N", dataByHighestScoringTrait),
      "Neuroticism"
    );

    heatmap.updateVis();
    oCircularBarplot.updateVis();
    cCircularBarplot.updateVis();
    eCircularBarplot.updateVis();
    aCircularBarplot.updateVis();
    nCircularBarplot.updateVis();
  })
  .catch((error) => console.error(error));

  // Filter by selection
d3.select("#trait-selector").on("change", function () {
  const selected = d3.select(this).property("value");
  console.log(selected);
  switch (selected) {
    case "ipip_O":
      heatmap.trait = "ipip_O";
      break;
    case "ipip_C":
      heatmap.trait = "ipip_C";
      break;
    case "ipip_E":
      heatmap.trait = "ipip_E";
      break;
    case "ipip_A":
      heatmap.trait = "ipip_A";
      break;
    case "ipip_N":
      heatmap.trait = "ipip_N";
      break;
    default:
      heatmap.trait = "ipip_O";
      break;
  }
  heatmap.updateVis();
});

  function getHighestScoringTrait(trait, groupedData) {
    // Get sum
    let sums = [];
    let sumObj = {};
    let totalSums = [];
    movieGenres.forEach(genre => {
        let sum = d3.rollup(groupedData.get(trait), v => d3.sum(v, d => d[genre]));
        totalSums.push(sum);

        sumObj = {
            name: genre,
            sum
        };
        sums.push(sumObj);
    });
    return sums;
  }
