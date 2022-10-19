const express = require('express');
const router = express.Router();
const { body, checkSchema } = require('express-validator');
const validateFunc = require('../models/Validation')
const Notes = require('../models/Notes');
const authUserCheck = require('../middleware/User_auth_check');

const createNotesSchema = {
  title: {
    notEmpty: {
      errorMessage: "name field cannot be empty",
    },
    isLength: {
      options: { max: 50 },
      errorMessage: 'title length should not more then 50 characters',
    }
  },
  description: {
    notEmpty: {
      errorMessage: "name field cannot be empty",
    },
    isLength: {
      options: { max: 250 },
      errorMessage: 'description length should not more then 250 characters'
    }
  },
  tag: {
    notEmpty: {
      errorMessage: "name field cannot be empty"
    },
    isLength: {
      options: { max: 250 },
      errorMessage: 'tag length should not more then 250 characters'
    }
  },
}


//function to get all notes for a single user
router.get('/get-notes', authUserCheck, async (req, res) => {
  try {
    let id = req.user.id;
    console.log(id);
    const note = await Notes.find({user: id});
    res.status(200).send({ status: "success", data: note });

  } catch (error) {
    console.log(`Message: ${error.message}`);
    return res.status(400).json({ message: 'Internal server error' })
  }
})


//function to save notes for a single user
router.post('/create-notes', authUserCheck, validateFunc(checkSchema(createNotesSchema)), async (req, res) => {
  try {
    const note = new Notes({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
      tag: req.body.tag,
    })
    const saveNotes = await note.save();
    return res.status(200).json({ status: "success", message: "Data saved successfully.", data: saveNotes })
  } catch (error) {
    console.log(`Message: ${error.message}`);
    return res.status(400).json({ message: 'Internal server error' })
  }
})


//function to delete notes for a single user
router.put('/edit-notes/:id', authUserCheck, validateFunc(checkSchema(createNotesSchema)), async (req, res) => {
  const  {title,description,tag} = req.body
  try {
    const newNote = {};
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}

    const note = await Notes.findById(req.params.id);
    if(!note){
      return res.status(404).json({ message: 'Not Found' })
    }
    if(note.user.toString() !== req.user.id){
      return res.status(401).send({ status: "error", message: 'Not Allowed' })
    }

    const updatedNote = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
    return res.status(200).json({ status: "success", message: "Data updated successfully.", data: updatedNote })

  } catch (error) {
    console.log(`Message: ${error.message}`);
    return res.status(400).json({ message: 'Internal server error' })
  }
})


//function to delete notes for a single user
router.delete('/delete-notes/:id', authUserCheck, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if(!note){
      return res.status(404).json({ message: 'Not Found' })
    }
    if(note.user.toString() !== req.user.id){
      return res.status(401).send({ status: "error", message: 'Not Allowed' })
    }

    const deleteData = await Notes.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: "success", message: "Data deleted successfully."})
  } catch (error) {
    console.log(`Message: ${error.message}`);
    return res.status(400).json({ message: 'Internal server error' })
  }
})


module.exports = router;