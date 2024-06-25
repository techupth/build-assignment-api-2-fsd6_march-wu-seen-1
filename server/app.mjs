import express from "express";
import connectionPool from "./utils/db.mjs";
import 'dotenv/config'

const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {

  let results;

  try {
    results = await connectionPool.query(`SELECT * FROM assignments`)  
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment due to database connection issue"
    })
  }
  
  return res.status(200).json({
      data: results.rows
    })

})

app.get("/assignments/:assignment_id", async (req, res) => {

  const assignmentId = req.params.assignment_id;

  let assignmentResults;

  try {
    assignmentResults = await connectionPool.query(
      `
      SELECT *
      FROM assignments
      WHERE assignment_id = $1
      `,[assignmentId]
    ) 
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment due to database connection issue"
    })
  } 

  if (!assignmentResults.rows[0]){
    return res.status(404).json({
      message : `Server could not find a requested assignment (assignmentid:${assignmentId})`
    })
  }

  return res.status(200).json({
    data: assignmentResults.rows[0]
  })
})

app.put("/assignments/:assignment_id", async (req, res) => {

  const putAssignmentId = req.params.assignment_id
  const updatedAssignment = { ...req.body, updated_at: new Date()}

  try {

    const assignmentIdCheck = await connectionPool.query(
      `
      SELECT *
      FROM assignments
      WHERE assignment_id = $1
      `,[putAssignmentId]
    )

    if(!assignmentIdCheck.rows[0]){
      return res.status(404).json({
        message: `Server could not find a requested assignment to update (Assignment id:${putAssignmentId})`
      })
    }

      await connectionPool.query(
      `
      UPDATE assignments
      SET
        title = $2,
        content = $3,
        category = $4,
        updated_at = $5
      WHERE
        assignment_id = $1
      `,
      [
        putAssignmentId,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ]
    );

    return res.status(200).json({
      message: "Updated assignment sucessfully"
    });
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment due to database connection issue"
    })
  }
})

app.delete("/assignments/:assignment_id", async (req,res) => {

  const getAssignmentId = req.params.assignment_id

  try {
    const assignmentIdCheckForDelete = await connectionPool.query(
      `
      SELECT *
      FROM assignments
      WHERE assignment_id = $1
      `,[getAssignmentId]
    )

    if (!assignmentIdCheckForDelete.rows[0]){
      return res.status(404).json({
        message: `Server could not find a requested assignment to delete (Assignment id: ${getAssignmentId})`
      })
    }
      
    await connectionPool.query(`
      DELETE FROM assignments
      WHERE assignment_id = $1
      `, [getAssignmentId]
    );

    return res.status(200).json({
      message: "Deleted assignment sucessfully"
    });   
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment due to database connection issue"
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
