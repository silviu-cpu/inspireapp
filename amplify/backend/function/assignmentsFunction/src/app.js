/*
  App.js - Assignments API using Express + DynamoDB
*/

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "Assignments";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const path = "/api";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/************************************
 * GET all assignments
 ************************************/
app.get(path, async (req, res) => {
  try {
    const data = await ddbDocClient.send(
      new ScanCommand({ TableName: tableName })
    );
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: "Could not load items: " + err.message });
  }
});

/************************************
 * GET single assignment by Name
 ************************************/
app.get(`${path}/:Name`, async (req, res) => {
  const { Name } = req.params;
  try {
    const data = await ddbDocClient.send(
      new GetCommand({ TableName: tableName, Key: { Name } })
    );
    if (!data.Item)
      return res.status(404).json({ error: "Assignment not found" });
    res.json(data.Item);
  } catch (err) {
    res.status(500).json({ error: "Could not load item: " + err.message });
  }
});

/************************************
 * POST new assignment
 ************************************/
app.post(path, async (req, res) => {
  const assignment = {
    Name: req.body.title, // Using title as partition key
    title: req.body.title,
    content: req.body.content,
    uploadedBy: req.body.uploadedBy,
    status: req.body.status || "SUBMITTED",
    comments: req.body.comments || [],
    uploadedAt: req.body.uploadedAt || new Date().toISOString(),
    id: Date.now(),
  };

  try {
    await ddbDocClient.send(
      new PutCommand({ TableName: tableName, Item: assignment })
    );
    res.json({ success: true, item: assignment });
  } catch (err) {
    res.status(500).json({ error: "Could not save item: " + err.message });
  }
});

/************************************
 * POST comment to assignment
 ************************************/
app.post(`${path}/:Name/comments`, async (req, res) => {
  const { Name } = req.params;
  const { user, message } = req.body;

  try {
    // Get existing item
    const data = await ddbDocClient.send(
      new GetCommand({ TableName: tableName, Key: { Name } })
    );
    if (!data.Item)
      return res.status(404).json({ error: "Assignment not found" });

    // Add comment
    const comments = data.Item.comments || [];
    comments.push({
      id: Date.now(),
      user,
      message,
      timestamp: new Date().toISOString(),
    });

    // Update assignment
    const updatedItem = { ...data.Item, comments };
    await ddbDocClient.send(
      new PutCommand({ TableName: tableName, Item: updatedItem })
    );

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "Could not add comment: " + err.message });
  }
});

/************************************
 * PUT update assignment (content/status)
 ************************************/
app.put(path, async (req, res) => {
  const { Name, title, content, status, comments } = req.body;

  try {
    // Ia item-ul curent
    const data = await ddbDocClient.send(
      new GetCommand({ TableName: tableName, Key: { Name } })
    );
    if (!data.Item)
      return res.status(404).json({ error: "Assignment not found" });

    // Actualizează doar câmpurile trimise în body
    const updatedItem = {
      ...data.Item,
      title: title ?? data.Item.title,
      content: content ?? data.Item.content,
      status: status ?? data.Item.status,
      comments: comments ?? data.Item.comments, //  păstrăm comments
    };

    await ddbDocClient.send(
      new PutCommand({ TableName: tableName, Item: updatedItem })
    );
    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "Could not update item: " + err.message });
  }
});
/************************************
 * DELETE assignment
 ************************************/
app.delete(`${path}/:Name`, async (req, res) => {
  const { Name } = req.params;

  try {
    const data = await ddbDocClient.send(
      new GetCommand({ TableName: tableName, Key: { Name } })
    );
    if (!data.Item)
      return res.status(404).json({ error: "Assignment not found" });

    await ddbDocClient.send(
      new DeleteCommand({ TableName: tableName, Key: { Name } })
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete item: " + err.message });
  }
});

app.listen(3000, () => console.log("App started"));

module.exports = app;
