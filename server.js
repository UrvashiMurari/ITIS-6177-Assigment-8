const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require('body-parser')

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host : 'localhost',
        user: 'root',
        password: 'root',
        database: 'sample',
        port: 3306,
        connectionLimit: 15
})

pool.getConnection((err, connection) => {
        if(err){
                console.error('there is an error');
        }
        if(connection) connection.release();
        return;

});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/addstudent',(req, res) => {


        const newStudent = req.body;
        let name= newStudent.name;
        let title = newStudent.title;
        let sclass = newStudent.class;
        let section = newStudent.section;
        let rollid = newStudent.rollid;

        pool.query(`INSERT INTO student VALUES \('${name}','${title}','${sclass}', '${section}', '${rollid}'\)`)
                .then(result => res.send("Success"))
                .catch(err => console.log(err))
})


app.put('/student',(req, res) => {
        const student = req.body;

        const data = pool.query(`SELECT 1 FROM student WHERE ROLLID=${student.rollid}`)
        if(data.length == 0){
            pool.query(`INSERT into student VALUES('${student.name}', '${student.title}', '${student.section}', '${student.section}', '${student.rollid}')`)
            .then( created => {
                    res.status(201).send("Created");
            })
            .catch(err=> console.log(err))
    }
    pool.query(`UPDATE student SET ROLLID = '${student.rollid}', NAME = '${student.name}', TITLE = '${student.title}', SECTION = '${student.section}' WHERE ROLLID = '${student.rollid}'`)
    .then(result => res.send("Success"))
    .catch(err=> console.log(err))
})


app.patch('/student', async (req, res) => {
        const student = req.body;

        const data = await pool.query(`SELECT 1 FROM student WHERE ROLLID=${student.rollid}`)
        console.log(data, student.rollid)
        if(data.length == 0){
            res.status(404).send("Student not found");
        }
        else{
        await pool.query(`UPDATE student SET ROLLID = '${student.rollid}', NAME = '${student.name}', TITLE = '${student.title}', SECTION = '${student.section}' WHERE ROLLID = '${student.rollid}'`)
        .then(result => res.status(200).send(`Student Updated with Roll no: ${student.rollid}`))
        .catch(err => console.log(err))
        }
})

app.delete('/student/:id',(req, res)=> {
   let student_id = req.params.id;
   console.log(student_id,typeof student_id)
   const data = pool.query(`SELECT 1 FROM student WHERE ROLLID = ${parseInt(student_id)}`)

        if(data.length == 0){
            res.status(404);
            res.send("Student not found.");
        }
            pool.query(`DELETE FROM student WHERE ROLLID = ${parseInt(student_id)}`)
                    .then(result => res.send("Deleted"))
                    .catch(err => console.log(err))
});


app.get('/customer', async function (req, res) {
const sql_query = 'Select * from customer'
const rows = await pool.query(sql_query);
res.status(200).json(rows);
})

app.get('/agent', async function (req, res) {
const sql_query = 'select * from agents'
const rows = await pool.query(sql_query);
res.status(200).json(rows);
})

app.get('/company', async function (req, res) {
const sql_query = 'Select * from company'
const rows = await pool.query(sql_query);
res.status(200).json(rows);
})

app.get('/customer_newyork', async function (req, res) {
const sql_query = 'Select * from customer where CUST_CITY="New York"'
const rows = await pool.query(sql_query);
res.status(200).json(rows);
})



app.get('/studentdetail', (req, res) => {
        pool.getConnection()
        .then( conn => {
                conn.query("SELECT * FROM student")
                .then((rows)=> {
                        res.json(rows)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})


app.listen(port, function () {
  console.log('App listening at http://localhost:%s', port)
})
