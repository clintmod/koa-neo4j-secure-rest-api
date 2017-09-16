const neo4j = require('neo4j-driver').v1;
const neo4jResultParser = require('parse-neo4j');
const settings = require('../settings')
const driver = neo4j.driver(settings.neo4j.url, neo4j.auth.basic(settings.neo4j.user, settings.neo4j.password));

async function readNode(uid, ctx) {
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();
  let results = await session.run('MATCH (n {uid: $uid}) RETURN n', {uid: uid});
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? parsedResults[0]
    : {};
}

async function mergeNode(node, ctx) {
  node = node || {}
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();

  let results = await session.run('MERGE (n {uid: $uid}) ON CREATE SET n = {props} ON MATCH SET n = {props} RETURN ' +
      'n', {
    props: node,
    uid: node.uid
  });
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? parsedResults[0]
    : {};
}

async function deleteNode(uid, ctx) {
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();

  let results = await session.run('MATCH (n {uid: $uid}) DELETE n RETURN COUNT(n) as count', {uid: uid});
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? {
      message: 'success',
      count: parsedResults[0]
    }
    : {
      error: 'Failed to delete any rows',
      count: 0
    };
}

async function readRelationship(uid, ctx) {

  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();
  let results = await session.run('MATCH ()-[r {uid:$uid}]-() RETURN r', {uid: uid});
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? parsedResults[0]
    : {};

}

async function createRelationship(relationship, ctx) {
  relationship = relationship || {}
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();

  let query = 'MATCH (nl {uid: "' + relationship.uidLeft + '"}), (nr {uid: "' + relationship.uidRight + '"}) CREATE (nl)-[r:' + relationship.type + ' {props}]->(nr) RETURN r'
  let results = await session.run(query, {props: relationship.props});
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? parsedResults[0]
    : {
      error: 'Failed to create relationship.'
    };

}

async function updateRelationship(relationship, ctx) {
  relationship = relationship || {}
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();

  let query = 'MATCH (ln {uid: "' + relationship.uidLeft + '"})-[r:' + relationship.type + ']->(rn {uid: "' + relationship.uidRight + '"}) Set r = {props} RETURN r'
  let results = await session.run(query, {props: relationship.props});
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? parsedResults[0]
    : {
      error: 'Failed to create relationship.'
    };

}

async function deleteRelationship(relationship, ctx) {
  let session = ctx.neo4jSession = ctx.neo4jSession || driver.session();

  let results = await session.run('Match (ln {uid: $uidLeft})-[rel:' + relationship.type + ']->(rn {uid: $uidRight}) delete rel return count(rel) as count', relationship);
  let parsedResults = neo4jResultParser.parse(results);
  return parsedResults.length > 0
    ? {
      message: 'success',
      count: parsedResults[0],
      error: null
    }
    : {
      error: 'Failed to delete any rows',
      count: 0
    };

}

module.exports.readNode = readNode;
module.exports.mergeNode = mergeNode;
module.exports.deleteNode = deleteNode;

module.exports.readRelationship = readRelationship;
module.exports.createRelationship = createRelationship;
module.exports.updateRelationship = updateRelationship;
module.exports.deleteRelationship = deleteRelationship;