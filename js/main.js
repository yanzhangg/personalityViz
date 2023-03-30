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

const ipipScores = [
  "Extremely Low",
  "Very Low",
  "Low",
  "Neither high nor low",
  "High",
  "Very High",
  "Extremely High",
];

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/data.csv")
  .then((data) => {
    // Convert columns to numerical values
    data.forEach((d) => {
      Object.keys(d).forEach((attr) => {
        if (
          attr != "IPIP_O_ordinal" &&
          attr != "IPIP_C_ordinal" &&
          attr != "IPIP_E_ordinal" &&
          attr != "IPIP_A_ordinal" &&
          attr != "IPIP_N_ordinal" &&
          attr != "Highest Scoring Trait"
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
            ipip_O: d.IPIP_O_ordinal,
            ipip_C: d.IPIP_C_ordinal,
            ipip_E: d.IPIP_E_ordinal,
            ipip_A: d.IPIP_A_ordinal,
            ipip_N: d.IPIP_N_ordinal,
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
            ipip_O: d.IPIP_O_ordinal,
            ipip_C: d.IPIP_C_ordinal,
            ipip_E: d.IPIP_E_ordinal,
            ipip_A: d.IPIP_A_ordinal,
            ipip_N: d.IPIP_N_ordinal,
            pref: +d[group],
          };
        }),
      };
    });

    console.log(bookGenresData);

    // Initialize scatterplot
    const scatterplot = new Scatterplot(
      { parentElement: "#scatterplot" },
      movieGenresData
    );
    scatterplot.updateVis();
  })
  .catch((error) => console.error(error));
