const { algoliasearch } = require('algoliasearch');

const client = algoliasearch('ZQFQRGW5U1', 'c37bc186141bcd96fb2765c583e31d08');

// Fetch and index objects in Algolia
const processRecords = async () => {
  const datasetRequest = await fetch('https://dashboard.algolia.com/api/1/sample_datasets?type=movie');
  const movies = await datasetRequest.json();
  return await client.saveObjects({ indexName: 'movies_index', objects: movies });
};

processRecords()
  .then(() => console.log('Successfully indexed objects!'))
  .catch((err) => console.error(err));
