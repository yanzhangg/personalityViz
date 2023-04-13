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

let data, movieGenresData, bookGenresData, computeAggregatedData;
let heatmap,
  oCircularBarplot,
  cCircularBarplot,
  eCircularBarplot,
  aCircularBarplot,
  nCircularBarplot,
  highlightedTrait,
  globaldata;

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

    // Group data by media type and genre
    computeAggregatedData = (mediaType, dataset) => {
      return mediaType.map((group) => {
        return {
          name: group,
          values: dataset.map((d) => {
            let obj = {
              name: group,
              ipip_O: d.IPIP_O,
              ipip_C: d.IPIP_C,
              ipip_E: d.IPIP_E,
              ipip_A: d.IPIP_A,
              ipip_N: d.IPIP_N,
              maxTrait: d.Highest_Scoring_Trait,
              pref: +d[group],
              age: d.Age,
              gender: d.Gender,
            };
            return obj;
          }),
        };
      });
    };

    movieGenresData = computeAggregatedData(movieGenres, data);
    bookGenresData = computeAggregatedData(bookGenres, data);

    // Group data by highest scoring trait
    const dataByHighestScoringTrait = d3.group(
      data,
      (d) => d.Highest_Scoring_Trait
    );

    // Initialize heatmap
    heatmap = new Heatmap(
      {
        parentElement: "#heatmap",
      },
      movieGenresData,
      "ipip_O",
      "movies"
    );

    highlightedTrait = "Openness";

    // Initialize circular barplots
    oCircularBarplot = new CircularBarplot(
      {
        parentElement: "#o-circularbarplot",
      },
      getHighestScoringTrait("O", dataByHighestScoringTrait),
      "Openness",
      highlightedTrait
    );

    cCircularBarplot = new CircularBarplot(
      {
        parentElement: "#c-circularbarplot",
      },
      getHighestScoringTrait("C", dataByHighestScoringTrait),
      "Conscientiousness",
      highlightedTrait
    );

    eCircularBarplot = new CircularBarplot(
      {
        parentElement: "#e-circularbarplot",
      },
      getHighestScoringTrait("E", dataByHighestScoringTrait),
      "Extraversion",
      highlightedTrait
    );

    aCircularBarplot = new CircularBarplot(
      {
        parentElement: "#a-circularbarplot",
      },
      getHighestScoringTrait("A", dataByHighestScoringTrait),
      "Agreeableness",
      highlightedTrait
    );

    nCircularBarplot = new CircularBarplot(
      {
        parentElement: "#n-circularbarplot",
      },
      getHighestScoringTrait("N", dataByHighestScoringTrait),
      "Neuroticism",
      highlightedTrait
    );

    heatmap.updateVis();
    oCircularBarplot.updateVis();
    cCircularBarplot.updateVis();
    eCircularBarplot.updateVis();
    aCircularBarplot.updateVis();
    nCircularBarplot.updateVis();
  })
  .catch((error) => console.error(error));

// Filter by selection on personality trait and trigger change to circular barplots
d3.select("#trait-selector").on("change", function () {
  const selected = d3.select(this).property("value");

  switch (selected) {
    case "ipip_O":
      heatmap.trait = "ipip_O";
      changeTraitView("Openness");
      break;
    case "ipip_C":
      heatmap.trait = "ipip_C";
      changeTraitView("Conscientiousness");
      break;
    case "ipip_E":
      heatmap.trait = "ipip_E";
      changeTraitView("Extraversion");
      break;
    case "ipip_A":
      heatmap.trait = "ipip_A";
      changeTraitView("Agreeableness");
      break;
    case "ipip_N":
      heatmap.trait = "ipip_N";
      changeTraitView("Neuroticism");
      break;
    default:
      heatmap.trait = "ipip_O";
      changeTraitView("Openness");
      break;
  }
});

// Filter by Media Type
d3.select("#media-button").on("change", filterAll);

// Filter by Age
d3.select("#slider").on("change", filterAll);

// Filter by Gender
d3.select("#gender-Button").on("change", filterAll);

// Filter data by all selections (media type, age, gender)
function filterAll() {
  let filteredData = [];

  // Filter by Media
  const selected = d3.select('input[name="media"]:checked').node().value;
  if (selected == "movies") {
    filteredData = computeAggregatedData(movieGenres, data);
    console.log("movieData", movieGenresData);
    heatmap.media = "movies";
  } else if (selected == "books") {
    filteredData = computeAggregatedData(bookGenres, data);
    heatmap.media = "books";
  }

  // Filter by Age
  const age = d3.select("#slider").property("value");

  d3.select("#age-value").text(age);
  filteredData.forEach((genre) => {
    genre.values = genre.values.filter((item) => item.age <= age);
  });

  // Filter by Gender
  const gender = d3
    .select("#gender-Button")
    .select('input[name="gender"]:checked')
    .node().value;
  switch (gender) {
    case "male":
      filteredData.forEach((genre) => {
        genre.values = genre.values.filter((item) => item.gender == 0);
      });
      break;
    case "female":
      filteredData.forEach((genre) => {
        genre.values = genre.values.filter((item) => item.gender == 1);
      });
      break;
    case "both":
      break;
    default:
      break;
  }

  heatmap.data = filteredData;
  heatmap.updateVis();
}

// Change heatmap and dropdown to given trait, 
// and update highlighting of circular barplots
function changeTraitView(trait) {
  switch (trait) {
    case "Openness":
      heatmap.trait = "ipip_O";
      document.getElementById("trait-selector").value = "ipip_O";
      break;
    case "Conscientiousness":
      heatmap.trait = "ipip_C";
      document.getElementById("trait-selector").value = "ipip_C";
      break;
    case "Extraversion":
      heatmap.trait = "ipip_E";
      document.getElementById("trait-selector").value = "ipip_E";
      break;
    case "Agreeableness":
      heatmap.trait = "ipip_A";
      document.getElementById("trait-selector").value = "ipip_A";
      break;
    case "Neuroticism":
      heatmap.trait = "ipip_N";
      document.getElementById("trait-selector").value = "ipip_N";
      break;
    default:
      heatmap.trait = "ipip_O";
      document.getElementById("trait-selector").value = "ipip_O";
      break;
  }

  oCircularBarplot.highlightedTrait = trait;
  cCircularBarplot.highlightedTrait = trait;
  eCircularBarplot.highlightedTrait = trait;
  aCircularBarplot.highlightedTrait = trait;
  nCircularBarplot.highlightedTrait = trait;

  heatmap.updateVis();
  oCircularBarplot.updateVis();
  cCircularBarplot.updateVis();
  eCircularBarplot.updateVis();
  aCircularBarplot.updateVis();
  nCircularBarplot.updateVis();
}

// Get sums of preference scores for each genre by highest-scoring personality trait
// - groupedData: data grouped by highest scoring trait
// - trait: Big Five personality trait
function getHighestScoringTrait(trait, groupedData) {
  let sums = [];
  let sumObj = {};
  let totalSums = [];
  movieGenres.forEach((genre) => {
    let sum = d3.rollup(groupedData.get(trait), (v) =>
      d3.sum(v, (d) => d[genre])
    );
    totalSums.push(sum);

    sumObj = {
      name: genre,
      sum,
    };
    sums.push(sumObj);
  });
  return sums;
}
