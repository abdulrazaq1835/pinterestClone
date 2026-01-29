import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import userRoutes  from './routes/userRoutes.js'


dotenv.config()

const app  =  express()

app.use(express.json())

const PORT =  process.env.PORT || 5000

connectDB()
  
app.use('/api/user',userRoutes)

app.get('/',(req,res)=>{
 res.send("heloo")
})

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})