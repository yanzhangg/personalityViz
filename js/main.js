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
  highlightedTrait;

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
      "Openness", highlightedTrait
    );

    cCircularBarplot = new CircularBarplot(
      {
        parentElement: "#c-circularbarplot",
      },
      getHighestScoringTrait("C", dataByHighestScoringTrait),
      "Conscientiousness", highlightedTrait
    );

    eCircularBarplot = new CircularBarplot(
      {
        parentElement: "#e-circularbarplot",
      },
      getHighestScoringTrait("E", dataByHighestScoringTrait),
      "Extraversion", highlightedTrait
    );

    aCircularBarplot = new CircularBarplot(
      {
        parentElement: "#a-circularbarplot",
      },
      getHighestScoringTrait("A", dataByHighestScoringTrait),
      "Agreeableness", highlightedTrait
    );

    nCircularBarplot = new CircularBarplot(
      {
        parentElement: "#n-circularbarplot",
      },
      getHighestScoringTrait("N", dataByHighestScoringTrait),
      "Neuroticism", highlightedTrait
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
  
  switch (selected) {
    case "ipip_O":
      heatmap.trait = "ipip_O";
      oCircularBarplot.highlightedTrait = "Openness";
      cCircularBarplot.highlightedTrait = "Openness";
      eCircularBarplot.highlightedTrait = "Openness";
      aCircularBarplot.highlightedTrait = "Openness";
      nCircularBarplot.highlightedTrait = "Openness";
      break;
    case "ipip_C":
      heatmap.trait = "ipip_C";
      oCircularBarplot.highlightedTrait = "Conscientiousness";
      cCircularBarplot.highlightedTrait = "Conscientiousness";
      eCircularBarplot.highlightedTrait = "Conscientiousness";
      aCircularBarplot.highlightedTrait = "Conscientiousness";
      nCircularBarplot.highlightedTrait = "Conscientiousness";
      break;
    case "ipip_E":
      heatmap.trait = "ipip_E";
      oCircularBarplot.highlightedTrait = "Extraversion";
      cCircularBarplot.highlightedTrait = "Extraversion";
      eCircularBarplot.highlightedTrait = "Extraversion";
      aCircularBarplot.highlightedTrait = "Extraversion";
      nCircularBarplot.highlightedTrait = "Extraversion";
      break;
    case "ipip_A":
      heatmap.trait = "ipip_A";
      oCircularBarplot.highlightedTrait = "Agreeableness";
      cCircularBarplot.highlightedTrait = "Agreeableness";
      eCircularBarplot.highlightedTrait = "Agreeableness";
      aCircularBarplot.highlightedTrait = "Agreeableness";
      nCircularBarplot.highlightedTrait = "Agreeableness";
      break;
    case "ipip_N":
      heatmap.trait = "ipip_N";
      oCircularBarplot.highlightedTrait = "Neuroticism";
      cCircularBarplot.highlightedTrait = "Neuroticism";
      eCircularBarplot.highlightedTrait = "Neuroticism";
      aCircularBarplot.highlightedTrait = "Neuroticism";
      nCircularBarplot.highlightedTrait = "Neuroticism";
      break;
    default:
      heatmap.trait = "ipip_O";
      oCircularBarplot.highlightedTrait = "Openness";
      cCircularBarplot.highlightedTrait = "Openness";
      eCircularBarplot.highlightedTrait = "Openness";
      aCircularBarplot.highlightedTrait = "Openness";
      nCircularBarplot.highlightedTrait = "Openness";
      break;
  }
  heatmap.updateVis();
  oCircularBarplot.updateVis();
  cCircularBarplot.updateVis();
  eCircularBarplot.updateVis();
  aCircularBarplot.updateVis();
  nCircularBarplot.updateVis();
});


// Filter by Media Type
  d3.select("#media-button").on("change", function() {
    const selected = d3.select('input[name="media"]:checked').node().value;
    let filteredData;
    if (selected == "movies") {
      filteredData = movieGenresData;
        heatmap.media = "movies";
    } else if (selected == "books") {
      filteredData = bookGenresData;
        heatmap.media = "books";
    }
    heatmap.data = filteredData;
    heatmap.updateVis();
  });

// Filter by Age
d3.select("#slider").on("change", function () {
  const age = d3.select(this).property("value");

  d3.select("#age-value").text(this.value);

  const filteredAgeData = data.filter((person) => person["Age"] <= age);
  movieGenresData = computeAggregatedData(movieGenres, filteredAgeData);
  bookGenresData = computeAggregatedData(bookGenres, filteredAgeData);

  const genreSelected = d3.select('input[name="media"]:checked').node().value;
  if (genreSelected == "movies") {
    heatmap.data = movieGenresData;
    heatmap.media = "movies";
  } else if (genreSelected == "books") {
    heatmap.data = bookGenresData;
    heatmap.media = "books";
  }
  heatmap.updateVis();
});

//Filter by Gender
d3.select("#gender-Button").on("change", filterGenderOnChange);

function filterGender() {
    const selected = d3.select("#gender-Button").select('input[name="gender"]:checked').node().value;
    let filteredData;
    let mediaArr = (heatmap.media == "movies") ? movieGenres : bookGenres;
    switch (selected) {
      case "male":
        filteredData = computeAggregatedData(mediaArr, data.filter((item) => item.Gender == 0));
        console.log(filteredData);
        break;
      case "female":
        filteredData = computeAggregatedData(mediaArr, data.filter((item) => item.Gender == 1));
        console.log(data.filter((item) => item.Gender == 1));
        break;
      case "both":
        filteredData = computeAggregatedData(mediaArr, data);
        break;
      default:
        filteredData = computeAggregatedData(mediaArr, data);
        break;
    }
    heatmap.data = filteredData;
}

function filterGenderOnChange() {
  filterGender();
  heatmap.updateVis();
}

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

// function filterGenderData() {
//   const gender = d3.select('input[name="gender"]:checked').property("value");
//   let tempData;

//   if (gender == "male") {
//     tempData = data.filter(d => d["Gender"] == 0);
//   } else if (gender == "female") {
//     tempData = data.filter(d => d["Gender"] == 1);
//   } else {
//     tempData = data;
//   }
  
//   movieGenresData = computeAggregatedData(movieGenres, tempData);
//   bookGenresData = computeAggregatedData(bookGenres, tempData);

//   const genreSelected = d3.select('input[name="media"]:checked').node().value;
//   if (genreSelected == "movies") {
//     heatmap.data = movieGenresData;
//     heatmap.media = "movies";
//   } else if (genreSelected == "books") {
//     heatmap.data = bookGenresData;
//     heatmap.media = "books";
//   }
//   heatmap.updateVis();
// }

// Event listener to the radio button
// d3.select("#gender-Button").on("change", filterGenderData);
