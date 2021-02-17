const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api', require('./controllers/users'))

app.listen(process.env.PORT || 8000, ()=>{
    console.log('SEI MERN AUTH API RUNNING')
})