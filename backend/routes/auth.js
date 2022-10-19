const express = require('express');
const router = express.Router();
const { body, checkSchema } = require('express-validator');
const Users = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecretHash = "myprojectisfortesting";
const saltRounds = 10;
const validateFunc = require('../models/Validation')
const authUserCheck = require('../middleware/User_auth_check');
const registrationSchema = {
    name: {
        notEmpty: true,
        errorMessage: "name field cannot be empty",
    },
    password: {
        isStrongPassword: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
    },
    mobileNumber: {
        notEmpty: true,
        errorMessage: "Phone number cannot be empty",
        custom: {
            options: value => {
                return Users.find({
                    mobileNumber: value
                }).then(users => {
                    if (users.length > 0) {
                        return Promise.reject('Mobile Number already taken')
                    }
                })
            }
        }
    },
    email: {
        normalizeEmail: true,
        custom: {
            options: value => {
                return Users.find({
                    email: value
                }).then(users => {
                    if (users.length > 0) {
                        return Promise.reject('Email address already taken')
                    }
                })
            }
        }
    }
}

const loginSchema = {
    password: {
        notEmpty: true,
    },
    email: {
        notEmpty: true,
        normalizeEmail: true,
        // custom: {
        //     options: value => {
        //         return Users.find({
        //             email: value
        //         }).then(users => {
        //             if (users.length > 0) {
        //                 return Promise.reject('Email address already taken')
        //             }
        //         })
        //     }
        // }
    }
}

// function to create a new user 
router.post('/create-user', validateFunc(checkSchema(registrationSchema)),
    async (req, res) => {
        const passHash = bcrypt.hashSync(req.body.password, saltRounds);

        const data = new Users({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            password: passHash,
        })
        try {
            const dataToSave = await data.save();
            let payload = {
                user: {
                    id: dataToSave.id
                }
            }
            var token = jwt.sign(payload, jwtSecretHash);
            return res.status(200).json({ status: "success", message: "Data saved successfully.", authToken: token })
        }
        catch (error) {
            console.log(`Message: ${error.message}`);
            return res.status(400).json({ message: 'Internal server error' })
        }
    })



// function to login
router.post('/login', validateFunc(checkSchema(loginSchema)),
    async (req, res) => {
        const { email, password } = req.body;
        try {
            let user = await Users.findOne({ email }).select('+password');
            if (!user) {
                return res.status(400).json({ status: "error", message: "Invalid login details" })
            }
            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return res.status(400).json({ status: "error", message: "Invalid login details" })
            }
            let payload = {
                user: {
                    id: user.id
                }
            }
            var token = jwt.sign(payload, jwtSecretHash);
            return res.status(200).json({ status: "success", message: "User login successfully", authToken: token })
        }
        catch (error) {
            console.log(`Message: ${error.message}`);
            return res.status(400).json({ message: 'Internal server error' })
        }
    })

// function to get user details
router.get('/get-user', authUserCheck,
    async (req, res) => {
        try {
            const id = req.user.id
            console.log(id)
            let users = await Users.findById({ _id: id });
            return res.status(200).json({ status: "success", data: users })
        }
        catch (error) {
            console.log(`Message: ${error.message}`);
            return res.status(400).json({ message: 'Internal server error' })
        }
    })

module.exports = router;
