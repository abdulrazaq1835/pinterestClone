import express from 'express'
import {  followerAndflollowing, forgotPassword, loginUser, logOut, myProfile, registerUser, userProfile } from '../controllers/userControllers.js'
import {isAuth} from '../middleware/isAuth.js'
const router =  express.Router()


router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/logout',isAuth,logOut)
router.post("/forgot-password", forgotPassword);
router.get('/me',isAuth,myProfile)
router.get('/:id',isAuth,userProfile)
router.post("/follow/:id",isAuth,followerAndflollowing)


export default router